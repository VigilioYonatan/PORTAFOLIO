# Drizzle ORM: Guía Definitiva & Cheatsheet (2026)

Este documento condensa desde lo básico hasta patrones de arquitectura senior.

---

## 1. Migraciones vs Prototipado

Drizzle ofrece dos flujos de trabajo principales para gestionar la base de datos.

### `drizzle-kit push` (Prototipado Rapido)

Sincroniza el estado de tu esquema TypeScript directamente con la DB.

-   **Uso:** Desarrollo temprano, pruebas, side-projects.
-   **Peligro:** Puede borrar datos si cambias nombres de columnas.
-   **Comando:** `bun drizzle-kit push`

### `drizzle-kit generate` + `migrate` (Producción)

Genera archivos SQL inmutables que representan el historial de cambios.

-   **Uso:** Entornos de producción, equipos, CI/CD.
-   **Flujo:**
    1.  Cambias `schema.ts`.
    2.  `bun drizzle-kit generate` (Crea SQL en `/drizzle`).
    3.  `bun drizzle-kit migrate` (Aplica SQL a la DB).

---

## 2. Definición de Schema y Relaciones

```typescript
import {
    pgTable,
    serial,
    text,
    integer,
    primaryKey,
    uniqueIndex,
    index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Tabla Básica
// user.entity.ts
export const users = pgTable("users", {
    id: serial().primaryKey(),
    name: text().notNull(),
}); // recuerda poner indices normales y compuestos para mejorar rendimiento y seguridad, ejemplo: index, uniqueIndex, primaryKey,GIN Indexes,check(),Partial Indexes

// Relación 1:1 (User <-> Profile) UNO a UNO
// profile.entity.ts
export const profiles = pgTable("profiles", {
    id: serial().primaryKey(),
    bio: text(),
    user_id: integer()
        .references(() => users.id)
        .unique(), // unique() fuerza 1:1
}); // recuerda poner indices normales y compuestos para mejorar rendimiento y seguridad, ejemplo: index, uniqueIndex, primaryKey,GIN Indexes,check(),Partial Indexes

// Relaciones para Users
// user.entity.ts
export const usersRelations = relations(users, ({ one }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.user_id],
  }),
  ...aca ira varias relaciones
}));
// Relaciones para Profiles
// profile.entity.ts
export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.user_id],
    references: [users.id],
  }),
}));

//Como usarlo 
const result = await db.query.users.findFirst({
  with: {
    profile: true,
  },
});

const profileWithUser = await db.query.profiles.findFirst({
  with: { user: true }
});

-----
// Relación 1:N (User <-> Posts) UNO a MUCHOS
// post.entity.ts
export const posts = pgTable(
    "posts",
    {
        id: serial().primaryKey(),
        title: text(),
        author_id: integer().references(() => users.id),
    },
    (table) => [index("title_idx").on(table.title), index("user_title_idx").on(table.author_id, table.title)]  // recuerda poner indices normales y compuestos para mejorar rendimiento y seguridad, ejemplo: index, uniqueIndex, primaryKey,GIN Indexes,check(),Partial Indexes
);
// post.entity.ts
export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { // Cada post tiene un solo autor
    fields: [posts.authorId],
    references: [users.id],
  }),
}));

// user.entity.ts
export const usersRelations = relations(users, ({ one, many }) => ({
  ...aca ira varias relaciones
  posts: many(posts),
}));

// asi se obtiene los posts con el autor
const allPosts = await db.query.posts.findMany({
  with: {
    author: true,
  },
});

-------
// Relación N:M (Post <-> Category) mediante Tabla Intermedia, MUCHOS a MUCHOS
// category.entity.ts
export const categories = pgTable("categories", {
    id: serial("id").primaryKey(),
    name: text("name"),
});  // recuerda poner indices normales y compuestos para mejorar rendimiento y seguridad, ejemplo: index, uniqueIndex, primaryKey,GIN Indexes,check(),Partial Indexes


// post-category.entity.ts
export const postCategories = pgTable(
    "post_categories",
    {
        postId: integer().references(() => posts.id),
        categoryId: integer().references(() => categories.id),
    },
    (t) => [primaryKey({ columns: [t.postId, t.categoryId] })]  // recuerda poner indices normales y compuestos para mejorar rendimiento y seguridad, ejemplo: index, uniqueIndex, primaryKey,GIN Indexes,check(),Partial Indexes
);

export const postCategoriesRelations = relations(postCategories, ({ one }) => ({
  post: one(posts, { fields: [postCategories.postId], references: [posts.id] }),
  category: one(categories, { fields: [postCategories.categoryId], references: [categories.id] }),
}));


// category.entity.ts
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  ...aca ira varias relaciones si tiene mas
  postCategories: many(postCategories),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  ...aca ira varias relaciones si tiene mas
  postCategories: many(postCategories),
}));



// Como obtenerlo
const studentWithCourses = await db.query.students.findFirst({
  with: {
    // 1. Entramos a la tabla intermedia
    enrollments: {
      with: {
        // 2. Desde la intermedia, entramos a la tabla final
        course: true 

        // Consulta con filtros
        //course: {
        //  where: (courses, { eq }) => eq(courses.status, 'active')
        //}
      }
    }
  }
});
// limpiar la respuesta
const cleanCourses = studentWithCourses?.enrollments.map(e => e.course);
-------
// Relación Self-Referencing
// employees.entity.ts
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  // Esta columna apunta a la misma tabla 'employees'
  managerId: integer("manager_id").references(() => employees.id),
});
export const employeesRelations = relations(employees, ({ one, many }) => ({
  // Relación "hacia arriba": Un empleado tiene un mánager (One)
  manager: one(employees, {
    fields: [employees.managerId],
    references: [employees.id],
    relationName: "management", // Nombre único para evitar confusión
  }),
  // Relación "hacia abajo": Un mánager tiene muchos subordinados (Many)
  subordinates: many(employees, {
    relationName: "management", // Debe coincidir con el nombre de arriba
  }),
}));

// como obtenerlo 
const employee = await db.query.employees.findFirst({
  with: {
    manager: true,
  },
});
const boss = await db.query.employees.findFirst({
  where: eq(employees.name, "Elon Musk"),
  with: {
    subordinates: true,
  },
});


-----
// Relacion  One-to-One (1:1) Polimórfico
const targetTypeEnum = pgEnum("target_type", ["post", "video", "product"]);
export const metadata = pgTable("metadata", {
  id: serial().primaryKey(),
  extra_info: text(),
  parent_id: integer().notNull(),
  target_type: targetTypeEnum().notNull(),
}, (table) => [
  // Esto obliga a que la combinación (tipo + id) sea ÚNICA en toda la tabla.
  uniqueIndex("metadata_target_unique_idx").on(table.target_type, table.parent_id),
]);  // recuerda poner indices normales y compuestos para mejorar rendimiento y seguridad, ejemplo: index, uniqueIndex, primaryKey,GIN Indexes,check(),Partial Indexes

// Como usarlo 
const result = await db.query.metadata.findFirst({
  where: (metadata, { and, eq }) => and(
    eq(metadata.target_type, 'post'),
    eq(metadata.parent_id, 5)
  ),
});

-------

// Relacion  One-to-Many (1:N) Polimórfico

export const targetTypeEnum = pgEnum("target_type", ["post", "video", "product"]);

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  parent_id: integer().notNull(),
  target_type: targetTypeEnum().notNull(),
}, (table) => [
  // 3. ÍNDICE COMPUESTO PARA VELOCIDAD MÁXIMA
  index("comments_target_idx").on(table.target_type, table.parent_id),
]); // recuerda poner indices normales y compuestos para mejorar rendimiento y seguridad, ejemplo: index, uniqueIndex, primaryKey,GIN Indexes,check(),Partial Indexes

// como obtenerlo 
const postComments = await db.query.comments.findMany({
  where: (comments, { and, eq }) => and(
    eq(comments.target_type, 'post'),
    eq(comments.parent_id, 10)
  ),
  orderBy: (comments, { desc }) => [desc(comments.id)], // Los más nuevos primero
});


-------
// Relacion  One-to-Many (N:M) Polimórfico

export const taggables = pgTable("taggables", {
  tag_id: integer().notNull().references(() => tags.id),
  target_id: integer().notNull(),
  target_type: targetTypeEnum().notNull(), // "article" | "product"
}, (table) => [
  // PK COMPUESTA: Indexación automática al más alto nivel
  primaryKey({ columns: [table.tag_id, table.target_id, table.target_type] }),
  // ÍNDICE EXTRA: Para buscar rápidamente todos los tags de un objeto específico
  index("taggable_target_idx").on(table.targetType, table.targetId),
]);

```



---

## 3. Patrones Avanzados

### Polimorfismo (Discriminator Pattern)

SQL no soporta polimorfismo nativo. El patrón estándar es usar una columna `type` y opcionalmente columnas específicas o tablas JSON.

**Ejemplo:** Un sistema de notificaciones que referencia diferentes entidades.

```typescript
export const notifications = pgTable("notifications", {
    id: serial("id").primaryKey(),
    type: text("type", { enum: ["POST_LIKE", "NEW_FOLLOWER"] }).notNull(),

    // Opción A: References "sueltas" (Nullable FKs)
    postId: integer("post_id").references(() => posts.id), // Lleno si type === 'POST_LIKE'
    followerId: integer("follower_id").references(() => users.id), // Lleno si type === 'NEW_FOLLOWER'
});
```

### Subqueries

Drizzle permite usar subconsultas como columnas computadas.

```typescript
import { sql } from "drizzle-orm";

// Seleccionar usuarios con su conteo de posts (sin hacer JOIN masivo)
const usersWithCounts = await db
    .select({
        id: users.id,
        name: users.name,
        postCount: db.$count(posts, eq(posts.authorId, users.id)), // Helper moderno
    })
    .from(users);

// O Manualmente con sq
const sq = db
    .select({
        authorId: posts.authorId,
        count: sql<number>`count(*)`.as("count"),
    })
    .from(posts)
    .groupBy(posts.authorId)
    .as("sq");

const res = await db
    .select()
    .from(users)
    .leftJoin(sq, eq(users.id, sq.authorId));
```

### Views & Materialized Views

Abstracciones a nivel de DB. Útil para reportes complejos.

```typescript
import { pgView } from "drizzle-orm/pg-core";

export const userStatsView = pgView("user_stats").as((qb) => {
    return qb
        .select({
            userId: users.id,
            postCount: count(posts.id).as("post_count"),
        })
        .from(users)
        .leftJoin(posts, eq(users.id, posts.authorId))
        .groupBy(users.id);
});

// Consulta la View como tabla normal
const stats = await db.select().from(userStatsView);
```

---

## 4. Consultas Vigilio Actually y Optimización

### Prepared Statements

Esencial para High Performance. Drizzle prepara la consulta en la DB una vez y solo envía parámetros. **Reduce la latencia de red y CPU de DB.**

```typescript
const userById = db
    .select()
    .from(users)
    .where(eq(users.id, sql.placeholder("id")))
    .prepare("get_user_by_id");

// Uso repetido (Ultra rápido)
const u1 = await userById.execute({ id: 1 });
const u2 = await userById.execute({ id: 2 });
```

### Streaming (Iterator Mode)

Para datasets masivos, no cargues todo en memoria. Usa iteradores.

```typescript
const usersIterator = await db.select().from(users).iterator();

// Procesa 1 a 1 sin explotar la RAM del servidor
for await (const user of usersIterator) {
    await processUser(user);
}
```

### Batching (Consultas en Lote)

Reduce Round-Trips a la DB enviando múltiples queries en un solo request.

```typescript
/* Solo disponible si el driver lo soporta (como Neon o Vercel Postgres) */
// const [usersData, postsData] = await db.batch([
//   db.select().from(users),
//   db.select().from(posts)
// ]);
```

### Partial Select

**Nunca hagas `select *`** en tablas grandes. Selecciona solo lo que necesitas.

```typescript
const list = await db.query.users.findMany({
    columns: {
        id: true,
        name: true, // No traemos password, bio, ni JSON blobs gigantes
    },
});
```

---

## 5. Paginación por Cursor (Cursor Pagination)

La paginación por `offset` (`LIMIT 10 OFFSET 10000`) es lenta en tablas grandes.
**Cursor Pagination** usa un índice (ej. `id` o `created_at`) para saltar directamente.

**Estrategia:** "Dame 10 items donde `created_at` sea menor al del último item que vi".

```typescript
import { lt, desc, and } from "drizzle-orm";

async function getPosts(cursor?: Date, limit = 10) {
    return db.query.posts.findMany({
        limit: limit,
        orderBy: [desc(posts.createdAt)], // Orden determinista
        where: cursor
            ? lt(posts.createdAt, cursor) // WHERE created_at < cursor
            : undefined,
    });
}

// Uso
const page1 = await getPosts();
const lastItem = page1[page1.length - 1];
const page2 = await getPosts(lastItem.createdAt);
```

---

## 6. Trucos de Experto

### Soft Delete (Borrado Lógico)

En lugar de borrar, ocultamos.

```typescript
// 1. Añadir columna
// isDeleted: boolean('is_deleted')

// 2. Abstraer en funciones
async function findActiveUsers() {
    return db.select().from(users).where(eq(users.isDeleted, false));
}

// 3. O usar Middleware/Extensions (Experimental/Custom)
// Puedes crear una función 'softDelete' helper
const softDeleteUser = (id: number) =>
    db.update(users).set({ isDeleted: true }).where(eq(users.id, id));
```

### JSON Operations

Postgres y Drizzle son muy buenos con JSON.

```typescript
// metadata: jsonb('metadata')

await db
    .select()
    .from(products)
    .where(sql`${products.metadata}->>'color' = 'red'`); // Query cruda eficiente
```

### Logging & Debugging

Para ver qué SQL está generando Drizzle exactamente.

```typescript
const db = drizzle(client, {
    schema,
    logger: true, // <--- Esencial para debugging
});
```

## 7. Ejemplo CRUD Completo

Patrón común para Repositories (como se usa en este proyecto).

```typescript
import { eq } from "drizzle-orm";
// Asumiendo inyeccion de dependencias o import directo
// import { db } from "@/db";
// import { users } from "@/schema";

export class UsersRepository {
    // 1. INDEX: Listar todos
    async index() {
        return await this.db.query.users.findMany();
    }

    // 2. SHOW: Mostrar uno por ID
    async show(id: number) {
        return await this.db.query.users.findFirst({
            where: eq(users.id, id),
        });
    }

    // 3. STORE: Crear nuevo
    async store(body: typeof users.$inferInsert) {
        const [newUser] = await this.db.insert(users).values(body).returning();
        return newUser;
    }

    // 4. UPDATE: Actualizar
    async update(id: number, body: Partial<typeof users.$inferInsert>) {
        await this.db.update(users).set(body).where(eq(users.id, id));

        return { message: "User updated successfully" };
    }

    // 5. DESTROY: Eliminar
    async destroy(id: number) {
        await this.db.delete(users).where(eq(users.id, id));

        return { message: "User deleted successfully" };
    }
}
```
```ts
await db.transaction(async (tx) => {
  // 1. Primera operación
  await tx.insert(users).values({ name: "Alice", balance: 100 });

  // 2. Segunda operación
  await tx.update(accounts)
    .set({ balance: 50 })
    .where(eq(accounts.id, 1));
});
```

## Resumen de Mejores Prácticas

1.  **Strict Mode**: Siempre `strict: true` en `drizzle.config.ts`.
2.  **Schema Separation**: Divide tu schema en archivos si crece (`users.sql.ts`, `posts.sql.ts`).
3.  **Indexes**: Siempre añade índices a FKs y columnas de búsqueda (`where`).
4.  **Zod**: Usa `drizzle-zod` para generar validaciones de API automáticamente.
