### ESPAÑOL (ES)

Drizzle ORM ha redefinido el panorama del desarrollo backend en el ecosistema TypeScript. No es solo otro "query builder"; es una capa de abstracción delgada que devuelve el control total de SQL a los desarrolladores, eliminando la "mágica negra" que a menudo plaga a ORMs tradicionales como TypeORM o Prisma. En este artículo técnico senior, exploraremos patrones avanzados que separan a los usuarios promedio de Drizzle de los expertos en rendimiento.

Analizaremos Prepared Statements para velocidad extrema, gestión de transacciones complejas con Savepoints, optimización de la API Relacional y la integración profunda con Zod para validación de esquemas.

#### 1. Prepared Statements: Velocidad de la Luz

![Drizzle Performance](./images/drizzle-orm-advanced/performance.png)

En aplicaciones de alto rendimiento, la latencia de red suele ser el cuello de botella, seguido de cerca por el tiempo de parseo de SQL en la base de datos.
Cada vez que ejecutas una query, Postgres debe:

1.  Parsear el texto SQL.
2.  Verificar que las tablas y columnas existen.
3.  Planear la mejor estrategia de ejecución (Index Scan vs Seq Scan).
4.  Ejecutar.

Los **Prepared Statements** permiten realizar los pasos 1-3 **una sola vez**.

```typescript
// Definición del Prepared Statement (fuera del handler de la request si es posible)
const userByEmailPrep = db
  .select({
    id: users.id,
    email: users.email,
    role: users.role,
    createdAt: users.createdAt,
  })
  .from(users)
  .where(eq(users.email, placeholder("email")))
  .prepare("find_user_by_email");

// Ejecución ultra-rápida
async function getUserByEmail(email: string) {
  // Solo envía el nombre del plan y los parámetros a Postgres
  return await userByEmailPrep.execute({ email });
}
```

> **Benchmarks**: En pruebas de carga con k6, utilizar `.prepare()` puede reducir el uso de CPU de la base de datos en un 40% y mejorar el throughput de la aplicación en un 20-30% para consultas frecuentes (como autenticación o fetching de perfiles).

#### 2. Transacciones Avanzadas y Niveles de Aislamiento

La mayoría de los desarrolladores confían ciegamente en `db.transaction()`, pero las aplicaciones financieras o de inventario requieren más control. Drizzle expone la potencia de los niveles de aislamiento de SQL.

**Problema del Double Spending (Race Condition):**
Si dos transacciones leen el saldo de una cuenta al mismo tiempo y ambas restan dinero, el saldo final será incorrecto.

```typescript
import { sql } from "drizzle-orm";

await db.transaction(
  async (tx) => {
    // 1. Bloqueo pesimista (Pessimistic Locking)
    // SELECT ... FOR UPDATE impide que otros modifiquen la fila hasta que termine la tx
    const [account] = await tx
      .select()
      .from(accounts)
      .where(eq(accounts.id, accountId))
      .for("update");

    if (account.balance < amount) throw new Error("Fondos insuficientes");

    // 2. Actualización atómica
    await tx
      .update(accounts)
      .set({
        balance: sql`${accounts.balance} - ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, accountId));
  },
  {
    // Serializable garantiza que las transacciones parezcan ejecutarse secuencialmente
    isolationLevel: "serializable",
    accessMode: "read write",
  },
);
```

#### 3. Core API vs. Relational API: ¿Cuál usar?

Drizzle ofrece dos formas de consultar: la "Core API" (estilo SQL) y la "Relational API" (estilo Prisma `db.query`).

- **Core API (`db.select()...`)**:
  - _Pros_: Control total sobre JOINS, índices y cláusulas WHERE. Máximo rendimiento.
  - _Contras_: El resultado es una lista plana de filas. Si haces un JOIN 1:N, obtendrás datos duplicados que debes "agrupar" manualmente en el código.
  - _Uso_: Reportes complejos, agregaciones, dashboards de análisis.

- **Relational API (`db.query.users.findMany(...)`)**:
  - _Pros_: Devuelve objetos anidados automáticamente (`user.posts`). DX (Developer Experience) superior.
  - _Contras_: Drizzle debe inferir cómo construir los JOINS. Puede traer más datos de los necesarios si no usas `columns: {}`.
  - _Uso_: CRUDs estándar, APIs REST/GraphQL donde la estructura del JSON de respuesta coincide con el grafo de datos.

**Optimización de Queries Relacionales**:

```typescript
// Evita el "Select *" implícito
const usersWithPosts = await db.query.users.findMany({
  columns: {
    id: true,
    name: true, // Solo trae lo que necesitas
  },
  with: {
    posts: {
      columns: {
        title: true,
      },
      limit: 5, // Siempre limita las relaciones
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    },
  },
});
```

#### 4. Validaciones de esquema con `drizzle-zod`

Una de las características más potentes es la capacidad de generar esquemas de validación Zod directamente desde la definición de la tabla. Esto asegura que tu API acepte exactamente lo que tu base de datos puede almacenar ("Single Source of Truth").

```typescript
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Generar esquema base
const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email().min(5), // Refinar validaciones
  role: z.enum(["admin", "user"]).default("user"),
});

// Usar en un endpoint de API (ej. NestJS o Express)
app.post("/users", async (req, res) => {
  const result = insertUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(result.error);
  }

  // Tipado 100% seguro al insertar
  await db.insert(users).values(result.data);
});
```

#### 5. Migraciones Custom (SQL Crudo)

`drizzle-kit` es excelente para crear tablas, pero los ingenieros senior a menudo necesitan características de base de datos que no tienen representación directa en el esquema TypeScript, como Triggers para auditoría o Vistas Materializadas.

Utiliza la bandera `--custom` o edita manualmente los archivos SQL generados para incluir lógica avanzada.

```sql
-- migration_custom.sql
-- Crear una función para actualizar automáticamente 'updated_at'
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();
```

Combinar la seguridad de tipos, la velocidad de ejecución y la flexibilidad de SQL crudo es lo que hace que Drizzle ORM sea la opción definitiva para el desarrollo backend moderno.

---

### ENGLISH (EN)

Drizzle ORM has redefined the backend development landscape in the TypeScript ecosystem. It is not just another "query builder"; it is a thin abstraction layer that returns full control of SQL to developers, eliminating the "black magic" that often plagues traditional ORMs like TypeORM or Prisma. In this senior technical article, we will explore advanced patterns that separate average Drizzle users from performance experts.

We will analyze Prepared Statements for extreme speed, complex transaction management with Savepoints, Relational API optimization, and deep integration with Zod for schema validation.

#### 1. Prepared Statements: Light Speed

![Drizzle Performance](./images/drizzle-orm-advanced/performance.png)

In high-performance applications, network latency is often the bottleneck, followed closely by SQL parse time in the database.
Every time you execute a query, Postgres must:

1.  Parse the SQL text.
2.  Verify tables and columns exist.
3.  Plan the best execution strategy (Index Scan vs. Seq Scan).
4.  Execute.

**Prepared Statements** allow steps 1-3 to be performed **only once**.

```typescript
// Prepared Statement definition (outside request handler if possible)
const userByEmailPrep = db
  .select({
    id: users.id,
    email: users.email,
    role: users.role,
    createdAt: users.createdAt,
  })
  .from(users)
  .where(eq(users.email, placeholder("email")))
  .prepare("find_user_by_email");

// Ultra-fast execution
async function getUserByEmail(email: string) {
  // Only sends the plan name and parameters to Postgres
  return await userByEmailPrep.execute({ email });
}
```

> **Benchmarks**: In load tests using k6, relying on `.prepare()` can reduce database CPU usage by 40% and improve application throughput by 20-30% for frequent queries (like authentication or profile fetching).

#### 2. Advanced Transactions and Isolation Levels

Most developers blindly trust `db.transaction()`, but financial or inventory applications require more control. Drizzle exposes the full power of SQL isolation levels.

**Double Spending Problem (Race Condition):**
If two transactions read an account balance at the same time and both subtract money, the final balance will be incorrect.

```typescript
import { sql } from "drizzle-orm";

await db.transaction(
  async (tx) => {
    // 1. Pessimistic Locking
    // SELECT ... FOR UPDATE prevents others from modifying the row until tx ends
    const [account] = await tx
      .select()
      .from(accounts)
      .where(eq(accounts.id, accountId))
      .for("update");

    if (account.balance < amount) throw new Error("Insufficient funds");

    // 2. Atomic Update
    await tx
      .update(accounts)
      .set({
        balance: sql`${accounts.balance} - ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, accountId));
  },
  {
    // Serializable ensures transactions appear to run sequentially
    isolationLevel: "serializable",
    accessMode: "read write",
  },
);
```

#### 3. Core API vs. Relational API: Which to use?

Drizzle offers two ways to query: the "Core API" (SQL style) and the "Relational API" (Prisma `db.query` style).

- **Core API (`db.select()...`)**:
  - _Pros_: Full control over JOINS, indexes, and WHERE clauses. Maximum performance.
  - _Cons_: Result is a flat list of rows. If you do a 1:N JOIN, you get duplicated data you must manually "group" in code.
  - _Usage_: Complex reports, aggregations, analytics dashboards.

- **Relational API (`db.query.users.findMany(...)`)**:
  - _Pros_: Returns nested objects automatically (`user.posts`). Superior DX (Developer Experience).
  - _Cons_: Drizzle must infer how to construct JOINS. Can fetch more data than needed if you don't use `columns: {}`.
  - _Usage_: Standard CRUDs, REST/GraphQL APIs where the response JSON structure matches the data graph.

**Optimizing Relational Queries**:

```typescript
// Avoid implicit "Select *"
const usersWithPosts = await db.query.users.findMany({
  columns: {
    id: true,
    name: true, // Only fetch what you need
  },
  with: {
    posts: {
      columns: {
        title: true,
      },
      limit: 5, // Always limit relations
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    },
  },
});
```

#### 4. Schema Validations with `drizzle-zod`

One of the most powerful features is the ability to generate Zod validation schemas directly from the table definition. This ensures your API accepts exactly what your database can store ("Single Source of Truth").

```typescript
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Generate base schema
const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email().min(5), // Refine validations
  role: z.enum(["admin", "user"]).default("user"),
});

// Use in an API endpoint (e.g., NestJS or Express)
app.post("/users", async (req, res) => {
  const result = insertUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(result.error);
  }

  // 100% type-safe insertion
  await db.insert(users).values(result.data);
});
```

#### 5. Custom Migrations (Raw SQL)

`drizzle-kit` is excellent for creating tables, but senior engineers often need database features that lack direct TypeScript schema representation, such as Audit Triggers or Materialized Views.

Use the `--custom` flag or manually edit generated SQL files to include advanced logic.

```sql
-- migration_custom.sql
-- Create a function to automatically update 'updated_at'
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();
```

Combining type safety, execution speed, and raw SQL flexibility makes Drizzle ORM the definitive choice for modern backend development.

---

### PORTUGUÊS (PT)

O Drizzle ORM redefiniu o panorama do desenvolvimento backend no ecossistema TypeScript. Não é apenas mais um "query builder"; é uma camada de abstração fina que devolve o controle total do SQL aos desenvolvedores, eliminando a "mágica negra" que frequentemente assola ORMs tradicionais como TypeORM ou Prisma. Neste artigo técnico sênior, exploraremos padrões avançados que separam os usuários médios do Drizzle dos especialistas em desempenho.

Analisaremos Prepared Statements para velocidade extrema, gerenciamento de transações complexas com Savepoints, otimização da API Relacional e a integração profunda com Zod para validação de esquemas.

#### 1. Prepared Statements: Velocidade da Luz

![Drizzle Performance](./images/drizzle-orm-advanced/performance.png)

Em aplicações de alto desempenho, a latência de rede é frequentemente o gargalo, seguido de perto pelo tempo de análise (parsing) do SQL no banco de dados.
Toda vez que você executa uma consulta, o Postgres deve:

1.  Analisar o texto SQL.
2.  Verificar se tabelas e colunas existem.
3.  Planejar a melhor estratégia de execução (Index Scan vs. Seq Scan).
4.  Executar.

**Prepared Statements** permitem que os passos 1-3 sejam realizados **apenas uma vez**.

```typescript
// Definição do Prepared Statement (fora do manipulador da requisição se possível)
const userByEmailPrep = db
  .select({
    id: users.id,
    email: users.email,
    role: users.role,
    createdAt: users.createdAt,
  })
  .from(users)
  .where(eq(users.email, placeholder("email")))
  .prepare("find_user_by_email");

// Execução ultrarrápida
async function getUserByEmail(email: string) {
  // Envia apenas o nome do plano e os parâmetros para o Postgres
  return await userByEmailPrep.execute({ email });
}
```

> **Benchmarks**: Em testes de carga usando k6, apoiar-se em `.prepare()` pode reduzir o uso de CPU do banco de dados em 40% e melhorar o throughput da aplicação em 20-30% para consultas frequentes (como autenticação ou busca de perfis).

#### 2. Transações Avançadas e Níveis de Isolamento

A maioria dos desenvolvedores confia cegamente em `db.transaction()`, mas aplicações financeiras ou de inventário exigem mais controle. O Drizzle expõe todo o poder dos níveis de isolamento SQL.

**Problema do Gasto Duplo (Race Condition):**
Se duas transações leem o saldo de uma conta ao mesmo tempo e ambas subtraem dinheiro, o saldo final estará incorreto.

```typescript
import { sql } from "drizzle-orm";

await db.transaction(
  async (tx) => {
    // 1. Bloqueio Pessimista (Pessimistic Locking)
    // SELECT ... FOR UPDATE impede que outros modifiquem a linha até que a tx termine
    const [account] = await tx
      .select()
      .from(accounts)
      .where(eq(accounts.id, accountId))
      .for("update");

    if (account.balance < amount) throw new Error("Fundos insuficientes");

    // 2. Atualização Atômica
    await tx
      .update(accounts)
      .set({
        balance: sql`${accounts.balance} - ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, accountId));
  },
  {
    // Serializable garante que as transações pareçam ser executadas sequencialmente
    isolationLevel: "serializable",
    accessMode: "read write",
  },
);
```

#### 3. Core API vs. Relational API: Qual usar?

O Drizzle oferece duas maneiras de consultar: a "Core API" (estilo SQL) e a "Relational API" (estilo Prisma `db.query`).

- **Core API (`db.select()...`)**:
  - _Prós_: Controle total sobre JOINS, índices e cláusulas WHERE. Desempenho máximo.
  - _Contras_: O resultado é uma lista plana de linhas. Se você fizer um JOIN 1:N, obterá dados duplicados que deve "agrupar" manualmente no código.
  - _Uso_: Relatórios complexos, agregações, dashboards analíticos.

- **Relational API (`db.query.users.findMany(...)`)**:
  - _Prós_: Retorna objetos aninhados automaticamente (`user.posts`). DX (Experiência do Desenvolvedor) superior.
  - _Contras_: O Drizzle deve inferir como construir os JOINS. Pode buscar mais dados do que o necessário se você não usar `columns: {}`.
  - _Uso_: CRUDs padrão, APIs REST/GraphQL onde a estrutura do JSON de resposta corresponde ao grafo de dados.

**Otimizando Consultas Relacionais**:

```typescript
// Evite o "Select *" implícito
const usersWithPosts = await db.query.users.findMany({
  columns: {
    id: true,
    name: true, // Busque apenas o que você precisa
  },
  with: {
    posts: {
      columns: {
        title: true,
      },
      limit: 5, // Sempre limite as relações
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    },
  },
});
```

#### 4. Validações de Esquema com `drizzle-zod`

Uma das funcionalidades mais poderosas é a capacidade de gerar esquemas de validação Zod diretamente da definição da tabela. Isso garante que sua API aceite exatamente o que seu banco de dados pode armazenar ("Fonte Única da Verdade").

```typescript
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Gerar esquema base
const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email().min(5), // Refinar validações
  role: z.enum(["admin", "user"]).default("user"),
});

// Usar em um endpoint de API (ex: NestJS ou Express)
app.post("/users", async (req, res) => {
  const result = insertUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(result.error);
  }

  // Inserção 100% type-safe
  await db.insert(users).values(result.data);
});
```

#### 5. Migrações Custom (SQL Bruto)

`drizzle-kit` é excelente para criar tabelas, mas engenheiros seniores frequentemente precisam de recursos de banco de dados que não têm representação direta no esquema TypeScript, como Triggers de Auditoria ou Views Materializadas.

Use a flag `--custom` ou edite manualmente os arquivos SQL gerados para incluir lógica avançada.

```sql
-- migration_custom.sql
-- Criar uma função para atualizar automaticamente 'updated_at'
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();
```

Combinar a segurança de tipos, velocidade de execução e a flexibilidade do SQL bruto faz do Drizzle ORM a escolha definitiva para o desenvolvimento backend moderno.
