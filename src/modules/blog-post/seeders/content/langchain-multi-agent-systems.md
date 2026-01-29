### ESPAÑOL (ES)

Un solo agente de IA, por poderoso que sea, tiene límites en su ventana de contexto y capacidad de razonamiento. El futuro de la automización empresarial reside en los Sistemas Multi-Agente (MAS), donde múltiples agentes especializados colaboran para resolver problemas complejos. Usando LangGraph (la evolución de LangChain para agentes stateful), construiremos una orquestación robusta inspirada en arquitecturas de actores.

#### 1. Arquitectura Jerárquica vs. Red Plana

![Multi-Agent System](./images/langchain-multi-agent-systems/diagram.png)

Existen dos patrones principales que un ingeniero senior debe dominar:

**Supervisor Pattern:**
Un "Agente Supervisor" (generalmente GPT-4) recibe la tarea del usuario y la delega a agentes subordinados (Coder, Researcher, Reviewer). El supervisor gestiona el estado global y decide cuándo terminar.

**Network Pattern:**
Los agentes son nodos autónomos que pueden comunicarse con cualquier otro agente. Esto es más flexible pero más propenso a bucles infinitos si no se valida el grafo.

Implementaremos un patrón **Supervisor** para un equipo de desarrollo de software virtual.

#### 2. Implementación con LangGraph

LangGraph permite definir flujos de trabajo cíclicos con estado persistente, algo que las cadenas DAG tradicionales no permitían fácilmente.

```typescript
import { StateGraph, END } from "@langchain/langgraph";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";

// Definir el estado compartido del equipo
const AgentState = {
  messages: {
    value: (x: any[], y: any[]) => x.concat(y),
    default: () => [],
  },
  next: {
    value: (x: string, y: string) => y,
    default: () => END,
  },
};

// Nodo Supervisor: Decide quién actúa a continuación
const supervisorNode = async (state: any) => {
  const supervisorModel = new ChatOpenAI({ modelName: "gpt-4-turbo" });

  const systemPrompt = new SystemMessage(
    "Eres el supervisor de un equipo de dev. Tienes a 'Coder' y 'Tester'." +
      "Decide quién actúa a continuación o responde 'FINISH' si la tarea está completa.",
  );

  const response = await supervisorModel.invoke([
    systemPrompt,
    ...state.messages,
  ]);
  const nextAgent = response.content.includes("Coder")
    ? "coder"
    : response.content.includes("Tester")
      ? "tester"
      : "FINISH";

  return { next: nextAgent };
};

// Grafo de Estado
const workflow = new StateGraph({ channels: AgentState })
  .addNode("supervisor", supervisorNode)
  .addNode("coder", coderAgent) // Implementación de agente estándar
  .addNode("tester", testerAgent)
  .addEdge("coder", "supervisor") // El coder reporta al supervisor
  .addEdge("tester", "supervisor") // El tester reporta al supervisor
  .setEntryPoint("supervisor");

// Persistencia en Postgres (Drizzle)
const checkpointer = new PostgresSaver(db);

const app = workflow.compile({ checkpointer });
```

#### 3. Memoria Compartida y Checkpointing

En un sistema multi-agente, la "memoria" no es solo el historial de chat. Es el estado actual del proyecto. Usamos **Drizzle ORM** para persistir este estado, permitiendo "Human-in-the-loop":

- El sistema pausa después de que el agente `Coder` genera código.
- Un humano revisa el PR simulado y aprueba.
- El sistema reanuda la ejecución con el agente `Deployer`.

```typescript
// src/agents/checkpoint.ts
import { db } from "@db";
import { checkpoints } from "@db/schema";

export class PostgresSaver {
  async put(config: RunnableConfig, checkpoint: Checkpoint) {
    await db.insert(checkpoints).values({
      thread_id: config.configurable.thread_id,
      checkpoint: JSON.stringify(checkpoint),
      created_at: new Date(),
    });
  }
}
```

#### 4. Prevención de Bucles y Alucinaciones

Los sistemas multi-agente tienden a entrar en bucles de "corrección infinita" donde el Tester encuentra un error, el Coder "dice" que lo arregló (pero no lo hizo), y el Tester vuelve a fallar.

**Soluciones Senior:**

- **Herramientas Deterministas**: Los agentes no deben solo "decir" que ejecutaron código. Deben tener una herramienta `RunCode` que realmente ejecute el script en un sandbox seguro (como e2b o Docker aislado).
- **Límites de Recursión**: LangGraph permite configurar `recursionLimit` para detener la ejecución tras N pasos.

```typescript
const result = await app.invoke(
  { messages: [new HumanMessage("Crea una API REST básica")] },
  { recursionLimit: 50 }, // Evitar bucles infinitos
);
```

#### 5. Optimización de Costes con Modelos Mixtos

No todos los agentes necesitan GPT-4.

- **Supervisor**: GPT-4 (Necesita razonamiento complejo).
- **Coder**: Claude 3 Opus (Mejor en generación de código).
- **Tester**: Llama 3 (Rápido y barato para validaciones simples).

Esta orquestación mixta reduce los costes operativos en un 60% sin sacrificar la calidad del resultado final.

#### Conclusión

La orquestación multi-agente es el siguiente nivel en la ingeniería de IA. Pasamos de "chatbots" a "sistemas de trabajo" capaces de razonar, criticar su propio trabajo y persistir el estado a lo largo de días o semanas. Con LangGraph y una arquitectura sólida en Node.js, podemos construir la fuerza laboral digital del futuro.

---

### ENGLISH (EN)

A single AI agent, no matter how powerful, has limits on its context window and reasoning capability. The future of enterprise automation lies in Multi-Agent Systems (MAS), where multiple specialized agents collaborate to solve complex problems. Using LangGraph (the evolution of LangChain for stateful agents), we will build robust orchestration inspired by actor architectures.

#### 1. Hierarchical Architecture vs. Flat Network

![Multi-Agent System](./images/langchain-multi-agent-systems/diagram.png)

There are two main patterns a senior engineer must master:

**Supervisor Pattern:**
A "Supervisor Agent" (usually GPT-4) receives the user task and delegates it to subordinate agents (Coder, Researcher, Reviewer). The supervisor manages the global state and decides when to terminate.

**Network Pattern:**
Agents are autonomous nodes that can communicate with any other agent. This is more flexible but more prone to infinite loops if the graph is not validated.

We will implement a **Supervisor** pattern for a virtual software development team.

#### 2. Implementation with LangGraph

LangGraph allows defining cyclic workflows with persistent state, something traditional DAG chains did not easily permit.

```typescript
import { StateGraph, END } from "@langchain/langgraph";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";

// Define shared team state
const AgentState = {
  messages: {
    value: (x: any[], y: any[]) => x.concat(y),
    default: () => [],
  },
  next: {
    value: (x: string, y: string) => y,
    default: () => END,
  },
};

// Supervisor Node: Decides who acts next
const supervisorNode = async (state: any) => {
  const supervisorModel = new ChatOpenAI({ modelName: "gpt-4-turbo" });

  const systemPrompt = new SystemMessage(
    "You are the supervisor of a dev team. You have 'Coder' and 'Tester'." +
      "Decide who acts next or respond 'FINISH' if the task is complete.",
  );

  const response = await supervisorModel.invoke([
    systemPrompt,
    ...state.messages,
  ]);
  const nextAgent = response.content.includes("Coder")
    ? "coder"
    : response.content.includes("Tester")
      ? "tester"
      : "FINISH";

  return { next: nextAgent };
};

// State Graph
const workflow = new StateGraph({ channels: AgentState })
  .addNode("supervisor", supervisorNode)
  .addNode("coder", coderAgent) // Standard agent implementation
  .addNode("tester", testerAgent)
  .addEdge("coder", "supervisor") // Coder reports to supervisor
  .addEdge("tester", "supervisor") // Tester reports to supervisor
  .setEntryPoint("supervisor");

// Persistence in Postgres (Drizzle)
const checkpointer = new PostgresSaver(db);

const app = workflow.compile({ checkpointer });
```

#### 3. Shared Memory and Checkpointing

In a multi-agent system, "memory" is not just chat history. It is the current state of the project. We use **Drizzle ORM** to persist this state, enabling "Human-in-the-loop":

- The system pauses after the `Coder` agent generates code.
- A human reviews the simulated PR and approves.
- The system resumes execution with the `Deployer` agent.

```typescript
// src/agents/checkpoint.ts
import { db } from "@db";
import { checkpoints } from "@db/schema";

export class PostgresSaver {
  async put(config: RunnableConfig, checkpoint: Checkpoint) {
    await db.insert(checkpoints).values({
      thread_id: config.configurable.thread_id,
      checkpoint: JSON.stringify(checkpoint),
      created_at: new Date(),
    });
  }
}
```

#### 4. Preventing Loops and Hallucinations

Multi-agent systems tend to enter "infinite correction" loops where the Tester finds a bug, the Coder "says" it fixed it (but didn't), and the Tester fails again.

**Senior Solutions:**

- **Deterministic Tools**: Agents must not just "say" they executed code. They must have a `RunCode` tool that actually executes the script in a secure sandbox (like e2b or isolated Docker).
- **Recursion Limits**: LangGraph allows configuring `recursionLimit` to halt execution after N steps.

```typescript
const result = await app.invoke(
  { messages: [new HumanMessage("Create a basic REST API")] },
  { recursionLimit: 50 }, // Prevent infinite loops
);
```

#### 5. Cost Optimization with Mixed Models

Not all agents need GPT-4.

- **Supervisor**: GPT-4 (Needs complex reasoning).
- **Coder**: Claude 3 Opus (Better at code generation).
- **Tester**: Llama 3 (Fast and cheap for simple validations).

This mixed orchestration reduces operating costs by 60% without sacrificing the quality of the final result.

#### Conclusion

Multi-agent orchestration is the next level in AI engineering. We move from "chatbots" to "work systems" capable of reasoning, critiquing their own work, and persisting state over days or weeks. With LangGraph and a solid Node.js architecture, we can build the digital workforce of the future.

---

### PORTUGUÊS (PT)

Um único agente de IA, por mais poderoso que seja, tem limites em sua janela de contexto e capacidade de raciocínio. O futuro da automação empresarial reside nos Sistemas Multi-Agente (MAS), onde múltiplos agentes especializados colaboram para resolver problemas complexos. Usando LangGraph (a evolução do LangChain para agentes com estado), construiremos uma orquestração robusta inspirada em arquiteturas de atores.

#### 1. Arquitetura Hierárquica vs. Rede Plana

![Multi-Agent System](./images/langchain-multi-agent-systems/diagram.png)

Existem dois padrões principais que um engenheiro sênior deve dominar:

**Supervisor Pattern:**
Um "Agente Supervisor" (geralmente GPT-4) recebe a tarefa do usuário e a delega a agentes subordinados (Coder, Researcher, Reviewer). O supervisor gerencia o estado global e decide quando terminar.

**Network Pattern:**
Os agentes são nós autônomos que podem se comunicar com qualquer outro agente. Isso é mais flexível, mas mais propenso a loops infinitos se o grafo não for validado.

Implementaremos um padrão **Supervisor** para uma equipe de desenvolvimento de software virtual.

#### 2. Implementação com LangGraph

O LangGraph permite definir fluxos de trabalho cíclicos com estado persistente, algo que as cadeias DAG tradicionais não permitiam facilmente.

```typescript
import { StateGraph, END } from "@langchain/langgraph";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";

// Definir o estado compartilhado da equipe
const AgentState = {
  messages: {
    value: (x: any[], y: any[]) => x.concat(y),
    default: () => [],
  },
  next: {
    value: (x: string, y: string) => y,
    default: () => END,
  },
};

// Nó Supervisor: Decide quem age a seguir
const supervisorNode = async (state: any) => {
  const supervisorModel = new ChatOpenAI({ modelName: "gpt-4-turbo" });

  const systemPrompt = new SystemMessage(
    "Você é o supervisor de uma equipe de dev. Você tem 'Coder' e 'Tester'." +
      "Decida quem age a seguir ou responda 'FINISH' se a tarefa estiver concluída.",
  );

  const response = await supervisorModel.invoke([
    systemPrompt,
    ...state.messages,
  ]);
  const nextAgent = response.content.includes("Coder")
    ? "coder"
    : response.content.includes("Tester")
      ? "tester"
      : "FINISH";

  return { next: nextAgent };
};

// Grafo de Estado
const workflow = new StateGraph({ channels: AgentState })
  .addNode("supervisor", supervisorNode)
  .addNode("coder", coderAgent) // Implementação de agente padrão
  .addNode("tester", testerAgent)
  .addEdge("coder", "supervisor") // O coder reporta ao supervisor
  .addEdge("tester", "supervisor") // O tester reporta ao supervisor
  .setEntryPoint("supervisor");

// Persistência no Postgres (Drizzle)
const checkpointer = new PostgresSaver(db);

const app = workflow.compile({ checkpointer });
```

#### 3. Memória Compartilhada e Checkpointing

Em um sistema multi-agente, a "memória" não é apenas o histórico de chat. É o estado atual do projeto. Usamos **Drizzle ORM** para persistir esse estado, permitindo "Human-in-the-loop":

- O sistema pausa após o agente `Coder` gerar código.
- Um humano revisa o PR simulado e aprova.
- O sistema retoma a execução com o agente `Deployer`.

```typescript
// src/agents/checkpoint.ts
import { db } from "@db";
import { checkpoints } from "@db/schema";

export class PostgresSaver {
  async put(config: RunnableConfig, checkpoint: Checkpoint) {
    await db.insert(checkpoints).values({
      thread_id: config.configurable.thread_id,
      checkpoint: JSON.stringify(checkpoint),
      created_at: new Date(),
    });
  }
}
```

#### 4. Prevenção de Loops e Alucinações

Sistemas multi-agente tendem a entrar em loops de "correção infinita" onde o Tester encontra um erro, o Coder "diz" que corrigiu (mas não corrigiu), e o Tester falha novamente.

**Soluções Sênior:**

- **Ferramentas Determinísticas**: Os agentes não devem apenas "dizer" que executaram código. Eles devem ter uma ferramenta `RunCode` que realmente execute o script em um sandbox seguro (como e2b ou Docker isolado).
- **Limites de Recursão**: O LangGraph permite configurar `recursionLimit` para interromper a execução após N etapas.

```typescript
const result = await app.invoke(
  { messages: [new HumanMessage("Crie uma API REST básica")] },
  { recursionLimit: 50 }, // Evitar loops infinitos
);
```

#### 5. Otimização de Custos com Modelos Mistos

Nem todos os agentes precisam do GPT-4.

- **Supervisor**: GPT-4 (Necessita de raciocínio complexo).
- **Coder**: Claude 3 Opus (Melhor na geração de código).
- **Tester**: Llama 3 (Rápido e barato para validações simples).

Essa orquestração mista reduz os custos operacionais em 60% sem sacrificar a qualidade do resultado final.

#### Conclusão

A orquestração multi-agente é o próximo nível na engenharia de IA. Passamos de "chatbots" para "sistemas de trabalho" capazes de raciocinar, criticar seu próprio trabalho e persistir o estado ao longo de dias ou semanas. Com LangGraph e uma arquitetura sólida em Node.js, podemos construir a força de trabalho digital do futuro.
