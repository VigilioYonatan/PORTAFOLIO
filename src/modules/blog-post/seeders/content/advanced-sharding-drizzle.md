### ESPAÑOL (ES)

El escalado horizontal de bases de datos relacionales, conocido como **Sharding**, es una de las fronteras más complejas y desafiantes en la ingeniería de backend. Mientras que el escalado vertical (comprar un servidor más grande) tiene un límite físico y financiero, el sharding promete una escalabilidad teóricamente infinita. Sin embargo, como dice el teorema CAP, todo tiene un costo.

En este análisis profundo, exploraremos cómo implementar una arquitectura de sharding robusta utilizando Drizzle ORM y Node.js, abordando no solo el enrutamiento de consultas, sino también la gestión de topología, re-sharding y consistencia de datos.

#### 1. ¿Cuándo (y cuándo NO) hacer Sharding?

![Sharding Architecture](./images/advanced-sharding-drizzle/architecture.png)

El sharding introduce una complejidad operativa masiva. Antes de considerar fragmentar tu base de datos, debes haber agotado:

1.  **Optimización de Índices**: Un `EXPLAIN ANALYZE` vale más que 10 nuevos servidores.
2.  **Particionamiento Nativo de Postgres**: Usar `PARTITION BY RANGE/HASH` en una sola instancia para mejorar la gestión de tablas gigantes.
3.  **Réplicas de Lectura**: Si tu bottleneck es lectura, usa réplicas. El sharding es principalmente para escalar **escrituras**.
4.  **Vertical Scaling**: ¿Has intentado usar una instancia AWS `r7g.16xlarge` (512GB RAM)? A menudo es más barato que mantener un cluster distribuido.

**La Señal de Fuego**: Implementa sharding cuando tu volumen de escritura (IOPS) satura el disco del nodo primario más grande posible, o cuando el tamaño de tus índices activos excede la RAM disponible (RAM-to-Disk ratio < 1:1), causando "thrashing" constante.

#### 2. Estrategias de Distribución de Datos

La elección de la **Sharding Key** es irrevocable. Cambiarla implica reescribir toda la base de datos.

- **Tenant-Based (SaaS)**: Todos los datos de un `tenant_id` viven en el mismo shard.
  - _Pros_: JOINs locales rápidos, transacciones ACID por tenant.
  - _Contras_: Hot Shards (un cliente gigante como Coca-Cola usando el 40% de un shard).
- **Entity-Based (User ID)**: Ideal para B2C (redes sociales).
  - _Pros_: Distribución muy uniforme.
  - _Contras_: Consultas de rango o agregaciones globales son muy costosas (Scatter-Gather).
- **Geo-Based**: Sharding por región geográfica (EU, US, APAC).
  - _Pros_: Baja latencia (Data Locality) y cumplimiento de GDPR.

#### 3. Arquitectura del "Shard Router" con Drizzle

Drizzle no tiene soporte nativo para sharding automático (como Vitess), pero su flexibilidad permite construir un enrutador de nivel de aplicación elegante.

```typescript
// infrastructure/database/shard-manager.ts
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { ConsistentHash } from "./consistent-hash"; // Algoritmo Ketama o Rendezvous

export class ShardManager {
  private shards: Map<string, NodePgDatabase> = new Map();
  private ring = new ConsistentHash();

  constructor(private config: DatabaseConfig) {
    // Inicializar pool para cada shard físico
    this.config.shards.forEach((shardConfig) => {
      const pool = new Pool({ connectionString: shardConfig.url });
      const db = drizzle(pool);
      this.shards.set(shardConfig.id, db);
      this.ring.addNode(shardConfig.id);
    });
  }

  // Obtener la instancia de DB correcta para un Tenant
  getShard(tenantId: string): NodePgDatabase {
    const shardId = this.ring.getNode(tenantId);
    const db = this.shards.get(shardId);
    if (!db) throw new Error(`Shard ${shardId} not found/healthy`);
    return db;
  }
}
```

#### 4. Topología Dinámica y Service Discovery

En producción, no quieres hardcodear las IPs de los shards en tu `ENV`. Necesitas un **almacén de topología** (como Redis, Consul o Etcd).
Tu aplicación debe suscribirse a cambios en la topología para saber si un shard ha sido promovido (failover) o movido.

```typescript
// Ejemplo conceptual
async function getTopology() {
  const shardsConfig = await redis.hgetall("db:topology:shards");
  // { "shard-01": "postgres://node1:5432/db", "shard-02": "postgres://node2..." }
  return parseTopology(shardsConfig);
}
```

#### 5. El Desafío de las Consultas Cross-Shard (Scatter-Gather)

¿Cómo calculas el "Total de Usuarios" si están repartidos en 10 shards?
No puedes hacer `SELECT COUNT(*) FROM users`. Debes lanzar la consulta a todos los shards en paralelo y sumar en la aplicación.

```typescript
async function getGlobalUserCount(manager: ShardManager) {
  const allShards = manager.getAllShards();

  // Ejecutar en paralelo (Scatter)
  const counts = await Promise.all(
    allShards.map((db) =>
      db.select({ count: sql<number>`count(*)` }).from(users),
    ),
  );

  // Agregar resultados (Gather)
  return counts.reduce((acc, res) => acc + Number(res[0].count), 0);
}
```

_Advertencia_: Esto no escala bien para `ORDER BY` y `LIMIT` (paginación global). Evita esto a toda costa; pre-calcula totales en una tabla separada o usa un Data Warehouse.

#### 6. Resharding: El Cuco de las Bases de Datos

Eventualmente, un shard se llenará. Necesitas dividirlo en dos.
**Estrategia Zero-Downtime**:

1.  Identificar rangos de Shard Keys a mover.
2.  Iniciar replicación lógica desde el Shard Origen al Destino (usando `pglogical` o CDC).
3.  Cuando el lag sea casi cero, bloquear escrituras para esos Tenants (pequeño downtime de segundos).
4.  Actualizar la topología en Redis.
5.  Desbloquear escrituras (ahora van al nuevo destino).

El sharding es una herramienta poderosa pero peligrosa. Drizzle ORM, al ser un cliente agnóstico y ligero, es el compañero perfecto para orquestar esta complejidad sin añadir overhead innecesario.

---

### ENGLISH (EN)

Horizontal scaling of relational databases, known as **Sharding**, is one of the most complex frontiers in backend engineering. While vertical scaling (buying a bigger server) has physical and financial limits, sharding promises theoretically infinite scalability. However, as the CAP theorem states, everything comes at a cost.

In this deep dive, we will explore how to implement a robust sharding architecture using Drizzle ORM and Node.js, addressing not just query routing, but topology management, resharding, and data consistency.

#### 1. When (and when NOT) to Shard?

![Sharding Architecture](./images/advanced-sharding-drizzle/architecture.png)

Sharding introduces massive operational complexity. Before considering fragmenting your database, you must have exhausted:

1.  **Index Optimization**: An `EXPLAIN ANALYZE` is worth more than 10 new servers.
2.  **Postgres Native Partitioning**: Use `PARTITION BY RANGE/HASH` on a single instance to improve giant table management.
3.  **Read Replicas**: If your bottleneck is reading, use replicas. Sharding is primarily for scaling **writes**.
4.  **Vertical Scaling**: Have you tried using an AWS `r7g.16xlarge` instance (512GB RAM)? Often cheaper than maintaining a distributed cluster.

**The Warning Signal**: Implement sharding when your write volume (IOPS) saturates the disk of the largest possible primary node, or when the size of your active indexes exceeds available RAM (RAM-to-Disk ratio < 1:1), causing constant "thrashing."

#### 2. Data Distribution Strategies

The choice of the **Sharding Key** is irrevocable. Changing it means rewriting the entire database.

- **Tenant-Based (SaaS)**: All data for a `tenant_id` lives on the same shard.
  - _Pros_: Fast local JOINs, ACID transactions per tenant.
  - _Cons_: Hot Shards (a giant client effectively taking up 40% of a shard).
- **Entity-Based (User ID)**: Ideal for B2C (social networks).
  - _Pros_: Very uniform distribution.
  - _Cons_: Range queries or global aggregations are very expensive (Scatter-Gather).
- **Geo-Based**: Sharding by geographic region (EU, US, APAC).
  - _Pros_: Low latency (Data Locality) and GDPR compliance.

#### 3. "Shard Router" Architecture with Drizzle

Drizzle has no native support for automatic sharding (like Vitess), but its flexibility allows building an elegant application-level router.

```typescript
// infrastructure/database/shard-manager.ts
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { ConsistentHash } from "./consistent-hash"; // Ketama or Rendezvous algo

export class ShardManager {
  private shards: Map<string, NodePgDatabase> = new Map();
  private ring = new ConsistentHash();

  constructor(private config: DatabaseConfig) {
    // Initialize pool for each physical shard
    this.config.shards.forEach((shardConfig) => {
      const pool = new Pool({ connectionString: shardConfig.url });
      const db = drizzle(pool);
      this.shards.set(shardConfig.id, db);
      this.ring.addNode(shardConfig.id);
    });
  }

  // Get correct DB instance for a Tenant
  getShard(tenantId: string): NodePgDatabase {
    const shardId = this.ring.getNode(tenantId);
    const db = this.shards.get(shardId);
    if (!db) throw new Error(`Shard ${shardId} not found/healthy`);
    return db;
  }
}
```

#### 4. Dynamic Topology and Service Discovery

In production, you don't want to hardcode shard IPs in your `ENV`. You need a **topology store** (like Redis, Consul, or Etcd).
Your application must subscribe to topology changes to know if a shard has been promoted (failover) or moved.

```typescript
// Conceptual example
async function getTopology() {
  const shardsConfig = await redis.hgetall("db:topology:shards");
  // { "shard-01": "postgres://node1:5432/db", "shard-02": "postgres://node2..." }
  return parseTopology(shardsConfig);
}
```

#### 5. Cross-Shard Queries Challenge (Scatter-Gather)

How do you calculate "Total Users" if they are spread across 10 shards?
You cannot execute `SELECT COUNT(*) FROM users`. You must launch the query to all shards in parallel and sum in the application.

```typescript
async function getGlobalUserCount(manager: ShardManager) {
  const allShards = manager.getAllShards();

  // Execute in parallel (Scatter)
  const counts = await Promise.all(
    allShards.map((db) =>
      db.select({ count: sql<number>`count(*)` }).from(users),
    ),
  );

  // Aggregate results (Gather)
  return counts.reduce((acc, res) => acc + Number(res[0].count), 0);
}
```

_Warning_: This does not scale well for `ORDER BY` and `LIMIT` (global pagination). Avoid this at all costs; pre-calculate totals in a separate table or use a Data Warehouse.

#### 6. Resharding: The Database Boogeyman

Eventually, a shard will fill up. You need to split it in two.
**Zero-Downtime Strategy**:

1.  Identify Shard Key ranges to move.
2.  Start logical replication from Source Shard to Destination (using `pglogical` or CDC).
3.  When lag is near zero, lock writes for those Tenants (small downtime of seconds).
4.  Update topology in Redis.
5.  Unlock writes (now directed to the new destination).

Sharding is a powerful but dangerous tool. Drizzle ORM, being a lightweight and agnostic client, is the perfect companion to orchestrate this complexity without adding unnecessary overhead.

---

### PORTUGUÊS (PT)

O escalonamento horizontal de bancos de dados relacionais, conhecido como **Sharding**, é uma das fronteiras mais complexas da engenharia de backend. Enquanto o escalonamento vertical (comprar um servidor maior) tem limites físicos e financeiros, o sharding promete escalabilidade teoricamente infinita. No entanto, como diz o teorema CAP, tudo tem um custo.

Neste mergulho profundo, exploraremos como implementar uma arquitetura de sharding robusta usando Drizzle ORM e Node.js, abordando não apenas o roteamento de consultas, mas também o gerenciamento de topologia, re-sharding e consistência de dados.

#### 1. Quando (e quando NÃO) fazer Sharding?

![Sharding Architecture](./images/advanced-sharding-drizzle/architecture.png)

O sharding introduz complexidade operacional massiva. Antes de considerar fragmentar seu banco de dados, você deve ter esgotado:

1.  **Otimização de Índices**: Um `EXPLAIN ANALYZE` vale mais que 10 novos servidores.
2.  **Particionamento Nativo do Postgres**: Use `PARTITION BY RANGE/HASH` em uma instância única para gerenciamento de tabelas gigantes.
3.  **Réplicas de Leitura**: Se o gargalo for leitura, use réplicas. Sharding é principalmente para escalar **escritas**.
4.  **Escalonamento Vertical**: Você tentou usar uma instância AWS `r7g.16xlarge` (512GB RAM)? Muitas vezes é mais barato do que manter um cluster distribuído.

**O Sinal de Alerta**: Implemente sharding quando seu volume de escrita (IOPS) saturar o disco do maior nó primário possível, ou quando o tamanho de seus índices ativos exceder a RAM disponível, causando "thrashing" constante.

#### 2. Estratégias de Distribuição de Dados

A escolha da **Sharding Key** é irrevogável. Alterá-la significa reescrever todo o banco de dados.

- **Tenant-Based (SaaS)**: Todos os dados de um `tenant_id` vivem no mesmo shard.
  - _Prós_: JOINs locais rápidos, transações ACID por tenant.
  - _Contras_: Hot Shards (um cliente gigante usando o 40% de um shard).
- **Entity-Based (User ID)**: Ideal para B2C (redes sociais).
  - _Prós_: Distribuição muito uniforme.
  - _Contras_: Consultas de intervalo ou agregações globais custosas (Scatter-Gather).
- **Geo-Based**: Sharding por região geográfica (EU, US, APAC).
  - _Prós_: Baixa latência (Localidade de Dados) e conformidade com GDPR.

#### 3. Arquitetura "Shard Router" com Drizzle

Drizzle não tem suporte nativo para sharding automático (como Vitess), mas sua flexibilidade permite construir um roteador elegante na camada de aplicação.

```typescript
// infrastructure/database/shard-manager.ts
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { ConsistentHash } from "./consistent-hash"; // Algoritmo Ketama/Rendezvous

export class ShardManager {
  private shards: Map<string, NodePgDatabase> = new Map();
  private ring = new ConsistentHash();

  constructor(private config: DatabaseConfig) {
    // Inicializar pool para cada shard físico
    this.config.shards.forEach((shardConfig) => {
      const pool = new Pool({ connectionString: shardConfig.url });
      const db = drizzle(pool);
      this.shards.set(shardConfig.id, db);
      this.ring.addNode(shardConfig.id);
    });
  }

  // Obter a instância de DB correta para um Tenant
  getShard(tenantId: string): NodePgDatabase {
    const shardId = this.ring.getNode(tenantId);
    const db = this.shards.get(shardId);
    if (!db) throw new Error(`Shard ${shardId} não encontrado/saudável`);
    return db;
  }
}
```

#### 4. Topologia Dinâmica e Descoberta de Serviços

Em produção, você não quer hardcodear IPs de shards no `ENV`. Você precisa de um **armazenamento de topologia** (como Redis, Consul ou Etcd).
Sua aplicação deve assinar mudanças de topologia para saber se um shard foi promovido (failover) ou movido.

```typescript
// Exemplo conceitual
async function getTopology() {
  const shardsConfig = await redis.hgetall("db:topology:shards");
  // { "shard-01": "postgres://node1:5432/db", "shard-02": "postgres://node2..." }
  return parseTopology(shardsConfig);
}
```

#### 5. Desafio das Consultas Cross-Shard (Scatter-Gather)

Como calcular "Total de Usuários" se estão espalhados em 10 shards?
Você não pode executar `SELECT COUNT(*) FROM users`. Deve lançar a consulta para todos os shards em paralelo e somar na aplicação.

```typescript
async function getGlobalUserCount(manager: ShardManager) {
  const allShards = manager.getAllShards();

  // Executar em paralelo (Scatter)
  const counts = await Promise.all(
    allShards.map((db) =>
      db.select({ count: sql<number>`count(*)` }).from(users),
    ),
  );

  // Agregar resultados (Gather)
  return counts.reduce((acc, res) => acc + Number(res[0].count), 0);
}
```

_Aviso_: Isso não escala bem para `ORDER BY` e `LIMIT` (paginação global). Evite a todo custo; pré-calcule totais em tabelas separadas ou use um Data Warehouse.

#### 6. Resharding: O Bicho-Papão dos Bancos de Dados

Eventualmente, um shard encherá. Você precisa dividi-lo.
**Estratégia Zero-Downtime**:

1.  Identificar intervalos de Shard Keys para mover.
2.  Iniciar replicação lógica da Origem para o Destino (usando `pglogical` ou CDC).
3.  Quando o lag for quase zero, bloquear escrituras para esses Tenants (downtime de segundos).
4.  Atualizar topologia no Redis.
5.  Desbloquear escrituras (agora direcionadas ao novo destino).

O sharding é uma ferramenta poderosa mas perigosa. Drizzle ORM, sendo um cliente leve e agnóstico, é o companheiro perfeito para orquestrar essa complexidade sem adicionar sobrecarga.
