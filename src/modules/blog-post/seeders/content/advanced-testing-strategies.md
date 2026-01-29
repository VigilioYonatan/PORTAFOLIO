### ESPAÑOL (ES)

En el ecosistema de desarrollo de software moderno, particularmente en arquitecturas de microservicios y sistemas distribuidos utilizando Node.js y TypeScript, el concepto de "Testing" ha evolucionado drásticamente. Ya no se trata simplemente de verificar si una función `sum(a, b)` devuelve el resultado correcto. En un nivel de ingeniería senior, el testing es una disciplina arquitectónica que garantiza la resiliencia, mantenibilidad y evolutividad del sistema. Este artículo profundiza en estrategias avanzadas de testing, alejándose de los tutoriales básicos para centrarse en patrones de nivel empresarial como Contract Testing, Mutation Testing, Pruebas de Integración con Contenedores Efímeros y Load Testing como Código.

#### 1. La Pirámide de Testing Invertida (o El Trofeo de Testing)

Tradicionalmente, se nos enseñó la pirámide de testing: muchos unitarios, pocos de integración, muy pocos E2E. Sin embargo, en backends modernos con TypeScript y ORMs como Drizzle, la lógica de negocio a menudo reside en la orquestación de servicios y la interacción con la base de datos. Aquí, los **Tests de Integración** aportan mucho más valor por unidad de esfuerzo que los tests unitarios aislados con mocks excesivos.

#### 2. Testcontainers: Integración Real, Cero Mocks

El uso excesivo de Mocks (burlas) es uno de los mayores antipatrones en el testing de backend. Mockear una base de datos o una cola de mensajes significa que estás probando tu suposición de cómo funcionan esos sistemas, no cómo funcionan realmente. Si tu query SQL tiene un error de sintaxis específico de Postgres, un mock de "in-memory repository" nunca lo detectará.

La solución estándar en la industria hoy en día es **Testcontainers**. Esta librería permite levantar instancias reales de infraestructura (PostgreSQL, Redis, Kafka) en contenedores Docker desechables para cada suite de pruebas.

**Ejemplo Práctico con Vitest, Drizzle ORM y Testcontainers:**

```typescript
// tests/infrastructure/database.test.ts
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";
import { users } from "../../src/schema";
import { eq } from "drizzle-orm";

describe("Users Repository Integration", () => {
  let container: StartedPostgreSqlContainer;
  let db: ReturnType<typeof drizzle>;
  let client: Client;

  // Setup: Levanta un contenedor real de Postgres antes de los tests
  beforeAll(async () => {
    container = await new PostgreSqlContainer("postgres:16-alpine").start();

    client = new Client({
      connectionString: container.getConnectionUri(),
    });
    await client.connect();

    // Inicializa Drizzle y corre las migraciones reales
    db = drizzle(client);
    await migrate(db, { migrationsFolder: "./drizzle" });
  }, 60000); // Timeout extendido para docker pull

  // Teardown: Limpia todo al finalizar
  afterAll(async () => {
    await client.end();
    await container.stop();
  });

  it("debería crear y recuperar un usuario con transacción consistente", async () => {
    // Arrange
    const newUser = {
      email: "engineer@senior.ts",
      name: "Senior Dev",
      role: "ADMIN" as const,
    };

    // Act
    const inserted = await db.insert(users).values(newUser).returning();

    // Assert
    expect(inserted[0].id).toBeDefined();

    const retrieved = await db
      .select()
      .from(users)
      .where(eq(users.id, inserted[0].id));
    expect(retrieved[0]).toMatchObject(newUser);
  });
});
```

Este enfoque garantiza que si rompes una _Foreign Key_ o usas una función de Postgres no soportada, el test fallará. Es confianza real para desplegar a producción los viernes.

#### 3. Contract Testing: La Cura para el "Infierno de los Microservicios"

![Contract Testing Flow](./images/advanced-testing-strategies/pact-flow.png)

Cuando tienes el Servicio A (Consumidor) llamando al Servicio B (Provedor), ¿cómo aseguras que un cambio en la API de B no rompa A sin tener que levantar todo e1 ecosistema para un test E2E? La respuesta es **Consumer-Driven Contract Testing (CDCT)**.

Utilizando herramientas como **Pact**, el consumidor define un "contrato" (expectativas de request/response). Este contrato se comparte (vía Pact Broker) y el proveedor lo valida en su CI pipeline.

**Ejemplo del Lado del Consumidor (Servicio A):**

```typescript
// consumer.test.ts
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { UserApiClient } from "../src/api-client";

const provider = new PactV3({
  consumer: "FrontendApp",
  provider: "UserService",
});

describe("API de Usuarios", () => {
  it("obtiene un usuario existente", () => {
    provider
      .given("un usuario con ID 123 existe")
      .uponReceiving("una petición para obtener usuario 123")
      .withRequest({
        method: "GET",
        path: "/users/123",
      })
      .willRespondWith({
        status: 200,
        body: {
          id: MatchersV3.like("123"),
          name: MatchersV3.string("John Doe"),
          email: MatchersV3.email("john@test.com"),
        },
      });

    return provider.executeTest(async (mockServer) => {
      const client = new UserApiClient(mockServer.url);
      const response = await client.getUser("123");
      expect(response.name).toEqual("John Doe");
    });
  });
});
```

Si el Servicio B cambia el campo `email` a `contact_email` sin avisar, su propio pipeline de CI fallará al validar este contrato, previniendo la ruptura antes del merge.

#### 4. Mutation Testing: ¿Quién testea a tus tests?

La cobertura de código ("80% coverage") es una métrica de vanidad peligrosa. Puedes tener 100% de cobertura ejecutando el código sin hacer ninguna aserción (`expect`).

**Mutation Testing** (usando herramientas como Stryker para JS/TS) evalúa la calidad de tus tests. Introduce "mutantes" (bugs deliberados) en tu código fuente: cambia `a + b` por `a - b`, elimina llamadas a funciones, invierte condicionales. Luego corre tus tests.

- Si los tests pasan (verde), el mutante **sobrevivió**. Esto es MALO. Significa que tu test no detectó el cambio de comportamiento.
- Si los tests fallan (rojo), el mutante **murió**. Esto es BUENO.

```json
// stryker.conf.json
{
  "mutator": "typescript",
  "packageManager": "npm",
  "reporters": ["html", "clear-text", "progress"],
  "testRunner": "jest",
  "coverageAnalysis": "perTest"
}
```

Integrar esto en el CI bloquea PRs que añaden código sin tests significativos, elevando drásticamente la calidad del software.

#### 5. Load Testing como Código (K6)

El rendimiento es una "feature". No esperes al Black Friday para ver si tu API aguanta. Incorpora pruebas de carga en tu pipeline continuo usando **k6**. A diferencia de JMeter (basado en GUI/XML), k6 usa scripts en JavaScript/TypeScript, lo que permite versionarlos junto con el código de la aplicación.

```javascript
// load-test.js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 50 }, // Ramp up a 50 usuarios
    { duration: "1m", target: 50 }, // Mantener carga
    { duration: "30s", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p95<500"], // 95% de las peticiones deben ser < 500ms
    http_req_failed: ["rate<0.01"], // Menos del 1% de errores
  },
};

export default function () {
  const res = http.get("http://api.mi-app.com/products");
  check(res, { "status was 200": (r) => r.status == 200 });
  sleep(1);
}
```

### Conclusión

Pasar de Junior a Senior implica dejar de ver los tests como una tarea tediosa de "marcar casillas" y empezar a verlos como herramientas de diseño y arquitectura. Adoptar Testcontainers, Contract Testing y Mutation Testing requiere inversión inicial, pero paga dividendos masivos en velocidad de desarrollo y estabilidad a largo plazo.

---

### ENGLISH (EN)

In the modern software development ecosystem, particularly within microservices architectures and distributed systems using Node.js and TypeScript, the concept of "Testing" has evolved drastically. It is no longer simply about verifying if a `sum(a, b)` function returns the correct result. At a senior engineering level, testing is an architectural discipline that ensures system resilience, maintainability, and evolvability. This article delves into advanced testing strategies, moving away from basic tutorials to focus on enterprise-grade patterns such as Contract Testing, Mutation Testing, Ephemeral Container Integration Testing, and Load Testing as Code.

#### 1. The Inverted Testing Pyramid (or The Testing Trophy)

Traditionally, we were taught the testing pyramid: many unit tests, few integration tests, very few E2E tests. However, in modern backends with TypeScript and ORMs like Drizzle, business logic often resides in service orchestration and database interaction. Here, **Integration Tests** provide much more value per unit of effort than isolated unit tests with excessive mocks.

#### 2. Testcontainers: Real Integration, Zero Mocks

Excessive use of Mocks is one of the biggest anti-patterns in backend testing. Mocking a database or a message queue means you are testing your assumption of how those systems work, not how they actually work. If your SQL query has a Postgres-specific syntax error, an "in-memory repository" mock will never catch it.

The industry standard solution today is **Testcontainers**. This library allows you to spin up real infrastructure instances (PostgreSQL, Redis, Kafka) in disposable Docker containers for each test suite.

**Practical Example with Vitest, Drizzle ORM, and Testcontainers:**

```typescript
// tests/infrastructure/database.test.ts
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";
import { users } from "../../src/schema";
import { eq } from "drizzle-orm";

describe("Users Repository Integration", () => {
  let container: StartedPostgreSqlContainer;
  let db: ReturnType<typeof drizzle>;
  let client: Client;

  // Setup: Spin up a real Postgres container before tests
  beforeAll(async () => {
    container = await new PostgreSqlContainer("postgres:16-alpine").start();

    client = new Client({
      connectionString: container.getConnectionUri(),
    });
    await client.connect();

    // Initialize Drizzle and run real migrations
    db = drizzle(client);
    await migrate(db, { migrationsFolder: "./drizzle" });
  }, 60000); // Extended timeout for docker pull

  // Teardown: Clean up everything afterwards
  afterAll(async () => {
    await client.end();
    await container.stop();
  });

  it("should create and retrieve a user with consistent transaction", async () => {
    // Arrange
    const newUser = {
      email: "engineer@senior.ts",
      name: "Senior Dev",
      role: "ADMIN" as const,
    };

    // Act
    const inserted = await db.insert(users).values(newUser).returning();

    // Assert
    expect(inserted[0].id).toBeDefined();

    const retrieved = await db
      .select()
      .from(users)
      .where(eq(users.id, inserted[0].id));
    expect(retrieved[0]).toMatchObject(newUser);
  });
});
```

This approach guarantees that if you break a _Foreign Key_ or use an unsupported Postgres function, the test will fail. It provides real confidence to deploy to production on Fridays.

#### 3. Contract Testing: The Cure for "Microservices Hell"

![Contract Testing Flow](./images/advanced-testing-strategies/pact-flow.png)

When you have Service A (Consumer) calling Service B (Provider), how do you ensure that a change in B's API doesn't break A without having to spin up the entire ecosystem for an E2E test? The answer is **Consumer-Driven Contract Testing (CDCT)**.

Using tools like **Pact**, the consumer defines a "contract" (request/response expectations). This contract is shared (via Pact Broker) and the provider validates it in their CI pipeline.

**Consumer Side Example (Service A):**

```typescript
// consumer.test.ts
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { UserApiClient } from "../src/api-client";

const provider = new PactV3({
  consumer: "FrontendApp",
  provider: "UserService",
});

describe("User API", () => {
  it("fetches an existing user", () => {
    provider
      .given("a user with ID 123 exists")
      .uponReceiving("a request to get user 123")
      .withRequest({
        method: "GET",
        path: "/users/123",
      })
      .willRespondWith({
        status: 200,
        body: {
          id: MatchersV3.like("123"),
          name: MatchersV3.string("John Doe"),
          email: MatchersV3.email("john@test.com"),
        },
      });

    return provider.executeTest(async (mockServer) => {
      const client = new UserApiClient(mockServer.url);
      const response = await client.getUser("123");
      expect(response.name).toEqual("John Doe");
    });
  });
});
```

If Service B changes the `email` field to `contact_email` without warning, its own CI pipeline will fail when validating this contract, preventing the breakage before the merge.

#### 4. Mutation Testing: Who Tests Your Tests?

Code coverage ("80% coverage") is a dangerous vanity metric. You can have 100% coverage by executing code without making any assertions (`expect`).

**Mutation Testing** (using tools like Stryker for JS/TS) evaluates the quality of your tests. It introduces "mutants" (deliberate bugs) into your source code: changes `a + b` to `a - b`, removes function calls, inverts conditionals. Then it runs your tests.

- If the tests pass (green), the mutant **survived**. This is BAD. It means your test didn't catch the behavior change.
- If the tests fail (red), the mutant **killed**. This is GOOD.

```json
// stryker.conf.json
{
  "mutator": "typescript",
  "packageManager": "npm",
  "reporters": ["html", "clear-text", "progress"],
  "testRunner": "jest",
  "coverageAnalysis": "perTest"
}
```

Integrating this into CI blocks PRs that add code without meaningful tests, significantly raising software quality.

#### 5. Load Testing as Code (K6)

Performance is a "feature". Don't wait for Black Friday to see if your API holds up. Incorporate load testing into your continuous pipeline using **k6**. Unlike JMeter (GUI/XML based), k6 uses JavaScript/TypeScript scripts, allowing you to version them alongside your application code.

```javascript
// load-test.js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 50 }, // Ramp up to 50 users
    { duration: "1m", target: 50 }, // Maintain load
    { duration: "30s", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p95<500"], // 95% of requests must be < 500ms
    http_req_failed: ["rate<0.01"], // Less than 1% errors
  },
};

export default function () {
  const res = http.get("http://api.myapp.com/products");
  check(res, { "status was 200": (r) => r.status == 200 });
  sleep(1);
}
```

### Conclusion

Going from Junior to Senior implies stopping viewing tests as a tedious "box-checking" task and starting to view them as design and architecture tools. Adopting Testcontainers, Contract Testing, and Mutation Testing requires initial investment but pays massive dividends in development velocity and long-term stability.

---

### PORTUGUÊS (PT)

No ecossistema moderno de desenvolvimento de software, particularmente em arquiteturas de microsserviços e sistemas distribuídos usando Node.js e TypeScript, o conceito de "Testing" evoluiu drasticamente. Não se trata mais apenas de verificar se uma função `sum(a, b)` retorna o resultado correto. Em um nível de engenharia sênior, o teste é uma disciplina arquitetônica que garante a resiliência, manutenibilidade e evolutividade do sistema. Este artigo aprofunda-se em estratégias avançadas de teste, afastando-se dos tutoriais básicos para focar em padrões de nível empresarial como Contract Testing, Mutation Testing, Testes de Integração com Contêineres Efêmeros e Load Testing como Código.

#### 1. A Pirâmide de Testes Invertida (ou O Troféu de Testes)

Tradicionalmente, fomos ensinados sobre a pirâmide de testes: muitos unitários, poucos de integração, muito poucos E2E. No entanto, em backends modernos com TypeScript e ORMs como Drizzle, a lógica de negócio frequentemente reside na orquestração de serviços e interação com o banco de dados. Aqui, os **Testes de Integração** fornecem muito mais valor por unidade de esforço do que testes unitários isolados com mocks excessivos.

#### 2. Testcontainers: Integração Real, Zero Mocks

O uso excessivo de Mocks é um dos maiores antipadrões no teste de backend. Mockar um banco de dados ou uma fila de mensagens significa que você está testando sua suposição de como esses sistemas funcionam, não como eles realmente funcionam. Se sua query SQL tiver um erro de sintaxe específico do Postgres, um mock de "repositório em memória" nunca detectará isso.

A solução padrão na indústria hoje é **Testcontainers**. Esta biblioteca permite subir instâncias reais de infraestrutura (PostgreSQL, Redis, Kafka) em contêineres Docker descartáveis para cada suíte de testes.

**Exemplo Prático com Vitest, Drizzle ORM e Testcontainers:**

```typescript
// tests/infrastructure/database.test.ts
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";
import { users } from "../../src/schema";
import { eq } from "drizzle-orm";

describe("Integração do Repositório de Usuários", () => {
  let container: StartedPostgreSqlContainer;
  let db: ReturnType<typeof drizzle>;
  let client: Client;

  // Setup: Sobe um contêiner Postgres real antes dos testes
  beforeAll(async () => {
    container = await new PostgreSqlContainer("postgres:16-alpine").start();

    client = new Client({
      connectionString: container.getConnectionUri(),
    });
    await client.connect();

    // Inicializa Drizzle e roda migrações reais
    db = drizzle(client);
    await migrate(db, { migrationsFolder: "./drizzle" });
  }, 60000); // Timeout estendido para docker pull

  // Teardown: Limpa tudo depois
  afterAll(async () => {
    await client.end();
    await container.stop();
  });

  it("deve criar e recuperar um usuário com transação consistente", async () => {
    // Arrange
    const newUser = {
      email: "engineer@senior.ts",
      name: "Senior Dev",
      role: "ADMIN" as const,
    };

    // Act
    const inserted = await db.insert(users).values(newUser).returning();

    // Assert
    expect(inserted[0].id).toBeDefined();

    const retrieved = await db
      .select()
      .from(users)
      .where(eq(users.id, inserted[0].id));
    expect(retrieved[0]).toMatchObject(newUser);
  });
});
```

Essa abordagem garante que se você quebrar uma _Foreign Key_ ou usar uma função do Postgres não suportada, o teste falhará. É confiança real para fazer deploy em produção nas sextas-feiras.

#### 3. Contract Testing: A Cura para o "Inferno dos Microsserviços"

![Contract Testing Flow](./images/advanced-testing-strategies/pact-flow.png)

Quando você tem o Serviço A (Consumidor) chamando o Serviço B (Provedor), como garantir que uma mudança na API de B não quebre A sem ter que subir todo o ecossistema para um teste E2E? A resposta é **Consumer-Driven Contract Testing (CDCT)**.

Usando ferramentas como **Pact**, o consumidor define um "contrato" (expectativas de requisição/resposta). Este contrato é compartilhado (via Pact Broker) e o provedor o valida em seu pipeline de CI.

**Exemplo do Lado do Consumidor (Serviço A):**

```typescript
// consumer.test.ts
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { UserApiClient } from "../src/api-client";

const provider = new PactV3({
  consumer: "FrontendApp",
  provider: "UserService",
});

describe("API de Usuários", () => {
  it("busca um usuário existente", () => {
    provider
      .given("um usuário com ID 123 existe")
      .uponReceiving("uma requisição para obter usuário 123")
      .withRequest({
        method: "GET",
        path: "/users/123",
      })
      .willRespondWith({
        status: 200,
        body: {
          id: MatchersV3.like("123"),
          name: MatchersV3.string("John Doe"),
          email: MatchersV3.email("john@test.com"),
        },
      });

    return provider.executeTest(async (mockServer) => {
      const client = new UserApiClient(mockServer.url);
      const response = await client.getUser("123");
      expect(response.name).toEqual("John Doe");
    });
  });
});
```

Se o Serviço B mudar o campo `email` para `contact_email` sem avisar, seu próprio pipeline de CI falhará ao validar esse contrato, prevenindo a quebra antes do merge.

#### 4. Mutation Testing: Quem testa seus testes?

A cobertura de código ("80% coverage") é uma métrica de vaidade perigosa. Você pode ter 100% de cobertura executando o código sem fazer nenhuma asserção (`expect`).

**Mutation Testing** (usando ferramentas como Stryker para JS/TS) avalia a qualidade dos seus testes. Ele introduz "mutantes" (bugs deliberados) no seu código fonte: troca `a + b` por `a - b`, remove chamadas de função, inverte condicionais. Depois roda seus testes.

- Se os testes passarem (verde), o mutante **sobreviveu**. Isso é RUIM. Significa que seu teste não detectou a mudança de comportamento.
- Se os testes falharem (vermelho), o mutante **morreu**. Isso é BOM.

```json
// stryker.conf.json
{
  "mutator": "typescript",
  "packageManager": "npm",
  "reporters": ["html", "clear-text", "progress"],
  "testRunner": "jest",
  "coverageAnalysis": "perTest"
}
```

Integrar isso no CI bloqueia PRs que adicionam código sem testes significativos, elevando drasticamente a qualidade do software.

#### 5. Load Testing como Código (K6)

O desempenho é uma "feature". Não espere pela Black Friday para ver se sua API aguenta. Incorpore testes de carga no seu pipeline contínuo usando **k6**. Diferente do JMeter (baseado em GUI/XML), o k6 usa scripts em JavaScript/TypeScript, permitindo versioná-los junto com o código da aplicação.

```javascript
// load-test.js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 50 }, // Ramp up para 50 usuários
    { duration: "1m", target: 50 }, // Manter carga
    { duration: "30s", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p95<500"], // 95% das requisições devem ser < 500ms
    http_req_failed: ["rate<0.01"], // Menos de 1% de erros
  },
};

export default function () {
  const res = http.get("http://api.myapp.com/products");
  check(res, { "status was 200": (r) => r.status == 200 });
  sleep(1);
}
```

### Conclusão

Passar de Júnior para Sênior implica parar de ver os testes como uma tarefa tediosa de "marcar caixinhas" e começar a vê-los como ferramentas de design e arquitetura. Adotar Testcontainers, Contract Testing e Mutation Testing requer investimento inicial, mas paga dividendos massivos em velocidade de desenvolvimento e estabilidade a longo prazo.
