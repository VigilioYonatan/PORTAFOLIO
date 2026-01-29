### ESPAÑOL (ES)

El patrón "One API Fits All" (Una API para todos) es un mito peligroso en el desarrollo moderno. Un cliente Móvil (iOS) en una red 4G inestable, una Web App (React) rica en datos, y un cliente IoT con recursos limitados tienen necesidades, restricciones y modelos de seguridad radicalmente diferentes.

El patrón **Backend for Frontend (BFF)** propone un cambio de paradigma: en lugar de una API generalista monolítica, creamos una capa de API dedicada y optimizada para cada experiencia de usuario o cliente específico.

#### 1. Arquitectura y Roles

![BFF Architecture](./images/bff-pattern/architecture.png)

En esta arquitectura, el BFF se sitúa entre el cliente y los microservicios core.

- **Mobile BFF**: Optimizado para bajo consumo de datos, consolidando múltiples llamadas en una sola.
- **Web BFF**: Optimizado para el navegador, manejando cookies de sesión y SSR.
- **Public API BFF**: Rate limits estrictos y documentación OpenAPI para terceros.

#### 2. Resolviendo el Over-fetching y Under-fetching

Imagine un endpoint `/users/me`.

- **Problema**: La API REST general devuelve un JSON de 50KB con `orders`, `history`, `preferences`, `logs`.
- **Caso de Uso Móvil**: La App solo necesita `avatarUrl` y `displayName` para mostrar el header.
- **Consecuencia**: El cliente móvil descarga 49KB de "basura", quemando batería y plan de datos.

Un BFF Móvil llama internamente a los microservicios necesarios, filtra los datos, y retorna _exactamente_ lo que la UI necesita: `{ avatarUrl: "...", displayName: "..." }`.

#### 3. Seguridad: El BFF como Borde de Seguridad

El manejo de autenticación es drásticamente diferente entre plataformas.

- **Web (React/Next.js)**: Almacenar JWTs en `localStorage` es vulnerable a XSS. La mejor práctica es usar **Cookies HttpOnly, Secure, SameSite**. El Web BFF actúa como un servidor de sesión, intercambiando cookies por tokens JWT para hablar con el backend.
- **Mobile (iOS/Android)**: Los dispositivos móviles pueden almacenar tokens de forma segura en el Keychain/Keystore. El Mobile BFF puede aceptar Tokens OAuth2 directamente.

```typescript
// NestJS Web BFF: Cookie to Token Exchange Middleware
@Injectable()
export class CookieAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const sessionCookie = req.cookies["session_id"];
    if (!sessionCookie) throw new UnauthorizedException();

    // El BFF recupera el JWT real de Redis usando el ID de sesión
    const jwt = await this.redis.get(`session:${sessionCookie}`);

    // Inyecta el token en el header para los servicios downstream
    req.headers["authorization"] = `Bearer ${jwt}`;
    next();
  }
}
```

#### 4. GraphQL Federation: El BFF Definitivo

GraphQL es, naturalmente, un BFF dinámico donde el cliente pide lo que quiere. Pero en microservicios, no queremos un monolito GraphQL.

**Apollo Federation** permite que cada microservicio (Usuarios, Productos, Reseñas) exponga su propio "subgrafo". El Gateway (BFF) une estos subgrafos en un "Supergrafo" unificado.

- El servicio de _Productos_ define el tipo `Product`.
- El servicio de _Reseñas_ extiende el tipo `Product` añadiendo el campo `reviews`.
- El BFF permite consultar `product { reviews }` mágicamente.

```typescript
// Subgraph: Reviews Service (NestJS + GraphQL + Mercurius)
@Resolver(() => Product)
export class ProductReviewsResolver {
  @ResolveField(() => [Review])
  async reviews(@Parent() product: Product) {
    return this.reviewsService.findByProductId(product.id);
  }
}
```

#### 5. Desventajas y Costo Operativo

No todo es gratis. Adoptar BFFs significa que tienes más piezas de software para desplegar, monitorear y mantener.

- **Duplicación de Lógica**: A veces la lógica de validación se repite entre el Web BFF y el Mobile BFF.
- **Latencia**: Añade un salto de red adicional.

El BFF debe ser una capa **delgada** (dumb layer). No debe contener lógica de negocio compleja, solo lógica de presentación, agregación y transformación.

---

### ENGLISH (EN)

The "One API Fits All" pattern is a dangerous myth in modern development. A Mobile client (iOS) on a flaky 4G network, a data-rich Web App (React), and a resource-constrained IoT client have radically different needs, constraints, and security models.

The **Backend for Frontend (BFF)** pattern proposes a paradigm shift: instead of a monolithic generalist API, we create a dedicated API layer optimized for each specific user experience or client.

#### 1. Architecture and Roles

![BFF Architecture](./images/bff-pattern/architecture.png)

In this architecture, the BFF sits between the client and the core microservices.

- **Mobile BFF**: Optimized for low data consumption, consolidating multiple calls into one.
- **Web BFF**: Optimized for the browser, handling session cookies and SSR.
- **Public API BFF**: Strict rate limits and OpenAPI documentation for third parties.

#### 2. Solving Over-fetching and Under-fetching

Imagine a `/users/me` endpoint.

- **Problem**: The general REST API returns a 50KB JSON with `orders`, `history`, `preferences`, `logs`.
- **Mobile Use Case**: The App only needs `avatarUrl` and `displayName` to show the header.
- **Consequence**: The mobile client downloads 49KB of "garbage", burning battery and data plans.

A Mobile BFF internally calls the necessary microservices, filters the data, and returns _exactly_ what the UI needs: `{ avatarUrl: "...", displayName: "..." }`.

#### 3. Security: The BFF as a Security Edge

Authentication handling is drastically different across platforms.

- **Web (React/Next.js)**: Storing JWTs in `localStorage` is vulnerable to XSS. The best practice is to use **HttpOnly, Secure, SameSite Cookies**. The Web BFF acts as a session server, swapping cookies for JWT tokens to talk to the backend.
- **Mobile (iOS/Android)**: Mobile devices can store tokens securely in the Keychain/Keystore. The Mobile BFF can accept OAuth2 Tokens directly.

```typescript
// NestJS Web BFF: Cookie to Token Exchange Middleware
@Injectable()
export class CookieAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const sessionCookie = req.cookies["session_id"];
    if (!sessionCookie) throw new UnauthorizedException();

    // The BFF retrieves the real JWT from Redis using the session ID
    const jwt = await this.redis.get(`session:${sessionCookie}`);

    // Injects the token into the header for downstream services
    req.headers["authorization"] = `Bearer ${jwt}`;
    next();
  }
}
```

#### 4. GraphQL Federation: The Ultimate BFF

GraphQL is naturally a dynamic BFF where the client asks for what it wants. But in microservices, we don't want a GraphQL monolith.

**Apollo Federation** allows each microservice (Users, Products, Reviews) to expose its own "subgraph". The Gateway (BFF) stitches these subgraphs into a unified "Supergraph".

- The _Products_ service defines the `Product` type.
- The _Reviews_ service extends the `Product` type adding the `reviews` field.
- The BFF allows querying `product { reviews }` magically.

```typescript
// Subgraph: Reviews Service (NestJS + GraphQL + Mercurius)
@Resolver(() => Product)
export class ProductReviewsResolver {
  @ResolveField(() => [Review])
  async reviews(@Parent() product: Product) {
    return this.reviewsService.findByProductId(product.id);
  }
}
```

#### 5. Drawbacks and Operational Cost

Nothing is free. Adopting BFFs means you have more pieces of software to deploy, monitor, and maintain.

- **Logic Duplication**: Sometimes validation logic is repeated between the Web BFF and Mobile BFF.
- **Latency**: Adds an extra network hop.

The BFF must be a **thin** layer. It should not contain complex business logic, only presentation, aggregation, and transformation logic.

---

### PORTUGUÊS (PT)

O padrão "One API Fits All" (Uma API para todos) é um mito perigoso no desenvolvimento moderno. Um cliente Móvel (iOS) em uma rede 4G instável, uma Web App (React) rica em dados, e um cliente IoT com recursos limitados têm necessidades, restrições e modelos de segurança radicalmente diferentes.

O padrão **Backend for Frontend (BFF)** propõe uma mudança de paradigma: em vez de uma API generalista monolítica, criamos uma camada de API dedicada e otimizada para cada experiência de usuário ou cliente específico.

#### 1. Arquitetura e Papéis

![BFF Architecture](./images/bff-pattern/architecture.png)

Nesta arquitetura, o BFF situa-se entre o cliente e os microsserviços principais.

- **Mobile BFF**: Otimizado para baixo consumo de dados, consolidando múltiplas chamadas em uma.
- **Web BFF**: Otimizado para o navegador, gerenciando cookies de sessão e SSR.
- **Public API BFF**: Rate limits estritos e documentação OpenAPI para terceiros.

#### 2. Resolvendo Over-fetching e Under-fetching

Imagine um endpoint `/users/me`.

- **Problema**: A API REST geral retorna um JSON de 50KB com `orders`, `history`, `preferences`, `logs`.
- **Caso de Uso Móvel**: O App precisa apenas de `avatarUrl` e `displayName` para mostrar o cabeçalho.
- **Consequência**: O cliente móvel baixa 49KB de "lixo", queimando bateria e plano de dados.

Um BFF Móvel chama internamente os microsserviços necessários, filtra os dados, e retorna _exatamente_ o que a UI precisa: `{ avatarUrl: "...", displayName: "..." }`.

#### 3. Segurança: O BFF como Borda de Segurança

O tratamento de autenticação é drasticamente diferente entre plataformas.

- **Web (React/Next.js)**: Armazenar JWTs no `localStorage` é vulnerável a XSS. A melhor prática é usar **Cookies HttpOnly, Secure, SameSite**. O Web BFF atua como um servidor de sessão, trocando cookies por tokens JWT para falar com o backend.
- **Mobile (iOS/Android)**: Dispositivos móveis podem armazenar tokens de forma segura no Keychain/Keystore. O Mobile BFF pode aceitar Tokens OAuth2 diretamente.

```typescript
// NestJS Web BFF: Cookie to Token Exchange Middleware
@Injectable()
export class CookieAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const sessionCookie = req.cookies["session_id"];
    if (!sessionCookie) throw new UnauthorizedException();

    // O BFF recupera o JWT real do Redis usando o ID de sessão
    const jwt = await this.redis.get(`session:${sessionCookie}`);

    // Injeta o token no header para os serviços a jusante
    req.headers["authorization"] = `Bearer ${jwt}`;
    next();
  }
}
```

#### 4. GraphQL Federation: O BFF Definitivo

GraphQL é, naturalmente, um BFF dinâmico onde o cliente pede o que quer. Mas em microsserviços, não queremos um monólito GraphQL.

**Apollo Federation** permite que cada microsserviço (Usuários, Produtos, Avaliações) exponha seu próprio "subgrafo". O Gateway (BFF) une esses subgrafos em um "Supergrafo" unificado.

- O serviço de _Produtos_ define o tipo `Product`.
- O serviço de _Avaliações_ estende o tipo `Product` adicionando o campo `reviews`.
- O BFF permite consultar `product { reviews }` magicamente.

```typescript
// Subgraph: Reviews Service (NestJS + GraphQL + Mercurius)
@Resolver(() => Product)
export class ProductReviewsResolver {
  @ResolveField(() => [Review])
  async reviews(@Parent() product: Product) {
    return this.reviewsService.findByProductId(product.id);
  }
}
```

#### 5. Desvantagens e Custo Operacional

Nada é de graça. Adotar BFFs significa que você tem mais peças de software para implantar, monitorar e manter.

- **Duplicação de Lógica**: Às vezes a lógica de validação se repete entre o Web BFF e o Mobile BFF.
- **Latência**: Adiciona um salto de rede adicional.

O BFF deve ser uma camada **fina** (thin layer). Não deve conter lógica de negócios complexa, apenas lógica de apresentação, agregação e transformação.
