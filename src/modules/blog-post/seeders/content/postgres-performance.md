### ESPAÑOL (ES)

PostgreSQL es indiscutiblemente el motor de base de datos relacional open source más avanzado del mundo, capaz de gestionar petabytes de información y miles de transacciones por segundo. Sin embargo, su configuración por defecto ("out-of-the-box") es conservadora, diseñada para ejecutarse en hardware modesto y garantizar la máxima compatibilidad, no el máximo rendimiento. Para ingenieros de backend y DBAs que buscan escalar aplicaciones a nivel empresarial, es crucial entender cómo "tunear" Postgres para cargas de trabajo masivas.

En este artículo técnico, profundizaremos en la arquitectura interna de Postgres, estrategias de optimización avanzadas y cómo integrar estas prácticas con herramientas modernas como Drizzle ORM en un entorno Node.js/TypeScript.

#### 1. Arquitectura de Memoria: shared_buffers y work_mem

El manejo de memoria en Postgres es fundamental para el rendimiento. Entender el archivo `postgresql.conf` es el primer paso.

![Postgres Memory Architecture](./images/postgres-performance/memory-architecture.png)

- **shared_buffers**: Este parámetro define cuánta memoria RAM dedica Postgres a cachear bloques de datos. A diferencia de otras bases de datos que intentan cachear todo el DB en RAM, Postgres confía en el sistema operativo para el manejo del caché de archivos.
  - _Regla de oro_: Asigna el **25% de la RAM total** del sistema. Si tu servidor tiene 64GB, `shared_buffers` debería ser 16GB. Asignar más puede ser contraproducente debido al "double buffering" (Postgres y el OS compitiendo por cachear lo mismo).
- **work_mem**: Determina la memoria máxima utilizada por _cada operación_ de ordenamiento (`ORDER BY`, `DISTINCT`) o hash (`Hash Join`).
  - _El peligro_: Si configuras esto muy alto (ej. 100MB) y tienes 100 conexiones concurrentes ejecutando queries complejos, podrías consumir 10GB de RAM instantáneamente, llevando al servidor a un OOM (Out Of Memory) kill.
  - _Estrategia_: Mantén un valor seguro por defecto (ej. 16MB) y auméntalo dinámicamente solo para sesiones específicas que realizan reportes pesados:
    ```sql
    SET work_mem = '256MB';
    SELECT * FROM analytics_heavy_table ORDER BY huge_column;
    ```
- **effective_cache_size**: Una estimación de cuánta memoria está disponible para el caché del disco del sistema operativo + `shared_buffers`. Esto no reserva memoria, solo ayuda al planificador de consultas a estimar si es probable que un índice esté en RAM. Configúralo al 50-75% de la RAM total.

#### 2. Autovacuum Tuning: Domando el Bloat

Postgres utiliza MVCC (Multi-Version Concurrency Control). Cuando haces un `UPDATE` o `DELETE`, la fila original no se elimina físicamente de inmediato; se marca como "muerta" (dead tuple). El proceso de **Autovacuum** es el encargado de reclamar este espacio.

Si el autovacuum es "perezoso", las tablas se llenan de espacio muerto ("bloat"), lo que resulta en:

1.  Escaneos secuenciales más lentos (leyendo más páginas de disco para los mismos datos vivos).
2.  Índices innecesariamente grandes.
3.  La temida "transaction ID wraparound" que puede poner la base de datos en modo solo lectura.

**Configuración Agresiva para Producción**:

```ini
# No esperar a que el 20% de la tabla cambie (default), actuar al 2%
autovacuum_vacuum_scale_factor = 0.02

# Permitir que el vacuum trabaje más duro antes de tomar una siesta
autovacuum_vacuum_cost_limit = 2000
autovacuum_vacuum_cost_delay = 2ms
```

> **Nota Pro**: Para tablas gigantescas (millones de filas) que reciben muchas escrituras (ej. logs de auditoría), ajusta estos parámetros _por tabla_ usando `ALTER TABLE`.

#### 3. Índices Avanzados: Más allá del B-Tree

Si bien el índice B-Tree es el caballo de batalla, Postgres ofrece estructuras de datos especializadas que pueden reducir tiempos de consulta de segundos a milisegundos.

- **GIN (Generalized Inverted Index)**: Esencial para tipos de datos compuestos como Arrays, JSONB y búsqueda de texto completo (tsvector).
- **BRIN (Block Range Index)**: Diseñado para tablas inmensas (TB de datos) donde las columnas tienen una correlación natural con el almacenamiento físico (como fechas/timestamps en logs incrementales). Un índice BRIN puede ser cientos de veces más pequeño que un B-Tree.
- **Índices Parciales**: Si solo consultas frecuentemente usuarios activos, no indices toda la tabla:
  ```sql
  CREATE INDEX idx_users_active_email ON users(email) WHERE status = 'active';
  ```
  Esto reduce drásticamente el tamaño del índice y el costo de mantenimiento en escrituras.

#### 4. JSONB: Potencia NoSQL dentro de SQL

El tipo de datos `JSONB` almacena JSON en un formato binario descompuesto, permitiendo indexación y operaciones rápidas. Esto elimina la necesidad de sincronizar datos con una base documental separada como MongoDB para muchos casos de uso.

Performance con Drizzle ORM:

```typescript
// schema.ts
import { pgTable, jsonb, text } from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  payload: jsonb("payload").notNull(),
});

// Consulta eficiente buscando dentro del JSON
// SQL generado: SELECT * FROM events WHERE payload @> '{"type": "click"}'
await db
  .select()
  .from(events)
  .where(sql`${events.payload} @> '{"type": "click"}'`);
```

Para que esto vuele, necesitas un índice GIN:

```sql
CREATE INDEX idx_events_payload ON events USING GIN (payload);
```

#### 5. Connection Pooling con PgBouncer

En arquitecturas serverless o de microservicios (como NestJS o Lambdas), abrir y cerrar conexiones a Postgres es costoso (SSL handshake, forking de procesos). Postgres utiliza un modelo de proceso por conexión, lo que consume mucha memoria (aprox 10MB por conexión).

**PgBouncer** actúa como un middleware que mantiene un pool de conexiones vivas hacia la base de datos y las "presta" a los clientes de manera muy eficiente.

- **Modo Transacción**: El modo más común. La conexión se devuelve al pool tan pronto como termina la transacción.
- **Integración con ORMs**: Asegúrate de que tu ORM (Drizzle, TypeORM, Prisma) esté configurado para no mantener conexiones ociosas innecesariamente si usas un pooler externo.

#### 6. Optimizaciones en Drizzle ORM

Drizzle es ligero, pero el rendimiento final depende de cómo construyas tus queries.

1.  **Prepared Statements**: Drizzle soporta sentencias preparadas, que pre-compilan el plan de ejecución en Postgres, ahorrando CPU en consultas repetitivas.

    ```typescript
    const preparedUserQuery = db
      .select()
      .from(users)
      .where(eq(users.id, placeholder("id")))
      .prepare("get_user");

    const user = await preparedUserQuery.execute({ id: 123 });
    ```

2.  **Selección de Campos (Select Specific)**: Evita `select *`. Traer columnas `text` o `jsonb` grandes que no necesitas aumenta el tráfico de red y el uso de memoria en Node.js.
    ```typescript
    // Bien
    await db.select({ id: users.id, name: users.name }).from(users);
    ```

#### Conclusión

Optimizar PostgreSQL es un arte que combina conocimiento del hardware, comprensión del motor de base de datos y prácticas de código eficientes. Al ajustar `shared_buffers`, domar el Autovacuum, utilizar los índices correctos y emplear patrones de conexión eficientes, puedes escalar Postgres para manejar cargas de trabajo que rivalizan con cualquier solución propietaria costosa.

---

### ENGLISH (EN)

PostgreSQL is arguably the most advanced open-source relational database engine in the world, capable of handling petabytes of data and thousands of transactions per second. However, its default ("out-of-the-box") configuration is conservative, designed to run on modest hardware and ensure maximum compatibility rather than maximum performance. For backend engineers and DBAs looking to scale enterprise applications, understanding how to "tune" Postgres for massive workloads is crucial.

In this technical article, we will dive deep into Postgres' internal architecture, advanced optimization strategies, and how to integrate these practices with modern tools like Drizzle ORM in a Node.js/TypeScript environment.

#### 1. Memory Architecture: shared_buffers and work_mem

Memory management in Postgres is clear-cut and critical for performance. Understanding the `postgresql.conf` file is the first step.

![Postgres Memory Architecture](./images/postgres-performance/memory-architecture.png)

- **shared_buffers**: This parameter defines how much RAM Postgres dedicates to caching data blocks. Unlike other databases that try to cache the entire DB in RAM, Postgres relies on the operating system for file caching.
  - _Rule of Thumb_: Assign **25% of total system RAM**. If your server has 64GB, `shared_buffers` should be 16GB. Allocating more can be counterproductive due to "double buffering" (Postgres and the OS competing to cache the same data).
- **work_mem**: Determines the maximum memory used by _each operation_ for sorting (`ORDER BY`, `DISTINCT`) or hashing (`Hash Join`).
  - _The Danger_: If you set this too high (e.g., 100MB) and have 100 concurrent connections running complex queries, you could instantly consume 10GB of RAM, leading the server to an OOM (Out Of Memory) kill.
  - _Strategy_: Keep a safe default (e.g., 16MB) and increase it dynamically only for specific sessions running heavy reports:
    ```sql
    SET work_mem = '256MB';
    SELECT * FROM analytics_heavy_table ORDER BY huge_column;
    ```
- **effective_cache_size**: An estimate of how much memory is available for the OS disk cache + `shared_buffers`. This doesn't reserve memory; it only helps the query planner estimate if an index is likely to be found in RAM. Set this to 50-75% of total RAM.

#### 2. Autovacuum Tuning: Taming the Bloat

Postgres uses MVCC (Multi-Version Concurrency Control). When you perform an `UPDATE` or `DELETE`, the original row is not physically deleted immediately; it is marked as a "dead tuple." The **Autovacuum** process is responsible for reclaiming this space.

If autovacuum is "lazy," tables fill up with dead space ("bloat"), resulting in:

1.  Slower sequential scans (reading more disk pages for the same live data).
2.  Unnecessarily large indexes.
3.  The dreaded "transaction ID wraparound" which can force the database into read-only mode.

**Aggressive Production Configuration**:

```ini
# Do not wait for 20% of the table to change (default), act at 2%
autovacuum_vacuum_scale_factor = 0.02

# Allow vacuum to work harder before taking a nap
autovacuum_vacuum_cost_limit = 2000
autovacuum_vacuum_cost_delay = 2ms
```

> **Pro Tip**: For massive tables (millions of rows) that receive high write volumes (e.g., audit logs), tune these parameters _per table_ using `ALTER TABLE`.

#### 3. Advanced Indexes: Beyond B-Tree

While the B-Tree index is the workhorse, Postgres offers specialized data structures that can reduce query times from seconds to milliseconds.

- **GIN (Generalized Inverted Index)**: Essential for composite data types like Arrays, JSONB, and Full-Text Search (tsvector).
- **BRIN (Block Range Index)**: Designed for immense tables (TB of data) where columns have a natural correlation with physical storage (like dates/timestamps in time-series logs). A BRIN index can be hundreds of times smaller than a B-Tree.
- **Partial Indexes**: If you only frequently query active users, don't index the entire table:
  ```sql
  CREATE INDEX idx_users_active_email ON users(email) WHERE status = 'active';
  ```
  This drastically reduces index size and maintenance cost during writes.

#### 4. JSONB: NoSQL Power within SQL

The `JSONB` data type stores JSON in a decomposed binary format, allowing for indexing and fast operations. This eliminates the need to synchronize data with a separate document database like MongoDB for many use cases.

Performance with Drizzle ORM:

```typescript
// schema.ts
import { pgTable, jsonb, text } from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  payload: jsonb("payload").notNull(),
});

// Efficient query searching inside JSON
// Generated SQL: SELECT * FROM events WHERE payload @> '{"type": "click"}'
await db
  .select()
  .from(events)
  .where(sql`${events.payload} @> '{"type": "click"}'`);
```

To make this fly, you need a GIN index:

```sql
CREATE INDEX idx_events_payload ON events USING GIN (payload);
```

#### 5. Connection Pooling with PgBouncer

In serverless or microservices architectures (like NestJS or Lambdas), opening and closing connections to Postgres is expensive (SSL handshake, process forking). Postgres uses a process-per-connection model, which consumes significant memory (approx 10MB per connection).

**PgBouncer** acts as a middleware that maintains a pool of live connections to the database and "lends" them to clients very efficiently.

- **Transaction Mode**: The most common mode. The connection is returned to the pool as soon as the transaction ends.
- **ORM Integration**: Ensure your ORM (Drizzle, TypeORM, Prisma) is configured not to hold idle connections unnecessarily if using an external pooler.

#### 6. Drizzle ORM Optimizations

Drizzle is lightweight, but final performance depends on how you build your queries.

1.  **Prepared Statements**: Drizzle supports prepared statements, which pre-compile the execution plan in Postgres, saving CPU on repetitive queries.

    ```typescript
    const preparedUserQuery = db
      .select()
      .from(users)
      .where(eq(users.id, placeholder("id")))
      .prepare("get_user");

    const user = await preparedUserQuery.execute({ id: 123 });
    ```

2.  **Field Selection (Select Specific)**: Avoid `select *`. Fetching large `text` or `jsonb` columns you don't need increases network traffic and memory usage in Node.js.
    ```typescript
    // Good
    await db.select({ id: users.id, name: users.name }).from(users);
    ```

#### Conclusion

Optimizing PostgreSQL is an art combining hardware knowledge, understanding the database engine, and efficient coding practices. By tuning `shared_buffers`, taming Autovacuum, using the right indexes, and employing efficient connection patterns, you can scale Postgres to handle workloads rivaling any expensive proprietary solution.

---

### PORTUGUÊS (PT)

O PostgreSQL é indiscutivelmente o mecanismo de banco de dados relacional open source mais avançado do mundo, capaz de gerenciar petabytes de dados e milhares de transações por segundo. No entanto, sua configuração padrão ("out-of-the-box") é conservadora, projetada para rodar em hardware modesto e garantir a máxima compatibilidade, não o desempenho máximo. Para engenheiros de backend e DBAs que buscam escalar aplicações de nível empresarial, é crucial entender como "tunar" o Postgres para cargas de trabalho massivas.

Neste artigo técnico, mergulharemos na arquitetura interna do Postgres, estratégias de otimização avançadas e como integrar essas práticas com ferramentas modernas como Drizzle ORM em um ambiente Node.js/TypeScript.

#### 1. Arquitetura de Memória: shared_buffers e work_mem

O gerenciamento de memória no Postgres é fundamental para o desempenho. Entender o arquivo `postgresql.conf` é o primeiro passo.

![Postgres Memory Architecture](./images/postgres-performance/memory-architecture.png)

- **shared_buffers**: Este parâmetro define quanta memória RAM o Postgres dedica ao cache de blocos de dados. Ao contrário de outros bancos de dados que tentam cachear todo o DB na RAM, o Postgres confia no sistema operacional para o cache de arquivos.
  - _Regra de Ouro_: Atribua **25% da RAM total** do sistema. Se o seu servidor tem 64GB, `shared_buffers` deve ser 16GB. Alocar mais pode ser contraproducente devido ao "double buffering" (o Postgres e o OS competindo para cachear a mesma coisa).
- **work_mem**: Determina a memória máxima utilizada por _cada operação_ de ordenação (`ORDER BY`, `DISTINCT`) ou hash (`Hash Join`).
  - _O Perigo_: Se você configurar isso muito alto (ex. 100MB) e tiver 100 conexões concorrentes executando queries complexas, você poderia consumir 10GB de RAM instantaneamente, levando o servidor a um OOM (Out Of Memory) kill.
  - _Estratégia_: Mantenha um valor seguro por padrão (ex. 16MB) e aumente-o dinamicamente apenas para sessões específicas que executam relatórios pesados:
    ```sql
    SET work_mem = '256MB';
    SELECT * FROM analytics_heavy_table ORDER BY huge_column;
    ```
- **effective_cache_size**: Uma estimativa de quanta memória está disponível para o cache de disco do sistema operacional + `shared_buffers`. Isso não reserva memória; apenas ajuda o planejador de consultas a estimar se um índice provavelmente será encontrado na RAM. Configure para 50-75% da RAM total.

#### 2. Autovacuum Tuning: Domando o Bloat

O Postgres usa MVCC (Multi-Version Concurrency Control). Quando você realiza um `UPDATE` ou `DELETE`, a linha original não é excluída fisicamente de imediato; ela é marcada como "tupla morta". O processo de **Autovacuum** é o responsável por recuperar esse espaço.

Se o autovacuum for "preguiçoso", as tabelas se enchem de espaço morto ("bloat"), resultando em:

1.  Escaneamentos sequenciais mais lentos (lendo mais páginas de disco para os mesmos dados vivos).
2.  Índices desnecessariamente grandes.
3.  O temido "transaction ID wraparound" que pode forçar o banco de dados para o modo somente leitura.

**Configuração Agressiva para Produção**:

```ini
# Não esperar 20% da tabela mudar (padrão), agir com 2%
autovacuum_vacuum_scale_factor = 0.02

# Permitir que o vacuum trabalhe mais antes de fazer uma pausa
autovacuum_vacuum_cost_limit = 2000
autovacuum_vacuum_cost_delay = 2ms
```

> **Dica Pro**: Para tabelas gigantescas (milhões de linhas) que recebem altos volumes de gravação (ex. logs de auditoria), ajuste esses parâmetros _por tabela_ usando `ALTER TABLE`.

#### 3. Índices Avançados: Além do B-Tree

Embora o índice B-Tree seja o cavalo de batalha, o Postgres oferece estruturas de dados especializadas que podem reduzir os tempos de consulta de segundos para milissegundos.

- **GIN (Generalized Inverted Index)**: Essencial para tipos de dados compostos como Arrays, JSONB e busca de texto completo (tsvector).
- **BRIN (Block Range Index)**: Projetado para tabelas imensas (TB de dados) onde colunas têm uma correlação natural com o armazenamento físico (como datas/timestamps em logs de séries temporais). Um índice BRIN pode ser centenas de vezes menor que um B-Tree.
- **Índices Parciais**: Se você consulta frequentemente apenas usuários ativos, não indexe toda a tabela:
  ```sql
  CREATE INDEX idx_users_active_email ON users(email) WHERE status = 'active';
  ```
  Isso reduz drasticamente o tamanho do índice e o custo de manutenção durante as gravações.

#### 4. JSONB: Poder NoSQL dentro do SQL

O tipo de dados `JSONB` armazena JSON em um formato binário decomposto, permitindo indexação e operações rápidas. Isso elimina a necessidade de sincronizar dados com um banco de dados de documentos separado como o MongoDB para muitos casos de uso.

Performance com Drizzle ORM:

```typescript
// schema.ts
import { pgTable, jsonb, text } from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  payload: jsonb("payload").notNull(),
});

// Consulta eficiente buscando dentro do JSON
// SQL gerado: SELECT * FROM events WHERE payload @> '{"type": "click"}'
await db
  .select()
  .from(events)
  .where(sql`${events.payload} @> '{"type": "click"}'`);
```

Para fazer isso voar, você precisa de um índice GIN:

```sql
CREATE INDEX idx_events_payload ON events USING GIN (payload);
```

#### 5. Connection Pooling com PgBouncer

Em arquiteturas serverless ou de microsserviços (como NestJS ou Lambdas), abrir e fechar conexões com o Postgres é custoso (handshake SSL, forking de processo). O Postgres usa um modelo de processo por conexão, que consome memória significativa (aprox 10MB por conexão).

**PgBouncer** atua como um middleware que mantém um pool de conexões vivas com o banco de dados e as "empresta" aos clientes de forma muito eficiente.

- **Modo Transação**: O modo mais comum. A conexão é devolvida ao pool assim que a transação termina.
- **Integração com ORMs**: Certifique-se de que seu ORM (Drizzle, TypeORM, Prisma) esteja configurado para não manter conexões ociosas desnecessariamente se estiver usando um pooler externo.

#### 6. Otimizações no Drizzle ORM

O Drizzle é leve, mas o desempenho final depende de como você constrói suas consultas.

1.  **Prepared Statements**: O Drizzle suporta instruções preparadas, que pré-compilam o plano de execução no Postgres, economizando CPU em consultas repetitivas.

    ```typescript
    const preparedUserQuery = db
      .select()
      .from(users)
      .where(eq(users.id, placeholder("id")))
      .prepare("get_user");

    const user = await preparedUserQuery.execute({ id: 123 });
    ```

2.  **Seleção de Campos (Select Specific)**: Evite `select *`. Buscar grandes colunas `text` ou `jsonb` que você não precisa aumenta o tráfego de rede e o uso de memória no Node.js.
    ```typescript
    // Bom
    await db.select({ id: users.id, name: users.name }).from(users);
    ```

#### Conclusão

Otimizar o PostgreSQL é uma arte que combina conhecimento de hardware, compreensão do mecanismo de banco de dados e práticas de código eficientes. Ao ajustar `shared_buffers`, domar o Autovacuum, usar os índices corretos e empregar padrões de conexão eficientes, você pode escalar o Postgres para lidar com cargas de trabalho que rivalizam com qualquer solução proprietária cara.
