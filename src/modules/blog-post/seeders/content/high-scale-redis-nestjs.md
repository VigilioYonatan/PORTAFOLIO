### ESPAÑOL (ES)

El escalado de infraestructuras de alto rendimiento no es solo una cuestión de añadir más nodos de computación; es, sobre todo, un desafío de gestión del estado y latencia. En aplicaciones críticas construidas con NestJS, Redis deja de ser un simple "caché" para convertirse en la columna vertebral de la sincronización distribuida, la gestión de colas de alta prioridad y la persistencia de sesión global. Un ingeniero senior sabe que un solo nodo de Redis es un punto único de fallo y un cuello de botella potencial. En este artículo, profundizaremos en cómo implementar un clúster de Redis resiliente y patrones avanzados de NestJS para manejar millones de operaciones por segundo con latencias de microsegundos.

#### 1. Arquitectura de Redis: Del Nodo Único al Clúster Sharding

![Redis Cluster](./images/high-scale-redis-nestjs/cluster.png)

La primera decisión arquitectónica es elegir entre Redis Sentinel y Redis Cluster. Mientras que Sentinel ofrece alta disponibilidad a través de la monitorización y el failover automático, Redis Cluster proporciona sharding horizontal natural. En entornos de nivel Enterprise, preferimos Redis Cluster porque nos permite distribuir los datos en múltiples nodos principales, superando el límite de memoria de un solo servidor y permitiendo el escalado lineal.

Implementar esto en NestJS requiere una abstracción sólida sobre el cliente `ioredis`. El patrón Factory de NestJS es ideal aquí para inyectar una instancia de clúster configurada dinámicamente según el entorno.

```typescript
// redis.provider.ts
import { Provider } from "@nestjs/common";
import Redis from "ioredis";
import { ConfigService } from "@nestjs/config";

export const REDIS_CLIENT = "REDIS_CLIENT";

export const RedisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: async (configService: ConfigService) => {
    // REDIS_NODES=host1:6379,host2:6379,host3:6379
    const nodes = configService.get<string>("REDIS_NODES").split(",");

    return new Redis.Cluster(
      nodes.map((node) => ({
        host: node.split(":")[0],
        port: parseInt(node.split(":")[1], 10),
      })),
      {
        redisOptions: {
          password: configService.get("REDIS_PASSWORD"),
          tls: configService.get("NODE_ENV") === "production" ? {} : undefined,
          // Evitamos que la conexión se cierre prematuramente en picos de latencia
          commandTimeout: 500,
          enableAutoPipelining: true,
        },
        clusterRetryStrategy(times) {
          // Backoff exponencial para reconexión
          return Math.min(times * 100, 3000);
        },
        // Distribución inteligente de lecturas a esclavos si es necesario
        scaleReads: "slave",
      },
    );
  },
  inject: [ConfigService],
};
```

#### 2. Patrones de Caché Avanzados: Cache-Aside vs Write-Through

Un senior no se limita a usar `@CacheKey()`. Entiende cuándo aplicar cada estrategia.

El patrón **Cache-Aside** (Lazy Loading) es el más común: la aplicación consulta el caché y, si hay un "miss", consulta la base de datos y luego actualiza el caché. Es resiliente a fallos de caché pero puede servir datos obsoletos brevemente.

Para datos financieros o de inventario en tiempo real, el patrón **Write-Through** es superior. Aquí, la aplicación escribe en el caché y en la base de datos simultáneamente (o el caché se encarga de escribir en la DB). Esto garantiza consistencia fuerte.

**Estrategia de Invalidación Orientada a Eventos:**
El error más común es confiar solo en TTL (Time To Live). Un arquitecto senior implementa invalidación activa. Usando los hooks de Drizzle ORM, podemos emitir eventos tras una mutación.

```typescript
// users.service.ts
async updateUser(id: string, data: UpdateUserDto) {
  await this.db.update(users).set(data).where(eq(users.id, id));

  // Inmediatamente invalidamos o actualizamos el caché
  await this.redis.del(`user:${id}`);

  // O mejor aún, usamos el patrón "Double Delete" para mitigar condiciones de carrera
  // 1. Delete caché
  // 2. Update DB
  // 3. Delete caché again (delayed)
}
```

#### 3. Atomicidad y Lua Scripts: Más allá del GET/SET

Cuando necesitas realizar operaciones complejas de forma atómica (por ejemplo, verificar inventario y decrementarlo solo si es suficiente), múltiples llamadas de red son ineficientes y peligrosas. Redis permite ejecutar scripts Lua en el servidor, garantizando atomicidad total.

```typescript
// inventory.service.ts
const DECREMENT_STOCK_SCRIPT = `
  local stock = tonumber(redis.call('get', KEYS[1]))
  local amount = tonumber(ARGV[1])
  if stock >= amount then
    redis.call('decrby', KEYS[1], amount)
    return 1
  else
    return 0
  end
`;

async reserveStock(productId: string, quantity: number): Promise<boolean> {
  const result = await this.redis.eval(
    DECREMENT_STOCK_SCRIPT,
    1,
    `product:${productId}:stock`,
    quantity
  );
  return result === 1;
}
```

Este script se ejecuta como una sola operación, eliminando la posibilidad de que otro proceso modifique el stock "a mitad de camino".

#### 4. Pipelining: Reduciendo el RTT

En escenarios de alta carga, la latencia de red (Round Trip Time) es el enemigo. Si tienes que ejecutar 50 comandos, esperar la respuesta de uno para enviar el siguiente es inaceptable.

Redis Pipelining permite enviar múltiples comandos al servidor sin esperar las respuestas individuales, y luego leerlas todas juntas. En `ioredis`, esto es trivial pero poderoso:

```typescript
async trackPageViews(events: PageViewEvent[]) {
  const pipeline = this.redis.pipeline();

  events.forEach(event => {
    pipeline.hincrby(`stats:day:${event.date}`, event.page, 1);
    pipeline.sadd(`users:day:${event.date}`, event.userId);
  });

  // Un solo viaje a la red para cientos de operaciones
  await pipeline.exec();
}
```

Esto puede incrementar el throughput por un factor de 10x en redes con latencia moderada.

#### 5. Colas de Trabajo Resilientes con BullMQ

Redis no es solo para caché. Es el motor ideal para colas de tareas asíncronas. En NestJS, la integración con BullMQ es estándar, pero la configuración por defecto no es suficiente para producción.

**Patrón de Arquitectura Sandbox:**
Para evitar que un proceso de trabajo bloquee el Event Loop de Node.js, ejecutamos los workers en hilos separados (Sandboxed Processors).

```typescript
// audio-transcode.processor.ts
import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";

@Processor("audio-transcoding")
export class AudioTranscodeProcessor {
  @Process({ name: "transcode", concurrency: 5 }) // Procesar 5 en paralelo
  async handleTranscode(job: Job) {
    try {
      await externalFfmpegService.process(job.data.file);
      return { status: "completed" };
    } catch (error) {
      // BullMQ reintentará automáticamente con backoff exponencial
      throw error;
    }
  }
}
```

La clave aquí es la configuración de reintentos y la gestión de "stalled jobs" (trabajos que parecen colgados porque el worker murió). Configurar `lockDuration` y `maxStalledCount` es vital para la resiliencia.

#### 6. Seguridad y Listas de Control de Acceso (ACL)

Desde Redis 6, no estamos limitados a una sola contraseña global. Podemos y debemos usar ACLs para restringir qué comandos pueden ejecutar ciertos servicios.

- El servicio de **Analytics** solo necesita permisos de `WRITE` en claves `stats:*`.
- El servicio de **Frontend** solo necesita permisos de `READ` en `cache:public:*`.

Configurar esto previene que un bug en un microservicio limpie (`FLUSHALL`) toda la base de datos por accidente.

```bash
# Ejemplo de ACL en redis.conf
user analytics_service on >securepass ~stats:* +@write -@hazardous
```

#### Conclusión

Dominar Redis en un entorno de NestJS va mucho más allá de `cacheManager.get()`. Implica entender la topología de red, la serialización de datos, la gestión de concurrencia y la tolerancia a fallos. Al implementar clústeres shardeados, scripts Lua atómicos y estrategias de pipelining, transformamos Redis de un simple almacén temporal en un motor de alto rendimiento crítico para la infraestructura moderna.

---

### ENGLISH (EN)

Scaling high-performance infrastructures is not just a matter of adding more compute nodes; it is, above all, a challenge of state management and latency. In critical applications built with NestJS, Redis ceases to be a simple "cache" and becomes the backbone of distributed synchronization, high-priority queue management, and global session persistence. A senior engineer knows that a single Redis node is a single point of failure and a potential bottleneck. In this article, we will delve into how to implement a resilient Redis cluster and advanced NestJS patterns to handle millions of operations per second with microsecond latencies.

#### 1. Redis Architecture: From Single Node to Cluster Sharding

![Redis Cluster](./images/high-scale-redis-nestjs/cluster.png)

The first architectural decision is choosing between Redis Sentinel and Redis Cluster. While Sentinel offers high availability through monitoring and automatic failover, Redis Cluster provides natural horizontal sharding. In Enterprise-level environments, we prefer Redis Cluster because it allows us to distribute data across multiple primary nodes, exceeding the memory limit of a single server and allowing for linear scaling.

Implementing this in NestJS requires a solid abstraction over the `ioredis` client. The NestJS Factory pattern is ideal here to inject a dynamically configured cluster instance based on the environment.

```typescript
// redis.provider.ts
import { Provider } from "@nestjs/common";
import Redis from "ioredis";
import { ConfigService } from "@nestjs/config";

export const REDIS_CLIENT = "REDIS_CLIENT";

export const RedisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: async (configService: ConfigService) => {
    // REDIS_NODES=host1:6379,host2:6379,host3:6379
    const nodes = configService.get<string>("REDIS_NODES").split(",");

    return new Redis.Cluster(
      nodes.map((node) => ({
        host: node.split(":")[0],
        port: parseInt(node.split(":")[1], 10),
      })),
      {
        redisOptions: {
          password: configService.get("REDIS_PASSWORD"),
          tls: configService.get("NODE_ENV") === "production" ? {} : undefined,
          // Prevent connection closure on latency spikes
          commandTimeout: 500,
          enableAutoPipelining: true,
        },
        clusterRetryStrategy(times) {
          // Exponential backoff for reconnection
          return Math.min(times * 100, 3000);
        },
        // Smart read distribution to slaves if needed
        scaleReads: "slave",
      },
    );
  },
  inject: [ConfigService],
};
```

#### 2. Advanced Caching Patterns: Cache-Aside vs Write-Through

A senior engineer isn't limited to using `@CacheKey()`. They understand when to apply each strategy.

The **Cache-Aside** (Lazy Loading) pattern is the most common: the application queries the cache, and if there is a "miss," queries the database, then updates the cache. It is resilient to cache failures but may momentarily serve stale data.

For real-time financial or inventory data, the **Write-Through** pattern is superior. Here, the application writes to the cache and the database simultaneously (or the cache handles writing to the DB). This guarantees strong consistency.

**Event-Driven Invalidation Strategy:**
The most common mistake is relying solely on TTL (Time To Live). A senior architect implements active invalidation. Using Drizzle ORM hooks, we can emit events after a mutation.

```typescript
// users.service.ts
async updateUser(id: string, data: UpdateUserDto) {
  await this.db.update(users).set(data).where(eq(users.id, id));

  // Immediately invalidate or update the cache
  await this.redis.del(`user:${id}`);

  // Or better yet, use the "Double Delete" pattern to mitigate race conditions
  // 1. Delete cache
  // 2. Update DB
  // 3. Delete cache again (delayed)
}
```

#### 3. Atomicity and Lua Scripts: Beyond GET/SET

When you need to perform complex operations atomically (e.g., checking inventory and decrementing only if sufficient), multiple network calls are inefficient and dangerous. Redis allows executing Lua scripts on the server, guaranteeing total atomicity.

```typescript
// inventory.service.ts
const DECREMENT_STOCK_SCRIPT = `
  local stock = tonumber(redis.call('get', KEYS[1]))
  local amount = tonumber(ARGV[1])
  if stock >= amount then
    redis.call('decrby', KEYS[1], amount)
    return 1
  else
    return 0
  end
`;

async reserveStock(productId: string, quantity: number): Promise<boolean> {
  const result = await this.redis.eval(
    DECREMENT_STOCK_SCRIPT,
    1,
    `product:${productId}:stock`,
    quantity
  );
  return result === 1;
}
```

This script executes as a single operation, eliminating the possibility of another process modifying the stock "midway."

#### 4. Pipelining: Reducing RTT

In high-load scenarios, network latency (Round Trip Time) is the enemy. If you execute 50 commands, waiting for one response before sending the next is unacceptable.

Redis Pipelining allows sending multiple commands to the server without waiting for individual responses, and then reading them all together. In `ioredis`, this is trivial but powerful:

```typescript
async trackPageViews(events: PageViewEvent[]) {
  const pipeline = this.redis.pipeline();

  events.forEach(event => {
    pipeline.hincrby(`stats:day:${event.date}`, event.page, 1);
    pipeline.sadd(`users:day:${event.date}`, event.userId);
  });

  // A single network trip for hundreds of operations
  await pipeline.exec();
}
```

This can increase throughput by a factor of 10x on networks with moderate latency.

#### 5. Resilient Job Queues with BullMQ

Redis is not just for caching. It is the ideal engine for asynchronous task queues. In NestJS, integration with BullMQ is standard, but the default configuration is insufficient for production.

**Sandboxed Architecture Pattern:**
To prevent a worker process from blocking the Node.js Event Loop, we run workers in separate threads (Sandboxed Processors).

```typescript
// audio-transcode.processor.ts
import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";

@Processor("audio-transcoding")
export class AudioTranscodeProcessor {
  @Process({ name: "transcode", concurrency: 5 }) // Process 5 in parallel
  async handleTranscode(job: Job) {
    try {
      await externalFfmpegService.process(job.data.file);
      return { status: "completed" };
    } catch (error) {
      // BullMQ will automatically retry with exponential backoff
      throw error;
    }
  }
}
```

The key here is retry configuration and handling "stalled jobs" (jobs that appear hung because the worker died). Configuring `lockDuration` and `maxStalledCount` is vital for resilience.

#### 6. Security and Access Control Lists (ACL)

Since Redis 6, we are not limited to a single global password. We can and should use ACLs to restrict which commands certain services can execute.

- The **Analytics** service only needs `WRITE` permissions on `stats:*` keys.
- The **Frontend** service only needs `READ` permissions on `cache:public:*`.

Configuring this prevents a bug in a microservice from accidentally clearing (`FLUSHALL`) the entire database.

```bash
# Example ACL in redis.conf
user analytics_service on >securepass ~stats:* +@write -@hazardous
```

#### Conclusion

Mastering Redis in a NestJS environment goes far beyond `cacheManager.get()`. It involves understanding network topology, data serialization, concurrency management, and fault tolerance. By implementing sharded clusters, atomic Lua scripts, and pipelining strategies, we transform Redis from a simple temporary store into a high-performance engine critical for modern infrastructure.

---

### PORTUGUÊS (PT)

Escalar infraestruturas de alto desempenho não é apenas uma questão de adicionar mais nós de computação; é, acima de tudo, um desafio de gerenciamento de estado e latência. Em aplicações críticas construídas com NestJS, o Redis deixa de ser um simples "cache" para se tornar a espinha dorsal da sincronização distribuída, gerenciamento de filas de alta prioridade e persistência de sessão global. Um engenheiro sênior sabe que um único nó Redis é um ponto único de falha e um potencial gargalo. Neste artigo, aprofundaremos como implementar um cluster Redis resiliente e padrões NestJS avançados para lidar com milhões de operações por segundo com latências de microssegundos.

#### 1. Arquitetura Redis: Do Nó Único ao Cluster Sharding

![Redis Cluster](./images/high-scale-redis-nestjs/cluster.png)

A primeira decisão arquitetônica é escolher entre Redis Sentinel e Redis Cluster. Enquanto o Sentinel oferece alta disponibilidade por meio de monitoramento e failover automático, o Redis Cluster fornece sharding horizontal natural. Em ambientes de nível Enterprise, preferimos o Redis Cluster porque ele nos permite distribuir dados em vários nós principais, superando o limite de memória de um único servidor e permitindo o escalonamento linear.

Implementar isso no NestJS requer uma abstração sólida sobre o cliente `ioredis`. O padrão Factory do NestJS é ideal aqui para injetar uma instância de cluster configurada dinamicamente de acordo com o ambiente.

```typescript
// redis.provider.ts
import { Provider } from "@nestjs/common";
import Redis from "ioredis";
import { ConfigService } from "@nestjs/config";

export const REDIS_CLIENT = "REDIS_CLIENT";

export const RedisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: async (configService: ConfigService) => {
    // REDIS_NODES=host1:6379,host2:6379,host3:6379
    const nodes = configService.get<string>("REDIS_NODES").split(",");

    return new Redis.Cluster(
      nodes.map((node) => ({
        host: node.split(":")[0],
        port: parseInt(node.split(":")[1], 10),
      })),
      {
        redisOptions: {
          password: configService.get("REDIS_PASSWORD"),
          tls: configService.get("NODE_ENV") === "production" ? {} : undefined,
          // Evitamos que a conexão feche prematuramente em picos de latência
          commandTimeout: 500,
          enableAutoPipelining: true,
        },
        clusterRetryStrategy(times) {
          // Backoff exponencial para reconexão
          return Math.min(times * 100, 3000);
        },
        // Distribuição inteligente de leituras para slaves se necessário
        scaleReads: "slave",
      },
    );
  },
  inject: [ConfigService],
};
```

#### 2. Padrões de Cache Avançados: Cache-Aside vs Write-Through

Um sênior não se limita a usar `@CacheKey()`. Ele entende quando aplicar cada estratégia.

O padrão **Cache-Aside** (Carregamento Preguiçoso) é o mais comum: a aplicação consulta o cache e, se houver um "miss", consulta o banco de dados e depois atualiza o cache. É resiliente a falhas de cache, mas pode servir dados obsoletos brevemente.

Para dados financeiros ou de inventário em tempo real, o padrão **Write-Through** é superior. Aqui, a aplicação grava no cache e no banco de dados simultaneamente (ou o cache se encarrega de gravar no DB). Isso garante consistência forte.

**Estratégia de Invalidação Orientada a Eventos:**
O erro mais comum é confiar apenas no TTL (Time To Live). Um arquiteto sênior implementa invalidação ativa. Usando os hooks do Drizzle ORM, podemos emitir eventos após uma mutação.

```typescript
// users.service.ts
async updateUser(id: string, data: UpdateUserDto) {
  await this.db.update(users).set(data).where(eq(users.id, id));

  // Imediatamente invalidamos ou atualizamos o cache
  await this.redis.del(`user:${id}`);

  // Ou melhor ainda, usamos o padrão "Double Delete" para mitigar condições de corrida
  // 1. Delete cache
  // 2. Update DB
  // 3. Delete cache again (delayed)
}
```

#### 3. Atomicidade e Lua Scripts: Além do GET/SET

Quando você precisa realizar operações complexas de forma atômica (por exemplo, verificar estoque e decrementar apenas se for suficiente), múltiplas chamadas de rede são ineficientes e perigosas. O Redis permite executar scripts Lua no servidor, garantindo atomicidade total.

```typescript
// inventory.service.ts
const DECREMENT_STOCK_SCRIPT = `
  local stock = tonumber(redis.call('get', KEYS[1]))
  local amount = tonumber(ARGV[1])
  if stock >= amount then
    redis.call('decrby', KEYS[1], amount)
    return 1
  else
    return 0
  end
`;

async reserveStock(productId: string, quantity: number): Promise<boolean> {
  const result = await this.redis.eval(
    DECREMENT_STOCK_SCRIPT,
    1,
    `product:${productId}:stock`,
    quantity
  );
  return result === 1;
}
```

Este script é executado como uma única operação, eliminando a possibilidade de outro processo modificar o estoque "no meio do caminho".

#### 4. Pipelining: Reduzindo o RTT

Em cenários de alta carga, a latência de rede (Round Trip Time) é o inimigo. Se você tiver que executar 50 comandos, esperar a resposta de um para enviar o próximo é inaceitável.

O Redis Pipelining permite enviar vários comandos ao servidor sem esperar pelas respostas individuais e, em seguida, ler todas juntas. No `ioredis`, isso é trivial, mas poderoso:

```typescript
async trackPageViews(events: PageViewEvent[]) {
  const pipeline = this.redis.pipeline();

  events.forEach(event => {
    pipeline.hincrby(`stats:day:${event.date}`, event.page, 1);
    pipeline.sadd(`users:day:${event.date}`, event.userId);
  });

  // Uma única viagem à rede para centenas de operações
  await pipeline.exec();
}
```

Isso pode aumentar o throughput por um fator de 10x em redes com latência moderada.

#### 5. Filas de Trabalho Resilientes com BullMQ

O Redis não é apenas para cache. É o motor ideal para filas de tarefas assíncronas. No NestJS, a integração com o BullMQ é padrão, mas a configuração padrão não é suficiente para produção.

**Padrão de Arquitetura Sandbox:**
Para evitar que um processo de worker bloqueie o Event Loop do Node.js, executamos os workers em threads separadas (Sandboxed Processors).

```typescript
// audio-transcode.processor.ts
import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";

@Processor("audio-transcoding")
export class AudioTranscodeProcessor {
  @Process({ name: "transcode", concurrency: 5 }) // Processar 5 em paralelo
  async handleTranscode(job: Job) {
    try {
      await externalFfmpegService.process(job.data.file);
      return { status: "completed" };
    } catch (error) {
      // BullMQ tentará novamente automaticamente com backoff exponencial
      throw error;
    }
  }
}
```

A chave aqui é a configuração de novas tentativas e o gerenciamento de "stalled jobs" (trabalhos que parecem travados porque o worker morreu). Configurar `lockDuration` e `maxStalledCount` é vital para a resiliência.

#### 6. Segurança e Listas de Controle de Acesso (ACL)

Desde o Redis 6, não estamos limitados a uma única senha global. Podemos e devemos usar ACLs para restringir quais comandos determinados serviços podem executar.

- O serviço de **Analytics** só precisa de permissões `WRITE` em chaves `stats:*`.
- O serviço de **Frontend** só precisa de permissões `READ` em `cache:public:*`.

Configurar isso impede que um bug em um microsserviço limpe (`FLUSHALL`) todo o banco de dados acidentalmente.

```bash
# Exemplo de ACL em redis.conf
user analytics_service on >securepass ~stats:* +@write -@hazardous
```

#### Conclusão

Dominar o Redis em um ambiente NestJS vai muito além de `cacheManager.get()`. Envolve entender a topologia de rede, a serialização de dados, o gerenciamento de concorrência e a tolerância a falhas. Ao implementar clusters shardeados, scripts Lua atômicos e estratégias de pipelining, transformamos o Redis de um simples armazenamento temporário em um motor de alto desempenho crítico para a infraestrutura moderna.
