### ESPAÑOL (ES)

El patrón RAG (Retrieval-Augmented Generation) ha democratizado el acceso a información propietaria para los LLMs, pero llevar un sistema RAG del prototipo a la producción revela desafíos complejos como la alucinación, la latencia de recuperación y la degradación de la calidad del contexto. En este artículo, exploraremos estrategias avanzadas para construir pipelines RAG resilientes y precisos utilizando LangChain, PostgreSQL (pgvector) y técnicas de re-ranking.

#### 1. Estrategias Avanzadas de Chunking

![RAG Chunking Strategies](./images/langchain-production-rag/chunking.png)

El "Chunking" ingenuo (separar texto cada 500 caracteres) destruye el contexto semántico. En producción, implementamos estrategias conscientes de la estructura:

- **Recursive Character Splitting**: Respetamos la jerarquía del documento (párrafos, encabezados, listas) para mantener unidades de significado completas.
- **Parent Document Retriever**: Indexamos fragmentos pequeños para una búsqueda vectorial precisa, pero recuperamos el "bloque padre" completo para dar más contexto al LLM. Esto equilibra la precisión de búsqueda con la riqueza de contenido.

```typescript
import { ParentDocumentRetriever } from "langchain/retrievers/parent_document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { IVectorStore } from "@langchain/core/vectorstores";
import { BaseStore } from "@langchain/core/stores";

export const createRetriever = (
  vectorstore: IVectorStore,
  docstore: BaseStore<string, Document>,
) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 400,
    chunkOverlap: 50,
  });

  return new ParentDocumentRetriever({
    vectorstore,
    docstore,
    childSplitter: splitter,
    // Los chunks pequeños se usan para buscar, pero se devuelve el documento padre
  });
};
```

#### 2. Self-Querying: Más que Similitud Vectorial

La búsqueda vectorial falla con preguntas cuantitativas o filtros exactos (e.g., "documentos de 2023 sobre finanzas"). Implementamos **Self-Querying**, donde el LLM primero traduce la pregunta del usuario en un filtro de metadatos estructurado y una query de búsqueda.

- **Query**: "Artículos de finanzas publicados después de mayo 2023"
- **Filtro Generado**: `{ category: { $eq: "finance" }, date: { $gt: "2023-05-01" } }`

Esto reduce drásticamente el espacio de búsqueda y aumenta la precisión.

#### 3. Re-ranking: La Capa de Calidad

Los embeddings (como `text-embedding-3-small` de OpenAI) son excelentes para capturar similitud semántica general, pero a veces fallan en matices específicos de dominio.

Integramos una etapa de **Cross-Encoder Re-ranking** (usando modelos como Cohere o BGE-Reranker) después de la recuperación inicial. Si recuperamos 50 documentos candidatos con búsqueda vectorial rápida, el re-ranker (que es más lento pero más preciso) analiza esos 50 pares (pregunta, documento) y selecciona los 5 mejores verdaderos.

#### 4. Evaluación Continua (RAGAS)

No se puede mejorar lo que no se mide. Implementamos el framework **RAGAS** (Retrieval Augmented Generation Assessment) para evaluar métricas clave:

- **Context Precision**: ¿La información relevante está en los documentos recuperados?
- **Context Recall**: ¿Se recuperó _toda_ la información relevante?
- **Faithfulness**: ¿La respuesta del LLM se basa _únicamente_ en el contexto proporcionado (sin alucinaciones)?
- **Answer Relevance**: ¿Responde realmente a la pregunta del usuario?

Estas métricas se calculan automáticamente en nuestro pipeline de CI/CD para evitar regresiones de conocimiento.

Llevar RAG a producción no es solo conectar una base de datos vectorial a un LLM; es ingeniería de precisión sobre cómo se procesan, recuperan y presentan los datos.

---

### ENGLISH (EN)

The RAG (Retrieval-Augmented Generation) pattern has democratized access to proprietary information for LLMs, but taking a RAG system from prototype to production reveals complex challenges such as hallucination, retrieval latency, and context quality degradation. In this article, we will explore advanced strategies for building resilient and accurate RAG pipelines using LangChain, PostgreSQL (pgvector), and re-ranking techniques.

#### 1. Advanced Chunking Strategies

![RAG Chunking Strategies](./images/langchain-production-rag/chunking.png)

Naive "Chunking" (splitting text every 500 characters) destroys semantic context. In production, we implement structure-aware strategies:

- **Recursive Character Splitting**: We respect document hierarchy (paragraphs, headers, lists) to maintain complete units of meaning.
- **Parent Document Retriever**: We index small fragments for precise vector search but retrieve the full "parent block" to provide more context to the LLM. This balances search precision with content richness.

```typescript
import { ParentDocumentRetriever } from "langchain/retrievers/parent_document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { IVectorStore } from "@langchain/core/vectorstores";
import { BaseStore } from "@langchain/core/stores";

export const createRetriever = (
  vectorstore: IVectorStore,
  docstore: BaseStore<string, Document>,
) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 400,
    chunkOverlap: 50,
  });

  return new ParentDocumentRetriever({
    vectorstore,
    docstore,
    childSplitter: splitter,
    // Small chunks are used for searching, but the parent document is returned
  });
};
```

#### 2. Self-Querying: More Than Vector Similarity

Vector search fails with quantitative questions or exact filters (e.g., "finance documents from 2023"). We implement **Self-Querying**, where the LLM first translates the user's question into a structured metadata filter and a search query.

- **Query**: "Finance articles published after May 2023"
- **Generated Filter**: `{ category: { $eq: "finance" }, date: { $gt: "2023-05-01" } }`

This drastically reduces the search space and increases accuracy.

#### 3. Re-ranking: The Quality Layer

Embeddings (like OpenAI's `text-embedding-3-small`) are excellent for capturing general semantic similarity but sometimes fail on specific domain nuances.

We integrate a **Cross-Encoder Re-ranking** stage (using models like Cohere or BGE-Reranker) after the initial retrieval. If we retrieve 50 candidate documents with fast vector search, the re-ranker (which is slower but more precise) analyzes those 50 pairs (question, document) and selects the true top 5.

#### 4. Continuous Evaluation (RAGAS)

You cannot improve what you do not measure. We implement the **RAGAS** (Retrieval Augmented Generation Assessment) framework to evaluate key metrics:

- **Context Precision**: Is the relevant information in the retrieved documents?
- **Context Recall**: Was _all_ relevant information retrieved?
- **Faithfulness**: Is the LLM's answer based _solely_ on the provided context (no hallucinations)?
- **Answer Relevance**: Does it actually answer the user's question?

These metrics are automatically calculated in our CI/CD pipeline to prevent knowledge regressions.

Taking RAG to production isn't just connecting a vector database to an LLM; it's precision engineering on how data is processed, retrieved, and presented.

---

### PORTUGUÊS (PT)

O padrão RAG (Retrieval-Augmented Generation) democratizou o acesso a informações proprietárias para LLMs, mas levar um sistema RAG do protótipo para a produção revela desafios complexos como alucinação, latência de recuperação e degradação da qualidade do contexto. Neste artigo, exploraremos estratégias avançadas para construir pipelines RAG resilientes e precisos usando LangChain, PostgreSQL (pgvector) e técnicas de re-ranking.

#### 1. Estratégias Avançadas de Chunking

![RAG Chunking Strategies](./images/langchain-production-rag/chunking.png)

O "Chunking" ingênuo (separar texto a cada 500 caracteres) destrói o contexto semântico. Em produção, implementamos estratégias conscientes da estrutura:

- **Recursive Character Splitting**: Respeitamos a hierarquia do documento (parágrafos, cabeçalhos, listas) para manter unidades de significado completas.
- **Parent Document Retriever**: Indexamos fragmentos pequenos para uma busca vetorial precisa, mas recuperamos o "bloco pai" completo para dar mais contexto ao LLM. Isso equilibra a precisão da busca com a riqueza de conteúdo.

```typescript
import { ParentDocumentRetriever } from "langchain/retrievers/parent_document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { IVectorStore } from "@langchain/core/vectorstores";
import { BaseStore } from "@langchain/core/stores";

export const createRetriever = (
  vectorstore: IVectorStore,
  docstore: BaseStore<string, Document>,
) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 400,
    chunkOverlap: 50,
  });

  return new ParentDocumentRetriever({
    vectorstore,
    docstore,
    childSplitter: splitter,
    // Fragmentos pequenos são usados para busca, mas o documento pai é retornado
  });
};
```

#### 2. Self-Querying: Mais que Similaridade Vetorial

A busca vetorial falha com perguntas quantitativas ou filtros exatos (e.g., "documentos de finanças de 2023"). Implementamos **Self-Querying**, onde o LLM primeiro traduz a pergunta do usuário em um filtro de metadatos estruturado e uma query de busca.

- **Query**: "Artigos de finanças publicados após maio de 2023"
- **Filtro Gerado**: `{ category: { $eq: "finance" }, date: { $gt: "2023-05-01" } }`

Isso reduz drasticamente o espaço de busca e aumenta a precisão.

#### 3. Re-ranking: A Camada de Qualidade

Embeddings (como `text-embedding-3-small` da OpenAI) são excelentes para capturar similaridade semântica geral, mas às vezes falham em nuances específicas de domínio.

Integramos uma etapa de **Cross-Encoder Re-ranking** (usando modelos como Cohere ou BGE-Reranker) após a recuperação inicial. Se recuperarmos 50 documentos candidatos com busca vetorial rápida, o re-ranker (que é mais lento, mas mais preciso) analisa esses 50 pares (pergunta, documento) e seleciona os 5 melhores verdadeiros.

#### 4. Avaliação Contínua (RAGAS)

Não se pode melhorar o que não se mede. Implementamos o framework **RAGAS** (Retrieval Augmented Generation Assessment) para avaliar métricas chave:

- **Context Precision**: A informação relevante está nos documentos recuperados?
- **Context Recall**: _Toda_ a informação relevante foi recuperada?
- **Faithfulness**: A resposta do LLM baseia-se _unicamente_ no contexto fornecido (sem alucinações)?
- **Answer Relevance**: Ela realmente responde à pergunta do usuário?

Essas métricas são calculadas automaticamente em nosso pipeline de CI/CD para evitar regressões de conhecimento.

Levar RAG para produção não é apenas conectar um banco de dados vetorial a um LLM; é engenharia de precisão sobre como os dados são processados, recuperados e apresentados.
