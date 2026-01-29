### ESPAÑOL (ES)

El patrón RAG (Retrieval-Augmented Generation) básico —hacer embedding de un PDF, guardarlo en una DB vectorial y buscar los top-k chunks— es suficiente para demos, pero falla estrepitosamente en producción. Alucinaciones, recuperación de contexto irrelevante y falta de "razonamiento" sobre los datos son problemas comunes.

En este artículo, exploraremos arquitecturas avanzadas de RAG utilizando **LangChain** y **PostgreSQL (pgvector)** para construir sistemas de IA generativa que realmente funcionen a escala.

#### 1. Más allá del "Naive RAG": Advanced Retrieval

![Advanced RAG Architecture](./images/rag-architecture-langchain/advanced-rag.png)

El problema del RAG simple es que fragmenta la información. Un chunk de 500 caracteres puede perder el contexto global del documento.

**Estrategia: Parent Document Retriever**
Indexamos chunks pequeños (e.g., 200 caracteres) para una búsqueda vectorial precisa, pero recuperamos el "Parent Document" completo (o un chunk mucho más grande) para pasárselo al LLM.

```typescript
import { ParentDocumentRetriever } from "langchain/retrievers/parent_document";
import { ScoreThresholdRetriever } from "langchain/retrievers/score_threshold";

// Indexamos chunks pequeños, pero recuperamos el contexto grande
const retriever = new ParentDocumentRetriever({
  vectorstore: vectorStore,
  byteStore: docStore, // Almacena el documento original
  childSplitter: new RecursiveCharacterTextSplitter({ chunkSize: 200 }),
  parentSplitter: new RecursiveCharacterTextSplitter({ chunkSize: 2000 }),
});
```

#### 2. Multi-Query Retriever y Reranking

A veces la pregunta del usuario es ambigua. "Dame los reportes de ventas" puede significar "¿Ventas de este mes?", "¿Ventas globales?".
El **Multi-Query Retriever** usa un LLM para generar 3-4 variaciones de la pregunta original y busca todas en paralelo.

**Reranking (El toque secreto)**
El vector search es rápido pero no siempre ordena por relevancia semántica profunda. Usamos un modelo "Cross-Encoder" (como Cohere Rerank) para reordenar los 50 documentos recuperados y quedarnos con los 5 mejores.

#### 3. Self-RAG y Flujos Correctivos (CRAG)

¿Y si la base de datos no tiene la respuesta? Un RAG normal alucina.
**Self-RAG** entrena al modelo para emitir tokens de reflexión:

- `retrieve`: ¿Necesito buscar información externa?
- `is_relevant`: ¿Lo que encontré sirve?
- `is_supported`: ¿Mi respuesta está respaldada por la evidencia?

Si el sistema detecta que los documentos recuperados son irrelevantes, activamos **Corrective RAG (CRAG)**: un fallback que busca en la web (usando **Tavily** o Google Search) para obtener información fresca.

#### 4. Implementación con LCEL (LangChain Expression Language)

LCEL nos permite construir pipelines declarativos y observables.

```typescript
const ragChain = RunnableSequence.from([
  {
    context: retriever.pipe(formatDocumentsAsString),
    question: new RunnablePassthrough(),
  },
  promptTemplate,
  model,
  new StringOutputParser(),
]);

const result = await ragChain.invoke(
  "¿Cuáles son los requisitos de compliance?",
);
```

#### 5. Evaluación con RAGAS

No puedes mejorar lo que no mides. **RAGAS** (RAG Assessment) es un framework que utiliza otro LLM (GPT-4) para evaluar tu RAG en tres métricas:

1.  **Faithfulness**: ¿La respuesta es fiel al contexto recuperado?
2.  **Answer Relevance**: ¿Responde a la pregunta del usuario?
3.  **Context Precision**: ¿Hay mucha "paja" en el contexto recuperado?

El futuro del RAG no es solo buscar mejor, es construir agentes que sepan cuándo buscar, cuándo leer y cuándo preguntar.

---

### ENGLISH (EN)

Basic RAG (Retrieval-Augmented Generation)—embedding a PDF, saving it to a vector DB, and searching top-k chunks—is fine for demos, but fails miserably in production. Hallucinations, retrieval of irrelevant context, and lack of "reasoning" about data are common issues.

In this article, we'll explore advanced RAG architectures using **LangChain** and **PostgreSQL (pgvector)** to build generative AI systems that actually work at scale.

#### 1. Beyond "Naive RAG": Advanced Retrieval

![Advanced RAG Architecture](./images/rag-architecture-langchain/advanced-rag.png)

The problem with simple RAG is that it fragments information. A 500-character chunk can lose the global context of the document.

**Strategy: Parent Document Retriever**
We index small chunks (e.g., 200 chars) for precise vector search, but retrieve the full "Parent Document" (or a much larger chunk) to pass to the LLM.

```typescript
import { ParentDocumentRetriever } from "langchain/retrievers/parent_document";
import { ScoreThresholdRetriever } from "langchain/retrievers/score_threshold";

// Index small chunks, but retrieve large context
const retriever = new ParentDocumentRetriever({
  vectorstore: vectorStore,
  byteStore: docStore, // Stores original document
  childSplitter: new RecursiveCharacterTextSplitter({ chunkSize: 200 }),
  parentSplitter: new RecursiveCharacterTextSplitter({ chunkSize: 2000 }),
});
```

#### 2. Multi-Query Retriever and Reranking

Sometimes the user query is ambiguous. "Give me sales reports" could mean "Sales for this month?", "Global sales?".
The **Multi-Query Retriever** uses an LLM to generate 3-4 variations of the original question and searches for all of them in parallel.

**Reranking (The Secret Sauce)**
Vector search is fast but doesn't always sort by deep semantic relevance. We use a "Cross-Encoder" model (like Cohere Rerank) to re-order the 50 retrieved documents and keep the top 5.

#### 3. Self-RAG and Corrective Flows (CRAG)

What if the database doesn't have the answer? A normal RAG hallucinates.
**Self-RAG** trains the model to emit reflection tokens:

- `retrieve`: Do I need to search external info?
- `is_relevant`: Is what I found useful?
- `is_supported`: Is my answer backed by evidence?

If the system detects retrieved documents are irrelevant, we trigger **Corrective RAG (CRAG)**: a fallback that searches the web (using **Tavily** or Google Search) to get fresh information.

#### 4. Implementation with LCEL (LangChain Expression Language)

LCEL allows us to build declarative and observable pipelines.

```typescript
const ragChain = RunnableSequence.from([
  {
    context: retriever.pipe(formatDocumentsAsString),
    question: new RunnablePassthrough(),
  },
  promptTemplate,
  model,
  new StringOutputParser(),
]);

const result = await ragChain.invoke("What are the compliance requirements?");
```

#### 5. Evaluation with RAGAS

You can't improve what you don't measure. **RAGAS** (RAG Assessment) is a framework that uses another LLM (GPT-4) to evaluate your RAG on three metrics:

1.  **Faithfulness**: Is the answer faithful to the retrieved context?
2.  **Answer Relevance**: Does it answer the user's question?
3.  **Context Precision**: Is there too much "noise" in the retrieved context?

The future of RAG isn't just searching better; it's building agents that know when to search, when to read, and when to ask.

---

### PORTUGUÊS (PT)

O padrão RAG (Retrieval-Augmented Generation) básico — fazer o embedding de um PDF, salvá-lo em um DB vetorial e buscar os top-k chunks — é suficiente para demos, mas falha miseravelmente em produção. Alucinações, recuperação de contexto irrelevante e falta de "raciocínio" sobre os dados são problemas comuns.

Neste artigo, exploraremos arquiteturas avançadas de RAG usando **LangChain** e **PostgreSQL (pgvector)** para construir sistemas de IA generativa que realmente funcionam em escala.

#### 1. Além do "Naive RAG": Advanced Retrieval

![Advanced RAG Architecture](./images/rag-architecture-langchain/advanced-rag.png)

O problema do RAG simples é que ele fragmenta as informações. Um pedaço de 500 caracteres pode perder o contexto global do documento.

**Estratégia: Parent Document Retriever**
Indexamos pedaços pequenos (e.g., 200 caracteres) para uma busca vetorial precisa, mas recuperamos o "Documento Pai" completo (ou um pedaço muito maior) para passar ao LLM.

```typescript
import { ParentDocumentRetriever } from "langchain/retrievers/parent_document";
import { ScoreThresholdRetriever } from "langchain/retrievers/score_threshold";

// Indexamos pedaços pequenos, mas recuperamos contexto grande
const retriever = new ParentDocumentRetriever({
  vectorstore: vectorStore,
  byteStore: docStore, // Armazena o documento original
  childSplitter: new RecursiveCharacterTextSplitter({ chunkSize: 200 }),
  parentSplitter: new RecursiveCharacterTextSplitter({ chunkSize: 2000 }),
});
```

#### 2. Multi-Query Retriever e Reranking

Às vezes, a consulta do usuário é ambígua. "Dê-me os relatórios de vendas" pode significar "Vendas deste mês?", "Vendas globais?".
O **Multi-Query Retriever** usa um LLM para gerar 3-4 variações da pergunta original e busca todas em paralelo.

**Reranking (O Ingrediente Secreto)**
A busca vetorial é rápida, mas nem sempre ordena por relevância semântica profunda. Usamos um modelo "Cross-Encoder" (como Cohere Rerank) para reordenar os 50 documentos recuperados e manter os 5 melhores.

#### 3. Self-RAG e Fluxos Corretivos (CRAG)

E se o banco de dados não tiver a resposta? Um RAG normal alucina.
**Self-RAG** treina o modelo para emitir tokens de reflexão:

- `retrieve`: Preciso buscar informações externas?
- `is_relevant`: O que encontrei serve?
- `is_supported`: Minha resposta é apoiada pelas evidências?

Se o sistema detectar que os documentos recuperados são irrelevantes, ativamos o **Corrective RAG (CRAG)**: um fallback que pesquisa na web (usando **Tavily** ou Google Search) para obter informações frescas.

#### 4. Implementação com LCEL (LangChain Expression Language)

LCEL nos permite construir pipelines declarativos e observáveis.

```typescript
const ragChain = RunnableSequence.from([
  {
    context: retriever.pipe(formatDocumentsAsString),
    question: new RunnablePassthrough(),
  },
  promptTemplate,
  model,
  new StringOutputParser(),
]);

const result = await ragChain.invoke(
  "Quais são os requisitos de conformidade?",
);
```

#### 5. Avaliação com RAGAS

Você não pode melhorar o que não mede. **RAGAS** (RAG Assessment) é um framework que usa outro LLM (GPT-4) para avaliar seu RAG em três métricas:

1.  **Faithfulness**: A resposta é fiel ao contexto recuperado?
2.  **Answer Relevance**: Responde à pergunta do usuário?
3.  **Context Precision**: Há muita "palha" no contexto recuperado?

O futuro do RAG não é apenas buscar melhor; é construir agentes que saibam quando buscar, quando ler e quando perguntar.
