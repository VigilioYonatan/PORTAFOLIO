### ESPAÑOL (ES)

Ingeniería de software para sistemas de alta carga en Node.js es una disciplina que va mucho más allá de escribir código funcional. Se trata de entender cómo cada byte de memoria y cada ciclo de CPU impactan en la estabilidad global cuando se escalan miles de operaciones por segundo. Un ingeniero senior debe dominar la arquitectura interna de Node.js, optimizar la comunicación entre servicios y diseñar capas de persistencia que no se colapsen bajo presión. En este artículo exhaustivo, analizaremos estrategias críticas.

#### 1. El Event Loop como Recurso Escaso

![Node.js Event Loop](./images/high-load-nodejs-engineering/event-loop.png)

En alta carga, el Event Loop es el recurso que debemos proteger a toda costa.

**Evitar Operaciones Bloqueantes (The Golden Rule):**
Un solo `JSON.stringify` de 10MB bloquea el Event Loop durante ~40ms, tiempo suficiente para que se acumulen 400 peticiones pendientes si recibes 10k RPS.

```typescript
// MAL: Bloquea el hilo principal
const data = fs.readFileSync("big-file.json");

// BIEN: Streams
pipeline(fs.createReadStream("big-file.json"), res, (err) => {
  if (err) console.error("Stream fallido", err);
});
```

**Worker Threads para CPU Bound:**
Para tareas como criptografía o parsing de XML, delegamos a Workers.

```typescript
import { Worker } from "worker_threads";

function heavyTask(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./worker.js", { workerData: data });
    worker.on("message", resolve);
    worker.on("error", reject);
  });
}
```

#### 2. Optimizando la Capa de Datos

Bajo alta carga, la base de datos (Postgres) suele ser el primer punto de fallo.

- **Drizzle Pool Tuning**: Ajustamos el pool de conexiones `pg`. Si tienes 4 vCPUs en la DB, un pool de 100 en la app es contraproducente (context switching). `max: 10` suele ser más rápido que `max: 100`.
- **Transacciones Cortas**: Las transacciones bloquean filas. Un senior asegura que las transacciones duren <10ms. NUNCA hagas una llamada HTTP externa dentro de una transacción.

#### 3. Backpressure y Gestión de Colas

Si tu API recibe 10k RPS pero tu DB solo puede escribir 2k RPS, el sistema colapsará por Out Of Memory (OOM) a menos que manejes la contrapresión.

**Colas de Mensajes (BullMQ / Redis):**
Desacoplamos la ingesta del procesamiento.

```typescript
import { Queue } from "bullmq";

const emailQueue = new Queue("emails", { connection: redisConnection });

// API Handler: Super rápido, solo encola
app.post("/register", async (req, res) => {
  await emailQueue.add("welcome-email", { email: req.body.email });
  res.send("Processing...");
});
```

#### 4. Observabilidad de "Golden Signals"

En producción, necesitamos ojos dentro del sistema.

- **Prometheus & Grafana**: Métricas clave: Latencia (P95, P99), Tráfico (RPS), Errores (%), Saturación (CPU/RAM).
- **Pino Logger**: Usar `console.log` en producción es un pecado capital en Node.js (es síncrono y bloqueante). Pino escribe asíncronamente a `stdout`.

```typescript
import pino from "pino";
const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty", // Solo en dev
  },
});
```

#### 5. Infraestructura y Autoscale

- **Cluster Module**: Node.js es single-threaded. En un servidor de 64 cores, usas `pm2` en modo `cluster` para lanzar 64 instancias.
- **HPA (Kubernetes)**: Escalamos Pods basándonos en métricas custom (ej: longitud de la cola de BullMQ), no solo CPU.

#### Conclusión

Ingeniería de alta carga es una maratón de optimización continua. Al combinar la agilidad de Node.js con la precisión de DrizzleORM y una infraestructura resiliente, construimos sistemas inquebrantables. El éxito no es que el sistema funcione hoy, sino que siga funcionando cuando el tráfico se multiplique por diez mañana.

---

### ENGLISH (EN)

Software engineering for high-load systems in Node.js is a discipline that goes far beyond writing functional code. It is about understanding how every byte of memory and every CPU cycle impacts global stability when scaling thousands of operations per second. A senior engineer must master the internal architecture of Node.js, optimize communication between services, and design persistence layers that do not collapse under pressure. In this exhaustive article, we will analyze critical strategies.

#### 1. The Event Loop as a Scarce Resource

![Node.js Event Loop](./images/high-load-nodejs-engineering/event-loop.png)

Under high load, the Event Loop is the resource we must protect at all costs.

**Avoid Blocking Operations (The Golden Rule):**
A single 10MB `JSON.stringify` blocks the Event Loop for ~40ms, enough time for 400 pending requests to pile up if you receive 10k RPS.

```typescript
// BAD: Blocks the main thread
const data = fs.readFileSync("big-file.json");

// GOOD: Streams
pipeline(fs.createReadStream("big-file.json"), res, (err) => {
  if (err) console.error("Stream failed", err);
});
```

**Worker Threads for CPU Bound:**
For tasks like cryptography or XML parsing, we delegate to Workers.

```typescript
import { Worker } from "worker_threads";

function heavyTask(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./worker.js", { workerData: data });
    worker.on("message", resolve);
    worker.on("error", reject);
  });
}
```

#### 2. Optimizing the Data Layer

Under high load, the database (Postgres) is usually the first point of failure.

- **Drizzle Pool Tuning**: We tune the `pg` connection pool. If you have 4 vCPUs in the DB, a pool of 100 in the app is counterproductive (context switching). `max: 10` is often faster than `max: 100`.
- **Short Transactions**: Transactions lock rows. A senior engineer ensures transactions last <10ms. NEVER make an external HTTP call inside a transaction.

#### 3. Backpressure and Queue Management

If your API receives 10k RPS but your DB can only write 2k RPS, the system will collapse from Out Of Memory (OOM) unless you handle backpressure.

**Message Queues (BullMQ / Redis):**
We decouple ingestion from processing.

```typescript
import { Queue } from "bullmq";

const emailQueue = new Queue("emails", { connection: redisConnection });

// API Handler: Super fast, just enqueues
app.post("/register", async (req, res) => {
  await emailQueue.add("welcome-email", { email: req.body.email });
  res.send("Processing...");
});
```

#### 4. Golden Signals Observability

In production, we need eyes inside the system.

- **Prometheus & Grafana**: Key metrics: Latency (P95, P99), Traffic (RPS), Errors (%), Saturation (CPU/RAM).
- **Pino Logger**: Using `console.log` in production is a cardinal sin in Node.js (it is synchronous and blocking). Pino writes asynchronously to `stdout`.

```typescript
import pino from "pino";
const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty", // Only in dev
  },
});
```

#### 5. Infrastructure and Autoscale

- **Cluster Module**: Node.js is single-threaded. On a 64-core server, utilize `pm2` in `cluster` mode to launch 64 instances.
- **HPA (Kubernetes)**: We scale Pods based on custom metrics (e.g., BullMQ queue length), not just CPU.

#### Conclusion

High-load engineering is a marathon of continuous optimization. By combining the agility of Node.js with the precision of DrizzleORM and a resilient infrastructure, we build unbreakable systems. Success isn't that the system works today; it's that it keeps working when traffic multiplies tenfold tomorrow.

---

### PORTUGUÊS (PT)

Engenharia de software para sistemas de alta carga no Node.js é uma disciplina que vai muito além de escrever código funcional. Trata-se de entender como cada byte de memória e cada ciclo de CPU impactam a estabilidade global ao escalar milhares de operações por segundo. Um engenheiro sênior deve dominar a arquitetura interna do Node.js, otimizar a comunicação entre serviços e projetar camadas de persistência que não entrem em colapso sob pressão. Neste artigo abrangente, analisaremos estratégias críticas.

#### 1. O Event Loop como Recurso Escasso

![Node.js Event Loop](./images/high-load-nodejs-engineering/event-loop.png)

Em alta carga, o Event Loop é o recurso que devemos proteger a todo custo.

**Evitar Operações Bloqueantes (A Regra de Ouro):**
Um único `JSON.stringify` de 10MB bloqueia o Event Loop por ~40ms, tempo suficiente para acumular 400 requisições pendentes se você recebe 10k RPS.

```typescript
// RUIM: Bloqueia a thread principal
const data = fs.readFileSync("big-file.json");

// BOM: Streams
pipeline(fs.createReadStream("big-file.json"), res, (err) => {
  if (err) console.error("Falha no stream", err);
});
```

**Worker Threads para CPU Bound:**
Para tarefas como criptografia ou parsing de XML, delegamos para Workers.

```typescript
import { Worker } from "worker_threads";

function heavyTask(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./worker.js", { workerData: data });
    worker.on("message", resolve);
    worker.on("error", reject);
  });
}
```

#### 2. Otimizando a Camada de Dados

Sob alta carga, o banco de dados (Postgres) costuma ser o primeiro ponto de falha.

- **Drizzle Pool Tuning**: Ajustamos o pool de conexões `pg`. Se você tem 4 vCPUs no DB, um pool de 100 no app é contraproducente (troca de contexto). `max: 10` costuma ser mais rápido que `max: 100`.
- **Transações Curtas**: Transações bloqueiam linhas. Um sênior garante que as transações durem <10ms. NUNCA faça uma chamada HTTP externa dentro de uma transação.

#### 3. Backpressure e Gerenciamento de Filas

Se sua API recebe 10k RPS mas seu DB só pode escrever 2k RPS, o sistema colapsará por Out Of Memory (OOM) a menos que você gerencie a contrapressão.

**Filas de Mensagens (BullMQ / Redis):**
Desacoplamos a ingestão do processamento.

```typescript
import { Queue } from "bullmq";

const emailQueue = new Queue("emails", { connection: redisConnection });

// API Handler: Super rápido, apenas enfileira
app.post("/register", async (req, res) => {
  await emailQueue.add("welcome-email", { email: req.body.email });
  res.send("Processando...");
});
```

#### 4. Observabilidade de "Golden Signals"

Em produção, precisamos de olhos dentro do sistema.

- **Prometheus & Grafana**: Métricas chave: Latência (P95, P99), Tráfego (RPS), Erros (%), Saturação (CPU/RAM).
- **Pino Logger**: Usar `console.log` em produção é um pecado capital no Node.js (é síncrono e bloqueante). Pino escreve assincronamente em `stdout`.

```typescript
import pino from "pino";
const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty", // Apenas em dev
  },
});
```

#### 5. Infraestrutura e Autoscale

- **Cluster Module**: Node.js é single-threaded. Em um servidor de 64 cores, use `pm2` no modo `cluster` para lançar 64 instâncias.
- **HPA (Kubernetes)**: Escalamos Pods com base em métricas personalizadas (ex: tamanho da fila do BullMQ), não apenas CPU.

#### Conclusão

Engenharia de alta carga é uma maratona de otimização contínua. Ao combinar a agilidade do Node.js com a precisão do DrizzleORM e uma infraestrutura resiliente, construímos sistemas inquebráveis. O sucesso não é que o sistema funcione hoje, mas que ele continue funcionando quando o tráfego se multiplicar por dez amanhã.
