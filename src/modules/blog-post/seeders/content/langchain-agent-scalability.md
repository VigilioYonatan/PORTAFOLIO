### ESPAÑOL (ES)

Construir un script de Python que corre un agente en tu laptop es divertido ("Mira, ¡puede buscar en Google!"). Desplegar ese mismo agente para que soporte 10,000 usuarios concurrentes sin que alucine, pierda el contexto o quiebre tu base de datos es un desafío de ingeniería de sistemas distribuidos de primer nivel.

Los LLMs son, por definición, _stateless_ (sin estado). Pero los Agentes son _stateful_. Tienen "memoria" (el historial de chat) y "estado de ejecución" (en qué paso del plan van, qué herramienta intentaron llamar, cuál fue el error).
Gestionar este estado en una arquitectura de microservicios efímeros (Kubernetes/Fargate) requiere un cambio de mentalidad fundamental: de cadenas lineales a grafos persistentes y sistemas multi-agente orquestados.

#### 1. De LangChain Chains a LangGraph: Modelando Ciclos

![Agent Scalability](./images/langchain-agent-scalability/scaling.png)

LangChain "clásico" operaba como un DAG (Grafo Acíclico Dirigido). Esto funciona para tareas simples ("Prompt -> LLM -> Parser").
Pero los agentes autónomos necesitan **bucles (loops)**: "Pensar -> Actuar -> Observar -> Error -> Corregir -> Actuar...".

**LangGraph** introduce el concepto de `StateGraph`.

```typescript
// agent.graph.ts
import { StateGraph, END } from "@langchain/langgraph";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

// 1. Definimos el Schema del Estado Global
interface AgentState {
  messages: AnyMessage[];
  context: Record<string, any>;
  steps: number;
}

// 2. Definimos los Nodos (Funciones Puras)
async function callModel(state: AgentState) {
  const response = await model.invoke(state.messages);
  return { messages: [response], steps: state.steps + 1 };
}

async function executeTools(state: AgentState) {
  // ...lógica de ejecución de herramientas...
  return { messages: [toolOutput] };
}

// 3. Definimos la Lógica de Transición (Edges)
const shouldContinue = (state: AgentState) => {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return END;
};

// 4. Compilamos el Grafo
export const workflow = new StateGraph<AgentState>({
  channels: {
    messages: { reducer: (a, b) => a.concat(b) }, // Reducer tipo Redux
    steps: { reducer: (a, b) => b }, // Last Write Wins
    context: { reducer: (a, b) => ({ ...a, ...b }) },
  },
})
  .addNode("agent", callModel)
  .addNode("tools", executeTools)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent"); // Ciclo de vuelta al agente
```

#### 2. La Pesadilla del Estado en Servidores Stateless

Si despliegas el grafo anterior en un Pod de Kubernetes detrás de un Load Balancer, te enfrentarás al "brain split":

1.  **Request 1**: Usuario dice "Hola". Llega al Pod A. El Agente actualiza su memoria en RAM (Pod A).
2.  **Request 2**: Usuario dice "Busca vuelos". Llega al Pod B.
3.  **Error**: El Pod B no tiene la memoria del Pod A. El agente responde "¿Quién eres?".

**Solución: Patrón de Externalización de Estado (Checkpointing)**

LangGraph implementa el patrón de **Checkpointers**. Después de _cada nodo_, el estado del grafo se serializa y se guarda en una base de datos duradera (Postgres, Redis).

```typescript
import { PostgresCheckpointSaver } from "@langchain/checkpoint-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Importante: Connection Pooling para soportar alta concurrencia
});
const checkpointer = new PostgresCheckpointSaver(pool);

// El grafo compilado interactúa automáticamente con DB
export const app = workflow.compile({ checkpointer });

/* 
  Uso en el Controller (Stateless):
  Pasamos un 'thread_id' que actúa como la Session Key.
*/
const finalState = await app.invoke(
  { messages: [new HumanMessage("Reserva un vuelo a Madrid")] },
  { configurable: { thread_id: "user_session_123" } },
);
```

Esto permite que el Pod A procese el paso 1, muera (OOMKilled), y el Pod B retome el paso 2 exactamente donde se quedó, recuperando el stack trace completo desde Postgres.

#### 3. Human-in-the-Loop Distribuido y Persistencia a Largo Plazo

En entornos empresariales, los agentes no pueden tener "carte blanche". Necesitan aprobación humana para acciones sensibles (ej: "Reembolsar $500", "Borrar Base de Datos").

En un script local, harías `input("¿Aprobar? [y/n]")`. En un servidor web asíncrono, eso bloquearía el hilo de Node.js para siempre.

Con LangGraph + Checkpointing, modelamos esto como una **Interrupción**:

1.  Configuramos un `interruptBefore: ['approve_tools_node']`.
2.  El agente ejecuta su lógica hasta llegar a ese nodo.
3.  LangGraph detecta la interrupción, **guarda el estado en DB**, y devuelve el control.
4.  El servidor responde HTTP 202 ("Esperando Aprobación").
5.  Horas (o días) después, un administrador llama al endpoint `/api/approve`.
6.  Cargamos el estado del thread, inyectamos la aprobación, y llamamos a `stream()` de nuevo. El agente continúa _como si nunca se hubiera detenido_.

#### 4. Patrón Supervisor: Orquestando Multi-Agentes

Para tareas realmente complejas, un solo agente generalista falla. La arquitectura moderna utiliza un **Agente Supervisor** que delega tareas a agentes especialistas (Coder, Researcher, Reviewer).

```typescript
// supervisor.node.ts
const supervisorPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "Eres un supervisor. Tu tarea es delegar entre: [Researcher, Coder]. Si terminaron, responde FINISH.",
  ],
  new MessagesPlaceholder("messages"),
  [
    "system",
    "Elige el siguiente trabajador. Responde con el nombre del worker o FINISH.",
  ],
]);

// El Supervisor enruta dinámicamente el flujo
const supervisorChain = supervisorPrompt
  .pipe(llm)
  .pipe(new JsonOutputToolsParser());

// En el grafo:
workflow.addConditionalEdges("supervisor", (x) => x.next_worker);
```

Este patrón permite escalar la "inteligencia" horizontalmente: puedes tener 5 agentes especializados trabajando en paralelo en subgrafos distintos.

#### 5. Observabilidad en Producción con LangSmith

Cuando un agente falla en producción, "mirar los logs" no sirve. Los logs son texto plano; los agentes son árboles de ejecución no deterministas.

Necesitas **Tracing Distribuido**. LangSmith (o soluciones OpenTelemetry como Jaeger) permite visualizar:

- **Latencia por paso**: ¿Es el modelo el lento o es la herramienta de búsqueda?
- **Costos de tokens**: ¿Cuánto costó esa consulta recursiva de 10 pasos?
- **Dataset de Evaluación**: Guardar trazas fallidas para convertirlas en tests de regresión (Few-Shot Examples).

```typescript
// Habilitar tracing es tan simple como setear env vars
process.env.LANGCHAIN_TRACING_V2 = "true";
process.env.LANGCHAIN_API_KEY = "ls__...";

// Ahora cada invoke() envía telemetría asíncrona sin bloquear la respuesta
```

#### 6. Streaming de Tokens para UX Real-Time

Un agente ReAct complejo puede tardar 45 segundos en pensar, usar herramientas y responder. El usuario promedio abandona a los 3 segundos si no ve actividad.
Es obligatorio implementar **Server-Sent Events (SSE)** para hacer streaming de:

1.  Tokens de pensamiento (para debug o UI avanzada).
2.  Logs de uso de herramientas ("Buscando en Google...", "Leyendo PDF...").
3.  Tokens de respuesta final.

```typescript
// app/api/chat/route.ts (Next.js App Router)
export async function POST(req: Request) {
  const { messages, threadId } = await req.json();

  const stream = await app.streamEvents(
    { messages },
    { configurable: { thread_id: threadId }, version: "v1" },
  );

  const enc = new TextEncoder();

  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          // Filtramos eventos relevantes para el frontend
          if (event.event === "on_chat_model_stream") {
            controller.enqueue(
              enc.encode(`data: ${JSON.stringify(event.data.chunk)}\n\n`),
            );
          }
        }
        controller.close();
      },
    }),
    { headers: { "Content-Type": "text/event-stream" } },
  );
}
```

Escalar agentes de IA no es un problema de "Prompt Engineering". Es un problema clásico de **Ingeniería de Sistemas Distribuidos**: gestión de estado, concurrencia, persistencia y latencia.

---

### ENGLISH (EN)

Building a Python script that runs an agent on your laptop is fun ("Look, it can search Google!"). Deploying that same agent to support 10,000 concurrent users without hallucinating, losing context, or crashing your database is a top-tier distributed systems engineering challenge.

LLMs are by definition _stateless_. But Agents are _stateful_. They have "memory" (chat history) and "execution state" (which step of the plan they are on, which tool they tried to call, what the error was).
Managing this state in an ephemeral microservices architecture (Kubernetes/Fargate) requires a fundamental mindset shift: from linear chains to persistent graphs and orchestrated multi-agent systems.

#### 1. From LangChain Chains to LangGraph: Modeling Cycles

![Agent Scalability](./images/langchain-agent-scalability/scaling.png)

"Classic" LangChain operated as a DAG (Directed Acyclic Graph). This works for simple tasks ("Prompt -> LLM -> Parser").
But autonomous agents need **loops**: "Think -> Act -> Observe -> Error -> Correct -> Act...".

**LangGraph** introduces the concept of `StateGraph`.

```typescript
// agent.graph.ts
import { StateGraph, END } from "@langchain/langgraph";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

// 1. Define Global State Schema
interface AgentState {
  messages: AnyMessage[];
  context: Record<string, any>;
  steps: number;
}

// 2. Define Nodes (Pure Functions)
async function callModel(state: AgentState) {
  const response = await model.invoke(state.messages);
  return { messages: [response], steps: state.steps + 1 };
}

async function executeTools(state: AgentState) {
  // ...tool execution logic...
  return { messages: [toolOutput] };
}

// 3. Define Transition Logic (Edges)
const shouldContinue = (state: AgentState) => {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return END;
};

// 4. Compile Graph
export const workflow = new StateGraph<AgentState>({
  channels: {
    messages: { reducer: (a, b) => a.concat(b) }, // Redux-like Reducer
    steps: { reducer: (a, b) => b }, // Last Write Wins
    context: { reducer: (a, b) => ({ ...a, ...b }) },
  },
})
  .addNode("agent", callModel)
  .addNode("tools", executeTools)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent"); // Loop back to agent
```

#### 2. The Nightmare of State on Stateless Servers

If you deploy the above graph in a Kubernetes Pod behind a Load Balancer, you will face "brain split":

1.  **Request 1**: User says "Hello". Hits Pod A. Agent updates RAM memory (Pod A).
2.  **Request 2**: User says "Find flights". Hits Pod B.
3.  **Error**: Pod B has no memory of Pod A. Agent responds "Who are you?".

**Solution: State Externalization Pattern (Checkpointing)**

LangGraph implements the **Checkpointers** pattern. After _every node_, the graph state is serialized and saved to a durable database (Postgres, Redis).

```typescript
import { PostgresCheckpointSaver } from "@langchain/checkpoint-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Important: Connection Pooling for high concurrency
});
const checkpointer = new PostgresCheckpointSaver(pool);

// Compiled graph automatically interacts with DB
export const app = workflow.compile({ checkpointer });

/* 
  Usage in Controller (Stateless):
  We pass a 'thread_id' which acts as the Session Key.
*/
const finalState = await app.invoke(
  { messages: [new HumanMessage("Book a flight to Madrid")] },
  { configurable: { thread_id: "user_session_123" } },
);
```

This allows Pod A to process step 1, die (OOMKilled), and Pod B to pick up step 2 exactly where it left off, recovering the full stack trace from Postgres.

#### 3. Distributed Human-in-the-Loop and Long-Term Persistence

In enterprise environments, agents cannot have "carte blanche". They need human approval for sensitive actions (e.g., "Refund $500", "Delete Database").

In a local script, you would do `input("Approve? [y/n]")`. On an asynchronous web server, that would block the Node.js thread forever.

With LangGraph + Checkpointing, we model this as an **Interrupt**:

1.  Configure `interruptBefore: ['approve_tools_node']`.
2.  Agent executes logic until it hits that node.
3.  LangGraph detects interrupt, **saves state to DB**, and returns control.
4.  Server responds HTTP 202 ("Waiting Approval").
5.  Hours (or days) later, admin calls `/api/approve`.
6.  We load thread state, inject approval, and call `stream()` again. The agent resumes _as if it never stopped_.

#### 4. Supervisor Pattern: Orchestrating Multi-Agents

For truly complex tasks, a single generalist agent fails. Modern architecture uses a **Supervisor Agent** that delegates tasks to specialist agents (Coder, Researcher, Reviewer).

```typescript
// supervisor.node.ts
const supervisorPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a supervisor. Your task is to delegate between: [Researcher, Coder]. If finished, respond FINISH.",
  ],
  new MessagesPlaceholder("messages"),
  ["system", "Choose the next worker. Respond with the worker name or FINISH."],
]);

// The Supervisor dynamically routes the flow
const supervisorChain = supervisorPrompt
  .pipe(llm)
  .pipe(new JsonOutputToolsParser());

// In the graph:
workflow.addConditionalEdges("supervisor", (x) => x.next_worker);
```

This pattern allows scaling "intelligence" horizontally: you can have 5 specialized agents working in parallel on distinct subgraphs.

#### 5. Production Observability with LangSmith

When an agent fails in production, "looking at the logs" is useless. Logs are plain text; agents are non-deterministic execution trees.

You need **Distributed Tracing**. LangSmith (or OpenTelemetry solutions like Jaeger) allows visualizing:

- **Latency per step**: Is the model slow or is it the search tool?
- **Token costs**: How much did that 10-step recursive query cost?
- **Evaluation Dataset**: Save failed traces to turn them into regression tests (Few-Shot Examples).

```typescript
// Enabling tracing is as simple as setting env vars
process.env.LANGCHAIN_TRACING_V2 = "true";
process.env.LANGCHAIN_API_KEY = "ls__...";

// Now every invoke() sends asynchronous telemetry without blocking the response
```

#### 6. Token Streaming for Real-Time UX

A complex ReAct agent can take 45 seconds to think, use tools, and respond. The average user drops off after 3 seconds if they see no activity.
It is mandatory to implement **Server-Sent Events (SSE)** to stream:

1.  Thought tokens (for debug or advanced UI).
2.  Tool usage logs ("Searching Google...", "Reading PDF...").
3.  Final response tokens.

```typescript
// app/api/chat/route.ts (Next.js App Router)
export async function POST(req: Request) {
  const { messages, threadId } = await req.json();

  const stream = await app.streamEvents(
    { messages },
    { configurable: { thread_id: threadId }, version: "v1" },
  );

  const enc = new TextEncoder();

  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          // Filter relevant events for frontend
          if (event.event === "on_chat_model_stream") {
            controller.enqueue(
              enc.encode(`data: ${JSON.stringify(event.data.chunk)}\n\n`),
            );
          }
        }
        controller.close();
      },
    }),
    { headers: { "Content-Type": "text/event-stream" } },
  );
}
```

Scaling AI agents is not a "Prompt Engineering" problem. It is a classic **Distributed Systems Engineering** problem: state management, concurrency, persistence, and latency.

---

### PORTUGUÊS (PT)

Construir um script Python que executa um agente em seu laptop é divertido ("Olha, ele pode pesquisar no Google!"). Implantar esse mesmo agente para suportar 10.000 usuários simultâneos sem alucinar, perder o contexto ou quebrar seu banco de dados é um desafio de engenharia de sistemas distribuídos de alto nível.

LLMs são, por definição, _stateless_ (sem estado). Mas Agentes são _stateful_. Eles têm "memória" (histórico de chat) e "estado de execução" (em qual etapa do plano estão, qual ferramenta tentaram chamar, qual foi o erro).
Gerenciar esse estado em uma arquitetura de microsserviços efêmeros (Kubernetes/Fargate) requer uma mudança fundamental de mentalidade: de cadeias lineares para grafos persistentes e sistemas multiagentes orquestrados.

#### 1. De LangChain Chains para LangGraph: Modelando Ciclos

![Agent Scalability](./images/langchain-agent-scalability/scaling.png)

LangChain "clássico" operava como um DAG (Grafo Acíclico Dirigido). Isso funciona para tarefas simples ("Prompt -> LLM -> Parser").
Mas agentes autônomos precisam de **loops (ciclos)**: "Pensar -> Agir -> Observar -> Erro -> Corrigir -> Agir...".

**LangGraph** introduz o conceito de `StateGraph`.

```typescript
// agent.graph.ts
import { StateGraph, END } from "@langchain/langgraph";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

// 1. Definimos o Schema do Estado Global
interface AgentState {
  messages: AnyMessage[];
  context: Record<string, any>;
  steps: number;
}

// 2. Definimos os Nós (Funções Puras)
async function callModel(state: AgentState) {
  const response = await model.invoke(state.messages);
  return { messages: [response], steps: state.steps + 1 };
}

async function executeTools(state: AgentState) {
  // ...lógica de execução de ferramentas...
  return { messages: [toolOutput] };
}

// 3. Definimos a Lógica de Transição (Arestas)
const shouldContinue = (state: AgentState) => {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return END;
};

// 4. Compilamos o Grafo
export const workflow = new StateGraph<AgentState>({
  channels: {
    messages: { reducer: (a, b) => a.concat(b) }, // Reducer tipo Redux
    steps: { reducer: (a, b) => b }, // Last Write Wins
    context: { reducer: (a, b) => ({ ...a, ...b }) },
  },
})
  .addNode("agent", callModel)
  .addNode("tools", executeTools)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent"); // Ciclo de volta para o agente
```

#### 2. O Pesadelo do Estado em Servidores Stateless

Se você implantar o grafo acima em um Pod Kubernetes atrás de um Load Balancer, enfrentará o "brain split":

1.  **Request 1**: Usuário diz "Olá". Chega no Pod A. O Agente atualiza sua memória na RAM (Pod A).
2.  **Request 2**: Usuário diz "Busque voos". Chega no Pod B.
3.  **Erro**: O Pod B não tem a memória do Pod A. O agente responde "Quem é você?".

**Solução: Padrão de Externalização de Estado (Checkpointing)**

LangGraph implementa o padrão de **Checkpointers**. Após _cada nó_, o estado do grafo é serializado e salvo em um banco de dados durável (Postgres, Redis).

```typescript
import { PostgresCheckpointSaver } from "@langchain/checkpoint-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Importante: Connection Pooling para alta concorrência
});
const checkpointer = new PostgresCheckpointSaver(pool);

// O grafo compilado interage automaticamente com o DB
export const app = workflow.compile({ checkpointer });

/* 
  Uso no Controller (Stateless):
  Passamos um 'thread_id' que atua como a Session Key.
*/
const finalState = await app.invoke(
  { messages: [new HumanMessage("Reserve um voo para Madri")] },
  { configurable: { thread_id: "user_session_123" } },
);
```

Isso permite que o Pod A processe a etapa 1, morra (OOMKilled), e o Pod B retome a etapa 2 exatamente onde parou, recuperando o stack trace completo do Postgres.

#### 3. Human-in-the-Loop Distribuído e Persistência de Longo Prazo

Em ambientes corporativos, os agentes não podem ter "carta branca". Eles precisam de aprovação humana para ações sensíveis (ex: "Reembolsar $500", "Excluir Banco de Dados").

Em um script local, você faria `input("Aprovar? [s/n]")`. Em um servidor web assíncrono, isso bloquearia a thread do Node.js para sempre.

Com LangGraph + Checkpointing, modelamos isso como uma **Interrupção**:

1.  Configuramos um `interruptBefore: ['approve_tools_node']`.
2.  O agente executa sua lógica até atingir esse nó.
3.  LangGraph detecta a interrupção, **salva o estado no DB** e devolve o controle.
4.  O servidor responde HTTP 202 ("Aguardando Aprovação").
5.  Horas (ou dias) depois, um administrador chama o endpoint `/api/approve`.
6.  Carregamos o estado do thread, injetamos a aprovação e chamamos `stream()` novamente. O agente continua _como se nunca tivesse parado_.

#### 4. Padrão Supervisor: Orquestrando Multiagentes

Para tarefas realmente complexas, um único agente generalista falha. A arquitetura moderna usa um **Agente Supervisor** que delega tarefas a agentes especialistas (Codificador, Pesquisador, Revisor).

```typescript
// supervisor.node.ts
const supervisorPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "Você é um supervisor. Sua tarefa é delegar entre: [Researcher, Coder]. Se terminar, responda FINISH.",
  ],
  new MessagesPlaceholder("messages"),
  [
    "system",
    "Escolha o próximo trabalhador. Responda com o nome do worker ou FINISH.",
  ],
]);

// O Supervisor roteia dinamicamente o fluxo
const supervisorChain = supervisorPrompt
  .pipe(llm)
  .pipe(new JsonOutputToolsParser());

// No grafo:
workflow.addConditionalEdges("supervisor", (x) => x.next_worker);
```

Esse padrão permite escalar a "inteligência" horizontalmente: você pode ter 5 agentes especializados trabalhando em paralelo em subgrafos distintos.

#### 5. Observabilidade em Produção com LangSmith

Quando um agente falha na produção, "olhar os logs" é inútil. Logs são texto simples; agentes são árvores de execução não determinísticas.

Você precisa de **Rastreamento Distribuído (Distributed Tracing)**. LangSmith (ou soluções OpenTelemetry como Jaeger) permite visualizar:

- **Latência por etapa**: O modelo está lento ou é a ferramenta de pesquisa?
- **Custos de token**: Quanto custou aquela consulta recursiva de 10 etapas?
- **Dataset de Avaliação**: Salvar traces com falha para transformá-los em testes de regressão (Exemplos Few-Shot).

```typescript
// Habilitar rastreamento é tão simples quanto definir variáveis de ambiente
process.env.LANGCHAIN_TRACING_V2 = "true";
process.env.LANGCHAIN_API_KEY = "ls__...";

// Agora cada invoke() envia telemetria assíncrona sem bloquear a resposta
```

#### 6. Streaming de Tokens para UX em Tempo Real

Um agente ReAct complexo pode levar 45 segundos para pensar, usar ferramentas e responder. O usuário médio desiste após 3 segundos se não vir atividade.
É obrigatório implementar **Server-Sent Events (SSE)** para fazer streaming de:

1.  Tokens de pensamento (para debug ou UI avançada).
2.  Logs de uso de ferramentas ("Buscando no Google...", "Lendo PDF...").
3.  Tokens de resposta final.

```typescript
// app/api/chat/route.ts (Next.js App Router)
export async function POST(req: Request) {
  const { messages, threadId } = await req.json();

  const stream = await app.streamEvents(
    { messages },
    { configurable: { thread_id: threadId }, version: "v1" },
  );

  const enc = new TextEncoder();

  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          // Filtramos eventos relevantes para o frontend
          if (event.event === "on_chat_model_stream") {
            controller.enqueue(
              enc.encode(`data: ${JSON.stringify(event.data.chunk)}\n\n`),
            );
          }
        }
        controller.close();
      },
    }),
    { headers: { "Content-Type": "text/event-stream" } },
  );
}
```

Escalar agentes de IA não é um problema de "Engenharia de Prompt". É um problema clássico de **Engenharia de Sistemas Distribuídos**: gerenciamento de estado, simultaneidade, persistência e latência.
