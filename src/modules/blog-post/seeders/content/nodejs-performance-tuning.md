### ESPAÑOL (ES)

Node.js es famoso por su eficiencia con I/O, pero su naturaleza Single-Threaded lo hace vulnerable: un bucle infinito o un `JSON.parse` de 20MB puede bloquear todo el servidor. "No puedes arreglar lo que no puedes medir". Intentar optimizar Node.js sin perfilado es como conducir con los ojos vendados.

En este artículo, nos sumergiremos en las herramientas de diagnóstico profesional: **Clinic.js**, **0x**, **Inspector Protocol**, y técnicas avanzadas como Worker Threads para tareas intensivas de CPU.

#### 1. Entendiendo el Event Loop y el Bloqueo

![Event Loop Visualization](./images/nodejs-performance-tuning/event-loop.png)

El Event Loop es el corazón de Node.js. Si se detiene, todo se detiene.
Un error común es confundir tareas asíncronas con tareas en paralelo. `Promise.resolve().then(() => expensiveCalculation())` seguirá bloqueando el hilo principal.

**Síntoma**: Los health checks fallan (timeout) aunque la CPU no esté al 100%.
**Diagnóstico**: Monitorear el metric `eventLoopLag`. Si supera 100ms, estás en problemas.

#### 2. Flamegraphs con 0x: Visualizando la CPU

Un Flamegraph te dice exactamente dónde está gastando tiempo tu CPU.

- **Eje X**: Tiempo de CPU.
- **Eje Y**: Profundidad del stack.

Usamos `0x` para generarlos con cero configuración en producción (o staging con carga real):

```bash
# Capturar perfilado mientras se ejecuta la carga
npx 0x -o -- node server.js
```

Si ves "mesetas" anchas y planas en funciones como `bcrypt.hashSync`, `crypto.pbkdf2` o `JSON.parse` masivos, has encontrado tu cuello de botella. Estas funciones son "sync" y monopolizan el V8.

#### 3. Worker Threads: Rompiendo el Mito del Hilo Único

Para tareas intensivas de CPU (cifrado, compresión de imágenes, cálculos matemáticos), la solución no es optimizar el algoritmo, es sacarlo del Event Loop principal.

```typescript
// main.js
const { Worker } = require("worker_threads");

function runHeavyTask(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./worker.js", { workerData: data });
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}
```

#### 4. Fugas de Memoria (Memory Leaks) y Heap Snapshots

¿Tu servidor crashea por OOM (Out of Memory) cada 2 días como un reloj? Tienes un Memory Leak.
El Garbage Collector (GC) de V8 es excelente, pero no puede limpiar referencias que tú mantienes vivas accidentalmente.

**Culpables Comunes**:

1.  **Listeners Globales**: `process.on(...)` que nunca se desuscriben.
2.  **Closures**: Variables retenidas en contextos que no mueren.
3.  **Cachés Ilimitadas**: Un `Map` o `Object` que solo crece.

**Solución**: Usar `heapdump` o conectar Chrome DevTools al puerto de inspección.

1. Tomar Snapshot A (base).
2. Ejecutar carga.
3. Forzar GC.
4. Tomar Snapshot B.
5. Comparar. Buscar objetos "Detached" o arrays que han crecido desproporcionadamente.

#### 5. Streaming: Manejando Big Data

Cargar un CSV de 1GB en memoria con `fs.readFileSync` explotará tu proceso.
Node.js brilla cuando usamos **Streams**.

```typescript
// MALO: Carga todo en RAM
const file = fs.readFileSync("big-data.csv");

// BUENO: Procesa chunk a chunk (Backpressure automático)
import { pipeline } from "stream/promises";
const readStream = fs.createReadStream("big-data.csv");
const transform = new Transform({
  /* lógica de parsing */
});
const writeStream = fs.createWriteStream("output.json");

await pipeline(readStream, transform, writeStream);
```

Optimizar Node.js no es magia negra; es ciencia forense. Requiere hipótesis, medición y pruebas.

---

### ENGLISH (EN)

Node.js is famous for its I/O efficiency, but its Single-Threaded nature makes it vulnerable: an infinite loop or a 20MB `JSON.parse` can block the entire server. "You can't fix what you can't measure." Trying to optimize Node.js without profiling is like driving blindfolded.

In this article, we'll dive into professional diagnostic tools: **Clinic.js**, **0x**, **Inspector Protocol**, and advanced techniques like Worker Threads for CPU-intensive tasks.

#### 1. Understanding the Event Loop and Blocking

![Event Loop Visualization](./images/nodejs-performance-tuning/event-loop.png)

The Event Loop is the heart of Node.js. If it stops, everything stops.
A common mistake is confusing asynchronous tasks with parallel tasks. `Promise.resolve().then(() => expensiveCalculation())` will still block the main thread.

**Symptom**: Health checks fail (timeout) even though CPU is not at 100%.
**Diagnosis**: Monitor the `eventLoopLag` metric. If it exceeds 100ms, you are in trouble.

#### 2. Flamegraphs with 0x: Visualizing CPU

A Flamegraph tells you exactly where your CPU is spending time.

- **X-Axis**: CPU Time.
- **Y-Axis**: Stack depth.

We use `0x` to generate them with zero config in production (or load-tested staging):

```bash
# Capture profiling while running load
npx 0x -o -- node server.js
```

If you see wide, flat "plateaus" in functions like `bcrypt.hashSync`, `crypto.pbkdf2`, or massive `JSON.parse`, you've found your bottleneck. These functions are "sync" and monopolize V8.

#### 3. Worker Threads: Breaking the Single Thread Myth

For CPU-intensive tasks (encryption, image compression, math calculations), the solution isn't optimizing the algorithm, it's moving it off the main Event Loop.

```typescript
// main.js
const { Worker } = require("worker_threads");

function runHeavyTask(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./worker.js", { workerData: data });
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}
```

#### 4. Memory Leaks and Heap Snapshots

Does your server crash OOM (Out of Memory) every 2 days like clockwork? You have a Memory Leak.
The V8 Garbage Collector (GC) is excellent, but it cannot clean references you accidentally keep alive.

**Common Culprits**:

1.  **Global Listeners**: `process.on(...)` that never unsubscribe.
2.  **Closures**: Variables retained in contexts that don't die.
3.  **Unlimited Caches**: A `Map` or `Object` that only grows.

**Solution**: Use `heapdump` or connect Chrome DevTools to the inspection port.

1. Take Snapshot A (base).
2. Run load.
3. Force GC.
4. Take Snapshot B.
5. Compare. Look for "Detached" objects or arrays that have grown disproportionately.

#### 5. Streaming: Handling Big Data

Loading a 1GB CSV into memory with `fs.readFileSync` will blow up your process.
Node.js shines when we use **Streams**.

```typescript
// BAD: Loads everything into RAM
const file = fs.readFileSync("big-data.csv");

// GOOD: Process chunk by chunk (Automatic Backpressure)
import { pipeline } from "stream/promises";
const readStream = fs.createReadStream("big-data.csv");
const transform = new Transform({
  /* parsing logic */
});
const writeStream = fs.createWriteStream("output.json");

await pipeline(readStream, transform, writeStream);
```

Optimizing Node.js isn't black magic; it's forensic science. It requires hypothesis, measurement, and testing.

---

### PORTUGUÊS (PT)

Node.js é famoso por sua eficiência com E/S, mas sua natureza Single-Threaded o torna vulnerável: um loop infinito ou um `JSON.parse` de 20 MB pode bloquear todo o servidor. "Você não pode consertar o que não pode medir". Tentar otimizar o Node.js sem profiling é como dirigir de olhos vendados.

Neste artigo, mergulharemos nas ferramentas de diagnóstico profissional: **Clinic.js**, **0x**, **Inspector Protocol** e técnicas avançadas como Worker Threads para tarefas intensivas de CPU.

#### 1. Entendendo o Event Loop e o Bloqueio

![Event Loop Visualization](./images/nodejs-performance-tuning/event-loop.png)

O Event Loop é o coração do Node.js. Se ele parar, tudo para.
Um erro comum é confundir tarefas assíncronas com tarefas paralelas. `Promise.resolve().then(() => expensiveCalculation())` ainda bloqueará a thread principal.

**Sintoma**: As verificações de integridade falham (timeout) mesmo que a CPU não esteja em 100%.
**Diagnóstico**: Monitore a métrica `eventLoopLag`. Se exceder 100ms, você está com problemas.

#### 2. Flamegraphs com 0x: Visualizando a CPU

Um Flamegraph diz exatamente onde sua CPU está gastando tempo.

- **Eixo X**: Tempo de CPU.
- **Eixo Y**: Profundidade da pilha.

Usamos `0x` para gerá-los com configuração zero em produção (ou staging com carga real):

```bash
# Capturar perfilado enquanto executa a carga
npx 0x -o -- node server.js
```

Se você vir "platôs" largos e planos em funções como `bcrypt.hashSync`, `crypto.pbkdf2` ou `JSON.parse` massivos, você encontrou seu gargalo. Essas funções são "sync" e monopolizam o V8.

#### 3. Worker Threads: Quebrando o Mito da Thread Única

Para tarefas intensivas de CPU (criptografia, compressão de imagens, cálculos matemáticos), a solução não é otimizar o algoritmo, é retirá-lo do Event Loop principal.

```typescript
// main.js
const { Worker } = require("worker_threads");

function runHeavyTask(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./worker.js", { workerData: data });
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}
```

#### 4. Vazamentos de Memória (Memory Leaks) e Heap Snapshots

Seu servidor trava por OOM (Out of Memory) a cada 2 dias como um relógio? Você tem um Memory Leak.
O Garbage Collector (GC) do V8 é excelente, mas não pode limpar referências que você mantém vivas acidentalmente.

**Culpados Comuns**:

1.  **Listeners Globais**: `process.on(...)` que nunca cancelam a inscrição.
2.  **Closures**: Variáveis retidas em contextos que não morrem.
3.  **Caches Ilimitados**: Um `Map` ou `Object` que só cresce.

**Solução**: Use `heapdump` ou conecte o Chrome DevTools à porta de inspeção.

1. Tire o Snapshot A (base).
2. Execute a carga.
3. Force o GC.
4. Tire o Snapshot B.
5. Compare. Procure por objetos "Detached" ou arrays que cresceram desproporcionalmente.

#### 5. Streaming: Lidando com Big Data

Carregar um CSV de 1 GB na memória com `fs.readFileSync` explodirá seu processo.
O Node.js brilha quando usamos **Streams**.

```typescript
// RUIM: Carrega tudo na RAM
const file = fs.readFileSync("big-data.csv");

// BOM: Processa pedaço por pedaço (Backpressure automático)
import { pipeline } from "stream/promises";
const readStream = fs.createReadStream("big-data.csv");
const transform = new Transform({
  /* lógica de parsing */
});
const writeStream = fs.createWriteStream("output.json");

await pipeline(readStream, transform, writeStream);
```

Otimizar Node.js não é magia negra; é ciência forense. Requer hipótese, medição e teste.
