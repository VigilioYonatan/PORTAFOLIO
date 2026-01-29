### ESPAÑOL (ES)

Cuando una base de datos PostgreSQL supera los 10TB y billones de filas, los índices B-Tree estándar dejan de ser suficientes. Las operaciones de escritura se degradan y el mantenimiento (VACUUM) se vuelve una pesadilla. En este artículo, analizaremos estrategias avanzadas de indexación distribuida y particionamiento utilizando Drizzle ORM y PostgreSQL, enfocándonos en sistemas de alta escala.

#### 1. Particionamiento Declarativo: Divide y Vencerás

![Postgres Partitioning Strategy](./images/distributed-indexing-strategies/partitioning.png)

No podemos indexar una tabla de 10 mil millones de filas eficientemente. Usamos **Table Partitioning** (por rango o lista) para dividir los datos físicamente pero mantener una sola interfaz lógica.

```typescript
// schema.ts con Drizzle
// Nota: Drizzle tiene soporte incipiente para particiones nativas, usualmente se define vía SQL raw
// en migraciones, pero aquí mostramos cómo se estructuraría la lógica.

import { sql } from "drizzle-orm";
import { pgTable, timestamp, bigserial } from "drizzle-orm/pg-core";

export const logs = pgTable("logs", {
  id: bigserial("id", { mode: "number" }),
  createdAt: timestamp("created_at").notNull(),
  // ...otros campos
});

// SQL de migración para convertir en particionada
// CREATE TABLE logs (...) PARTITION BY RANGE (created_at);
// CREATE TABLE logs_y2024m01 PARTITION OF logs FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

El truco de rendimiento es el **Partition Pruning**: el planificador de queries de Postgres solo escanea las particiones relevantes (`WHERE created_at > '2024-01'`) ignorando terabytes de datos históricos.

#### 2. Índices Avanzados: GIN, GiST y BRIN

Un senior sabe cuándo NO usar B-Tree.

- **GIN (Generalized Inverted Index)**: Vital para tipos de datos compuestos como JSONB o Arrays. Permite búsquedas rápidas de "contiene la clave X" dentro de documentos JSON.
- **GiST (Generalized Search Tree)**: Esencial para datos geométricos (PostGIS) o búsquedas de texto completo (tsvector).
- **BRIN (Block Range INdex)**: El héroe olvidado del Big Data en Postgres. Un índice BRIN ocupa kilobytes donde un B-Tree ocuparía gigabytes. Funciona almacenando el valor mín/máx por bloque físico de disco. Perfecto para columnas naturalmente ordenadas como `timestamps` o `ids` incrementales en tablas de logs masivas.

#### 3. Sharding de Aplicación vs. Citus

Cuando una sola instancia (incluso particionada) no es suficiente, distribuimos los datos horizontalmente (Sharding).

- **Application-Level Sharding**: Lógica en el código (NestJS/Drizzle) que decide a qué BD conectar según el `user_id`. Complejo de mantener, rompe JOINs y transacciones entre shards.
- **Citus (Postgres Extension)**: Transforma Postgres en una base de datos distribuida. Las tablas se "fragmentan" transparentemente entre nodos. Drizzle interactúa con el nodo coordinador como si fuera una DB, y Citus paraleliza la query a los workers.

#### 4. Índices Parciales y Cubrientes (Covering Indexes)

Para optimizar queries críticas de "lectura pesada":

- **Índices Parciales**: `CREATE INDEX idx_orders_active ON orders (created_at) WHERE status = 'ACTIVE'`. Solo indexa el 1% de las filas que están activas, ahorrando espacio y acelerando escrituras.
- **Covering Indexes (INCLUDE)**: `CREATE INDEX idx_users_email ON users (email) INCLUDE (id, role)`. Permite realizar "Index Only Scans". Postgres obtiene todos los datos necesarios directamente del índice sin tener que visitar la tabla principal (Heap Fetch), reduciendo I/O drásticamente.

La indexación a escala no es "crear un índice y olvidar". Es un proceso continuo de análisis de `EXPLAIN ANALYZE`, tuneo de `work_mem`, y selección estratégica de estructuras de datos.

---

### ENGLISH (EN)

When a PostgreSQL database exceeds 10TB and billions of rows, standard B-Tree indexes are no longer sufficient. Write operations degrade, and maintenance (VACUUM) becomes a nightmare. In this article, we will analyze advanced distributed indexing and partitioning strategies using Drizzle ORM and PostgreSQL, focusing on high-scale systems.

#### 1. Declarative Partitioning: Divide and Conquer

![Postgres Partitioning Strategy](./images/distributed-indexing-strategies/partitioning.png)

We cannot efficiently index a table with 10 billion rows. We use **Table Partitioning** (by range or list) to physically divide data while maintaining a single logical interface.

```typescript
// schema.ts with Drizzle
// Note: Drizzle has nascent support for native partitions, usually defined via raw SQL
// in migrations, but here we show how the logic would be structured.

import { sql } from "drizzle-orm";
import { pgTable, timestamp, bigserial } from "drizzle-orm/pg-core";

export const logs = pgTable("logs", {
  id: bigserial("id", { mode: "number" }),
  createdAt: timestamp("created_at").notNull(),
  // ...other fields
});

// Migration SQL to convert to partitioned
// CREATE TABLE logs (...) PARTITION BY RANGE (created_at);
// CREATE TABLE logs_y2024m01 PARTITION OF logs FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

The performance trick is **Partition Pruning**: the Postgres query planner only scans relevant partitions (`WHERE created_at > '2024-01'`) ignoring terabytes of historical data.

#### 2. Advanced Indexes: GIN, GiST, and BRIN

A senior engineer knows when NOT to use B-Tree.

- **GIN (Generalized Inverted Index)**: Vital for composite data types like JSONB or Arrays. Enables fast "contains key X" searches within JSON documents.
- **GiST (Generalized Search Tree)**: Essential for geometric data (PostGIS) or full-text searches (tsvector).
- **BRIN (Block Range INdex)**: The unsung hero of Big Data in Postgres. A BRIN index takes up kilobytes where a B-Tree would take gigabytes. It works by storing the min/max value per physical disk block. Perfect for naturally ordered columns like `timestamps` or incremental `ids` in massive log tables.

#### 3. Application Sharding vs. Citus

When a single instance (even partitioned) is not enough, we distribute data horizontally (Sharding).

- **Application-Level Sharding**: Code logic (NestJS/Drizzle) decides which DB to connect to based on `user_id`. Complex to maintain, breaks JOINs and transactions between shards.
- **Citus (Postgres Extension)**: Transforms Postgres into a distributed database. Tables are transparently "sharded" across nodes. Drizzle interacts with the coordinator node as if it were a standard DB, and Citus parallelizes the query to workers.

#### 4. Partial and Covering Indexes

To optimize critical "read-heavy" queries:

- **Partial Indexes**: `CREATE INDEX idx_orders_active ON orders (created_at) WHERE status = 'ACTIVE'`. Only indexes the 1% of rows that are active, saving space and speeding up writes.
- **Covering Indexes (INCLUDE)**: `CREATE INDEX idx_users_email ON users (email) INCLUDE (id, role)`. Allows for "Index Only Scans". Postgres retrieves all necessary data directly from the index without visiting the main table (Heap Fetch), drastically reducing I/O.

Indexing at scale is not "create an index and forget." It is a continuous process of `EXPLAIN ANALYZE` analysis, `work_mem` tuning, and strategic data structure selection.

---

### PORTUGUÊS (PT)

Quando um banco de dados PostgreSQL ultrapassa 10TB e bilhões de linhas, os índices B-Tree padrão deixam de ser suficientes. As operações de gravação degradam e a manutenção (VACUUM) torna-se um pesadelo. Neste artigo, analisaremos estratégias avançadas de indexação distribuída e particionamento usando Drizzle ORM e PostgreSQL, com foco em sistemas de alta escala.

#### 1. Particionamento Declarativo: Dividir e Conquistar

![Postgres Partitioning Strategy](./images/distributed-indexing-strategies/partitioning.png)

Não podemos indexar uma tabela de 10 bilhões de linhas de forma eficiente. Usamos **Table Partitioning** (por intervalo ou lista) para dividir os dados fisicamente, mas manter uma única interface lógica.

```typescript
// schema.ts com Drizzle
// Nota: O Drizzle tem suporte incipiente para particionamento nativo, geralmente definido via SQL bruto
// em migrações, mas aqui mostramos como a lógica seria estruturada.

import { sql } from "drizzle-orm";
import { pgTable, timestamp, bigserial } from "drizzle-orm/pg-core";

export const logs = pgTable("logs", {
  id: bigserial("id", { mode: "number" }),
  createdAt: timestamp("created_at").notNull(),
  // ...outros campos
});

// SQL de migração para converter em particionada
// CREATE TABLE logs (...) PARTITION BY RANGE (created_at);
// CREATE TABLE logs_y2024m01 PARTITION OF logs FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

O truque de desempenho é o **Partition Pruning**: o planejador de consultas do Postgres verifica apenas as partições relevantes (`WHERE created_at > '2024-01'`) ignorando terabytes de dados históricos.

#### 2. Índices Avançados: GIN, GiST e BRIN

Um engenheiro sênior sabe quando NÃO usar B-Tree.

- **GIN (Generalized Inverted Index)**: Vital para tipos de dados compostos como JSONB ou Arrays. Permite pesquisas rápidas de "contém a chave X" dentro de documentos JSON.
- **GiST (Generalized Search Tree)**: Essencial para dados geométricos (PostGIS) ou pesquisas de texto completo (tsvector).
- **BRIN (Block Range INdex)**: O herói desconhecido do Big Data no Postgres. Um índice BRIN ocupa kilobytes onde um B-Tree ocuparia gigabytes. Funciona armazenando o valor mín/máx por bloco físico de disco. Perfeito para colunas naturalmente ordenadas como `timestamps` ou `ids` incrementais em tabelas de logs massivas.

#### 3. Sharding de Aplicação vs. Citus

Quando uma única instância (mesmo particionada) não é suficiente, distribuímos os dados horizontalmente (Sharding).

- **Application-Level Sharding**: Lógica no código (NestJS/Drizzle) que decide a qual BD conectar com base no `user_id`. Complexo de manter, quebra JOINs e transações entre shards.
- **Citus (Postgres Extension)**: Transforma o Postgres em um banco de dados distribuído. As tabelas são "fragmentadas" de forma transparente entre nós. O Drizzle interage com o nó coordenador como se fosse um BD padrão, e o Citus paraleliza a consulta para os workers.

#### 4. Índices Parciais e de Cobertura (Covering Indexes)

Para otimizar consultas críticas de "leitura pesada":

- **Índices Parciais**: `CREATE INDEX idx_orders_active ON orders (created_at) WHERE status = 'ACTIVE'`. Indexa apenas 1% das linhas que estão ativas, economizando espaço e acelerando gravações.
- **Covering Indexes (INCLUDE)**: `CREATE INDEX idx_users_email ON users (email) INCLUDE (id, role)`. Permite realizar "Index Only Scans". O Postgres obtém todos os dados necessários diretamente do índice sem ter que visitar a tabela principal (Heap Fetch), reduzindo drasticamente o I/O.

A indexação em escala não é "criar um índice e esquecer". É um processo contínuo de análise de `EXPLAIN ANALYZE`, ajuste de `work_mem` e seleção estratégica de estruturas de dados.
