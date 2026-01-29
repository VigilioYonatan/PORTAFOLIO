### ESPAÑOL (ES)

TypeScript ha conquistado el desarrollo empresarial, pero usarlo como "JavaScript con tipos" es desperdiciar su potencial. En sistemas de gran escala, TypeScript es la primera línea de defensa contra la deuda técnica. Este artículo explora patrones de diseño avanzados, tipos condicionales y técnicas de metaprogramación que separan a un desarrollador junior de un arquitecto de software.

#### 1. Tipado Nominal vs Estructural en IDs de Dominio

![TypeScript Type System](./images/typescript-enterprise-patterns/types.png)

Por defecto, TypeScript es estructuralmente tipado (duck typing). Esto es peligroso para los IDs: `UserId` y `OrderId` son ambos `strings`, y es fácil pasarlos erróneamente a una función.

Implementamos **Branded Types** para simular tipado nominal:

```typescript
declare const __brand: unique symbol;
type Brand<K, T> = K & { readonly [__brand]: T };

export type UserId = Brand<string, "UserId">;
export type OrderId = Brand<string, "OrderId">;

function cancelOrder(id: OrderId) {
  /* ... */
}

const uid = "user_123" as UserId;
const oid = "order_123" as OrderId;

cancelOrder(oid); // ✅ OK
cancelOrder(uid); // ❌ Error de compilación: Type 'UserId' is not assignable to type 'OrderId'.
```

#### 2. Inyección de Dependencias (DI) Segura

En NestJS, la DI es mágica. Pero en lógica de dominio puro (Clean Architecture), preferimos una DI explícita y agnóstica del framework.

Usamos el patrón **Reader Monad** o simplemente funciones de alto orden para inyectar repositorios sin decoradores `@Inject()`, facilitando tests unitarios aislados.

#### 3. Mapeo de Tipos Avanzado para Drizzle y DTOs

No dupliques definiciones. Usa **Utility Types** para derivar DTOs de tu esquema de base de datos.
Si tienes un esquema Drizzle, deriva el tipo de inserción y selección automáticamente:

```typescript
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users } from "./schema";

type User = InferSelectModel<typeof users>;
type NewUser = InferInsertModel<typeof users>;

// Omitir campos de auditoría en el DTO de creación
type CreateUserDto = Omit<NewUser, "createdAt" | "updatedAt">;
```

#### 4. Result Pattern en lugar de Try-Catch

El manejo de errores con `try-catch` rompe el flujo de control y hace que los errores sean invisibles en la firma de la función. Adoptamos el patrón **Result** (inspirado en Rust/Go).

```typescript
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

async function findUser(id: UserId): Promise<Result<User, UserNotFoundError>> {
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!user) {
    return { ok: false, error: new UserNotFoundError(id) };
  }
  return { ok: true, value: user };
}

// El consumidor ESTÁ OBLIGADO a manejar el error
const result = await findUser(id);
if (!result.ok) {
  return handleFailure(result.error);
}
console.log(result.value.email);
```

#### 5. Exhaustiveness Checking con Never

Al usar `switch` sobre uniones discriminadas (e.g., estados de un pedido), usamos el tipo `never` para asegurar que manejamos _todos_ los casos posibles. Si agregamos un nuevo estado `REFUNDED` y olvidamos actualizar el switch, TypeScript detendrá la compilación.

Dominar estas técnicas convierte al compilador en tu compañero de pair programming más estricto, eliminando categorías enteras de bugs antes de que lleguen a producción.

---

### ENGLISH (EN)

TypeScript has conquered enterprise development, but using it as "JavaScript with types" is wasting its potential. In large-scale systems, TypeScript is the first line of defense against technical debt. This article explores advanced design patterns, conditional types, and metaprogramming techniques that separate a junior developer from a software architect.

#### 1. Nominal vs Structural Typing in Domain IDs

![TypeScript Type System](./images/typescript-enterprise-patterns/types.png)

By default, TypeScript is structurally typed (duck typing). This is dangerous for IDs: `UserId` and `OrderId` are both `strings`, and it is easy to pass them wrongly to a function.

We implement **Branded Types** to simulate nominal typing:

```typescript
declare const __brand: unique symbol;
type Brand<K, T> = K & { readonly [__brand]: T };

export type UserId = Brand<string, "UserId">;
export type OrderId = Brand<string, "OrderId">;

function cancelOrder(id: OrderId) {
  /* ... */
}

const uid = "user_123" as UserId;
const oid = "order_123" as OrderId;

cancelOrder(oid); // ✅ OK
cancelOrder(uid); // ❌ Compilation Error: Type 'UserId' is not assignable to type 'OrderId'.
```

#### 2. Safe Dependency Injection (DI)

In NestJS, DI is standard. But in pure domain logic (Clean Architecture), we prefer explicit and framework-agnostic DI.

We use the **Reader Monad** pattern or simply higher-order functions to inject repositories without `@Inject()` decorators, facilitating isolated unit tests.

#### 3. Advanced Type Mapping for Drizzle and DTOs

Do not duplicate definitions. Use **Utility Types** to derive DTOs from your database schema.
If you have a Drizzle schema, derive the insertion and selection type automatically:

```typescript
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users } from "./schema";

type User = InferSelectModel<typeof users>;
type NewUser = InferInsertModel<typeof users>;

// Omit audit fields in creation DTO
type CreateUserDto = Omit<NewUser, "createdAt" | "updatedAt">;
```

#### 4. Result Pattern instead of Try-Catch

Error handling with `try-catch` breaks control flow and makes errors invisible in the function signature. We adopt the **Result** pattern (inspired by Rust/Go).

```typescript
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

async function findUser(id: UserId): Promise<Result<User, UserNotFoundError>> {
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!user) {
    return { ok: false, error: new UserNotFoundError(id) };
  }
  return { ok: true, value: user };
}

// The consumer IS FORCED to handle the error
const result = await findUser(id);
if (!result.ok) {
  return handleFailure(result.error);
}
console.log(result.value.email);
```

#### 5. Exhaustiveness Checking with Never

When using `switch` on discriminated unions (e.g., order states), we use the `never` type to ensure we handle _all_ possible cases. If we add a new state `REFUNDED` and forget to update the switch, TypeScript will stop compilation.

Mastering these techniques turns the compiler into your strictest pair programming partner, eliminating entire categories of bugs before they reach production.

---

### PORTUGUÊS (PT)

o TypeScript conquistou o desenvolvimento empresarial, mas usá-lo como "JavaScript com tipos" é desperdiçar seu potencial. Em sistemas de grande escala, o TypeScript é a primeira linha de defesa contra a dívida técnica. Este artigo explora padrões de design avançados, tipos condicionais e técnicas de metaprogramação que separam um desenvolvedor júnior de um arquiteto de software.

#### 1. Tipagem Nominal vs Estrutural em IDs de Domínio

![TypeScript Type System](./images/typescript-enterprise-patterns/types.png)

Por padrão, o TypeScript é estruturalmente tipado (duck typing). Isso é perigoso para IDs: `UserId` e `OrderId` são ambos `strings`, e é fácil passá-los erroneamente para uma função.

Implementamos **Branded Types** para simular tipagem nominal:

```typescript
declare const __brand: unique symbol;
type Brand<K, T> = K & { readonly [__brand]: T };

export type UserId = Brand<string, "UserId">;
export type OrderId = Brand<string, "OrderId">;

function cancelOrder(id: OrderId) {
  /* ... */
}

const uid = "user_123" as UserId;
const oid = "order_123" as OrderId;

cancelOrder(oid); // ✅ OK
cancelOrder(uid); // ❌ Erro de compilação: Type 'UserId' is not assignable to type 'OrderId'.
```

#### 2. Injeção de Dependência (DI) Segura

No NestJS, DI é padrão. Mas na lógica de domínio puro (Clean Architecture), preferimos uma DI explícita e agnóstica de framework.

Usamos o padrão **Reader Monad** ou simplesmente funções de ordem superior para injetar repositórios sem decoradores `@Inject()`, facilitando testes unitários isolados.

#### 3. Mapeamento de Tipos Avançado para Drizzle e DTOs

Não duplique definições. Use **Utility Types** para derivar DTOs do esquema do seu banco de dados.
Se você tiver um esquema Drizzle, derive o tipo de inserção e seleção automaticamente:

```typescript
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users } from "./schema";

type User = InferSelectModel<typeof users>;
type NewUser = InferInsertModel<typeof users>;

// Omitir campos de auditoria no DTO de criação
type CreateUserDto = Omit<NewUser, "createdAt" | "updatedAt">;
```

#### 4. Result Pattern em vez de Try-Catch

O tratamento de erros com `try-catch` quebra o fluxo de controle e torna os erros invisíveis na assinatura da função. Adotamos o padrão **Result** (inspirado em Rust/Go).

```typescript
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

async function findUser(id: UserId): Promise<Result<User, UserNotFoundError>> {
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!user) {
    return { ok: false, error: new UserNotFoundError(id) };
  }
  return { ok: true, value: user };
}

// O consumidor É OBRIGADO a lidar com o erro
const result = await findUser(id);
if (!result.ok) {
  return handleFailure(result.error);
}
console.log(result.value.email);
```

#### 5. Verificação de Exaustividade com Never

Ao usar `switch` em uniões discriminadas (e.g., estados de um pedido), usamos o tipo `never` para garantir que tratamos _todos_ os casos possíveis. Se adicionarmos um novo estado `REFUNDED` e esquecermos de atualizar o switch, o TypeScript interromperá a compilação.

Dominar essas técnicas transforma o compilador em seu parceiro de pair programming mais rigoroso, eliminando categorias inteiras de bugs antes que cheguem à produção.
