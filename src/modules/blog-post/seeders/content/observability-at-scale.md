### ESPAÑOL (ES)

En sistemas distribuidos modernos, la incertidumbre es la norma. Desplegar un servicio en Kubernetes es fácil; saber por qué tiene picos de latencia de 2 segundos a las 3 AM es el verdadero desafío. La observabilidad no es solo "logs y métricas", es la propiedad de un sistema que permite entender su estado interno a través de sus salidas externas. Para un ingeniero senior, esto significa implementar OpenTelemetry (OTel), Prometheus, Loki y Tempo (o Jaeger) como una plataforma unificada.

#### 1. OpenTelemetry: La Estandarización de la Telemetría

![Observability Stack](./images/observability-at-scale/stack.png)

Atrás quedaron los días de agentes propietarios pesados. OpenTelemetry (OTel) es el estándar de facto. Permite instrumentar la aplicación una sola vez y enviar los datos a cualquier backend (Grafana, Datadog, AWS X-Ray) sin cambiar una línea de código.

**Instrumentación Automática en NestJS / Node.js:**

La "magia" de OTel reside en su capacidad de interceptar librerías comunes (Express, `pg`, Redis, gRPC) automáticamente.

```typescript
// src/instrumentation.ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "portfolio-api-service",
    [SemanticResourceAttributes.SERVICE_VERSION]: "1.0.0",
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
      process.env.NODE_ENV || "production",
  }),
  traceExporter: new OTLPTraceExporter({
    url: "http://otel-collector:4318/v1/traces",
  }),
  metricExporter: new OTLPMetricExporter({
    url: "http://otel-collector:4318/v1/metrics",
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Desactivar instrumentaciones ruidosas si es necesario
      "@opentelemetry/instrumentation-fs": { enabled: false },
    }),
  ],
});

sdk.start();
```

Este código debe ejecutarse **antes** que cualquier otro módulo importado. En NestJS, esto se logra típicamente con `node --require ./dist/instrumentation.js main.js`.

#### 2. Distributed Tracing: Rastreando la Aguja en el Pajar

Cuando tienes microservicios, una petición HTTP puede desencadenar 10 llamadas RPC y 5 queries SQL. Sin trazas distribuidas, estás ciego.

**Context Propagation:**
OTel inyecta headers `traceparent` en las peticiones salientes. Esto permite visualizar el "Waterfal chart" completo en Grafana Tempo.

```typescript
// Ejemplo de span manual para una operación crítica
import { trace } from "@opentelemetry/api";

async function processOrder(orderId: string) {
  const tracer = trace.getTracer("order-service");

  return await tracer.startActiveSpan("processOrder", async (span) => {
    try {
      span.setAttribute("app.order.id", orderId);

      // Operación compleja
      await validateStock(orderId);
      await chargePayment(orderId);

      span.setStatus({ code: SpanStatusCode.OK });
    } catch (err) {
      span.recordException(err);
      span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
      throw err;
    } finally {
      span.end();
    }
  });
}
```

#### 3. Métricas RED y Dashboards de Alto Impacto

Un senior no monitoriza "CPU Usage" al principio. Se enfoca en las métricas **RED**:

- **R**ate (Tasa de peticiones por segundo)
- **E**rrors (Tasa de errores por segundo)
- **D**uration (Latencia: P50, P90, P99)

**PromQL para Latencia P99:**
`histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket{service="portfolio-api"}[5m])) by (le))`

Esta visión permite detectar degradaciones de rendimiento que afectan solo al 1% de los usuarios (a menudo los "power users" con más datos).

#### 4. Logging Estructurado con Correlación

Los logs en texto plano ("Error en DB") son inútiles a escala. Necesitamos JSON logs y, crucialmente, correlación con trazas.

**Configuración de Pino con Trace ID:**

```typescript
// src/logger/logger.config.ts
import { pino } from "pino";
import { trace, context } from "@opentelemetry/api";

export const logger = pino({
  formatters: {
    log(object) {
      const span = trace.getSpan(context.active());
      if (!span) return { ...object };

      const { traceId, spanId } = span.spanContext();
      return { ...object, trace_id: traceId, span_id: spanId };
    },
  },
});

// Uso
logger.error({ err, userId: "123" }, "Failed to process transaction");
```

En Grafana, esto permite que al ver un log de error en **Loki**, aparezca un botón "Derive Trace" que te lleva directamente a **Tempo** para ver qué pasó antes y después de ese error en todo el sistema distribuido.

#### 5. Observabilidad de Base de Datos (Drizzle)

Monitorizar la aplicación no basta; la base de datos es a menudo el cuello de botella.
Con Drizzle, podemos usar hooks o un logger personalizado para medir la duración de las queries.

```typescript
// src/db/drizzle.service.ts
import { DefaultLogger } from "drizzle-orm/logger";

class MyLogger extends DefaultLogger {
  logQuery(query: string, params: unknown[]): void {
    // Solo loggear queries lentas
    const start = performance.now();
    // ... ejecutar query ...
    const duration = performance.now() - start;

    if (duration > 500) {
      // 500ms threshold
      logger.warn({ query, duration }, "Slow Query Detected");
    }
  }
}
```

Además, es vital exportar métricas del pool de conexiones de Postgres (`pg-pool`) mediante un exportador de Prometheus, vigilando `pg_stat_activity` y los bloqueos.

#### Conclusión

La observabilidad a escala no se trata de tener más dashboards, sino de reducir el MTTR (Mean Time To Resolution). Al correlacionar Logs, Métricas y Trazas con un contexto de negocio rico (User IDs, Tenant IDs), transformamos el caos de los microservicios en un sistema transparente y debuggeable.

---

### ENGLISH (EN)

In modern distributed systems, uncertainty is the norm. Deploying a service in Kubernetes is easy; knowing why it has latency spikes of 2 seconds at 3 AM is the real challenge. Observability is not just "logs and metrics," it is the property of a system that allows understanding its internal state through its external outputs. For a senior engineer, this means implementing OpenTelemetry (OTel), Prometheus, Loki, and Tempo (or Jaeger) as a unified platform.

#### 1. OpenTelemetry: The Telemetry Standardization

![Observability Stack](./images/observability-at-scale/stack.png)

Gone are the days of heavy proprietary agents. OpenTelemetry (OTel) is the de facto standard. It allows instrumenting the application once and sending data to any backend (Grafana, Datadog, AWS X-Ray) without changing a line of code.

**Automatic Instrumentation in NestJS / Node.js:**

The "magic" of OTel lies in its ability to intercept common libraries (Express, `pg`, Redis, gRPC) automatically.

```typescript
// src/instrumentation.ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "portfolio-api-service",
    [SemanticResourceAttributes.SERVICE_VERSION]: "1.0.0",
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
      process.env.NODE_ENV || "production",
  }),
  traceExporter: new OTLPTraceExporter({
    url: "http://otel-collector:4318/v1/traces",
  }),
  metricExporter: new OTLPMetricExporter({
    url: "http://otel-collector:4318/v1/metrics",
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable noisy instrumentations if necessary
      "@opentelemetry/instrumentation-fs": { enabled: false },
    }),
  ],
});

sdk.start();
```

This code must run **before** any other imported module. In NestJS, this is typically achieved with `node --require ./dist/instrumentation.js main.js`.

#### 2. Distributed Tracing: Finding the Needle in the Haystack

When you have microservices, an HTTP request can trigger 10 RPC calls and 5 SQL queries. Without distributed tracing, you are blind.

**Context Propagation:**
OTel injects `traceparent` headers into outgoing requests. This allows visualizing the full "Waterfall chart" in Grafana Tempo.

```typescript
// Manual span example for a critical operation
import { trace } from "@opentelemetry/api";

async function processOrder(orderId: string) {
  const tracer = trace.getTracer("order-service");

  return await tracer.startActiveSpan("processOrder", async (span) => {
    try {
      span.setAttribute("app.order.id", orderId);

      // Complex operation
      await validateStock(orderId);
      await chargePayment(orderId);

      span.setStatus({ code: SpanStatusCode.OK });
    } catch (err) {
      span.recordException(err);
      span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
      throw err;
    } finally {
      span.end();
    }
  });
}
```

#### 3. RED Metrics and High-Impact Dashboards

A senior engineer doesn't monitor "CPU Usage" first. They focus on **RED** metrics:

- **R**ate (Requests per second)
- **E**rrors (Errors per second)
- **D**uration (Latency: P50, P90, P99)

**PromQL for P99 Latency:**
`histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket{service="portfolio-api"}[5m])) by (le))`

This view allows detecting performance degradations affecting only 1% of users (often "power users" with the most data).

#### 4. Structured Logging with Correlation

Plain text logs ("DB Error") are useless at scale. We need JSON logs and, crucially, trace correlation.

**Pino Configuration with Trace ID:**

```typescript
// src/logger/logger.config.ts
import { pino } from "pino";
import { trace, context } from "@opentelemetry/api";

export const logger = pino({
  formatters: {
    log(object) {
      const span = trace.getSpan(context.active());
      if (!span) return { ...object };

      const { traceId, spanId } = span.spanContext();
      return { ...object, trace_id: traceId, span_id: spanId };
    },
  },
});

// Usage
logger.error({ err, userId: "123" }, "Failed to process transaction");
```

In Grafana, this allows that when viewing an error log in **Loki**, a "Derive Trace" button appears, taking you directly to **Tempo** to see what happened before and after that error across the entire distributed system.

#### 5. Database Observability (Drizzle)

Monitoring the application isn't enough; the database is often the bottleneck.
With Drizzle, we can use hooks or a custom logger to measure query duration.

```typescript
// src/db/drizzle.service.ts
import { DefaultLogger } from "drizzle-orm/logger";

class MyLogger extends DefaultLogger {
  logQuery(query: string, params: unknown[]): void {
    // Only log slow queries
    const start = performance.now();
    // ... execute query ...
    const duration = performance.now() - start;

    if (duration > 500) {
      // 500ms threshold
      logger.warn({ query, duration }, "Slow Query Detected");
    }
  }
}
```

Additionally, it is vital to export Postgres connection pool (`pg-pool`) metrics via a Prometheus exporter, watching `pg_stat_activity` and locks.

#### Conclusion

Observability at scale is not about having more dashboards, but about reducing MTTR (Mean Time To Resolution). By correlating Logs, Metrics, and Traces with rich business context (User IDs, Tenant IDs), we transform microservice chaos into a transparent, debuggable system.

---

### PORTUGUÊS (PT)

Em sistemas distribuídos modernos, a incerteza é a norma. Implantar um serviço no Kubernetes é fácil; saber por que ele tem picos de latência de 2 segundos às 3 da manhã é o verdadeiro desafio. A observabilidade não é apenas "logs e métricas", é a propriedade de um sistema que permite entender seu estado interno através de suas saídas externas. Para um engenheiro sênior, isso significa implementar OpenTelemetry (OTel), Prometheus, Loki e Tempo (ou Jaeger) como uma plataforma unificada.

#### 1. OpenTelemetry: A Padronização da Telemetria

![Observability Stack](./images/observability-at-scale/stack.png)

Ficaram para trás os dias de agentes proprietários pesados. O OpenTelemetry (OTel) é o padrão de fato. Ele permite instrumentar a aplicação uma única vez e enviar os dados para qualquer backend (Grafana, Datadog, AWS X-Ray) sem alterar uma linha de código.

**Instrumentação Automática no NestJS / Node.js:**

A "magia" do OTel reside em sua capacidade de interceptar bibliotecas comuns (Express, `pg`, Redis, gRPC) automaticamente.

```typescript
// src/instrumentation.ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "portfolio-api-service",
    [SemanticResourceAttributes.SERVICE_VERSION]: "1.0.0",
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
      process.env.NODE_ENV || "production",
  }),
  traceExporter: new OTLPTraceExporter({
    url: "http://otel-collector:4318/v1/traces",
  }),
  metricExporter: new OTLPMetricExporter({
    url: "http://otel-collector:4318/v1/metrics",
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Desativar instrumentações ruidosas se necessário
      "@opentelemetry/instrumentation-fs": { enabled: false },
    }),
  ],
});

sdk.start();
```

Este código deve ser executado **antes** de qualquer outro módulo importado. No NestJS, isso é tipicamente alcançado com `node --require ./dist/instrumentation.js main.js`.

#### 2. Distributed Tracing: Rastreado a Agulha no Palheiro

Quando você tem microsserviços, uma requisição HTTP pode desencadear 10 chamadas RPC e 5 consultas SQL. Sem rastreamento distribuído, você está cego.

**Context Propagation:**
O OTel injeta headers `traceparent` nas requisições de saída. Isso permite visualizar o "Waterfall chart" completo no Grafana Tempo.

```typescript
// Exemplo de span manual para uma operação crítica
import { trace } from "@opentelemetry/api";

async function processOrder(orderId: string) {
  const tracer = trace.getTracer("order-service");

  return await tracer.startActiveSpan("processOrder", async (span) => {
    try {
      span.setAttribute("app.order.id", orderId);

      // Operação complexa
      await validateStock(orderId);
      await chargePayment(orderId);

      span.setStatus({ code: SpanStatusCode.OK });
    } catch (err) {
      span.recordException(err);
      span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
      throw err;
    } finally {
      span.end();
    }
  });
}
```

#### 3. Métricas RED e Dashboards de Alto Impacto

Um sênior não monitora "CPU Usage" no início. Ele foca nas métricas **RED**:

- **R**ate (Taxa de requisições por segundo)
- **E**rrors (Taxa de erros por segundo)
- **D**uration (Latência: P50, P90, P99)

**PromQL para Latência P99:**
`histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket{service="portfolio-api"}[5m])) by (le))`

Essa visão permite detectar degradações de desempenho que afetam apenas 1% dos usuários (frequentemente os "power users" com mais dados).

#### 4. Logging Estruturado com Correlação

Logs em texto plano ("Erro no DB") são inúteis em escala. Precisamos de logs JSON e, crucialmente, correlação com traces.

**Configuração do Pino com Trace ID:**

```typescript
// src/logger/logger.config.ts
import { pino } from "pino";
import { trace, context } from "@opentelemetry/api";

export const logger = pino({
  formatters: {
    log(object) {
      const span = trace.getSpan(context.active());
      if (!span) return { ...object };

      const { traceId, spanId } = span.spanContext();
      return { ...object, trace_id: traceId, span_id: spanId };
    },
  },
});

// Uso
logger.error({ err, userId: "123" }, "Falha ao processar transação");
```

No Grafana, isso permite que, ao ver um log de erro no **Loki**, apareça um botão "Derive Trace" que te leva diretamente ao **Tempo** para ver o que aconteceu antes e depois desse erro em todo o sistema distribuído.

#### 5. Observabilidade de Banco de Dados (Drizzle)

Monitorar a aplicação não basta; o banco de dados é frequentemente o gargalo.
Com Drizzle, podemos usar hooks ou um logger personalizado para medir a duração das queries.

```typescript
// src/db/drizzle.service.ts
import { DefaultLogger } from "drizzle-orm/logger";

class MyLogger extends DefaultLogger {
  logQuery(query: string, params: unknown[]): void {
    // Apenas logar queries lentas
    const start = performance.now();
    // ... executar query ...
    const duration = performance.now() - start;

    if (duration > 500) {
      // limite de 500ms
      logger.warn({ query, duration }, "Slow Query Detected");
    }
  }
}
```

Além disso, é vital exportar métricas do pool de conexões do Postgres (`pg-pool`) através de um exportador Prometheus, vigiando `pg_stat_activity` e bloqueios.

#### Conclusão

A observabilidade em escala não se trata de ter mais dashboards, mas de reduzir o MTTR (Mean Time To Resolution). Ao correlacionar Logs, Métricas e Traces com um contexto de negócio rico (User IDs, Tenant IDs), transformamos o caos dos microsserviços em um sistema transparente e depurável.
