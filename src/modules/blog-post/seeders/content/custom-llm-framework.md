### ESPAÑOL (ES)

Depender de APIs cerradas o frameworks genéricos como LangChain vanilla a menudo no es suficiente para productos empresariales que requieren latencia de milisegundos, privacidad de datos estricta y control granular sobre el contexto. Construir tu propio framework de LLM sobre Node.js y TypeScript te da control total sobre la orquestación, el caching y la gestión de costos.

#### 1. Abstracción del Modelo: El Patrón Provider

![LLM Framework](./images/custom-llm-framework/architecture.png)

El primer paso es desacoplar tu lógica de negocio del proveedor de IA (Vendor Lock-in).

```typescript
// src/ai/providers/base.provider.ts
export abstract class BaseAIProvider {
  abstract generateText(prompt: string, options?: GenerationOptions): Promise<string>;
  abstract generateEmbedding(text: string): Promise<number[]>;
}

// src/ai/providers/openai.provider.ts
export class OpenAIProvider extends BaseAIProvider {
  constructor(private client: OpenAI) { super(); }

  async generateText(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }]
    });
    return response.choices[0].message.content;
  }
}

// src/ai/providers/local.provider.ts (Llama 3 via Ollama)
export class OllamaProvider extends BaseAIProvider {
  async generateText(prompt: string): Promise<string> {
    // Call local Ollama API
    return axios.post('http://localhost:11434/api/generate', { ... });
  }
}
```

Esta arquitectura permite implementar **Circuit Breakers**: si OpenAI falla, el sistema conmuta automáticamente a Anthropic o un modelo local.

#### 2. Model Routing: Optimización de Costes y Latencia

No todas las tareas requieren GPT-4. Un router inteligente dirige el tráfico según la complejidad.

```typescript
// src/ai/router/model.router.ts
export class ModelRouter {
  constructor(
    private highIQ: BaseAIProvider, // GPT-4o
    private fastIQ: BaseAIProvider, // Claude Haiku / Llama 3
  ) {}

  async route(task: TaskType, prompt: string) {
    switch (task) {
      case "complex_reasoning":
      case "code_generation":
        return this.highIQ.generateText(prompt);

      case "summarization":
      case "classification":
        return this.fastIQ.generateText(prompt);

      default:
        // Fallback dinámico basado en longitud
        return prompt.length > 8000 ? this.highIQ : this.fastIQ;
    }
  }
}
```

#### 3. Caching Semántico con Drizzle y PGVector

¿Por qué pagar dos veces por la misma pregunta? Implementamos una caché semántica.

```typescript
// src/ai/cache/semantic.cache.ts
import { db } from "@db";
import { embeddingsTable } from "@db/schema";
import { cosineDistance, sql } from "drizzle-orm";

export async function getCachedResponse(
  prompt: string,
): Promise<string | null> {
  const promptEmbedding = await embeddingProvider.generate(prompt);

  // Buscar vector más cercano (threshold 0.95)
  const [match] = await db
    .select({
      response: embeddingsTable.response,
      similarity: sql<number>`1 - (${cosineDistance(embeddingsTable.vector, promptEmbedding)})`,
    })
    .from(embeddingsTable)
    .orderBy(
      sql`1 - (${cosineDistance(embeddingsTable.vector, promptEmbedding)}) DESC`,
    )
    .limit(1);

  if (match && match.similarity > 0.95) {
    console.log("Cache Hit! 🚀");
    return match.response;
  }

  return null;
}
```

#### 4. Guardrails y Sanitización (Zod)

Nunca confíes en la salida del LLM. Usamos Zod para forzar estructura y validar el contenido, abstraendo el "JSON Mode" que difiere entre proveedores.

```typescript
// src/ai/guardrails/structure.guard.ts
import { z } from "zod";

const sentimentSchema = z.object({
  sentiment: z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]),
  score: z.number().min(0).max(1),
  keywords: z.array(z.string()),
});

export async function analyzeSentiment(text: string) {
  // Prompt injection defense technique
  const prompt = `Analiza el siguiente texto delimitado por triple comillas.
  Responde SOLAMENTE con un objeto JSON válido que cumpla este esquema.
  
  Texto: """${text}"""`;

  const rawResponse = await aiProvider.generateText(prompt, { jsonMode: true });

  try {
    const json = JSON.parse(rawResponse);
    return sentimentSchema.parse(json); // Validación estrita
  } catch (e) {
    // Self-correction loop: Re-alimentamos el error al modelo
    console.warn("JSON malformado, reintentando con corrección...");
    return await retryWithCorrection(prompt, e.message);
  }
}
```

#### 5. Gestión de Memoria Dinámica (Context Pruning)

El contexto es caro y limitado. Un "Context Manager" inteligente no solo corta el historial, sino que lo resume o prioriza.

```typescript
// src/ai/context/context.manager.ts
import { enc } from "tiktoken";

export class ContextManager {
  private maxTokens = 4096;

  async pruneContext(history: Message[]): Promise<Message[]> {
    let currentTokens = this.countTokens(history);

    if (currentTokens <= this.maxTokens) return history;

    // Estrategia Senior: Resumir mensajes antiguos en lugar de eliminarlos
    const summary = await this.summarizerModel.generateText(
      `Resume esta conversación preservando entidades clave: ${JSON.stringify(history.slice(0, 5))}`,
    );

    return [
      { role: "system", content: `Resumen previo: ${summary}` },
      ...history.slice(5),
    ];
  }
}
```

#### Conclusión

Crear tu propio framework de LLM no es reinventar la rueda; es tomar el control del vehículo. Te permite optimizar el rendimiento mediante enrutamiento de modelos, reducir costes con caching semántico y asegurar la estabilidad con validación estricta de esquemas, algo que las librerías "caja negra" difícilmente pueden garantizar al nivel que una empresa requiere.

---

### ENGLISH (EN)

Relying on closed APIs or generic frameworks like vanilla LangChain is often not enough for enterprise products requiring millisecond latency, strict data privacy, and granular context control. Building your own LLM framework on top of Node.js and TypeScript gives you full control over orchestration, caching, and cost management.

#### 1. Model Abstraction: The Provider Pattern

![LLM Framework](./images/custom-llm-framework/architecture.png)

The first step is to decouple your business logic from the AI provider (Vendor Lock-in).

```typescript
// src/ai/providers/base.provider.ts
export abstract class BaseAIProvider {
  abstract generateText(prompt: string, options?: GenerationOptions): Promise<string>;
  abstract generateEmbedding(text: string): Promise<number[]>;
}

// src/ai/providers/openai.provider.ts
export class OpenAIProvider extends BaseAIProvider {
  constructor(private client: OpenAI) { super(); }

  async generateText(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }]
    });
    return response.choices[0].message.content;
  }
}

// src/ai/providers/local.provider.ts (Llama 3 via Ollama)
export class OllamaProvider extends BaseAIProvider {
  async generateText(prompt: string): Promise<string> {
    // Call local Ollama API
    return axios.post('http://localhost:11434/api/generate', { ... });
  }
}
```

This architecture allows implementing **Circuit Breakers**: if OpenAI fails, the system automatically switches to Anthropic or a local model.

#### 2. Model Routing: Cost and Latency Optimization

Not all tasks require GPT-4. A smart router directs traffic based on complexity.

```typescript
// src/ai/router/model.router.ts
export class ModelRouter {
  constructor(
    private highIQ: BaseAIProvider, // GPT-4o
    private fastIQ: BaseAIProvider, // Claude Haiku / Llama 3
  ) {}

  async route(task: TaskType, prompt: string) {
    switch (task) {
      case "complex_reasoning":
      case "code_generation":
        return this.highIQ.generateText(prompt);

      case "summarization":
      case "classification":
        return this.fastIQ.generateText(prompt);

      default:
        // Dynamic fallback based on length
        return prompt.length > 8000 ? this.highIQ : this.fastIQ;
    }
  }
}
```

#### 3. Semantic Caching with Drizzle and PGVector

Why pay twice for the same question? We implement a semantic cache.

```typescript
// src/ai/cache/semantic.cache.ts
import { db } from "@db";
import { embeddingsTable } from "@db/schema";
import { cosineDistance, sql } from "drizzle-orm";

export async function getCachedResponse(
  prompt: string,
): Promise<string | null> {
  const promptEmbedding = await embeddingProvider.generate(prompt);

  // Find nearest vector (threshold 0.95)
  const [match] = await db
    .select({
      response: embeddingsTable.response,
      similarity: sql<number>`1 - (${cosineDistance(embeddingsTable.vector, promptEmbedding)})`,
    })
    .from(embeddingsTable)
    .orderBy(
      sql`1 - (${cosineDistance(embeddingsTable.vector, promptEmbedding)}) DESC`,
    )
    .limit(1);

  if (match && match.similarity > 0.95) {
    console.log("Cache Hit! 🚀");
    return match.response;
  }

  return null;
}
```

#### 4. Guardrails and Sanitization (Zod)

Never trust LLM output. We use Zod to enforce structure and validate content, abstracting the "JSON Mode" that differs between providers.

```typescript
// src/ai/guardrails/structure.guard.ts
import { z } from "zod";

const sentimentSchema = z.object({
  sentiment: z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]),
  score: z.number().min(0).max(1),
  keywords: z.array(z.string()),
});

export async function analyzeSentiment(text: string) {
  // Prompt injection defense technique
  const prompt = `Analyze the following text delimited by triple quotes.
  Respond ONLY with a valid JSON object matching this schema.
  
  Text: """${text}"""`;

  const rawResponse = await aiProvider.generateText(prompt, { jsonMode: true });

  try {
    const json = JSON.parse(rawResponse);
    return sentimentSchema.parse(json); // Strict validation
  } catch (e) {
    // Self-correction loop: We feed the error back to the model
    console.warn("Malformed JSON, retrying with correction...");
    return await retryWithCorrection(prompt, e.message);
  }
}
```

#### 5. Dynamic Memory Management (Context Pruning)

Context is expensive and limited. A smart "Context Manager" not only cuts history but summarizes or prioritizes it.

```typescript
// src/ai/context/context.manager.ts
import { enc } from "tiktoken";

export class ContextManager {
  private maxTokens = 4096;

  async pruneContext(history: Message[]): Promise<Message[]> {
    let currentTokens = this.countTokens(history);

    if (currentTokens <= this.maxTokens) return history;

    // Senior Strategy: Summarize old messages instead of deleting them
    const summary = await this.summarizerModel.generateText(
      `Summarize this conversation preserving key entities: ${JSON.stringify(history.slice(0, 5))}`,
    );

    return [
      { role: "system", content: `Previous summary: ${summary}` },
      ...history.slice(5),
    ];
  }
}
```

#### Conclusion

Creating your own LLM framework is not reinventing the wheel; it is taking control of the vehicle. It allows you to optimize performance through model routing, reduce costs via smart caching, and ensure stability with strict schema validation, something that "black box" libraries can hardly guarantee at the level an enterprise requires.

---

### PORTUGUÊS (PT)

Depender de APIs fechadas ou frameworks genéricos como LangChain vanilla muitas vezes não é suficiente para produtos empresariais que exigem latência de milissegundos, privacidade de dados estrita e controle granular sobre o contexto. Construir seu próprio framework de LLM sobre Node.js e TypeScript oferece controle total sobre a orquestração, cache e gerenciamento de custos.

#### 1. Abstração de Modelo: O Padrão Provider

![LLM Framework](./images/custom-llm-framework/architecture.png)

O primeiro passo é desacoplar sua lógica de negócios do provedor de IA (Vendor Lock-in).

```typescript
// src/ai/providers/base.provider.ts
export abstract class BaseAIProvider {
  abstract generateText(prompt: string, options?: GenerationOptions): Promise<string>;
  abstract generateEmbedding(text: string): Promise<number[]>;
}

// src/ai/providers/openai.provider.ts
export class OpenAIProvider extends BaseAIProvider {
  constructor(private client: OpenAI) { super(); }

  async generateText(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }]
    });
    return response.choices[0].message.content;
  }
}

// src/ai/providers/local.provider.ts (Llama 3 via Ollama)
export class OllamaProvider extends BaseAIProvider {
  async generateText(prompt: string): Promise<string> {
    // Chamar API local do Ollama
    return axios.post('http://localhost:11434/api/generate', { ... });
  }
}
```

Essa arquitetura permite implementar **Circuit Breakers**: se a OpenAI falhar, o sistema muda automaticamente para a Anthropic ou um modelo local.

#### 2. Model Routing: Otimização de Custos e Latência

Nem todas as tarefas exigem GPT-4. Um roteador inteligente direciona o tráfego com base na complexidade.

```typescript
// src/ai/router/model.router.ts
export class ModelRouter {
  constructor(
    private highIQ: BaseAIProvider, // GPT-4o
    private fastIQ: BaseAIProvider, // Claude Haiku / Llama 3
  ) {}

  async route(task: TaskType, prompt: string) {
    switch (task) {
      case "complex_reasoning":
      case "code_generation":
        return this.highIQ.generateText(prompt);

      case "summarization":
      case "classification":
        return this.fastIQ.generateText(prompt);

      default:
        // Fallback dinâmico baseado no comprimento
        return prompt.length > 8000 ? this.highIQ : this.fastIQ;
    }
  }
}
```

#### 3. Cache Semântico com Drizzle e PGVector

Por que pagar duas vezes pela mesma pergunta? Implementamos um cache semântico.

```typescript
// src/ai/cache/semantic.cache.ts
import { db } from "@db";
import { embeddingsTable } from "@db/schema";
import { cosineDistance, sql } from "drizzle-orm";

export async function getCachedResponse(
  prompt: string,
): Promise<string | null> {
  const promptEmbedding = await embeddingProvider.generate(prompt);

  // Encontrar vetor mais próximo (limiar 0.95)
  const [match] = await db
    .select({
      response: embeddingsTable.response,
      similarity: sql<number>`1 - (${cosineDistance(embeddingsTable.vector, promptEmbedding)})`,
    })
    .from(embeddingsTable)
    .orderBy(
      sql`1 - (${cosineDistance(embeddingsTable.vector, promptEmbedding)}) DESC`,
    )
    .limit(1);

  if (match && match.similarity > 0.95) {
    console.log("Cache Hit! 🚀");
    return match.response;
  }

  return null;
}
```

#### 4. Guardrails e Sanitização (Zod)

Nunca confie na saída do LLM. Usamos Zod para forçar estrutura e validar o conteúdo, abstraindo o "Modo JSON" que difere entre os provedores.

```typescript
// src/ai/guardrails/structure.guard.ts
import { z } from "zod";

const sentimentSchema = z.object({
  sentiment: z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]),
  score: z.number().min(0).max(1),
  keywords: z.array(z.string()),
});

export async function analyzeSentiment(text: string) {
  // Técnica de defesa contra injeção de prompt
  const prompt = `Analise o seguinte texto delimitado por aspas triplas.
  Responda APENAS com um objeto JSON válido que corresponda a este esquema.
  
  Texto: """${text}"""`;

  const rawResponse = await aiProvider.generateText(prompt, { jsonMode: true });

  try {
    const json = JSON.parse(rawResponse);
    return sentimentSchema.parse(json); // Validação estrita
  } catch (e) {
    // Loop de autocorreção: enviamos o erro de volta ao modelo
    console.warn("JSON malformado, tentando novamente com correção...");
    return await retryWithCorrection(prompt, e.message);
  }
}
```

#### 5. Gerenciamento de Memória Dinâmica (Context Pruning)

O contexto é caro e limitado. Um "Context Manager" inteligente não apenas corta o histórico, mas o resume ou prioriza.

```typescript
// src/ai/context/context.manager.ts
import { enc } from "tiktoken";

export class ContextManager {
  private maxTokens = 4096;

  async pruneContext(history: Message[]): Promise<Message[]> {
    let currentTokens = this.countTokens(history);

    if (currentTokens <= this.maxTokens) return history;

    // Estratégia Sênior: Resumir mensagens antigas em vez de excluí-las
    const summary = await this.summarizerModel.generateText(
      `Resuma esta conversa preservando entidades-chave: ${JSON.stringify(history.slice(0, 5))}`,
    );

    return [
      { role: "system", content: `Resumo anterior: ${summary}` },
      ...history.slice(5),
    ];
  }
}
```

#### Conclusão

Criar seu próprio framework de LLM não é reinventar a roda; é assumir o controle do veículo. Permite otimizar o desempenho por meio do roteamento de modelos, reduzir custos com cache inteligente e garantir a estabilidade com validação estrita de esquemas, algo que as bibliotecas "caixa preta" dificilmente podem garantir no nível que uma empresa exige.
