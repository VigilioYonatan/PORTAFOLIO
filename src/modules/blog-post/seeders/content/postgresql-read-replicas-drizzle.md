### ESPAÑOL (ES)

En el ciclo de vida de cualquier aplicación exitosa, llega un momento en que una sola instancia de base de datos ya no puede manejar la carga. Sin embargo, antes de saltar a arquitecturas complejas de Sharding o Microservicios, el paso lógico y más eficiente es escalar las lecturas horizontalmente utilizando **Réplicas de Lectura (Read Replicas)**.

El patrón es simple en teoría: una instancia "Primary" para escrituras y múltiples réplicas para lecturas. Pero en la práctica, implementar esto sin romper la consistencia de los datos en una aplicación Node.js/TypeScript requiere una ingeniería cuidadosa.

#### 1. Arquitectura de Replicación Asíncrona

![Read Replicas Architecture](./images/postgresql-read-replicas-drizzle/architecture.png)

PostgreSQL utiliza WAL (Write-Ahead Log) Streaming para replicar cambios.

- **Primary (Writer)**: Acepta `INSERT`, `UPDATE`, `DELETE`. Envía stream de WAL a las réplicas.
- **Replicas (Readers)**: Modo "Hot Standby". Solo aceptan `SELECT`. Si intentas escribir, recibirás el error: `cannot execute INSERT in a read-only transaction`.

El desafío principal es el **Replication Lag**. La replicación asíncrona significa que hay un delta de tiempo (milisegundos a segundos) entre que un dato se escribe en el Primary y aparece en la Réplica.

#### 2. Implementación con Drizzle ORM

Aunque Drizzle no es un "load balancer", su arquitectura modular nos permite configurar conexiones separadas para escrituras y lecturas, e incluso usar su utilidad experimental `widthReplicas` (si está disponible) o construir una propia.

```typescript
// infrastructure/database/db.provider.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { withReplicas } from "drizzle-orm/pg-core";

const primaryPool = new Pool({ connectionString: process.env.DATABASE_URL });
const readPool1 = new Pool({
  connectionString: process.env.DATABASE_READ_REPLICA_1,
});
const readPool2 = new Pool({
  connectionString: process.env.DATABASE_READ_REPLICA_2,
});

// Instancia Primary
const primaryDb = drizzle(primaryPool);

// Instancia con Réplicas gestionadas por Drizzle
// Drizzle seleccionará aleatoriamente una réplica para lecturas usando this.
export const db = withReplicas(primaryDb, [
  drizzle(readPool1),
  drizzle(readPool2),
]);
```

#### 3. El Problema de "Read-Your-Own-Writes" (RYOW)

Imagina este flujo de usuario:

1.  Usuario edita su perfil (`UPDATE`).
2.  La API responde "200 OK".
3.  El frontend redirige al usuario a su dashboard.
4.  El dashboard hace un `GET` que golpea una Réplica.
5.  La Réplica tiene 100ms de lag. El usuario ve los datos viejos. 😱

Este es el problema #1 en sistemas distribuidos.

**Solución Sênior: LSN (Log Sequence Number) Tracking**

En lugar de forzar todas las lecturas al Primary (lo que derrotaría el propósito de tener réplicas), verificamos si la réplica está "al día".

```sql
-- En el Primary: Obtener posición actual del WAL al escribir
SELECT pg_current_wal_lsn();
-- Retorna '0/15D68C0'
```

En la capa de aplicación, guardamos ese token LSN en Redis con el ID del usuario.
Al leer de una réplica:

```sql
-- En la Réplica: Verificar si ya procesó hasta ese punto
SELECT pg_last_wal_replay_lsn() >= '0/15D68C0';
```

Si retorna `false`, la aplicación tiene dos opciones:

1.  Esperar y reintentar (Polling).
2.  Fallar hacia el Primary (Fallback to Primary).

#### 4. Balanceo de Carga y PgBouncer

No conectes tus aplicaciones Node.js directamente a las réplicas si tienes tráfico alto. Usa **PgBouncer** o **AWS RDS Proxy**.
Estos proxies mantienen pools de conexiones persistentes.

- **Session Pooling**: Asigna una conexión de servidor a una conexión de cliente por toda la sesión. Buena compatibilidad.
- **Transaction Pooling**: Asigna conexión solo durante una transacción. Máxima escalabilidad (permite 10,000 clientes con 50 conexiones reales), pero rompe features como `PREPARE` o `SET` variables de sesión.

#### 5. NestJS y Patrón CQRS

La separación de Lecturas y Escrituras se alinea perfectamente con **CQRS (Command Query Responsibility Segregation)**.

```typescript
// commands/create-order.handler.ts
@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler {
  constructor(@Inject("DB_WRITER") private db: NodePgDatabase) {}

  async execute(command: CreateOrderCommand) {
    // Escritas SIEMPRE al Primary
    return this.db.transaction(async (tx) => { ... });
  }
}

// queries/get-orders.handler.ts
@QueryHandler(GetOrdersQuery)
export class GetOrdersHandler {
  constructor(@Inject("DB_READER") private db: NodePgDatabase) {}

  async execute(query: GetOrdersQuery) {
    // Lecturas pueden ir a Réplicas con estrategia RYOW
    return this.db.select().from(orders)...;
  }
}
```

#### Conclusión

Las réplicas de lectura son esenciales para escalar, pero introducen "consistencia eventual". Un arquitecto senior no teme a la consistencia eventual; la gestiona. Al combinar Drizzle ORM con estrategias inteligentes de enrutamiento y CQRS, puedes construir sistemas masivamente escalables que se sienten instantáneos para el usuario.

---

### ENGLISH (EN)

In the lifecycle of any successful application, there comes a time when a single database instance can no longer handle the load. However, before jumping into complex Sharding or Microservices architectures, the logical and most efficient step is to scale reads horizontally using **Read Replicas**.

The pattern is simple in theory: one "Primary" instance for writes and multiple replicas for reads. But in practice, implementing this without breaking data consistency in a Node.js/TypeScript application requires careful engineering.

#### 1. Asynchronous Replication Architecture

![Read Replicas Architecture](./images/postgresql-read-replicas-drizzle/architecture.png)

PostgreSQL uses WAL (Write-Ahead Log) Streaming to replicate changes.

- **Primary (Writer)**: Accepts `INSERT`, `UPDATE`, `DELETE`. Streams WAL to replicas.
- **Replicas (Readers)**: "Hot Standby" mode. Only accept `SELECT`. If you try to write, you will receive the error: `cannot execute INSERT in a read-only transaction`.

The main challenge is **Replication Lag**. Asynchronous replication means there is a time delta (milliseconds to seconds) between when data is written to the Primary and when it appears on the Replica.

#### 2. Implementation with Drizzle ORM

Although Drizzle is not a "load balancer," its modular architecture allows us to configure separate connections for writes and reads, and even use its experimental `withReplicas` utility (if available) or build our own.

```typescript
// infrastructure/database/db.provider.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { withReplicas } from "drizzle-orm/pg-core";

const primaryPool = new Pool({ connectionString: process.env.DATABASE_URL });
const readPool1 = new Pool({
  connectionString: process.env.DATABASE_READ_REPLICA_1,
});
const readPool2 = new Pool({
  connectionString: process.env.DATABASE_READ_REPLICA_2,
});

// Primary Instance
const primaryDb = drizzle(primaryPool);

// Instance with Replicas managed by Drizzle
// Drizzle will randomly select a replica for reads using this.
export const db = withReplicas(primaryDb, [
  drizzle(readPool1),
  drizzle(readPool2),
]);
```

#### 3. The "Read-Your-Own-Writes" (RYOW) Problem

Imagine this user flow:

1.  User updates their profile (`UPDATE`).
2.  API responds "200 OK".
3.  Frontend redirects user to dashboard.
4.  Dashboard makes a `GET` hitting a Replica.
5.  Replica has 100ms lag. User sees old data. 😱

This is problem #1 in distributed systems.

**Senior Solution: LSN (Log Sequence Number) Tracking**

Instead of forcing all reads to Primary (which would defeat the purpose of having replicas), we check if the replica is "caught up."

```sql
-- On Primary: Get current WAL position on write
SELECT pg_current_wal_lsn();
-- Returns '0/15D68C0'
```

In the app layer, we store that LSN token in Redis with the User ID.
When reading from a replica:

```sql
-- On Replica: Check if it has processed up to that point
SELECT pg_last_wal_replay_lsn() >= '0/15D68C0';
```

If it returns `false`, the app has two choices:

1.  Wait and retry (Polling).
2.  Fallback to Primary.

#### 4. Load Balancing and PgBouncer

Do not connect your Node.js apps directly to replicas if you have high traffic. Use **PgBouncer** or **AWS RDS Proxy**.
These proxies maintain persistent connection pools.

- **Session Pooling**: Maps a server connection to a client connection for the entire session. Good compatibility.
- **Transaction Pooling**: Maps connection only during a transaction. Maximum scalability (allows 10,000 clients with 50 actual real connections), but breaks features like `PREPARE` or `SET` session variables.

#### 5. NestJS and CQRS Pattern

Separating Reads and Writes lines up perfectly with **CQRS (Command Query Responsibility Segregation)**.

```typescript
// commands/create-order.handler.ts
@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler {
  constructor(@Inject("DB_WRITER") private db: NodePgDatabase) {}

  async execute(command: CreateOrderCommand) {
    // Writes ALWAYS go to Primary
    return this.db.transaction(async (tx) => { ... });
  }
}

// queries/get-orders.handler.ts
@QueryHandler(GetOrdersQuery)
export class GetOrdersHandler {
  constructor(@Inject("DB_READER") private db: NodePgDatabase) {}

  async execute(query: GetOrdersQuery) {
    // Reads can go to Replicas with RYOW strategy
    return this.db.select().from(orders)...;
  }
}
```

#### Conclusion

Read Replicas are essential for scaling but introduce "eventual consistency." A senior architect doesn't fear eventual consistency; they manage it. By combining Drizzle ORM with smart routing strategies and CQRS, you can build massively scalable systems that feel instant to the user.

---

### PORTUGUÊS (PT)

No ciclo de vida de qualquer aplicação de sucesso, chega um momento em que uma única instância de banco de dados não consegue mais lidar com a carga. No entanto, antes de pular para arquiteturas complexas de Sharding ou Microsserviços, o passo lógico e mais eficiente é escalar as leituras horizontalmente usando **Réplicas de Leitura (Read Replicas)**.

O padrão é simples na teoria: uma instância "Primary" para gravações e múltiplas réplicas para leituras. Mas na prática, implementar isso sem quebrar a consistência dos dados em uma aplicação Node.js/TypeScript requer engenharia cuidadosa.

#### 1. Arquitetura de Replicação Assíncrona

![Read Replicas Architecture](./images/postgresql-read-replicas-drizzle/architecture.png)

PostgreSQL usa WAL (Write-Ahead Log) Streaming para replicar mudanças.

- **Primary (Writer)**: Aceita `INSERT`, `UPDATE`, `DELETE`. Envia fluxo de WAL para as réplicas.
- **Replicas (Readers)**: Modo "Hot Standby". Aceitam apenas `SELECT`. Se tentar escrever, receberá o erro: `cannot execute INSERT in a read-only transaction`.

O principal desafio é o **Replication Lag**. A replicação assíncrona significa que há um delta de tempo (milissegundos a segundos) entre o momento em que um dado é gravado no Primary e quando aparece na Réplica.

#### 2. Implementação com Drizzle ORM

Embora o Drizzle não seja um "balanceador de carga", sua arquitetura modular nos permite configurar conexões separadas para gravações e leituras, e até usar seu utilitário experimental `withReplicas` (se disponível) ou construir o nosso próprio.

```typescript
// infrastructure/database/db.provider.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { withReplicas } from "drizzle-orm/pg-core";

const primaryPool = new Pool({ connectionString: process.env.DATABASE_URL });
const readPool1 = new Pool({
  connectionString: process.env.DATABASE_READ_REPLICA_1,
});
const readPool2 = new Pool({
  connectionString: process.env.DATABASE_READ_REPLICA_2,
});

// Instância Primary
const primaryDb = drizzle(primaryPool);

// Instância com Réplicas gerenciadas pelo Drizzle
// O Drizzle selecionará aleatoriamente uma réplica para leituras usando isso.
export const db = withReplicas(primaryDb, [
  drizzle(readPool1),
  drizzle(readPool2),
]);
```

#### 3. O Problema de "Read-Your-Own-Writes" (RYOW)

Imagine este fluxo de usuário:

1.  Usuário edita seu perfil (`UPDATE`).
2.  API responde "200 OK".
3.  Frontend redireciona o usuário para o dashboard.
4.  O dashboard faz um `GET` que atinge uma Réplica.
5.  A Réplica tem 100ms de lag. O usuário vê dados antigos. 😱

Este é o problema #1 em sistemas distribuídos.

**Solução Sênior: Rastreamento via LSN (Log Sequence Number)**

Em vez de forçar todas as leituras para o Primary (o que derrotaria o propósito de ter réplicas), verificamos se a réplica está "em dia".

```sql
-- No Primary: Obter posição atual do WAL ao escrever
SELECT pg_current_wal_lsn();
-- Retorna '0/15D68C0'
```

Na camada de aplicação, armazenamos esse token LSN no Redis com o ID do usuário.
Ao ler de uma réplica:

```sql
-- Na Réplica: Verificar se já processou até aquele ponto
SELECT pg_last_wal_replay_lsn() >= '0/15D68C0';
```

Se retornar `false`, a aplicação tem duas opções:

1.  Aguardar e tentar novamente (Polling).
2.  Fallback para o Primary.

#### 4. Balanceamento de Carga e PgBouncer

Não conecte suas aplicações Node.js diretamente às réplicas se tiver alto tráfego. Use **PgBouncer** ou **AWS RDS Proxy**.
Esses proxies mantêm pools de conexões persistentes.

- **Session Pooling**: Mapeia uma conexão de servidor para uma conexão de cliente por toda a sessão. Boa compatibilidade.
- **Transaction Pooling**: Mapeia conexão apenas durante uma transação. Escalabilidade máxima (permite 10.000 clientes com 50 conexões reais), mas quebra recursos como `PREPARE` ou `SET` variáveis de sessão.

#### 5. NestJS e Padrão CQRS

A separação de Leituras e Gravações se alinha perfeitamente com **CQRS (Command Query Responsibility Segregation)**.

```typescript
// commands/create-order.handler.ts
@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler {
  constructor(@Inject("DB_WRITER") private db: NodePgDatabase) {}

  async execute(command: CreateOrderCommand) {
    // Gravações SEMPRE no Primary
    return this.db.transaction(async (tx) => { ... });
  }
}

// queries/get-orders.handler.ts
@QueryHandler(GetOrdersQuery)
export class GetOrdersHandler {
  constructor(@Inject("DB_READER") private db: NodePgDatabase) {}

  async execute(query: GetOrdersQuery) {
    // Leituras podem ir para Réplicas com estratégia RYOW
    return this.db.select().from(orders)...;
  }
}
```

#### Conclusão

As réplicas de leitura são essenciais para escalar, mas introduzem "consistência eventual". Um arquiteto sênior não teme a consistência eventual; ele a gerencia. Ao combinar Drizzle ORM com estratégias inteligentes de roteamento e CQRS, você pode construir sistemas massivamente escaláveis que parecem instantâneos para o usuário.
