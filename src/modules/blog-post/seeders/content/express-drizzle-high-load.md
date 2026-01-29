### ESPAÑOL (ES)

Escalar una aplicación ExpressJS para manejar decenas de miles de peticiones por segundo requiere un enfoque holístico que abarque desde la gestión de conexiones de red hasta la optimización extrema de la capa de persistencia. La combinación de Express como servidor web y Drizzle como ORM "SQL-first" ofrece una base excepcionalmente rápida, pero en condiciones de carga extrema, cada milisegundo cuenta.

#### 1. Gestión de Conexiones: PgBouncer y Read Replicas

![Drizzle Pool Architecture](./images/express-drizzle-high-load/architecture.png)

En sistemas de alta carga, no puedes conectar 500 instancias de Node.js directamente al nodo primario de Postgres. Necesitas multiplexación.

**Patrón Read/Write Split en Drizzle:**

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// 1. Writer Pool (Nodo Primario)
const writerPool = new Pool({
  connectionString: process.env.DATABASE_URL_WRITE,
  max: 10,
});

// 2. Reader Pool (Replicas de Lectura - Round Robin via DNS o Load Balancer)
const readerPool = new Pool({
  connectionString: process.env.DATABASE_URL_READ,
  max: 20,
});

// 3. Instancia Drizzle con logger personalizado para debug slow queries
export const db = drizzle(writerPool, { logger: true });
export const dbRead = drizzle(readerPool);

// Uso:
// Escrituras críticas -> db
// Reportes y listados -> dbRead
```

**Tip Senior:** Usa **PgBouncer** en modo "Transaction Pooling" delante de tu base de datos. Esto permite manejar 10,000 conexiones de clientes con solo 50 conexiones reales a Postgres.

#### 2. Optimizaciones de Bajo Nivel: Prepared Statements

Drizzle brilla aquí. Una sentencia preparada se parsea y planea una sola vez en Postgres.

```typescript
// Definición fuera del handler (Global Scope)
const preparedUserSelect = dbRead
  .select({
    id: users.id,
    email: users.email,
    role: users.role,
  })
  .from(users)
  .where(eq(users.id, sql.placeholder("id")))
  .prepare("get_user_by_id");

// Ejecución ultra-rápida en el handler
app.get("/users/:id", async (req, res) => {
  const user = await preparedUserSelect.execute({ id: req.params.id });
  res.json(user[0]);
});
```

Esto reduce el overhead de CPU en la DB en un 40% para queries repetitivas de alta frecuencia.

#### 3. Particionamiento Declarativo (Big Data)

Cuando tienes tablas de 500 millones de filas (ej: `logs`, `transactions`), los índices B-Tree se vuelven lentos y pesados en RAM. La solución es el **Particionamiento**.

Drizzle no soporta particionamiento nativo explícitamente en su API de esquemas (aún), pero podemos gestionarlo con SQL crudo en migraciones:

```sql
-- migration_001.sql
CREATE TABLE transactions (
  id SERIAL,
  amount DECIMAL,
  created_at TIMESTAMP NOT NULL
) PARTITION BY RANGE (created_at);

CREATE TABLE transactions_2024_q1 PARTITION OF transactions
  FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE transactions_2024_q2 PARTITION OF transactions
  FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
```

Esto permite al Query Planner de Postgres hacer "Partition Pruning": si buscas datos de Mayo, Postgres ignora físicamente la partición Q1.

#### 4. Estrategia de Eventual Consistency con BullMQ

No todas las escrituras necesitan ser síncronas. Si el usuario sube un archivo CSV para importar, no bloquees el HTTP Request.

```typescript
// Producer (Express Handler)
import { Queue } from "bullmq";
const importQueue = new Queue("csv-import", { connection: redisConfig });

app.post("/upload", async (req, res) => {
  await importQueue.add("process-csv", { fileId: req.body.id });
  res.status(202).json({ status: "queued" }); // Retorno inmediato
});

// Consumer (Worker Process separado)
import { Worker } from "bullmq";

const worker = new Worker(
  "csv-import",
  async (job) => {
    // Procesamiento pesado aquí
    // Insertar 10k filas en batch con Drizzle
    await db.insert(data).values(job.data.rows);
  },
  { concurrency: 5 },
);
```

#### 5. Caching Semántico "Read-Aside"

Redis no es solo para sesiones. Lo usamos para cachear el resultado de queries complejas (Materialized View pattern en app layer).

```typescript
async function getDashboardStats(orgId: string) {
  const cacheKey = `stats:${orgId}`;

  // 1. Cache Hit?
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // 2. Cache Miss: Ejecutar query pesada (Aggregation)
  const stats = await dbRead
    .select({
      count: count(users.id),
      avg: avg(users.age),
    })
    .from(users)
    .where(eq(users.orgId, orgId));

  // 3. Populate Cache (TTL 5 min)
  // Usamos pipeline para reducir RTT
  const pipeline = redis.pipeline();
  pipeline.setex(cacheKey, 300, JSON.stringify(stats));
  pipeline.exec();

  return stats;
}
```

#### Conclusión

La alta carga expone las grietas en arquitecturas ingenuas. Al separar lecturas de escrituras, utilizar sentencias preparadas, particionar datos masivos y descargar trabajo pesado a workers asíncronos, transformamos una aplicación Express frágil en una fortaleza escalable capaz de procesar millones de transacciones diarias.

---

### ENGLISH (EN)

Scaling an ExpressJS application to handle tens of thousands of requests per second requires a holistic approach spanning from network connection management to extreme optimization of the persistence layer. The combination of Express as a web server and Drizzle as a "SQL-first" ORM offers an exceptionally fast foundation, but under extreme load, every millisecond counts.

#### 1. Connection Management: PgBouncer and Read Replicas

![Drizzle Pool Architecture](./images/express-drizzle-high-load/architecture.png)

In high-load systems, you cannot connect 500 Node.js instances directly to the primary Postgres node. You need multiplexing.

**Read/Write Split Pattern in Drizzle:**

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// 1. Writer Pool (Primary Node)
const writerPool = new Pool({
  connectionString: process.env.DATABASE_URL_WRITE,
  max: 10,
});

// 2. Reader Pool (Read Replicas - Round Robin via DNS or Load Balancer)
const readerPool = new Pool({
  connectionString: process.env.DATABASE_URL_READ,
  max: 20,
});

// 3. Drizzle instance with custom logger for debugging slow queries
export const db = drizzle(writerPool, { logger: true });
export const dbRead = drizzle(readerPool);

// Usage:
// Critical writes -> db
// Reports and listings -> dbRead
```

**Senior Tip:** Use **PgBouncer** in "Transaction Pooling" mode in front of your database. This allows handling 10,000 client connections with only 50 real connections to Postgres.

#### 2. Low-Level Optimizations: Prepared Statements

Drizzle shines here. A prepared statement is parsed and planned only once in Postgres.

```typescript
// Definition outside the handler (Global Scope)
const preparedUserSelect = dbRead
  .select({
    id: users.id,
    email: users.email,
    role: users.role,
  })
  .from(users)
  .where(eq(users.id, sql.placeholder("id")))
  .prepare("get_user_by_id");

// Ultra-fast execution in the handler
app.get("/users/:id", async (req, res) => {
  const user = await preparedUserSelect.execute({ id: req.params.id });
  res.json(user[0]);
});
```

This reduces CPU overhead on the DB by 40% for high-frequency repetitive queries.

#### 3. Declarative Partitioning (Big Data)

When you have tables with 500 million rows (e.g., `logs`, `transactions`), B-Tree indexes become slow and heavy on RAM. The solution is **Partitioning**.

Drizzle doesn't support native partitioning explicitly in its schema API (yet), but we can manage it with raw SQL in migrations:

```sql
-- migration_001.sql
CREATE TABLE transactions (
  id SERIAL,
  amount DECIMAL,
  created_at TIMESTAMP NOT NULL
) PARTITION BY RANGE (created_at);

CREATE TABLE transactions_2024_q1 PARTITION OF transactions
  FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE transactions_2024_q2 PARTITION OF transactions
  FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
```

This functions allows the Postgres Query Planner to perform "Partition Pruning": if you search for data from May, Postgres physically ignores the Q1 partition.

#### 4. Eventual Consistency Strategy with BullMQ

Not all writes need to be synchronous. If the user uploads a CSV file for import, do not block the HTTP Request.

```typescript
// Producer (Express Handler)
import { Queue } from "bullmq";
const importQueue = new Queue("csv-import", { connection: redisConfig });

app.post("/upload", async (req, res) => {
  await importQueue.add("process-csv", { fileId: req.body.id });
  res.status(202).json({ status: "queued" }); // Immediate return
});

// Consumer (Worker Process separated)
import { Worker } from "bullmq";

const worker = new Worker(
  "csv-import",
  async (job) => {
    // Heavy processing here
    // Insert 10k rows in batch with Drizzle
    await db.insert(data).values(job.data.rows);
  },
  { concurrency: 5 },
);
```

#### 5. "Read-Aside" Semantic Caching

Redis is not just for sessions. We use it to cache the result of complex queries (Materialized View pattern in app layer).

```typescript
async function getDashboardStats(orgId: string) {
  const cacheKey = `stats:${orgId}`;

  // 1. Cache Hit?
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // 2. Cache Miss: Execute heavy query (Aggregation)
  const stats = await dbRead
    .select({
      count: count(users.id),
      avg: avg(users.age),
    })
    .from(users)
    .where(eq(users.orgId, orgId));

  // 3. Populate Cache (TTL 5 min)
  // We use pipeline to reduce RTT
  const pipeline = redis.pipeline();
  pipeline.setex(cacheKey, 300, JSON.stringify(stats));
  pipeline.exec();

  return stats;
}
```

#### Conclusion

High load exposes the cracks in naive architectures. By separating reads from writes, using prepared statements, partitioning massive data, and offloading heavy work to asynchronous workers, we transform a fragile Express application into a scalable fortress capable of processing millions of daily transactions.

---

### PORTUGUÊS (PT)

Escalar uma aplicação ExpressJS para lidar com dezenas de milhares de solicitações por segundo exige uma abordagem holística que abrange desde o gerenciamento de conexões de rede até a otimização extrema da camada de persistência. A combinação do Express como servidor web e do Drizzle como um ORM "SQL-first" oferece uma base excepcionalmente rápida, mas em condições de carga extrema, cada milissegundo conta.

#### 1. Gerenciamento de Conexões: PgBouncer e Réplicas de Leitura

![Drizzle Pool Architecture](./images/express-drizzle-high-load/architecture.png)

Em sistemas de alta carga, você não pode conectar 500 instâncias Node.js diretamente ao nó primário do Postgres. Você precisa de multiplexação.

**Padrão Read/Write Split no Drizzle:**

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// 1. Writer Pool (Nó Primário)
const writerPool = new Pool({
  connectionString: process.env.DATABASE_URL_WRITE,
  max: 10,
});

// 2. Reader Pool (Réplicas de Leitura - Round Robin via DNS ou Load Balancer)
const readerPool = new Pool({
  connectionString: process.env.DATABASE_URL_READ,
  max: 20,
});

// 3. Instância Drizzle com logger personalizado para debug de slow queries
export const db = drizzle(writerPool, { logger: true });
export const dbRead = drizzle(readerPool);

// Uso:
// Gravações críticas -> db
// Relatórios e listagens -> dbRead
```

**Dica Sênior:** Use **PgBouncer** no modo "Transaction Pooling" na frente do seu banco de dados. Isso permite lidar com 10.000 conexões de clientes com apenas 50 conexões reais ao Postgres.

#### 2. Otimizações de Baixo Nível: Prepared Statements

O Drizzle brilha aqui. Um prepared statement é analisado e planejado apenas uma vez no Postgres.

```typescript
// Definição fora do handler (Escopo Global)
const preparedUserSelect = dbRead
  .select({
    id: users.id,
    email: users.email,
    role: users.role,
  })
  .from(users)
  .where(eq(users.id, sql.placeholder("id")))
  .prepare("get_user_by_id");

// Execução ultra-rápida no handler
app.get("/users/:id", async (req, res) => {
  const user = await preparedUserSelect.execute({ id: req.params.id });
  res.json(user[0]);
});
```

Isso reduz a carga da CPU no DB em 40% para consultas repetitivas de alta frequência.

#### 3. Particionamento Declarativo (Big Data)

Quando você tem tabelas com 500 milhões de linhas (ex: `logs`, `transactions`), os índices B-Tree tornam-se lentos e pesados na RAM. A solução é o **Particionamento**.

O Drizzle não suporta particionamento nativo explicitamente em sua API de esquema (ainda), mas podemos gerenciá-lo com SQL bruto em migrações:

```sql
-- migration_001.sql
CREATE TABLE transactions (
  id SERIAL,
  amount DECIMAL,
  created_at TIMESTAMP NOT NULL
) PARTITION BY RANGE (created_at);

CREATE TABLE transactions_2024_q1 PARTITION OF transactions
  FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE transactions_2024_q2 PARTITION OF transactions
  FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
```

Isso permite que o Planejador de Consultas do Postgres faça "Partition Pruning": se você buscar dados de maio, o Postgres ignora fisicamente a partição Q1.

#### 4. Estratégia de Eventual Consistency com BullMQ

Nem todas as gravações precisam ser síncronas. Se o usuário fizer upload de um arquivo CSV para importação, não bloqueie a Solicitação HTTP.

```typescript
// Producer (Express Handler)
import { Queue } from "bullmq";
const importQueue = new Queue("csv-import", { connection: redisConfig });

app.post("/upload", async (req, res) => {
  await importQueue.add("process-csv", { fileId: req.body.id });
  res.status(202).json({ status: "queued" }); // Retorno imediato
});

// Consumer (Worker Process separado)
import { Worker } from "bullmq";

const worker = new Worker(
  "csv-import",
  async (job) => {
    // Processamento pesado aqui
    // Inserir 10k linhas em lote com Drizzle
    await db.insert(data).values(job.data.rows);
  },
  { concurrency: 5 },
);
```

#### 5. Caching Semântico "Read-Aside"

Redis não é apenas para sessões. Nós o usamos para armazenar em cache o resultado de consultas complexas (padrão Materialized View na camada de aplicativo).

```typescript
async function getDashboardStats(orgId: string) {
  const cacheKey = `stats:${orgId}`;

  // 1. Cache Hit?
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // 2. Cache Miss: Executar consulta pesada (Agregação)
  const stats = await dbRead
    .select({
      count: count(users.id),
      avg: avg(users.age),
    })
    .from(users)
    .where(eq(users.orgId, orgId));

  // 3. Popular Cache (TTL 5 min)
  // Usamos pipeline para reduzir RTT
  const pipeline = redis.pipeline();
  pipeline.setex(cacheKey, 300, JSON.stringify(stats));
  pipeline.exec();

  return stats;
}
```

#### Conclusão

A alta carga expõe as rachaduras em arquiteturas ingênuas. Ao separar leituras de gravações, usar prepared statements, particionar dados massivos e descarregar trabalho pesado para workers assíncronos, transformamos uma aplicação Express frágil em uma fortaleza escalável capaz de processar milhões de transações diárias.
