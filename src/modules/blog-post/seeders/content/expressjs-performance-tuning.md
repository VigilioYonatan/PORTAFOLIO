### ESPAÑOL (ES)

Express.js tiene la reputación de ser "rápido, sin opinión y minimalista", pero esa libertad es un arma de doble filo. Una configuración por defecto de Express ("Hello World") puede manejar cientos de requests, pero se derrumbará bajo carga real si no entiendes cómo funciona el **Single-Threaded Event Loop**.

En este análisis, convertiremos una app Express frágil en una bestia de rendimiento capaz de servir 10k RPS, abordando bloat de middleware, bloqueo del event loop y tuning de base de datos.

#### 1. El Enemigo #1: Bloqueo del Event Loop

![Event Loop Blocking](./images/expressjs-performance-tuning/clinic-doctor.png)

Node.js es asíncrono, pero su hilo principal es síncrono. Si ejecutas `JSON.parse` en un archivo de 50MB o calculas un hash criptográfico en el hilo principal, **nadie más puede entrar**.

**Diagnóstico con Clinic.js**:
Antes de optimizar, mide. Usa `clinic doctor` para detectar picos en el Event Loop Delay.

```bash
npm install -g clinic
clinic doctor -- on -c 'autocannon -c 100 localhost:3000' node server.js
```

**Solución: Offloading a Worker Threads**:
Para tareas intensivas en CPU (Image resizing, PDF generation), usa `piscina` o `worker_threads` nativos.

```typescript
// worker-pool.ts
import Piscina from "piscina";

export const imageResizePool = new Piscina({
  filename: path.resolve(__dirname, "image-worker.js"),
});

// controller.ts
app.post("/upload", async (req, res) => {
  // 🚫 BLOCKING: const result = resizeSync(req.file);
  // ✅ NON-BLOCKING: Delega al thread pool
  const result = await imageResizePool.run(req.file.buffer);
  res.send(result);
});
```

#### 2. Tuning de Conexiones a Base de Datos (Pool Sizing)

Un error común es pensar "más conexiones = más velocidad". Falso. PostgreSQL tiene un límite de concurrencia efectiva ligado a los núcleos de CPU.
Si tu pool es de 100 y tu DB tiene 4 cores, estás perdiendo tiempo en _Context Switching_.

**Fórmula Mágica (aprox)**: `(Core Count * 2) + Spindle Count`

En Node.js/Drizzle, configura tu pool para ser agresivo con el `idleTimeout` para liberar recursos rápido en arquitecturas Serverless/Lambda, pero estable en contenedores de larga duración.

```typescript
// database.ts
import { Pool } from "pg";

export const pool = new Pool({
  host: process.env.DB_HOST,
  max: 20, // Mantén esto alineado con la capacidad real de tu DB
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

#### 3. Middleware Bloat y Compresión Inteligente

Cada `app.use()` añade latencia. Parsear JSON globalmente (`app.use(json())`) desperdicia CPU en webhooks o subidas de binarios que no lo necesitan.

Además, usa **Brotli** sobre Gzip. Es más lento de comprimir, pero despimprime mucho más rápido y genera archivos más pequeños (crucial para móviles).

```typescript
import compression from "compression";

// Aplica middleware SOLO donde sea necesario
app.use("/api", json());

app.use(
  compression({
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
    level: 6, // Balance perfecto CPU/Tamaño para Brotli
  }),
);
```

#### 4. Streaming de Big Data (JSON/CSV)

Nunca uses `res.json(bigArray)`. Esto carga 1GB de datos en RAM para enviar 100MB de JSON. El Garbage Collector se volverá loco parando el mundo ("Stop-the-world GC").
Usa flujos (Streams) para entubar la base de datos directo a la red.

```typescript
// export-controller.ts
import { pipeline } from "node:stream/promises";

app.get("/export-users", async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  // Cursor de Drizzle: Lee fila a fila, bajo memory footprint
  const usersCursor = await db.select().from(users).iterator();

  // Transform Stream personalizado
  const jsonStream = new Transform({
    writableObjectMode: true,
    transform(chunk, encoding, callback) {
      this.push(JSON.stringify(chunk) + "\n");
      callback();
    },
  });

  // Pipeline maneja backpressure automáticamente
  await pipeline(usersCursor, jsonStream, res);
});
```

#### 5. Clustering vs PM2

Node es single-core. Si tienes una instancia EC2 con 8 vCPUs, estás desperdiciando 7.
En Kubernetes, se prefiere escalar Pods (Réplicas). Pero en VMs o Bare Metal, usa **Cluster Module**.

**PM2** es el estándar de la industria para gestionar esto sin código, pero entender cómo funciona (`fork`) es vital.

```bash
# Production Start
pm2 start dist/main.js -i max --name api-prod
```

PM2 balancea las conexiones entrantes (Round Robin) entre los processos hijos. Si uno muere, PM2 lo revive (Zero Downtime Reload).

Hacer que Express vuele no es magia negra; es entender el costo computacional de cada función que añades al stack, respetar el Event Loop y gestionar la memoria como un recurso finito.

---

### ENGLISH (EN)

Express.js has a reputation for being "fast, unopinionated, and minimalist," but that freedom is a double-edged sword. A default Express configuration ("Hello World") can handle hundreds of requests but will crumble under real load if you don't understand how the **Single-Threaded Event Loop** works.

In this analysis, we will turn a fragile Express app into a performance beast capable of serving 10k RPS, addressing middleware bloat, event loop blocking, and database tuning.

#### 1. Enemy #1: Event Loop Blocking

![Event Loop Blocking](./images/expressjs-performance-tuning/clinic-doctor.png)

Node.js is asynchronous, but its main thread is synchronous. If you execute `JSON.parse` on a 50MB file or calculate a cryptographic hash on the main thread, **nobody else can enter**.

**Diagnosis with Clinic.js**:
Before optimizing, measure. Use `clinic doctor` to detect spikes in Event Loop Delay.

```bash
npm install -g clinic
clinic doctor -- on -c 'autocannon -c 100 localhost:3000' node server.js
```

**Solution: Worker Threads Offloading**:
For CPU-intensive tasks (Image resizing, PDF generation), use `piscina` or native `worker_threads`.

```typescript
// worker-pool.ts
import Piscina from "piscina";

export const imageResizePool = new Piscina({
  filename: path.resolve(__dirname, "image-worker.js"),
});

// controller.ts
app.post("/upload", async (req, res) => {
  // 🚫 BLOCKING: const result = resizeSync(req.file);
  // ✅ NON-BLOCKING: Delegate to thread pool
  const result = await imageResizePool.run(req.file.buffer);
  res.send(result);
});
```

#### 2. Database Connection Tuning (Pool Sizing)

A common mistake is thinking "more connections = more speed". False. PostgreSQL has an effective concurrency limit tied to CPU cores.
If your pool is 100 and your DB has 4 cores, you are wasting time on _Context Switching_.

**Magic Formula (approx)**: `(Core Count * 2) + Spindle Count`

In Node.js/Drizzle, configure your pool to be aggressive with `idleTimeout` to free resources fast in Serverless/Lambda architectures, but stable in long-running containers.

```typescript
// database.ts
import { Pool } from "pg";

export const pool = new Pool({
  host: process.env.DB_HOST,
  max: 20, // Keep this aligned with your DB's actual capacity
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

#### 3. Middleware Bloat and Smart Compression

Every `app.use()` adds latency. Globally parsing JSON (`app.use(json())`) wastes CPU on webhooks or binary uploads that don't need it.

Also, use **Brotli** over Gzip. It's slower to compress but decompresses much faster and generates smaller files (critical for mobile).

```typescript
import compression from "compression";

// Apply middleware ONLY where needed
app.use("/api", json());

app.use(
  compression({
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
    level: 6, // Perfect CPU/Size balance for Brotli
  }),
);
```

#### 4. Streaming Big Data (JSON/CSV)

Never use `res.json(bigArray)`. This loads 1GB of data into RAM to send 100MB of JSON. The Garbage Collector will go crazy stopping the world ("Stop-the-world GC").
Use Streams to pipe the database directly to the network.

```typescript
// export-controller.ts
import { pipeline } from "node:stream/promises";

app.get("/export-users", async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  // Drizzle Cursor: Read row by row, low memory footprint
  const usersCursor = await db.select().from(users).iterator();

  // Custom Transform Stream
  const jsonStream = new Transform({
    writableObjectMode: true,
    transform(chunk, encoding, callback) {
      this.push(JSON.stringify(chunk) + "\n");
      callback();
    },
  });

  // Pipeline handles backpressure automatically
  await pipeline(usersCursor, jsonStream, res);
});
```

#### 5. Clustering vs PM2

Node is single-core. If you have an EC2 instance with 8 vCPUs, you are wasting 7.
In Kubernetes, scaling Pods (Replicas) is preferred. But on VMs or Bare Metal, use the **Cluster Module**.

**PM2** is the industry standard for managing this code-free, but understanding how it works (`fork`) is vital.

```bash
# Production Start
pm2 start dist/main.js -i max --name api-prod
```

PM2 balances incoming connections (Round Robin) among child processes. If one dies, PM2 revives it (Zero Downtime Reload).

Making Express fly isn't black magic; it's understanding the computational cost of every function you add to the stack, respecting the Event Loop, and managing memory as a finite resource.

---

### PORTUGUÊS (PT)

O Express.js tem a reputação de ser "rápido, sem opinião e minimalista", mas essa liberdade é uma faca de dois gumes. Uma configuração padrão do Express ("Hello World") pode lidar com centenas de requisições, mas desmoronará sob carga real se você não entender como funciona o **Single-Threaded Event Loop**.

Nesta análise, transformaremos um aplicativo Express frágil em uma fera de desempenho capaz de servir 10k RPS, abordando inchaço (bloat) de middleware, bloqueio do event loop e ajuste fino de banco de dados.

#### 1. Inimigo #1: Bloqueio do Event Loop

![Event Loop Blocking](./images/expressjs-performance-tuning/clinic-doctor.png)

O Node.js é assíncrono, mas seu thread principal é síncrono. Se você executar `JSON.parse` em um arquivo de 50MB ou calcular um hash criptográfico no thread principal, **ninguém mais poderá entrar**.

**Diagnóstico com Clinic.js**:
Antes de otimizar, meça. Use `clinic doctor` para detectar picos no atraso do Event Loop.

```bash
npm install -g clinic
clinic doctor -- on -c 'autocannon -c 100 localhost:3000' node server.js
```

**Solução: Offloading para Worker Threads**:
Para tarefas intensivas em CPU (redimensionamento de imagem, geração de PDF), use `piscina` ou `worker_threads` nativos.

```typescript
// worker-pool.ts
import Piscina from "piscina";

export const imageResizePool = new Piscina({
  filename: path.resolve(__dirname, "image-worker.js"),
});

// controller.ts
app.post("/upload", async (req, res) => {
  // 🚫 BLOCKING: const result = resizeSync(req.file);
  // ✅ NON-BLOCKING: Delegar para o pool de threads
  const result = await imageResizePool.run(req.file.buffer);
  res.send(result);
});
```

#### 2. Tuning de Conexões de Banco de Dados (Pool Sizing)

Um erro comum é pensar "mais conexões = mais velocidade". Falso. O PostgreSQL tem um limite de concorrência efetiva ligado aos núcleos da CPU.
Se o seu pool for 100 e seu BD tiver 4 núcleos, você estará perdendo tempo em _Context Switching_.

**Fórmula Mágica (aprox)**: `(Contagem de Núcleos * 2) + Contagem de Eixos`

No Node.js/Drizzle, configure seu pool para ser agressivo com o `idleTimeout` para liberar recursos rapidamente em arquiteturas Serverless/Lambda, mas estável em contêineres de longa duração.

```typescript
// database.ts
import { Pool } from "pg";

export const pool = new Pool({
  host: process.env.DB_HOST,
  max: 20, // Mantenha isso alinhado com a capacidade real do seu BD
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

#### 3. Middleware Bloat e Compressão Inteligente

Cada `app.use()` adiciona latência. Analisar JSON globalmente (`app.use(json())`) desperdiça CPU em webhooks ou uploads binários que não precisam disso.

Além disso, use **Brotli** sobre Gzip. É mais lento para comprimir, mas descomprime muito mais rápido e gera arquivos menores (crítico para dispositivos móveis).

```typescript
import compression from "compression";

// Aplique middleware APENAS onde necessário
app.use("/api", json());

app.use(
  compression({
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
    level: 6, // Equilíbrio perfeito CPU/Tamanho para Brotli
  }),
);
```

#### 4. Streaming de Big Data (JSON/CSV)

Nunca use `res.json(bigArray)`. Isso carrega 1GB de dados na RAM para enviar 100MB de JSON. O Garbage Collector ficará louco parando o mundo ("Stop-the-world GC").
Use Streams para canalizar o banco de dados direto para a rede.

```typescript
// export-controller.ts
import { pipeline } from "node:stream/promises";

app.get("/export-users", async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  // Drizzle Cursor: Lê linha por linha, baixo consumo de memória
  const usersCursor = await db.select().from(users).iterator();

  // Transform Stream personalizado
  const jsonStream = new Transform({
    writableObjectMode: true,
    transform(chunk, encoding, callback) {
      this.push(JSON.stringify(chunk) + "\n");
      callback();
    },
  });

  // Pipeline lida com backpressure automaticamente
  await pipeline(usersCursor, jsonStream, res);
});
```

#### 5. Clustering vs PM2

Node é single-core. Se você tem uma instância EC2 com 8 vCPUs, está desperdiçando 7.
No Kubernetes, escalar Pods (Réplicas) é preferível. Mas em VMs ou Bare Metal, use o **Cluster Module**.

**PM2** é o padrão da indústria para gerenciar isso sem código, mas entender como funciona (`fork`) é vital.

```bash
# Production Start
pm2 start dist/main.js -i max --name api-prod
```

O PM2 balanceia as conexões recebidas (Round Robin) entre os processos filhos. Se um morrer, o PM2 o revive (Zero Downtime Reload).

Fazer o Express voar não é magia negra; é entender o custo computacional de cada função que você adiciona à pilha, respeitar o Event Loop e gerenciar a memória como um recurso finito.
