### ESPAÑOL (ES)

El paradigma "Serverless" a menudo se malinterpreta como simplemente "FaaS" (Function as a Service) o Lambda. Sin embargo, la verdadera arquitectura Serverless en AWS es una filosofía de integración agnóstica de transporte, coreografiada por eventos y gobernada por definiciones de infraestructura estricta. Este artículo explora cómo construir sistemas distribuidos resilientes, desacoplados y escalables utilizando EventBridge, SQS, Step Functions y AWS CDK con TypeScript.

#### 1. Arquitectura Basada en Eventos (EDA) con EventBridge

![EventBridge Architecture](./images/aws-event-driven-serverless/architecture.png)

En una arquitectura monolítica, los componentes están fuertemente acoplados. En EDA, los productores de eventos no conocen a los consumidores. AWS EventBridge es el sistema nervioso central que permite este desacoplamiento.

**EventBridge Pipes** es una característica avanzada que permite conectar fuentes de eventos (como DynamoDB Streams, Kinesis o SQS) directamente a destinos (como Step Functions o API Destinations) sin escribir una sola línea de código Lambda "pegamento", reduciendo la latencia y el costo.

**Ejemplo de Infraestructura como Código (CDK/TypeScript):**

```typescript
// lib/order-service-stack.ts
import * as cdk from "aws-cdk-lib";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class OrderServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const eventBus = new events.EventBus(this, "OrderBus", {
      eventBusName: "com.mycompany.orders",
    });

    const inventoryFunction = new lambda.Function(this, "InventoryHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambdas/inventory"),
    });

    // Regla: Solo procesar eventos donde el estado del pedido sea "CREATED"
    new events.Rule(this, "OrderCreatedRule", {
      eventBus: eventBus,
      eventPattern: {
        source: ["com.mycompany.orders"],
        detailType: ["OrderCreated"],
        detail: {
          status: ["CREATED"],
          totalAmount: [{ numeric: [">", 100] }], // Filtrado de contenido
        },
      },
      targets: [new targets.LambdaFunction(inventoryFunction)],
    });
  }
}
```

#### 2. Patrón SQS + Lambda + DLQ para Resiliencia

El fallo es inevitable. Las redes tienen jitter, las bases de datos tienen timeouts. Un sistema robusto no es aquel que nunca falla, sino aquel que maneja el fallo con gracia.

El patrón **SQS Batch Processing** con **ReportBatchItemFailures** es crucial. Si una Lambda procesa un lote de 10 mensajes y falla el mensaje #7, no quieres reprocesar los 10 mensajes (y potencialmente duplicar transacciones de los mensajes 1-6).

**Implementación de Manejo de Errores Parciales (TypeScript):**

```typescript
import { SQSBatchResponse, SQSBatchItemFailure, SQSEvent } from "aws-lambda";

export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  const batchItemFailures: SQSBatchItemFailure[] = [];

  for (const record of event.Records) {
    try {
      await processOrder(JSON.parse(record.body));
    } catch (error) {
      console.error(`Error processing message ${record.messageId}`, error);
      // Marcamos solo este mensaje como fallido para que SQS lo reintente
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
};
```

#### 3. Idempotencia y Observabilidad con Lambda Powertools

En sistemas distribuidos, "Exactly-once delivery" es casi imposible. Lo que tenemos es "At-least-once delivery". Esto significa que tu Lambda _será_ invocada múltiples veces con el mismo evento en caso de reintentos. Tu código **debe** ser idempotente.

**AWS Lambda Powertools para TypeScript** ofrece utilidades decorativas para manejar esto sin ensuciar la lógica de negocio.

```typescript
import { Logger } from "@aws-lambda-powertools/logger";
import { Metrics } from "@aws-lambda-powertools/metrics";
import { Tracer } from "@aws-lambda-powertools/tracer";
import { makeIdempotent } from "@aws-lambda-powertools/idempotency";
import { DynamoDBPersistenceLayer } from "@aws-lambda-powertools/idempotency/dynamodb";
import middy from "@middy/core";

const logger = new Logger({ serviceName: "orderService" });
const tracer = new Tracer({ serviceName: "orderService" });
const metrics = new Metrics({ namespace: "MyCompany/Orders" });

const persistenceStore = new DynamoDBPersistenceLayer({
  tableName: "IdempotencyTable",
});

const lambdaHandler = async (event: any, context: any) => {
  logger.info("Procesando pedido", { orderId: event.detail.orderId });

  // Lógica de negocio crítica (pago, actualización de inventario)
  // Si este evento ya se procesó con éxito en los últimos X minutos,
  // esta función retornará el resultado anterior sin ejecutar la lógica de nuevo.
  return await processPayment(event.detail);
};

// Pipeline de Middleware: Tracing -> Logging -> Idempotencia
export const handler = middy(lambdaHandler)
  .use(tracer.captureLambdaHandler())
  .use(
    makeIdempotent({
      persistenceStore,
      key: (event) => event.detail.orderId, // Clave de idempotencia única
    }),
  );
```

#### 4. Orquestación de Estados con Step Functions

Para flujos de larga duración (por ejemplo, un proceso de aprobación de préstamo que toma días), Lambda es inadecuado debido a su límite de tiempo de 15 minutos. **AWS Step Functions** actúa como una máquina de estados finitos que persiste el progreso de cada ejecución.

Con **Workflow Studio**, puedes diseñar visualmente el flujo, pero como ingenieros, preferimos definirlo en CDK para control de versiones y reproducibilidad. Step Functions se integra nativamente con más de 200 servicios de AWS, permitiendo llamadas directas a DynamoDB `PutItem` o SNS `Publish` sin necesidad de una función Lambda intermediaria, reduciendo costos y puntos de falla.

### Conclusión

Construir en AWS Serverless requiere un cambio de mentalidad: de "escribir código para todo" a "configurar servicios para la mayoría de las cosas y escribir código solo para la lógica de dominio única". Al dominar EventBridge, patrones de SQS y herramientas como Powertools y CDK, elevamos nuestros sistemas de simples scripts en la nube a arquitecturas empresariales resilientes.

---

### ENGLISH (EN)

The "Serverless" paradigm is often misunderstood as simply "FaaS" (Function as a Service) or Lambda. However, true Serverless architecture on AWS is a philosophy of transport-agnostic integration, choreographed by events, and governed by strict infrastructure definitions. This article explores how to build resilient, decoupled, and scalable distributed systems using EventBridge, SQS, Step Functions, and AWS CDK with TypeScript.

#### 1. Event-Driven Architecture (EDA) with EventBridge

![EventBridge Architecture](./images/aws-event-driven-serverless/architecture.png)

In a monolithic architecture, components are tightly coupled. In EDA, event producers do not know about consumers. AWS EventBridge is the central nervous system that enables this decoupling.

**EventBridge Pipes** is an advanced feature that allows connecting event sources (like DynamoDB Streams, Kinesis, or SQS) directly to targets (like Step Functions or API Destinations) without writing a single line of "glue" Lambda code, reducing latency and cost.

**Infrastructure as Code Example (CDK/TypeScript):**

```typescript
// lib/order-service-stack.ts
import * as cdk from "aws-cdk-lib";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class OrderServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const eventBus = new events.EventBus(this, "OrderBus", {
      eventBusName: "com.mycompany.orders",
    });

    const inventoryFunction = new lambda.Function(this, "InventoryHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambdas/inventory"),
    });

    // Rule: Only process events where order status is "CREATED"
    new events.Rule(this, "OrderCreatedRule", {
      eventBus: eventBus,
      eventPattern: {
        source: ["com.mycompany.orders"],
        detailType: ["OrderCreated"],
        detail: {
          status: ["CREATED"],
          totalAmount: [{ numeric: [">", 100] }], // Content filtering
        },
      },
      targets: [new targets.LambdaFunction(inventoryFunction)],
    });
  }
}
```

#### 2. SQS + Lambda + DLQ Pattern for Resilience

Failure is inevitable. Networks have jitter, databases have timeouts. A robust system is not one that never fails, but one that handles failure gracefully.

The **SQS Batch Processing** pattern with **ReportBatchItemFailures** is crucial. If a Lambda processes a batch of 10 messages and message #7 fails, you don't want to reprocess all 10 messages (and potentially duplicate transactions from messages 1-6).

**Partial Failure Handling Implementation (TypeScript):**

```typescript
import { SQSBatchResponse, SQSBatchItemFailure, SQSEvent } from "aws-lambda";

export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  const batchItemFailures: SQSBatchItemFailure[] = [];

  for (const record of event.Records) {
    try {
      await processOrder(JSON.parse(record.body));
    } catch (error) {
      console.error(`Error processing message ${record.messageId}`, error);
      // Checkmark only this message as failed so SQS retries it specifically
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
};
```

#### 3. Idempotency and Observability with Lambda Powertools

In distributed systems, "Exactly-once delivery" is nearly impossible. What we have is "At-least-once delivery". This means your Lambda _will_ be invoked multiple times with the same event in case of retries. Your code **must** be idempotent.

**AWS Lambda Powertools for TypeScript** offers decorative utilities to handle this without cluttering business logic.

```typescript
import { Logger } from "@aws-lambda-powertools/logger";
import { Metrics } from "@aws-lambda-powertools/metrics";
import { Tracer } from "@aws-lambda-powertools/tracer";
import { makeIdempotent } from "@aws-lambda-powertools/idempotency";
import { DynamoDBPersistenceLayer } from "@aws-lambda-powertools/idempotency/dynamodb";
import middy from "@middy/core";

const logger = new Logger({ serviceName: "orderService" });
const tracer = new Tracer({ serviceName: "orderService" });
const metrics = new Metrics({ namespace: "MyCompany/Orders" });

const persistenceStore = new DynamoDBPersistenceLayer({
  tableName: "IdempotencyTable",
});

const lambdaHandler = async (event: any, context: any) => {
  logger.info("Processing order", { orderId: event.detail.orderId });

  // Critical business logic (payment, inventory update)
  // If this event was already successfully processed in the last X minutes,
  // this function will return the stored result without executing logic again.
  return await processPayment(event.detail);
};

// Middleware Pipeline: Tracing -> Logging -> Idempotency
export const handler = middy(lambdaHandler)
  .use(tracer.captureLambdaHandler())
  .use(
    makeIdempotent({
      persistenceStore,
      key: (event) => event.detail.orderId, // Unique idempotency key
    }),
  );
```

#### 4. State Orchestration with Step Functions

For long-running flows (e.g., a loan approval process taking days), Lambda is unsuitable due to its 15-minute timeout limit. **AWS Step Functions** acts as a finite state machine that persists the progress of each execution.

With **Workflow Studio**, you can visually design the flow, but as engineers, we prefer defining it in CDK for version control and reproducibility. Step Functions natively integrates with over 200 AWS services, allowing direct calls to DynamoDB `PutItem` or SNS `Publish` without needing an intermediate Lambda function, reducing costs and failure points.

### Conclusion

Building on AWS Serverless requires a mindset shift: from "writing code for everything" to "configuring services for most things and writing code only for unique domain logic." By mastering EventBridge, SQS patterns, and tools like Powertools and CDK, we elevate our systems from simple cloud scripts to resilient enterprise architectures.

---

### PORTUGUÊS (PT)

O paradigma "Serverless" é frequentemente mal interpretado como simplesmente "FaaS" (Function as a Service) ou Lambda. No entanto, a verdadeira arquitetura Serverless na AWS é uma filosofia de integração agnóstica de transporte, coreografada por eventos e governada por definições de infraestrutura estrita. Este artigo explora como construir sistemas distribuídos resilientes, desacoplados e escaláveis usando EventBridge, SQS, Step Functions e AWS CDK com TypeScript.

#### 1. Arquitetura Baseada em Eventos (EDA) com EventBridge

![EventBridge Architecture](./images/aws-event-driven-serverless/architecture.png)

Em uma arquitetura monolítica, os componentes são fortemente acoplados. Na EDA, os produtores de eventos não conhecem os consumidores. O AWS EventBridge é o sistema nervoso central que permite esse desacoplamento.

**EventBridge Pipes** é um recurso avançado que permite conectar fontes de eventos (como DynamoDB Streams, Kinesis ou SQS) diretamente a destinos (como Step Functions ou API Destinations) sem escrever uma única linha de código Lambda "cola", reduzindo a latência e o custo.

**Exemplo de Infraestrutura como Código (CDK/TypeScript):**

```typescript
// lib/order-service-stack.ts
import * as cdk from "aws-cdk-lib";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class OrderServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const eventBus = new events.EventBus(this, "OrderBus", {
      eventBusName: "com.mycompany.orders",
    });

    const inventoryFunction = new lambda.Function(this, "InventoryHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambdas/inventory"),
    });

    // Regra: Processar apenas eventos onde o status do pedido é "CREATED"
    new events.Rule(this, "OrderCreatedRule", {
      eventBus: eventBus,
      eventPattern: {
        source: ["com.mycompany.orders"],
        detailType: ["OrderCreated"],
        detail: {
          status: ["CREATED"],
          totalAmount: [{ numeric: [">", 100] }], // Filtragem de conteúdo
        },
      },
      targets: [new targets.LambdaFunction(inventoryFunction)],
    });
  }
}
```

#### 2. Padrão SQS + Lambda + DLQ para Resiliência

A falha é inevitável. As redes têm jitter, os bancos de dados têm timeouts. Um sistema robusto não é aquele que nunca falha, mas aquele que lida com a falha com elegância.

O padrão **SQS Batch Processing** com **ReportBatchItemFailures** é crucial. Se uma Lambda processa um lote de 10 mensagens e a mensagem nº 7 falhar, você não quer reprocessar todas as 10 mensagens (e potencialmente duplicar transações das mensagens 1-6).

**Implementação de Tratamento de Falhas Parciais (TypeScript):**

```typescript
import { SQSBatchResponse, SQSBatchItemFailure, SQSEvent } from "aws-lambda";

export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  const batchItemFailures: SQSBatchItemFailure[] = [];

  for (const record of event.Records) {
    try {
      await processOrder(JSON.parse(record.body));
    } catch (error) {
      console.error(`Erro processando mensagem ${record.messageId}`, error);
      // Marcamos apenas esta mensagem como falha para o SQS tentar novamente
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
};
```

#### 3. Idempotência e Observabilidade com Lambda Powertools

Em sistemas distribuídos, a entrega "Exatamente uma vez" (Exactly-once) é quase impossível. O que temos é "Pelo menos uma vez" (At-least-once). Isso significa que sua Lambda _será_ invocada várias vezes com o mesmo evento em caso de novas tentativas. Seu código **deve** ser idempotente.

**AWS Lambda Powertools para TypeScript** oferece utilitários decorativos para lidar com isso sem sujar a lógica de negócios.

```typescript
import { Logger } from "@aws-lambda-powertools/logger";
import { Metrics } from "@aws-lambda-powertools/metrics";
import { Tracer } from "@aws-lambda-powertools/tracer";
import { makeIdempotent } from "@aws-lambda-powertools/idempotency";
import { DynamoDBPersistenceLayer } from "@aws-lambda-powertools/idempotency/dynamodb";
import middy from "@middy/core";

const logger = new Logger({ serviceName: "orderService" });
const tracer = new Tracer({ serviceName: "orderService" });
const metrics = new Metrics({ namespace: "MyCompany/Orders" });

const persistenceStore = new DynamoDBPersistenceLayer({
  tableName: "IdempotencyTable",
});

const lambdaHandler = async (event: any, context: any) => {
  logger.info("Processando pedido", { orderId: event.detail.orderId });

  // Lógica de negócios crítica (pagamento, atualização de estoque)
  // Se este evento já foi processado com sucesso nos últimos X minutos,
  // esta função retornará o resultado armazenado sem executar a lógica novamente.
  return await processPayment(event.detail);
};

// Pipeline de Middleware: Tracing -> Logging -> Idempotência
export const handler = middy(lambdaHandler)
  .use(tracer.captureLambdaHandler())
  .use(
    makeIdempotent({
      persistenceStore,
      key: (event) => event.detail.orderId, // Chave única de idempotência
    }),
  );
```

#### 4. Orquestração de Estados com Step Functions

Para fluxos de longa duração (por exemplo, um processo de aprovação de empréstimo que leva dias), o Lambda é inadequado devido ao seu limite de tempo de 15 minutos. **AWS Step Functions** atua como uma máquina de estados finitos que persiste o progresso de cada execução.

Com o **Workflow Studio**, você pode projetar visualmente o fluxo, mas como engenheiros, preferimos defini-lo no CDK para controle de versão e reprodutibilidade. O Step Functions se integra nativamente com mais de 200 serviços da AWS, permitindo chamadas diretas ao DynamoDB `PutItem` ou SNS `Publish` sem a necessidade de uma função Lambda intermediária, reduzindo custos e pontos de falha.

### Conclusão

Construir no AWS Serverless requer uma mudança de mentalidade: de "escrever código para tudo" para "configurar serviços para a maioria das coisas e escrever código apenas para lógica de domínio única". Ao dominar EventBridge, padrões SQS e ferramentas como Powertools e CDK, elevamos nossos sistemas de simples scripts na nuvem para arquiteturas empresariais resilientes.
