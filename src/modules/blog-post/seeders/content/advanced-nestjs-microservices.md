### ESPAÑOL (ES)

En el panorama actual de sistemas distribuidos, pasar de una arquitectura monolítica a microservicios con NestJS requiere más que solo dividir el código; exige un dominio profundo de los protocolos de comunicación, la resiliencia y la consistencia de datos. NestJS brilla en este ámbito gracias a su abstracción de microservicios, permitiendo usar diferentes transportes con una interfaz unificada. En este artículo detallado, exploraremos cómo construir microservicios de alto rendimiento utilizando gRPC, NATS y Redis, aplicando patrones de diseño que garantizan la escalabilidad global.

#### 1. Comunicación de Alto Rendimiento con gRPC

![gRPC Architecture](./images/advanced-nestjs-microservices/grpc.png)

gRPC se ha convertido en el estándar de oro para la comunicación interna entre microservicios debido a su uso de Protocol Buffers (binario) y HTTP/2. A diferencia de REST sobre JSON, gRPC ofrece una eficiencia de red inigualable y contratos estrictos.

- **Serialización Binaria**: El formato binario de gRPC reduce drásticamente el tamaño del payload.
- **Contratos Fuertes**: Los archivos `.proto` definen la interfaz.

```proto
syntax = "proto3";
package orders;
service OrdersService {
  rpc CreateOrder (CreateOrderRequest) returns (OrderResponse);
}
message CreateOrderRequest {
  string user_id = 1;
  repeated string product_ids = 2;
}
message OrderResponse {
  string order_id = 1;
  string status = 2;
}
```

Implementamos **Client-Side Load Balancing** para que el cliente gRPC distribuya las peticiones entre réplicas sin pasar por un cuello de botella central.

#### 2. NATS: El Sistema de Mensajería para la Nube Moderna

![NATS Cloud Mesh](./images/advanced-nestjs-microservices/nats.png)

A diferencia de RabbitMQ, NATS es ultraligero y soporta patrones de "Fire and Forget" y Request-Response con latencia sub-milisegundo.

- **Queue Groups**: Para balancear carga entre microservicios consumers. Si levantas 10 réplicas del servicio `Payment`, NATS entrega el mensaje a solo una de ellas (Round Robin).

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URL],
      queue: "orders_service_queue", // Grupo de cola
    },
  },
);
```

#### 3. Circuit Breakers y Resiliencia

Un sistema distribuido debe abrazar el fallo. Usamos la librería `opossum` o interceptores personalizados en NestJS para implementar Circuit Breakers.

Si el servicio de Inventario falla el 50% de las veces, el Circuit Breaker "salta" (Open State) y devuelve un error inmediato al servicio de Pedidos, evitando que los hilos se queden bloqueados esperando timeout y protegiendo al servicio de Inventario para que pueda recuperarse.

#### 4. Consistencia Eventual con Saga Pattern

Sin transacciones distribuidas ACID (Two-Phase Commit es lento y bloqueante), usamos **Sagas**.

- **Coreografía**: Cada servicio escucha eventos y reacciona.
  1. Order Service crea orden (`PENDING`) -> emite `OrderCreated`.
  2. Payment Service escucha -> cobra tarjeta -> emite `PaymentProcessed`.
  3. Order Service escucha -> actualiza a `CONFIRMED`.
- **Compensación**: Si Payment falla -> emite `PaymentFailed`. Order Service escucha -> actualiza a `CANCELLED`.

Para garantizar que los eventos se envíen incluso si la DB cae justo después del commit, usamos el patrón **Transactional Outbox**: Guardamos el evento en una tabla `outbox` en la misma transacción de negocio, y un proceso separado (CDC o Polling) lo publica a NATS.

Construir microservicios con NestJS es un viaje de complejidad creciente. Al dominar gRPC, NATS y patrones de resiliencia, creamos sistemas que sobreviven al caos de la producción.

---

### ENGLISH (EN)

In today's landscape of distributed systems, moving from a monolithic architecture to microservices with NestJS requires more than just splitting code; it demands deep mastery of communication protocols, resilience, and data consistency. NestJS shines in this area thanks to its microservices abstraction, allowing different transports to be used with a unified interface. In this detailed article, we will explore how to build high-performance microservices using gRPC, NATS, and Redis, applying design patterns that guarantee global scalability.

#### 1. High-Performance Communication with gRPC

![gRPC Architecture](./images/advanced-nestjs-microservices/grpc.png)

gRPC has become the gold standard for internal communication between microservices due to its use of Protocol Buffers (binary) and HTTP/2. Unlike REST over JSON, gRPC offers unmatched network efficiency and strict contracts.

- **Binary Serialization**: gRPC's binary format drastically reduces payload size.
- **Strong Contracts**: `.proto` files define the interface.

```proto
syntax = "proto3";
package orders;
service OrdersService {
  rpc CreateOrder (CreateOrderRequest) returns (OrderResponse);
}
message CreateOrderRequest {
  string user_id = 1;
  repeated string product_ids = 2;
}
message OrderResponse {
  string order_id = 1;
  string status = 2;
}
```

We implement **Client-Side Load Balancing** so the gRPC client distributes requests among replicas without going through a central bottleneck.

#### 2. NATS: The Messaging System for the Modern Cloud

![NATS Cloud Mesh](./images/advanced-nestjs-microservices/nats.png)

Unlike RabbitMQ, NATS is ultra-lightweight and supports "Fire and Forget" and Request-Response patterns with sub-millisecond latency.

- **Queue Groups**: To load balance between consumer microservices. If you spin up 10 replicas of the `Payment` service, NATS delivers the message to only one of them (Round Robin).

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URL],
      queue: "orders_service_queue", // Queue Group
    },
  },
);
```

#### 3. Circuit Breakers and Resilience

A distributed system must embrace failure. We use the `opossum` library or custom interceptors in NestJS to implement Circuit Breakers.

If the Inventory service fails 50% of the time, the Circuit Breaker "trips" (Open State) and returns an immediate error to the Order service, preventing threads from blocking on timeouts and protecting the Inventory service so it can recover.

#### 4. Eventual Consistency with Saga Pattern

Without distributed ACID transactions (Two-Phase Commit is slow and blocking), we use **Sagas**.

- **Choreography**: Each service listens for events and reacts.
  1. Order Service creates order (`PENDING`) -> emits `OrderCreated`.
  2. Payment Service listens -> charges card -> emits `PaymentProcessed`.
  3. Order Service listens -> updates to `CONFIRMED`.
- **Compensation**: If Payment fails -> emits `PaymentFailed`. Order Service listens -> updates to `CANCELLED`.

To ensure events are sent even if the DB crashes right after commit, we use the **Transactional Outbox** pattern: We save the event in an `outbox` table within the same business transaction, and a separate process (CDC or Polling) publishes it to NATS.

Building microservices with NestJS is a journey of increasing complexity. By mastering gRPC, NATS, and resilience patterns, we create systems that survive the chaos of production.

---

### PORTUGUÊS (PT)

No cenário atual de sistemas distribuídos, a transição de uma arquitetura monolítica para microsserviços com o NestJS exige mais do que apenas dividir o código; demanda um domínio profundo dos protocolos de comunicação, resiliência e consistência de dados. O NestJS brilha nesse campo graças à sua abstração de microsserviços, permitindo o uso de diferentes transportes com uma interface unificada. Neste artigo detalhado, exploraremos como construir microsserviços de alto desempenho usando gRPC, NATS e Redis, aplicando padrões de projeto que garantem o escalonamento global.

#### 1. Comunicação de Alto Desempenho com gRPC

![gRPC Architecture](./images/advanced-nestjs-microservices/grpc.png)

O gRPC tornou-se o padrão-ouro para a comunicação interna entre microsserviços devido ao seu uso de Protocol Buffers (binário) e HTTP/2. Ao contrário do REST sobre JSON, o gRPC oferece uma eficiência de rede inigualável e contratos rígidos.

- **Serialização Binária**: O formato binário do gRPC reduz drasticamente o tamanho do payload.
- **Contratos Fortes**: Arquivos `.proto` definem a interface.

```proto
syntax = "proto3";
package orders;
service OrdersService {
  rpc CreateOrder (CreateOrderRequest) returns (OrderResponse);
}
message CreateOrderRequest {
  string user_id = 1;
  repeated string product_ids = 2;
}
message OrderResponse {
  string order_id = 1;
  string status = 2;
}
```

Implementamos **Client-Side Load Balancing** para que o cliente gRPC distribua as solicitações entre réplicas sem passar por um gargalo central.

#### 2. NATS: O Sistema de Mensagens para a Nuvem Moderna

![NATS Cloud Mesh](./images/advanced-nestjs-microservices/nats.png)

Ao contrário do RabbitMQ, o NATS é ultraleve e suporta padrões de "Fire and Forget" e Request-Response com latência submilisegundo.

- **Queue Groups**: Para balancear a carga entre microsserviços consumidores. Se você subir 10 réplicas do serviço `Payment`, o NATS entrega a mensagem para apenas uma delas (Round Robin).

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URL],
      queue: "orders_service_queue", // Grupo de fila
    },
  },
);
```

#### 3. Circuit Breakers e Resiliência

Um sistema distribuído deve abraçar a falha. Usamos a biblioteca `opossum` ou interceptores personalizados no NestJS para implementar Circuit Breakers.

Se o serviço de Inventário falhar 50% das vezes, o Circuit Breaker "dispara" (Estado Aberto) e retorna um erro imediato ao serviço de Pedidos, evitando que os threads fiquem bloqueados esperando timeout e protegendo o serviço de Inventário para que ele possa se recuperar.

#### 4. Consistência Eventual com Saga Pattern

Sem transações ACID distribuídas (Two-Phase Commit é lento e bloqueante), usamos **Sagas**.

- **Coreografia**: Cada serviço escuta eventos e reage.
  1. Order Service cria pedido (`PENDING`) -> emite `OrderCreated`.
  2. Payment Service escuta -> cobra cartão -> emite `PaymentProcessed`.
  3. Order Service escuta -> atualiza para `CONFIRMED`.
- **Compensação**: Se o Pagamento falhar -> emite `PaymentFailed`. O Order Service escuta -> atualiza para `CANCELLED`.

Para garantir que os eventos sejam enviados mesmo se o DB cair logo após o commit, usamos o padrão **Transactional Outbox**: Salvamos o evento em uma tabela `outbox` na mesma transação de negócio, e um processo separado (CDC ou Polling) o publica no NATS.

Construir microsserviços com o NestJS é uma jornada de complexidade crescente. Ao dominar gRPC, NATS e padrões de resiliência, criamos sistemas que sobrevivem ao caos da produção.
