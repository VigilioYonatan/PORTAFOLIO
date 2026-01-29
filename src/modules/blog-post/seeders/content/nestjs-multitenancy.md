### ESPAÑOL (ES)

Construir una aplicación SaaS B2B casi siempre implica enfrentar el problema de la multitenencia. ¿Cómo aislamos los datos de "Coca-Cola" de los de "Pepsi" usando el mismo backend? En este artículo, exploraremos las tres estrategias principales (Discriminator, Schema-Based, Database-Based) e implementaremos la más equilibrada en NestJS y Drizzle: **Schema-Based Isolation**.

#### 1. Estrategias de Aislamiento: El Dilema

![Multitenancy Strategies](./images/nestjs-multitenancy/strategies.png)

- **Columna Discriminadora**: Todas las tablas tienen `tenant_id`. Fácil de implementar, pero un error en un `WHERE` filtra datos entre clientes. Difícil respaldo/restauración por cliente.
- **Base de Datos por Tenant**: Aislamiento total (GDPR/HIPAA compliant), pero costoso y difícil de mantener migraciones en 10,000 bases de datos.
- **Esquema por Tenant** (Postgres Schemas): El punto dulce. Una sola base de datos, pero cada tenant tiene su propio namespace (`schema`). Aislamiento lógico fuerte, backups fáciles y costo bajo.

#### 2. Middleware de Resolución de Tenant

Primero, necesitamos saber quién llama. Extraemos el subdominio (`coca.app.com`) o un header `X-Tenant-ID`.

```typescript
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers["x-tenant-id"] || "public";
    // Validar que el tenant exista en Redis/DB
    req["tenantId"] = tenantId;
    next();
  }
}
```

#### 3. Dypamic Module y Scope Request

En NestJS, los providers son Singletons por defecto. Para multitenancy, necesitamos **Request Scoped Providers**.

Creamos un `DrizzleModule` dinámico que inyecta una conexión a base de datos configurada específicamente para el esquema del tenant actual en cada petición.

```typescript
// tenant-drizzle.provider.ts
export const TenantDrizzleProvider = {
  provide: "TENANT_CONNECTION",
  scope: Scope.REQUEST, // CRÍTICO: Una instancia nueva por petición
  useFactory: async (req: Request) => {
    const tenantId = req["tenantId"];
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    // SET search_path fuerza a Postgres a usar solo las tablas de ese esquema
    await client.query(`SET search_path TO "${tenantId}"`);
    return drizzle(client, { schema });
  },
  inject: [REQUEST],
};
```

#### 4. Migraciones Automáticas

El reto de "Schema-Based" es correr migraciones. No puedes correr `drizzle-kit push` una sola vez.
Creamos un script de "Migrator" que itera sobre todos los tenants activos y aplica los cambios de esquema secuencialmente (o en paralelo con límites).

```typescript
async function migrateAllTenants() {
  const tenants = await getTenants();
  for (const tenant of tenants) {
    console.log(`Migrating tenant: ${tenant.id}`);
    await migrateTenantSchema(tenant.id);
  }
}
```

La multitenencia no es una característica, es una arquitectura fundamental. Implementarla a nivel de infraestructura y no de aplicación garantiza que tus desarrolladores nunca olviden un `where tenant_id = ?`.

---

### ENGLISH (EN)

Building a B2B SaaS application almost always involves facing the multitenancy problem. How do we isolate "Coca-Cola's" data from "Pepsi's" using the same backend? In this article, we will explore the three main strategies (Discriminator, Schema-Based, Database-Based) and implement the most balanced one in NestJS and Drizzle: **Schema-Based Isolation**.

#### 1. Isolation Strategies: The Dilemma

![Multitenancy Strategies](./images/nestjs-multitenancy/strategies.png)

- **Discriminator Column**: All tables have `tenant_id`. Easy to implement, but a missed `WHERE` clause leaks data between clients. Hard per-client backup/restore.
- **Database per Tenant**: Total isolation (GDPR/HIPAA compliant), but expensive and hard to maintain migrations across 10,000 databases.
- **Schema per Tenant** (Postgres Schemas): The sweet spot. A single database, but each tenant has its own namespace (`schema`). Strong logical isolation, easy backups, and low cost.

#### 2. Tenant Resolution Middleware

First, we need to know who is calling. We extract the subdomain (`coca.app.com`) or an `X-Tenant-ID` header.

```typescript
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers["x-tenant-id"] || "public";
    // Validate that the tenant exists in Redis/DB
    req["tenantId"] = tenantId;
    next();
  }
}
```

#### 3. Dynamic Module and Scope Request

In NestJS, providers are Singletons by default. For multitenancy, we need **Request Scoped Providers**.

We create a dynamic `DrizzleModule` that injects a database connection specifically configured for the current tenant's schema in each request.

```typescript
// tenant-drizzle.provider.ts
export const TenantDrizzleProvider = {
  provide: "TENANT_CONNECTION",
  scope: Scope.REQUEST, // CRITICAL: A new instance per request
  useFactory: async (req: Request) => {
    const tenantId = req["tenantId"];
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    // SET search_path forces Postgres to use only that schema's tables
    await client.query(`SET search_path TO "${tenantId}"`);
    return drizzle(client, { schema });
  },
  inject: [REQUEST],
};
```

#### 4. Automatic Migrations

The challenge of "Schema-Based" is running migrations. You cannot run `drizzle-kit push` just once.
We create a "Migrator" script that iterates over all active tenants and applies schema changes sequentially (or in parallel with limits).

```typescript
async function migrateAllTenants() {
  const tenants = await getTenants();
  for (const tenant of tenants) {
    console.log(`Migrating tenant: ${tenant.id}`);
    await migrateTenantSchema(tenant.id);
  }
}
```

Multitenancy is not a feature; it is a fundamental architecture. Implementing it at the infrastructure level rather than the application level ensures your developers never forget a `where tenant_id = ?`.

---

### PORTUGUÊS (PT)

Construir uma aplicação SaaS B2B quase sempre envolve enfrentar o problema da multitenência. Como isolamos os dados da "Coca-Cola" dos da "Pepsi" usando o mesmo backend? Neste artigo, exploraremos as três principais estratégias (Discriminator, Schema-Based, Database-Based) e implementaremos a mais equilibrada no NestJS e Drizzle: **Schema-Based Isolation**.

#### 1. Estratégias de Isolamento: O Dilema

![Multitenancy Strategies](./images/nestjs-multitenancy/strategies.png)

- **Coluna Discriminadora**: Todas as tabelas têm `tenant_id`. Fácil de implementar, mas um erro em um `WHERE` vaza dados entre clientes. Difícil backup/restauração por cliente.
- **Banco de Dados por Tenant**: Isolamento total (compatível com GDPR/HIPAA), mas caro e difícil de manter migrações em 10.000 bancos de dados.
- **Esquema por Tenant** (Postgres Schemas): O ideal. Um único banco de dados, mas cada tenant tem seu próprio namespace (`schema`). Forte isolamento lógico, backups fáceis e baixo custo.

#### 2. Middleware de Resolução de Tenant

Primeiro, precisamos saber quem chama. Extraímos o subdomínio (`coca.app.com`) ou um cabeçalho `X-Tenant-ID`.

```typescript
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers["x-tenant-id"] || "public";
    // Validar que o tenant exista no Redis/DB
    req["tenantId"] = tenantId;
    next();
  }
}
```

#### 3. Módulo Dinâmico e Escopo de Requisição

No NestJS, os providers são Singletons por padrão. Para multitenancy, precisamos de **Request Scoped Providers**.

Criamos um `DrizzleModule` dinâmico que injeta uma conexão de banco de dados configurada especificamente para o esquema do tenant atual em cada requisição.

```typescript
// tenant-drizzle.provider.ts
export const TenantDrizzleProvider = {
  provide: "TENANT_CONNECTION",
  scope: Scope.REQUEST, // CRÍTICO: Uma nova instância por requisição
  useFactory: async (req: Request) => {
    const tenantId = req["tenantId"];
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    // SET search_path força o Postgres a usar apenas as tabelas desse esquema
    await client.query(`SET search_path TO "${tenantId}"`);
    return drizzle(client, { schema });
  },
  inject: [REQUEST],
};
```

#### 4. Migrações Automáticas

O desafio de "Schema-Based" é executar migrações. Você não pode executar `drizzle-kit push` apenas uma vez.
Criamos um script de "Migrador" que itera sobre todos os tenants ativos e aplica alterações de esquema sequencialmente (ou em paralelo com limites).

```typescript
async function migrateAllTenants() {
  const tenants = await getTenants();
  for (const tenant of tenants) {
    console.log(`Migrating tenant: ${tenant.id}`);
    await migrateTenantSchema(tenant.id);
  }
}
```

A multitenência não é uma funcionalidade; é uma arquitetura fundamental. Implementá-la no nível de infraestrutura e não no nível da aplicação garante que seus desenvolvedores nunca esqueçam de um `where tenant_id = ?`.
