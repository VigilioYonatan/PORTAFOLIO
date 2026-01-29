### ESPAÑOL (ES)

NestJS ofrece un módulo `@nestjs/event-emitter`, pero su alcance se limita al proceso local en memoria. En un sistema distribuido moderno, necesitamos eventos que crucen la red entre microservicios de forma fiable. Construiremos una arquitectura robusta orientada a eventos (EDA) utilizando **RabbitMQ**, resolviendo los problemas más difíciles: consistencia transaccional y orden de mensajes.

#### 1. Topología de RabbitMQ: Exchanges y Queues

![Event Driven Architecture](./images/event-driven-nestjs/topology.png)

No basta con "enviar un mensaje a una cola". El diseño de la topología define cómo escala tu sistema.
Utilizamos **Topic Exchanges** para un enrutamiento flexible.

- **Producer**: Publica a `users.exchange` con routing key `user.created.v1`.
- **Consumer A (Email)**: Crea una cola `email-service.send-welcome` y bindea a `user.created.*`.
- **Consumer B (Analytics)**: Crea una cola `analytics-service.track-signup` y bindea a `user.#`.

Esto implementa el principio **Open/Closed**: podemos añadir nuevos consumidores sin tocar al productor.

#### 2. Pattern Transactional Outbox: Resolviendo la Escritura Dual

El problema clásico en microservicios es la "Escrita Dual":

1.  Insertar usuario en Postgres (`INSERT INTO users...`).
2.  Publicar evento en RabbitMQ (`channel.publish(...)`).

**¿Qué pasa si la DB commitea pero RabbitMQ falla (red caída)?** Tienes un usuario en la DB pero nadie sabe que existe. Inconsistencia grave.

**Solución: Outbox Pattern**
En la _misma transacción_ de base de datos, guardamos la entidad y el evento.

```typescript
// Drizzle ORM Transaction
await db.transaction(async (tx) => {
  // 1. Mutar estado de negocio
  const [user] = await tx.insert(users).values(userData).returning();

  // 2. Insertar evento en tabla 'outbox'
  await tx.insert(outbox).values({
    aggregateId: user.id,
    type: "UserCreated",
    payload: JSON.stringify(user),
    status: "PENDING",
  });
}); // <--- Commit atómico (ACID)
```

**Relay (El Despachador)**:
Un proceso separado (como **Debezium** leyendo el WAL de Postgres o un Cron Job en Node.js) lee la tabla `outbox` y publica a RabbitMQ. Si falla, reintenta. Esto garantiza **At-Least-Once Delivery**.

#### 3. Idempotencia y Consumidores Robustos

Dado que garantizamos "At-least-once", es posible que RabbitMQ entregue el mismo mensaje dos veces.
Si procesamos `PaymentCharged` dos veces, cobramos doble al usuario.

Necesitamos **Consumidores Idempotentes**.

- **Técnica 1**: Tabla de deduplicación en DB (`processed_events` con UNIQUE constraint en `message_id`).
- **Técnica 2**: Operaciones idempotentes por diseño (`UPDATE set status='PAID'` es idempotente, `UPDATE set balance=balance-10` no lo es).

```typescript
@RabbitSubscribe({ exchange: "payments", routingKey: "payment.charged" })
async handlePaymentCharged(msg: PaymentChargedEvent) {
  const alreadyProcessed = await this.redis.setnx(`processed:${msg.id}`, "1");
  if (!alreadyProcessed) return; // Descartar duplicado silenciosamente

  try {
    await this.shipmentService.createLabel(msg);
  } catch (err) {
    await this.redis.del(`processed:${msg.id}`); // Permitir reintento
    throw new Nack(true); // Re-encolar
  }
}
```

#### 4. Sagas: Transacciones Distribuidas

Cuando una operación abarca múltiples microservicios (Pedido -> Pago -> Inventario), no podemos usar transacciones DB. Usamos **Sagas**.
Recomiendo **Orquestación** (un servicio central "OrderSaga" que manda comandos) sobre Coreografía (eventos caóticos) para flujos complejos.

- **Paso 1**: `OrderService` crea pedido (PENDING) -> Evento `OrderCreated`.
- **Paso 2**: `SagaOrchestrator` escucha y manda comando `ChargePayment` a `PaymentService`.
- **Paso 3**: `PaymentService` falla (Fondos insuficientes) -> Evento `PaymentFailed`.
- **Paso 4**: `SagaOrchestrator` escucha y manda comando compensatorio `RejectOrder` a `OrderService`.

#### 5. Dead Letter Queues (DLQ) y Estrategia de Retry

Nunca bloquees tu cola principal por un mensaje "venenoso" (mal formado).
Configura tus colas con `x-dead-letter-exchange`.

1.  Intento 1-3: Reintentar con backoff exponencial.
2.  Fallo final: Mover mensaje a `dlq.orders`.
3.  **Observabilidad**: Alerta en Slack si DLQ > 0.

Una arquitectura orientada a eventos no se trata solo de mover JSONs; se trata de diseñar para el fallo y garantizar consistencia eventual.

---

### ENGLISH (EN)

NestJS provides a `@nestjs/event-emitter` module, but its scope is limited to the local in-memory process. In a modern distributed system, we need events that cross the network between microservices reliably. We will build a robust Event-Driven Architecture (EDA) using **RabbitMQ**, solving the hardest problems: transactional consistency and message ordering.

#### 1. RabbitMQ Topology: Exchanges and Queues

![Event Driven Architecture](./images/event-driven-nestjs/topology.png)

It's not enough to "send a message to a queue". The topology design defines how your system scales.
We use **Topic Exchanges** for flexible routing.

- **Producer**: Publishes to `users.exchange` with routing key `user.created.v1`.
- **Consumer A (Email)**: Creates queue `email-service.send-welcome` and binds to `user.created.*`.
- **Consumer B (Analytics)**: Creates queue `analytics-service.track-signup` and binds to `user.#`.

This implements the **Open/Closed** principle: we can add new consumers without touching the producer.

#### 2. Transactional Outbox Pattern: Solving Dual Writes

The classic problem in microservices is "Dual Write":

1.  Insert user into Postgres (`INSERT INTO users...`).
2.  Publish event to RabbitMQ (`channel.publish(...)`).

**What happens if DB commits but RabbitMQ fails (network down)?** You have a user in DB but nobody knows they exist. Severe inconsistency.

**Solution: Outbox Pattern**
In the _same database transaction_, we save both the entity and the event.

```typescript
// Drizzle ORM Transaction
await db.transaction(async (tx) => {
  // 1. Mutate business state
  const [user] = await tx.insert(users).values(userData).returning();

  // 2. Insert event into 'outbox' table
  await tx.insert(outbox).values({
    aggregateId: user.id,
    type: "UserCreated",
    payload: JSON.stringify(user),
    status: "PENDING",
  });
}); // <--- Atomic Commit (ACID)
```

**Relay**:
A separate process (like **Debezium** reading Postgres WAL or a Node.js Cron Job) reads the `outbox` table and publishes to RabbitMQ. If it fails, it retries. This guarantees **At-Least-Once Delivery**.

#### 3. Idempotency and Robust Consumers

Since we guarantee "At-least-once", RabbitMQ might deliver the same message twice (e.g., ACK failure).
If we process `PaymentCharged` twice, we double-charge the user.

We need **Idempotent Consumers**.

- **Technique 1**: Deduplication table in DB (`processed_events` with UNIQUE constraint on `message_id`).
- **Technique 2**: Idempotent operations by design (`UPDATE set status='PAID'` is idempotent, `UPDATE set balance=balance-10` is not).

```typescript
@RabbitSubscribe({ exchange: "payments", routingKey: "payment.charged" })
async handlePaymentCharged(msg: PaymentChargedEvent) {
  const alreadyProcessed = await this.redis.setnx(`processed:${msg.id}`, "1");
  if (!alreadyProcessed) return; // Silently discard duplicate

  try {
    await this.shipmentService.createLabel(msg);
  } catch (err) {
    await this.redis.del(`processed:${msg.id}`); // Allow retry
    throw new Nack(true); // Re-queue
  }
}
```

#### 4. Sagas: Distributed Transactions

When an operation spans multiple microservices (Order -> Payment -> Inventory), we cannot use DB transactions. We use **Sagas**.
I recommend **Orchestration** (a central "OrderSaga" service sending commands) over Choreography (chaotic events) for complex flows.

- **Step 1**: `OrderService` creates order (PENDING) -> Event `OrderCreated`.
- **Step 2**: `SagaOrchestrator` listens and sends command `ChargePayment` to `PaymentService`.
- **Step 3**: `PaymentService` fails (Insufficient funds) -> Event `PaymentFailed`.
- **Step 4**: `SagaOrchestrator` listens and sends compensatory command `RejectOrder` to `OrderService`.

#### 5. Dead Letter Queues (DLQ) and Retry Strategy

Never block your main queue for a "poisonous" (malformed) message.
Configure your queues with `x-dead-letter-exchange`.

1.  Attempt 1-3: Retry with exponential backoff.
2.  Final Failure: Move message to `dlq.orders`.
3.  **Observability**: Alert in Slack if DLQ > 0.

Event-driven architecture isn't just about moving JSONs; it's about designing for failure and ensuring eventual consistency.

---

### PORTUGUÊS (PT)

O NestJS oferece um módulo `@nestjs/event-emitter`, mas seu escopo é limitado ao processo local em memória. Em um sistema distribuído moderno, precisamos de eventos que cruzem a rede entre microsserviços de forma confiável. Construiremos uma arquitetura robusta orientada a eventos (EDA) usando **RabbitMQ**, resolvendo os problemas mais difíceis: consistência transacional e ordem das mensagens.

#### 1. Topologia RabbitMQ: Exchanges e Queues

![Event Driven Architecture](./images/event-driven-nestjs/topology.png)

Não basta "enviar uma mensagem para uma fila". O design da topologia define como seu sistema escala.
Usamos **Topic Exchanges** para roteamento flexível.

- **Producer**: Publica em `users.exchange` com routing key `user.created.v1`.
- **Consumer A (Email)**: Cria uma fila `email-service.send-welcome` e vincula a `user.created.*`.
- **Consumer B (Analytics)**: Cria uma fila `analytics-service.track-signup` e vincula a `user.#`.

Isso implementa o princípio **Aberto/Fechado (Open/Closed)**: podemos adicionar novos consumidores sem tocar no produtor.

#### 2. Padrão Transactional Outbox: Resolvendo a Escrita Dupla

O problema clássico em microsserviços é a "Escrita Dupla":

1.  Inserir usuário no Postgres (`INSERT INTO users...`).
2.  Publicar evento no RabbitMQ (`channel.publish(...)`).

**O que acontece se o DB commitar mas o RabbitMQ falhar (rede caiu)?** Você tem um usuário no DB mas ninguém sabe que ele existe. Inconsistência grave.

**Solução: Outbox Pattern**
Na _mesma transação_ de banco de dados, salvamos a entidade e o evento.

```typescript
// Transação Drizzle ORM
await db.transaction(async (tx) => {
  // 1. Mutar estado de negócio
  const [user] = await tx.insert(users).values(userData).returning();

  // 2. Inserir evento na tabela 'outbox'
  await tx.insert(outbox).values({
    aggregateId: user.id,
    type: "UserCreated",
    payload: JSON.stringify(user),
    status: "PENDING",
  });
}); // <--- Commit atômico (ACID)
```

**Relay (O Despachante)**:
Um processo separado (como **Debezium** lendo o WAL do Postgres ou um Cron Job em Node.js) lê a tabela `outbox` e publica no RabbitMQ. Se falhar, tenta novamente. Isso garante **Entrega Pelo Menos Uma Vez (At-Least-Once Delivery)**.

#### 3. Idempotência e Consumidores Robustos

Dado que garantizamos "At-least-once", é possível que o RabbitMQ entregue a mesma mensagem duas vezes.
Se processarmos `PaymentCharged` duas vezes, cobramos o usuário em dobro.

Precisamos de **Consumidores Idempotentes**.

- **Técnica 1**: Tabela de desduplicação no DB (`processed_events` com restrição UNIQUE em `message_id`).
- **Técnica 2**: Operações idempotentes por design (`UPDATE set status='PAID'` é idempotente, `UPDATE set balance=balance-10` não é).

```typescript
@RabbitSubscribe({ exchange: "payments", routingKey: "payment.charged" })
async handlePaymentCharged(msg: PaymentChargedEvent) {
  const alreadyProcessed = await this.redis.setnx(`processed:${msg.id}`, "1");
  if (!alreadyProcessed) return; // Descartar duplicado silenciosamente

  try {
    await this.shipmentService.createLabel(msg);
  } catch (err) {
    await this.redis.del(`processed:${msg.id}`); // Permitir reintento
    throw new Nack(true); // Re-enfileirar
  }
}
```

#### 4. Sagas: Transações Distribuídas

Quando uma operação abrange múltiplos microsserviços (Pedido -> Pagamento -> Estoque), não podemos usar transações de DB. Usamos **Sagas**.
Recomendo **Orquestração** (um serviço central "OrderSaga" que envia comandos) em vez de Coreografia (eventos caóticos) para fluxos complexos.

- **Passo 1**: `OrderService` cria pedido (PENDENTE) -> Evento `OrderCreated`.
- **Passo 2**: `SagaOrchestrator` escuta e envia comando `ChargePayment` para `PaymentService`.
- **Passo 3**: `PaymentService` falha (Fundos insuficientes) -> Evento `PaymentFailed`.
- **Passo 4**: `SagaOrchestrator` escuta e envia comando compensatório `RejectOrder` para `OrderService`.

#### 5. Dead Letter Queues (DLQ) e Estratégia de Retry

Nunca bloqueie sua fila principal por uma mensagem "venenosa" (malformada).
Configure suas filas com `x-dead-letter-exchange`.

1.  Tentativa 1-3: Tentar novamente com backoff exponencial.
2.  Falha final: Mover mensagem para `dlq.orders`.
3.  **Observabilidade**: Alerta no Slack se DLQ > 0.

Uma arquitetura orientada a eventos não se trata apenas de mover JSONs; trata-se de projetar para a falha e garantir a consistência eventual.
