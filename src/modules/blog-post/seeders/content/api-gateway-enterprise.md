### ESPAÑOL (ES)

En un ecosistema de microservicios, exponer 50 o 100 servicios directamente a internet no solo es una pesadilla de seguridad, sino una receta para el caos operativo. Un **API Gateway** actúa como el único punto de entrada para todo el tráfico de clientes, desacoplando la interfaz pública de la arquitectura interna.

Sin embargo, la elección de la tecnología es crítica. AWS API Gateway puede volverse prohibitivamente caro a gran escala (cobrando por millón de peticiones), y soluciones como Apigee pueden ser "overkill". En este artículo, exploraremos cómo construir una solución robusta y de alto rendimiento utilizando **Kong** o un Gateway personalizado con **NestJS + Fastify**, enfocándonos en patrones empresariales.

#### 1. Arquitectura de Alto Nivel

![API Gateway Architecture](./images/api-gateway-enterprise/gateway-architecture.png)

El Gateway no es solo un proxy inverso; es un orquestador de políticas transversales:

- **Routing Dinámico**: Enrutamiento basado en path, headers o versiones.
- **Security**: Terminación SSL/TLS, validación JWT, protección DDoS básica.
- **Resilience**: Retry policies, Circuit Breakers, Timeouts.
- **Observability**: Generación de Request IDs únicos para Distributed Tracing.

#### 2. Rate Limiting Distribuido con Redis

La limitación de velocidad es la primera línea de defensa. Implementar esto en memoria local es inútil en un entorno clusterizado (Kubernetes), ya que el límite se multiplicaría por el número de réplicas del Gateway (e.g., 100 req/s \* 10 pods = 1000 req/s reales).

Necesitamos un estado compartido y atómico. **Redis** es la herramienta estándar aquí, utilizando scripts Lua para garantizar atomicidad.

**Algoritmo: Sliding Window Log**
A diferencia del "Fixed Window" que permite ráfagas al borde del minuto, el "Sliding Window" ofrece un suavizado real del tráfico.

```typescript
// NestJS Throttler Guard Custom Implementation using Redis
import { Injectable, ExecutionContext } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class DistributedThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Rate limit por Tenant ID o User ID, fallback a IP
    return req.headers["x-tenant-id"] || req.user?.id || req.ip;
  }

  protected async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
  ): Promise<boolean> {
    const key = this.generateKey(context, suffix);
    // Ejecutar script Lua en Redis para incremento atómico y TTL
    const { totalHits } = await this.storageService.increment(key, ttl);

    if (totalHits > limit) {
      throw new ThrottlerException("Rate limit exceeded for Tenant");
    }
    return true;
  }
}
```

#### 3. Autenticación y Autorización Centralizada

El Gateway debe validar la identidad (Authentication) pero delegar o simplificar la gestión de permisos complejos.

1.  **Validación JWT**: El Gateway descarga y cachéa las llaves públicas (JWKS) del proveedor de identidad (Auth0, Cognito).
2.  **Token Inspection**: Verifica firma, expiración e `iss`.
3.  **User Context Injection**: Si el token es válido, extrae el `sub` (User ID) y `roles`, y los inyecta en headers HTTP internos (`X-User-Id`, `X-User-Roles`) hacia los microservicios.

**Ventaja**: Los microservicios aguas abajo no gastan CPU validando criptografía RSA/ECDSA; confían en el Gateway mediante **mTLS (Mutual TLS)** o una red privada segura.

#### 4. Transformación de Protocolos (JSON a gRPC)

Una de las optimizaciones más potentes es usar **gRPC (Protobuf)** para la comunicación interna entre microservicios por su baja latencia y tipado estricto, mientras se expone **REST/JSON** al mundo exterior (Apps móviles, Web).

El Gateway realiza la "transcodificación" al vuelo.

```typescript
// NestJS Gateway: Proxying JSON to gRPC
@Controller("orders")
export class OrdersGatewayController {
  constructor(@Inject("ORDERS_PACKAGE") private readonly client: ClientGrpc) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    // El cliente gRPC serializa automáticamente el DTO a Protobuf
    const ordersService =
      this.client.getService<OrdersService>("OrdersService");
    // RxJS Observable pattern
    return ordersService.create(createOrderDto).pipe(
      map((response) => ({
        id: response.id,
        status: response.status,
        // Transformación de respuesta si es necesaria
      })),
    );
  }
}
```

#### 5. Caching Strategy en el Borde

Para endpoints de mucha lectura (e.g., Catálogo de Productos), el Gateway puede implementar caché HTTP cumpliendo con los headers `Cache-Control`. Almacenar respuestas en Redis por 60 segundos puede reducir la carga en la base de datos de productos en un 95%.

#### 6. Observabilidad: El `X-Request-ID`

Es imposible depurar un error 500 que ocurre en el servicio 'D' iniciado por el Gateway sin trazabilidad.
El Gateway debe generar un UUID v4 como `X-Request-ID` si no existe, y pasarlo a todos los servicios downstream. Este ID se usa para correlacionar logs en un sistema centralizado como ELK o Datadog.

Implementar un API Gateway propio da control total, pero conlleva la responsabilidad de mantener una infraestructura crítica. Para la mayoría de startups, Kong o servicios gestionados son el punto de partida ideal, pero entender estos patrones es vital para escalar.

---

### ENGLISH (EN)

In a microservices' ecosystem, exposing 50 or 100 services directly to the internet is not just a security nightmare, but a recipe for operational chaos. An **API Gateway** acts as the single entry point for all client traffic, decoupling the public interface from the internal architecture.

However, technology choice is critical. AWS API Gateway can become prohibitively expensive at scale (charging per million requests), and solutions like Apigee can be overkill. In this article, we will explore how to build a robust, high-performance solution using **Kong** or a custom Gateway with **NestJS + Fastify**, focusing on enterprise patterns.

#### 1. High-Level Architecture

![API Gateway Architecture](./images/api-gateway-enterprise/gateway-architecture.png)

The Gateway is not just a reverse proxy; it is an orchestrator of cross-cutting concerns:

- **Dynamic Routing**: Routing based on path, headers, or versions.
- **Security**: SSL/TLS termination, JWT validation, basic DDoS protection.
- **Resilience**: Retry policies, Circuit Breakers, Timeouts.
- **Observability**: Generating unique Request IDs for Distributed Tracing.

#### 2. Distributed Rate Limiting

Rate limiting is the first line of defense. Implementing this in local memory is useless in a clustered environment (Kubernetes), as the limit would be multiplied by the number of Gateway replicas (e.g., 100 req/s \* 10 pods = 1000 actual req/s).

We need shared, atomic state. **Redis** is the standard tool here, using Lua scripts to ensure atomicity.

**Algorithm: Sliding Window Log**
Unlike "Fixed Window" which allows bursts at the minute boundary, "Sliding Window" offers real traffic smoothing.

```typescript
// NestJS Throttler Guard Custom Implementation using Redis
import { Injectable, ExecutionContext } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class DistributedThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Rate limit by Tenant ID or User ID, fallback to IP
    return req.headers["x-tenant-id"] || req.user?.id || req.ip;
  }

  protected async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
  ): Promise<boolean> {
    const key = this.generateKey(context, suffix);
    // Execute Lua script in Redis for atomic increment and TTL
    const { totalHits } = await this.storageService.increment(key, ttl);

    if (totalHits > limit) {
      throw new ThrottlerException("Rate limit exceeded for Tenant");
    }
    return true;
  }
}
```

#### 3. Centralized Authentication and Authorization

The Gateway must validate identity (Authentication) but delegate or simplify complex permission management.

1.  **JWT Validation**: The Gateway downloads and caches public keys (JWKS) from the identity provider (Auth0, Cognito).
2.  **Token Inspection**: Verifies signature, expiration, and `iss`.
3.  **User Context Injection**: If the token is valid, it extracts the `sub` (User ID) and `roles`, and injects them into internal HTTP headers (`X-User-Id`, `X-User-Roles`) forwarded to microservices.

**Advantage**: Downstream microservices do not spend CPU validating RSA/ECDSA cryptography; they trust the Gateway via **mTLS (Mutual TLS)** or a secure private network.

#### 4. Protocol Transformation (JSON to gRPC)

One of the most powerful optimizations is using **gRPC (Protobuf)** for internal communication between microservices due to its low latency and strict typing, while exposing **REST/JSON** to the outside world (Mobile apps, Web).

The Gateway performs "transcoding" on the fly.

```typescript
// NestJS Gateway: Proxying JSON to gRPC
@Controller("orders")
export class OrdersGatewayController {
  constructor(@Inject("ORDERS_PACKAGE") private readonly client: ClientGrpc) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    // The gRPC client automatically serializes the DTO to Protobuf
    const ordersService =
      this.client.getService<OrdersService>("OrdersService");
    // RxJS Observable pattern
    return ordersService.create(createOrderDto).pipe(
      map((response) => ({
        id: response.id,
        status: response.status,
        // Response transformation if necessary
      })),
    );
  }
}
```

#### 5. Caching Strategy at the Edge

For read-heavy endpoints (e.g., Product Catalog), the Gateway can implement HTTP caching complying with `Cache-Control` headers. Storing responses in Redis for 60 seconds can reduce the load on the product database by 95%.

#### 6. Observability: The `X-Request-ID`

It is impossible to debug a 500 error occurring in service 'D' initiated by the Gateway without traceability.
The Gateway must generate a UUID v4 as `X-Request-ID` if it doesn't exist, and pass it to all downstream services. This ID is used to correlate logs in a centralized system like ELK or Datadog.

Implementing your own API Gateway gives total control but carries the responsibility of maintaining critical infrastructure. For most startups, Kong or managed services are the ideal starting point, but understanding these patterns is vital for scaling.

---

### PORTUGUÊS (PT)

Em um ecossistema de microsserviços, expor 50 ou 100 serviços diretamente para a internet não é apenas um pesadelo de segurança, mas uma receita para o caos operacional. Um **API Gateway** atua como o único ponto de entrada para todo o tráfego de clientes, desacoplando a interface pública da arquitetura interna.

No entanto, a escolha da tecnologia é crítica. O AWS API Gateway pode se tornar proibitivamente caro em escala (cobrando por milhão de requisições), e soluções como Apigee podem ser um exagero. Neste artigo, exploraremos como construir uma solução robusta e de alto desempenho usando **Kong** ou um Gateway personalizado com **NestJS + Fastify**, focando em padrões empresariais.

#### 1. Arquitetura de Alto Nível

![API Gateway Architecture](./images/api-gateway-enterprise/gateway-architecture.png)

O Gateway não é apenas um proxy reverso; é um orquestrador de políticas transversais:

- **Roteamento Dinâmico**: Roteamento baseado em caminho, headers ou versões.
- **Segurança**: Terminação SSL/TLS, validação JWT, proteção DDoS básica.
- **Resiliência**: Políticas de repetição (Retries), Circuit Breakers, Timeouts.
- **Observabilidade**: Geração de Request IDs únicos para Rastreamento Distribuído (Distributed Tracing).

#### 2. Rate Limiting Distribuído com Redis

A limitação de taxa é a primeira linha de defesa. Implementar isso na memória local é inútil em um ambiente clusterizado (Kubernetes), pois o limite seria multiplicado pelo número de réplicas do Gateway (e.g., 100 req/s \* 10 pods = 1000 req/s reais).

Precisamos de um estado compartilhado e atômico. **Redis** é a ferramenta padrão aqui, usando scripts Lua para garantir a atomicidade.

**Algoritmo: Sliding Window Log**
Ao contrário do "Fixed Window", que permite picos no limite do minuto, o "Sliding Window" oferece uma suavização real do tráfego.

```typescript
// NestJS Throttler Guard Custom Implementation using Redis
import { Injectable, ExecutionContext } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class DistributedThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Rate limit por Tenant ID ou User ID, fallback para IP
    return req.headers["x-tenant-id"] || req.user?.id || req.ip;
  }

  protected async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
  ): Promise<boolean> {
    const key = this.generateKey(context, suffix);
    // Executar script Lua no Redis para incremento atômico e TTL
    const { totalHits } = await this.storageService.increment(key, ttl);

    if (totalHits > limit) {
      throw new ThrottlerException("Rate limit exceeded for Tenant");
    }
    return true;
  }
}
```

#### 3. Autenticação e Autorização Centralizada

O Gateway deve validar a identidade (Autenticação), mas delegar ou simplificar o gerenciamento de permissões complexas.

1.  **Validação JWT**: O Gateway baixa e faz cache das chaves públicas (JWKS) do provedor de identidade (Auth0, Cognito).
2.  **Inspeção de Token**: Verifica assinatura, expiração e `iss` (emissor).
3.  **Injeção de Contexto de Usuário**: Se o token for válido, extrai o `sub` (User ID) e `roles`, e os injeta em headers HTTP internos (`X-User-Id`, `X-User-Roles`) encaminhados para os microsserviços.

**Vantagem**: Os microsserviços a jusante não gastam CPU validando criptografia RSA/ECDSA; eles confiam no Gateway via **mTLS (Mutual TLS)** ou uma rede privada segura.

#### 4. Transformação de Protocolos (JSON para gRPC)

Uma das otimizações mais poderosas é usar **gRPC (Protobuf)** para comunicação interna entre microsserviços devido à sua baixa latência e tipagem estrita, enquanto expõe **REST/JSON** para o mundo exterior (Apps móveis, Web).

O Gateway realiza a "transcodificação" em tempo real.

```typescript
// NestJS Gateway: Proxying JSON to gRPC
@Controller("orders")
export class OrdersGatewayController {
  constructor(@Inject("ORDERS_PACKAGE") private readonly client: ClientGrpc) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    // O cliente gRPC serializa automaticamente o DTO para Protobuf
    const ordersService =
      this.client.getService<OrdersService>("OrdersService");
    // Padrão RxJS Observable
    return ordersService.create(createOrderDto).pipe(
      map((response) => ({
        id: response.id,
        status: response.status,
        // Transformação de resposta se necessário
      })),
    );
  }
}
```

#### 5. Estratégia de Cache na Borda

Para endpoints de muita leitura (e.g., Catálogo de Produtos), o Gateway pode implementar cache HTTP respeitando os headers `Cache-Control`. Armazenar respostas no Redis por 60 segundos pode reduzir a carga no banco de dados de produtos em 95%.

#### 6. Observabilidade: O `X-Request-ID`

É impossível depurar um erro 500 que ocorre no serviço 'D' iniciado pelo Gateway sem rastreabilidade.
O Gateway deve gerar um UUID v4 como `X-Request-ID` se não existir, e passá-lo para todos os serviços a jusante. Esse ID é usado para correlacionar logs em um sistema centralizado como ELK ou Datadog.

Implementar seu próprio API Gateway dá controle total, mas carrega a responsabilidade de manter uma infraestrutura crítica. Para a maioria das startups, Kong ou serviços gerenciados são o ponto de partida ideal, mas entender esses padrões é vital para escalar.
