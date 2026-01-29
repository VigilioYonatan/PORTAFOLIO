### ESPAÑOL (ES)

La promesa de Serverless es seductora: escalar a cero, pagar por uso y olvidarse de los parches de seguridad del sistema operativo. Sin embargo, para los ingenieros experimentados, Serverless presenta un nuevo conjunto de desafíos arquitectónicos. El problema más común es convertir una arquitectura limpia en un "Lambda Spaghetti", donde la función A llama a la B, que llama a la C, y nadie sabe qué pasa cuando la B falla.

La solución para sistemas empresariales robustos es el desacoplamiento mediante **EventBridge** y la orquestación mediante **AWS Step Functions**. En este artículo, elevaremos el nivel, integrando estas herramientas con **Drizzle ORM** y **AWS Lambda Powertools**.

#### 1. Orquestación vs. Coreografía

![Step Functions Orchestration](./images/serverless-orchestration-aws/orchestration.png)

Es el debate eterno. ¿Debemos usar un director central o dejar que los servicios reaccionen libremente?

- **Coreografía (EventBridge)**: Ideal para notificar a sistemas dispares. "El usuario se registró". El servicio de Email manda bienvenida, el de Analytics registra el evento. El productor no conoce a los consumidores.
- **Orquestación (Step Functions)**: Obligatorio para procesos de negocio transaccionales. "Cobrar tarjeta -> Si éxito -> Generar factura -> Si fallo -> Reembolsar". Necesitas un estado centralizado y manejo de errores determinista.

#### 2. Pattern SAGA con Step Functions

En microservicios distribuidos, las transacciones ACID no existen. Emulamos la atomicidad usando el patrón Saga con acciones compensatorias.

```json
/* Definición ASL (Amazon States Language) simplificada */
{
  "StartAt": "ProcesarPago",
  "States": {
    "ProcesarPago": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123:function:ChargeCard",
      "Next": "ReservarInventario",
      "Catch": [
        { "ErrorEquals": ["PaymentDeclined"], "Next": "NotificarUsuario" }
      ]
    },
    "ReservarInventario": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123:function:ReserveItem",
      "Next": "EnviarPedido",
      "Catch": [
        {
          "ErrorEquals": ["OutOfStock", "States.Timeout"],
          "Next": "ReembolsarPago" // <--- COMPENSACIÓN
        }
      ]
    },
    "ReembolsarPago": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123:function:RefundCard",
      "End": true
    }
  }
}
```

#### 3. Drizzle ORM en Entornos Lambda

Conectar a una base de datos relacional desde Lambda es peligroso. Si tu Lambda escala a 1,000 ejecuciones concurrentes, abrirás 1,000 conexiones a Postgres, agotando la memoria del servidor DB.

**Estrategias de Mitigación**:

1.  **RDS Proxy**: Un intermediario gestionado por AWS que multiplexa conexiones. Tu Lambda habla con el Proxy, el Proxy habla con la DB.
2.  **Serverless V2 + Data API**: Si usas Aurora Serverless v2, la Data API permite consultas vía HTTP (sin conexión persistente), lo cual Drizzle soporta nativamente con `drizzle-orm/aws-data-api/pg`.

```typescript
// Drizzle con AWS Data API (Zero Connection Management)
import { drizzle } from "drizzle-orm/aws-data-api/pg";
import { RDSDataClient } from "@aws-sdk/client-rds-data";

const client = new RDSDataClient({ region: "us-east-1" });
const db = drizzle(client, {
  database: "app_db",
  secretArn: "arn:aws:secretsmanager:...",
  resourceArn: "arn:aws:rds:...",
});

// Esto es stateless y seguro para Lambdas masivas
export const handler = async () => {
  return await db.select().from(users).limit(10);
};
```

#### 4. Observabilidad con Lambda Powertools

`console.log` no escala. Necesitas logs estructurados (JSON), trazas distribuidas (X-Ray) y métricas personalizadas. **AWS Lambda Powertools for TypeScript** es la librería estándar de facto.

```typescript
import { Logger } from "@aws-lambda-powertools/logger";
import { Tracer } from "@aws-lambda-powertools/tracer";

const logger = new Logger({ serviceName: "orderService" });
const tracer = new Tracer({ serviceName: "orderService" });

export const handler = async (event: any, context: any) => {
  // Logger inyecta automáticamente requestId, cold_start, y memory_limit
  logger.info("Processing order", { orderId: event.id });

  const segment = tracer.getSegment(); // Integración con X-Ray
  // ... lógica ...
};
```

#### 5. Integraciones Directas (SDK Integration)

La mejor función Lambda es la que no escribes. Step Functions puede llamar directamente a DynamoDB, SNS, SQS o más de 200 servicios sin una sola línea de código Python/Node.js.

- **Ventaja 1**: Menor costo (pagas por transición de estado, no por GB-segundo de Lambda).
- **Ventaja 2**: Cero Cold Starts.
- **Ventaja 3**: Retries y Backoff exponencial gestionados por la plataforma.

**Ejemplo**: "Guardar en DynamoDB" puede ser un estado `DynamoDB:PutItem` directo en el State Machine.

#### 6. Desarrollo Local: SST vs LocalStack

Desarrollar Serverless localmente es doloroso.

- **LocalStack**: Intenta emular AWS en tu laptop con Docker. Es pesado y a menudo incompleto.
- **SST (Serverless Stack)**: El enfoque moderno. Despliega infraestructura real de desarrollo en tu cuenta AWS en segundos, y hace "Live Lambda Development", proxyando las peticiones de la Lambda real en la nube a tu código corriendo localmente en VS Code. Esto permite debuggear con breakpoints tráfico real de la nube.

Dominar la orquestación Serverless significa dejar de pensar en "servidores que ejecutan funciones" y empezar a pensar en "flujos de eventos gestionados".

---

### ENGLISH (EN)

The Serverless promise is seductive: scale to zero, pay per use, and forget about OS security patches. However, for experienced engineers, Serverless presents a new set of architectural challenges. The most common problem is turning a clean architecture into "Lambda Spaghetti," where function A calls B, which calls C, and no one knows what happens when B fails.

The solution for robust enterprise systems is decoupling via **EventBridge** and orchestration via **AWS Step Functions**. In this article, we will raise the bar by integrating these tools with **Drizzle ORM** and **AWS Lambda Powertools**.

#### 1. Choreography vs. Orchestration

![Step Functions Orchestration](./images/serverless-orchestration-aws/orchestration.png)

It is the eternal debate. Should we use a central director or let services react freely?

- **Choreography (EventBridge)**: Ideal for notifying disparate systems. "User registered." The Email service sends a welcome, Analytics logs the event. The producer does not know the consumers.
- **Orchestration (Step Functions)**: Mandatory for transactional business processes. "Charge card -> If success -> Generate invoice -> If failure -> Refund". You need centralized state and deterministic error handling.

#### 2. SAGA Pattern with Step Functions

In distributed microservices, ACID transactions do not exist. We emulate atomicity using the Saga pattern with compensatory actions.

```json
/* Simplified ASL (Amazon States Language) definition */
{
  "StartAt": "ProcessPayment",
  "States": {
    "ProcessPayment": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123:function:ChargeCard",
      "Next": "ReserveInventory",
      "Catch": [{ "ErrorEquals": ["PaymentDeclined"], "Next": "NotifyUser" }]
    },
    "ReserveInventory": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123:function:ReserveItem",
      "Next": "ShipOrder",
      "Catch": [
        {
          "ErrorEquals": ["OutOfStock", "States.Timeout"],
          "Next": "RefundPayment" // <--- COMPENSATION
        }
      ]
    },
    "RefundPayment": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123:function:RefundCard",
      "End": true
    }
  }
}
```

#### 3. Drizzle ORM in Lambda Environments

Connecting to a relational database from Lambda is dangerous. If your Lambda scales to 1,000 concurrent executions, you will open 1,000 connections to Postgres, exhausting DB server memory.

**Mitigation Strategies**:

1.  **RDS Proxy**: An AWS-managed middleman that multiplexes connections. Your Lambda talks to the Proxy, the Proxy talks to the DB.
2.  **Serverless V2 + Data API**: If using Aurora Serverless v2, the Data API allows queries via HTTP (no persistent connection), which Drizzle natively supports with `drizzle-orm/aws-data-api/pg`.

```typescript
// Drizzle with AWS Data API (Zero Connection Management)
import { drizzle } from "drizzle-orm/aws-data-api/pg";
import { RDSDataClient } from "@aws-sdk/client-rds-data";

const client = new RDSDataClient({ region: "us-east-1" });
const db = drizzle(client, {
  database: "app_db",
  secretArn: "arn:aws:secretsmanager:...",
  resourceArn: "arn:aws:rds:...",
});

// This is stateless and safe for massive Lambdas
export const handler = async () => {
  return await db.select().from(users).limit(10);
};
```

#### 4. Observability with Lambda Powertools

`console.log` does not scale. You need structured logs (JSON), distributed tracing (X-Ray), and custom metrics. **AWS Lambda Powertools for TypeScript** is the de facto standard library.

```typescript
import { Logger } from "@aws-lambda-powertools/logger";
import { Tracer } from "@aws-lambda-powertools/tracer";

const logger = new Logger({ serviceName: "orderService" });
const tracer = new Tracer({ serviceName: "orderService" });

export const handler = async (event: any, context: any) => {
  // Logger automatically injects requestId, cold_start, and memory_limit
  logger.info("Processing order", { orderId: event.id });

  const segment = tracer.getSegment(); // Integration with X-Ray
  // ... logic ...
};
```

#### 5. Direct Integrations (SDK Integration)

The best Lambda function is the one you don't write. Step Functions can define tasks that call directly to DynamoDB, SNS, SQS, or over 200 services without a single line of Python/Node.js code.

- **Advantage 1**: Lower cost (pay per state transition, not Lambda GB-second).
- **Advantage 2**: Zero Cold Starts.
- **Advantage 3**: Platform-managed Retries and exponential Backoff.

**Example**: "Save to DynamoDB" can be a direct `DynamoDB:PutItem` state in the State Machine.

#### 6. Local Development: SST vs. LocalStack

Developing Serverless locally is painful.

- **LocalStack**: Attempts to emulate AWS on your laptop using Docker. It is heavy and often incomplete.
- **SST (Serverless Stack)**: The modern approach. It deploys real dev infrastructure to your AWS account in seconds and performs "Live Lambda Development," proxying requests from the real cloud Lambda to your code running locally in VS Code. This allows debugging real cloud traffic with breakpoints.

Mastering Serverless orchestration means stopping thinking about "servers running functions" and starting to think about "managed event flows."

---

### PORTUGUÊS (PT)

A promessa do Serverless é sedutora: escalar para zero, pagar por uso e esquecer os patches de segurança do sistema operacional. No entanto, para engenheiros experientes, o Serverless apresenta um novo conjunto de desafios arquiteturais. O problema mais comum é transformar uma arquitetura limpa em um "Lambda Spaghetti", onde a função A chama B, que chama C, e ninguém sabe o que acontece quando B falha.

A solução para sistemas empresariais robustos é o desacoplamento via **EventBridge** e a orquestração via **AWS Step Functions**. Neste artigo, elevaremos o nível, integrando essas ferramentas com **Drizzle ORM** e **AWS Lambda Powertools**.

#### 1. Orquestração vs. Coreografia

![Step Functions Orchestration](./images/serverless-orchestration-aws/orchestration.png)

É o debate eterno. Devemos usar um diretor central ou deixar os serviços reagirem livremente?

- **Coreografia (EventBridge)**: Ideal para notificar sistemas díspares. "Usuário registrado". O serviço de Email envia boas-vindas, o Analytics registra o evento. O produtor não conhece os consumidores.
- **Orquestração (Step Functions)**: Obrigatória para processos de negócios transacionais. "Cobrar cartão -> Se sucesso -> Gerar fatura -> Se falha -> Reembolsar". Você precisa de estado centralizado e tratamento de erros determinístico.

#### 2. Padrão SAGA com Step Functions

Em microsserviços distribuídos, transações ACID não existem. Emulamos atomicidade usando o padrão Saga com ações compensatórias.

```json
/* Definição simplificada ASL (Amazon States Language) */
{
  "StartAt": "ProcesarPago",
  "States": {
    "ProcesarPago": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123:function:ChargeCard",
      "Next": "ReservarInventario",
      "Catch": [
        { "ErrorEquals": ["PaymentDeclined"], "Next": "NotificarUsuario" }
      ]
    },
    "ReservarInventario": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123:function:ReserveItem",
      "Next": "EnviarPedido",
      "Catch": [
        {
          "ErrorEquals": ["OutOfStock", "States.Timeout"],
          "Next": "ReembolsarPago" // <--- COMPENSAÇÃO
        }
      ]
    },
    "ReembolsarPago": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123:function:RefundCard",
      "End": true
    }
  }
}
```

#### 3. Drizzle ORM em Ambientes Lambda

Conectar-se a um banco de dados relacional a partir do Lambda é perigoso. Se sua Lambda escalar para 1.000 execuções simultâneas, você abrirá 1.000 conexões com o Postgres, esgotando a memória do servidor DB.

**Estratégias de Mitigação**:

1.  **RDS Proxy**: Um intermediário gerenciado pela AWS que multiplexa conexões. Sua Lambda fala com o Proxy, o Proxy fala com o DB.
2.  **Serverless V2 + Data API**: Se usar Aurora Serverless v2, a Data API permite consultas via HTTP (sem conexão persistente), o que o Drizzle suporta nativamente com `drizzle-orm/aws-data-api/pg`.

```typescript
// Drizzle com AWS Data API (Gerenciamento Zero de Conexão)
import { drizzle } from "drizzle-orm/aws-data-api/pg";
import { RDSDataClient } from "@aws-sdk/client-rds-data";

const client = new RDSDataClient({ region: "us-east-1" });
const db = drizzle(client, {
  database: "app_db",
  secretArn: "arn:aws:secretsmanager:...",
  resourceArn: "arn:aws:rds:...",
});

// Isso é stateless e seguro para Lambdas massivas
export const handler = async () => {
  return await db.select().from(users).limit(10);
};
```

#### 4. Observabilidade com Lambda Powertools

`console.log` não escala. Você precisa de logs estruturados (JSON), rastreamento distribuído (X-Ray) e métricas personalizadas. **AWS Lambda Powertools for TypeScript** é a biblioteca padrão de fato.

```typescript
import { Logger } from "@aws-lambda-powertools/logger";
import { Tracer } from "@aws-lambda-powertools/tracer";

const logger = new Logger({ serviceName: "orderService" });
const tracer = new Tracer({ serviceName: "orderService" });

export const handler = async (event: any, context: any) => {
  // O logger injeta automaticamente requestId, cold_start e memory_limit
  logger.info("Processing order", { orderId: event.id });

  const segment = tracer.getSegment(); // Integração com X-Ray
  // ... lógica ...
};
```

#### 5. Integrações Diretas (SDK Integration)

A melhor função Lambda é aquela que você não escreve. O Step Functions pode definir tarefas que chamam diretamente o DynamoDB, SNS, SQS ou mais de 200 serviços sem uma única linha de código Python/Node.js.

- **Vantagem 1**: Menor custo (pague por transição de estado, não por GB-segundo da Lambda).
- **Vantagem 2**: Zero Cold Starts.
- **Vantagem 3**: Novas tentativas e Backoff exponencial gerenciados pela plataforma.

**Exemplo**: "Salvar no DynamoDB" pode ser um estado direto `DynamoDB:PutItem` na Máquina de Estado.

#### 6. Desenvolvimento Local: SST vs LocalStack

Desenvolver Serverless localmente é doloroso.

- **LocalStack**: Tenta emular a AWS no seu laptop usando Docker. É pesado e muitas vezes incompleto.
- **SST (Serverless Stack)**: A abordagem moderna. Implanta infraestrutura real de desenvolvimento em sua conta AWS em segundos e faz "Live Lambda Development", roteando as solicitações da Lambda real na nuvem para seu código rodando localmente no VS Code. Isso permite depurar tráfego real da nuvem com breakpoints.

Dominar a orquestração Serverless significa parar de pensar em "servidores executando funções" e começar a pensar em "fluxos de eventos gerenciados".
