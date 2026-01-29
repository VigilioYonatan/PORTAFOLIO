### ESPAÑOL (ES)

Clean Architecture no es sobre tener carpetas bonitas. Es sobre **independencia**: del framework, de la UI, de la base de datos y de cualquier agente externo. El objetivo es que la lógica de negocio (Use Cases) sea pura, testeable y estable. Si mañana decides cambiar Drizzle por Prisma, tu lógica de negocio no debería tocarse. En este artículo, implementaremos una arquitectura hexagonal estricta en TypeScript, separando las capas de Dominio, Aplicación e Infraestructura.

#### 1. La Regla de Dependencia: Hacia Adentro

El código fuente solo puede apuntar hacia adentro. El **Dominio** no sabe nada de la base de datos. La **Aplicación** orquesta el Dominio pero no sabe de controladores HTTP.

![Clean Architecture Layers](./images/clean-architecture-ddd/layers.png)

1.  **Dominio (Core)**: Entidades, Value Objects, Domain Services, Domain Events.
2.  **Aplicación**: Use Cases (Interactors), Puertos (Interfaces de Repositorios, Servicios Externos).
3.  **Infraestructura**: Implementaciones de Repositorios (Drizzle, etc.), Adaptadores de Servicios (Stripe, AWS SES).
4.  **Presentación**: Controladores REST, Resolvers GraphQL.

#### 2. Modelando el Dominio Rico (DDD)

Evitamos el "Anemic Domain Model" (entidades que son solo bolsas de datos `get/set`).
Nuestras entidades encapsulan reglas de negocio invariantas.

```typescript
// domain/user/user.entity.ts
export class User {
  constructor(
    private readonly _id: UserId,
    private _email: Email,
    private _status: UserStatus,
  ) {}

  public activate(): void {
    if (this._status === UserStatus.BANNED) {
      throw new DomainError("Cannot activate a banned user.");
    }
    this._status = UserStatus.ACTIVE;
    // Domain Events son cruciales para desacoplar efectos secundarios
    this.addDomainEvent(new UserActivatedEvent(this._id));
  }
}
```

#### 3. Inversión de Dependencias en NestJS

Esta es la clave de la arquitectura hexagonal. El Use Case necesita un repositorio, pero no puede depender de la clase concreta `DrizzleUserRepository` (porque eso violaría la regla de dependencia).

**La Solución**: Definir una interfaz en la capa de **Aplicación**.

```typescript
// application/ports/user.repository.port.ts
export abstract class UserRepositoryPort {
  abstract save(user: User): Promise<void>;
  abstract findById(id: string): Promise<User | null>;
}
```

Luego, en el módulo de NestJS, "pegamos" la interfaz con la implementación concreta usando `providers`:

```typescript
// infrastructure/ioc/user.module.ts
@Module({
  providers: [
    CreateUserUseCase,
    {
      provide: UserRepositoryPort, // El token es la clase abstracta
      useClass: DrizzleUserRepository, // La implementación real
    },
  ],
})
export class UserModule {}
```

#### 4. Use Cases: Orquestadores Puros

Un Use Case es una función que representa una intención del usuario. Solo debe coordinar.

```typescript
// application/use-cases/create-user.interactor.ts
export class CreateUserUseCase {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute(dto: CreateUserDto): Promise<void> {
    const email = new Email(dto.email);

    // Validar unicidad (regla de aplicación)
    const exists = await this.userRepo.findByEmail(email);
    if (exists) throw new ConflictException("Email taken");

    // Crear agregado
    const user = User.create(email, dto.password);

    // Persistir
    await this.userRepo.save(user);

    // Despachar eventos de dominio (opcional, para side-effects)
    DomainEvents.dispatch(user);
  }
}
```

#### 5. Mappers: El Pegamento Invisible

Para que esto funcione, necesitamos traducir entre el mundo de la base de datos y el mundo del dominio. Nunca uses tus entidades de TypeORM/Drizzle en el dominio.

```typescript
// infrastructure/persistence/mappers/user.mapper.ts
export class UserMapper {
  static toDomain(raw: UserSqlModel): User {
    // Reconstruir la entidad desde datos crudos sin ejecutar validaciones de creación
    return new User(new UserId(raw.id), ...);
  }

  static toPersistence(user: User): UserSqlModel {
    return {
      id: user.id.value,
      status: user.status.value, // Value Object a primitivo
      // ...
    };
  }
}
```

#### 6. Testing Unitario Real

Gracias a esta separación, probar el `CreateUserUseCase` es trivial y ultrarrápido. No necesitas Docker ni una base de datos real.

```typescript
// create-user.spec.ts
const mockRepo = new InMemoryUserRepository(); // Fake en memoria
const useCase = new CreateUserUseCase(mockRepo);

await useCase.execute({ email: "test@test.com" });
expect(mockRepo.users).toHaveLength(1);
```

Clean Architecture tiene un costo inicial de boilerplate (más clases, mappers), pero se paga con creces en mantenimiento a largo plazo. Tu base de datos es un detalle. Tu framework web es un detalle. Tu negocio es lo único que importa.

---

### ENGLISH (EN)

Clean Architecture is not about pretty folders. It is about **independence**: from the framework, the UI, the database, and any external agent. The goal is for business logic (Use Cases) to be pure, testable, and stable. If tomorrow you decide to switch from Drizzle to Prisma, your business logic should remain untouched. In this article, we will implement strict hexagonal architecture in TypeScript, separating Domain, Application, and Infrastructure layers.

#### 1. The Dependency Rule: Pointing Inwards

Source code can only point inwards. The **Domain** knows nothing about the database. The **Application** orchestrates the Domain but knows nothing about HTTP controllers.

![Clean Architecture Layers](./images/clean-architecture-ddd/layers.png)

1.  **Domain (Core)**: Entities, Value Objects, Domain Services, Domain Events.
2.  **Application**: Use Cases (Interactors), Ports (Repository Interfaces, External Services).
3.  **Infrastructure**: Repository Implementations (Drizzle, etc.), Service Adapters (Stripe, AWS SES).
4.  **Presentation**: REST Controllers, GraphQL Resolvers.

#### 2. Modeling the Rich Domain (DDD)

We avoid the "Anemic Domain Model" (entities that are just `get/set` data bags).
Our entities encapsulate invariant business rules.

```typescript
// domain/user/user.entity.ts
export class User {
  constructor(
    private readonly _id: UserId,
    private _email: Email,
    private _status: UserStatus,
  ) {}

  public activate(): void {
    if (this._status === UserStatus.BANNED) {
      throw new DomainError("Cannot activate a banned user.");
    }
    this._status = UserStatus.ACTIVE;
    // Domain Events are crucial for decoupling side effects
    this.addDomainEvent(new UserActivatedEvent(this._id));
  }
}
```

#### 3. Inversion of Control (IoC) in NestJS

This is the key to hexagonal architecture. The Use Case needs a repository, but it cannot depend on the concrete class `DrizzleUserRepository` (because that would violate the dependency rule).

**The Solution**: Define an interface in the **Application** layer.

```typescript
// application/ports/user.repository.port.ts
export abstract class UserRepositoryPort {
  abstract save(user: User): Promise<void>;
  abstract findById(id: string): Promise<User | null>;
}
```

Then, in the NestJS module, we "glue" the interface to the concrete implementation using `providers`:

```typescript
// infrastructure/ioc/user.module.ts
@Module({
  providers: [
    CreateUserUseCase,
    {
      provide: UserRepositoryPort, // The token is the abstract class
      useClass: DrizzleUserRepository, // The real implementation
    },
  ],
})
export class UserModule {}
```

#### 4. Use Cases: Pure Orchestrators

A Use Case is a function representing a user intent. It should only coordinate.

```typescript
// application/use-cases/create-user.interactor.ts
export class CreateUserUseCase {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute(dto: CreateUserDto): Promise<void> {
    const email = new Email(dto.email);

    // Validate uniqueness (application rule)
    const exists = await this.userRepo.findByEmail(email);
    if (exists) throw new ConflictException("Email taken");

    // Create aggregate
    const user = User.create(email, dto.password);

    // Persist
    await this.userRepo.save(user);

    // Dispatch domain events (optional, for side-effects)
    DomainEvents.dispatch(user);
  }
}
```

#### 5. Mappers: The Invisible Glue

For this to work, we need to translate between the database world and the domain world. Never use your TypeORM/Drizzle entities in the domain.

```typescript
// infrastructure/persistence/mappers/user.mapper.ts
export class UserMapper {
  static toDomain(raw: UserSqlModel): User {
    // Reconstruct the entity from raw data without running creation validations
    return new User(new UserId(raw.id), ...);
  }

  static toPersistence(user: User): UserSqlModel {
    return {
      id: user.id.value,
      status: user.status.value, // Value Object to primitive
      // ...
    };
  }
}
```

#### 6. Real Unit Testing

Thanks to this separation, testing the `CreateUserUseCase` is trivial and ultra-fast. You don't need Docker or a real database.

```typescript
// create-user.spec.ts
const mockRepo = new InMemoryUserRepository(); // In-memory fake
const useCase = new CreateUserUseCase(mockRepo);

await useCase.execute({ email: "test@test.com" });
expect(mockRepo.users).toHaveLength(1);
```

Clean Architecture has an initial boilerplate cost (more classes, mappers), but it pays off handsomely in long-term maintenance. Your database is a detail. Your web framework is a detail. Your business is the only thing that matters.

---

### PORTUGUÊS (PT)

Clean Architecture não é sobre ter pastas bonitas. É sobre **independência**: do framework, da UI, do banco de dados e de qualquer agente externo. O objetivo é que a lógica de negócios (Use Cases) seja pura, testável e estável. Se amanhã você decidir mudar do Drizzle para o Prisma, sua lógica de negócios deve permanecer intocada. Neste artigo, implementaremos uma arquitetura hexagonal estrita em TypeScript, separando as camadas de Domínio, Aplicação e Infraestrutura.

#### 1. A Regra de Dependência: Apontando para Dentro

O código-fonte só pode apontar para dentro. O **Domínio** não sabe nada sobre o banco de dados. A **Aplicação** orquestra o Domínio, mas não sabe nada sobre controladores HTTP.

![Clean Architecture Layers](./images/clean-architecture-ddd/layers.png)

1.  **Domínio (Core)**: Entidades, Value Objects, Domain Services, Domain Events.
2.  **Aplicação**: Use Cases (Interactores), Portas (Interfaces de Repositórios, Serviços Externos).
3.  **Infraestrutura**: Implementações de Repositórios (Drizzle, etc.), Adaptadores de Serviços (Stripe, AWS SES).
4.  **Apresentação**: Controladores REST, Resolvers GraphQL.

#### 2. Modelando o Domínio Rico (DDD)

Evitamos o "Modelo de Domínio Anêmico" (entidades que são apenas sacos de dados `get/set`).
Nossas entidades encapsulam regras de negócios invariantes.

```typescript
// domain/user/user.entity.ts
export class User {
  constructor(
    private readonly _id: UserId,
    private _email: Email,
    private _status: UserStatus,
  ) {}

  public activate(): void {
    if (this._status === UserStatus.BANNED) {
      throw new DomainError("Cannot activate a banned user.");
    }
    this._status = UserStatus.ACTIVE;
    // Eventos de Domínio são cruciais para desacoplar efeitos colaterais
    this.addDomainEvent(new UserActivatedEvent(this._id));
  }
}
```

#### 3. Inversão de Controle (IoC) no NestJS

Esta é a chave da arquitetura hexagonal. O Use Case precisa de um repositório, mas não pode depender da classe concreta `DrizzleUserRepository` (porque isso violaria a regra de dependência).

**A Solução**: Definir uma interface na camada de **Aplicação**.

```typescript
// application/ports/user.repository.port.ts
export abstract class UserRepositoryPort {
  abstract save(user: User): Promise<void>;
  abstract findById(id: string): Promise<User | null>;
}
```

Então, no módulo NestJS, "colamos" a interface à implementação concreta usando `providers`:

```typescript
// infrastructure/ioc/user.module.ts
@Module({
  providers: [
    CreateUserUseCase,
    {
      provide: UserRepositoryPort, // O token é a classe abstrata
      useClass: DrizzleUserRepository, // A implementação real
    },
  ],
})
export class UserModule {}
```

#### 4. Use Cases: Orquestradores Puros

Um Use Case é uma função que representa uma intenção do usuário. Deve apenas coordenar.

```typescript
// application/use-cases/create-user.interactor.ts
export class CreateUserUseCase {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute(dto: CreateUserDto): Promise<void> {
    const email = new Email(dto.email);

    // Validar unicidade (regra de aplicação)
    const exists = await this.userRepo.findByEmail(email);
    if (exists) throw new ConflictException("Email taken");

    // Criar agregado
    const user = User.create(email, dto.password);

    // Persistir
    await this.userRepo.save(user);

    // Despachar eventos de domínio (opcional, para efeitos colaterais)
    DomainEvents.dispatch(user);
  }
}
```

#### 5. Mappers: A Cola Invisível

Para que isso funcione, precisamos traduzir entre o mundo do banco de dados e o mundo do domínio. Nunca use suas entidades TypeORM/Drizzle no domínio.

```typescript
// infrastructure/persistence/mappers/user.mapper.ts
export class UserMapper {
  static toDomain(raw: UserSqlModel): User {
    // Reconstruir a entidade a partir de dados brutos sem executar validações de criação
    return new User(new UserId(raw.id), ...);
  }

  static toPersistence(user: User): UserSqlModel {
    return {
      id: user.id.value,
      status: user.status.value, // Value Object para primitivo
      // ...
    };
  }
}
```

#### 6. Testes Unitários Reais

Graças a essa separação, testar o `CreateUserUseCase` é trivial e ultrarrápido. Você não precisa do Docker ou de um banco de dados real.

```typescript
// create-user.spec.ts
const mockRepo = new InMemoryUserRepository(); // Fake em memória
const useCase = new CreateUserUseCase(mockRepo);

await useCase.execute({ email: "test@test.com" });
expect(mockRepo.users).toHaveLength(1);
```

Clean Architecture tem um custo inicial de boilerplate (mais classes, mappers), mas compensa muito na manutenção de longo prazo. Seu banco de dados é um detalhe. Seu framework web é um detalhe. Seu negócio é a única coisa que importa.
