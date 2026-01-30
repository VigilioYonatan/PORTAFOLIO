### ENGLISH (EN)

# @vigilio/preact-paginator

Managing pages, especially for large datasets, can involve tedious math and edge-case handling. `@vigilio/preact-paginator` is a specialized utility that abstracts the logic of pagination while providing a reactive interface via `@preact/signals`.

## 🎯 Key Capabilities

- **Gap Handling**: Automatically generates "..." markers for large page ranges.
- **Reactive State**: Updates UI instantly when the current page changes.
- **Math Abstraction**: Handles offsets, totals, and per-page limits seamlessly.
- **Zero UI Opinion**: Just hooks and logic, bring your own design.

---

## 📥 Installation

```bash
npm install @vigilio/preact-paginator
```

---

## 🚀 Basic Implementation

The hook provides all the necessary methods to control the navigation flow.

```tsx
import { usePaginator } from "@vigilio/preact-paginator";

function MyPaginator({ totalItems }) {
  const { page, pages, hasNext, hasPrev, onNextPage, onPrevPage, onGoToPage } =
    usePaginator({
      total: totalItems,
      limit: 10,
      initialPage: 1,
    });

  return (
    <nav class="flex gap-2">
      <button onClick={onPrevPage} disabled={!hasPrev.value}>
        Previous
      </button>

      {pages.value.map((p) => (
        <button
          class={page.value === p ? "active" : ""}
          onClick={() => onGoToPage(p)}
        >
          {p === "gap" ? "..." : p}
        </button>
      ))}

      <button onClick={onNextPage} disabled={!hasNext.value}>
        Next
      </button>
    </nav>
  );
}
```

---

## 🔗 Integration with `@vigilio/preact-table`

While `@vigilio/preact-table` has an internal pagination signal, using the paginator library allows for more granular control over complex navigation bars.

```tsx
// Example of synchronized paginator
const table = useTable({ ... });
const pagination = usePaginator({
    total: table.pagination.value.total,
    limit: table.pagination.value.limit
});

// Sync when table data changes
useEffect(() => {
    pagination.onTotalUpdate(table.pagination.value.total);
}, [table.pagination.value.total]);
```

---

## 🧠 Understanding the Logic

### The `pages` signal

The library doesn't just return a number. The `pages` signal returns an array of numbers and the string `'gap'`. This allows you to render smart pagination bars:

- **Short range**: `[1, 2, 3, 4, 5]`
- **Long range (start)**: `[1, 2, 3, 'gap', 50]`
- **Long range (middle)**: `[1, 'gap', 25, 26, 27, 'gap', 50]`

### Offsets Calculation

If your API requires `offset` instead of `page`, use the utility getter:

```typescript
const currentOffset = (page.value - 1) * limit;
```

---

## 🛠️ API Reference

### Constructor Options

| Param         | Description                                  | Default |
| :------------ | :------------------------------------------- | :------ |
| `total`       | Total number of items in the dataset.        | `0`     |
| `limit`       | Items per page.                              | `10`    |
| `initialPage` | The page to start on.                        | `1`     |
| `range`       | Number of visible pages around current page. | `2`     |

---

## 📈 Advanced Use: URL Sync

It is highly recommended to sync pagination with the URL for better UX (shareable links).

```tsx
const router = useRouter();
const { page } = usePaginator({
  initialPage: Number(router.query.page) || 1,
});

useEffect(() => {
  router.push({
    query: { ...router.query, page: page.value },
  });
}, [page.value]);
```

---

## 🌐 Real-world Example: Data Fetching

Combining `@vigilio/preact-paginator` with `@vigilio/preact-fetching` allows for powerful, automated server-side pagination with search and filtering.

```tsx
import { useEffect } from "preact/hooks";
import { useQuery } from "@vigilio/preact-fetching";
import { usePaginator } from "@vigilio/preact-paginator";

function ProductList() {
  const pagination = usePaginator({ limit: 10 });

  const { data, refetch, isLoading, isSuccess, isError, error } = useQuery(
    "/products",
    async (url) => {
      const params = new URLSearchParams();
      // Using internal pagination helpers for offsets
      params.append("offset", String(pagination.pagination.offset));
      params.append("limit", String(pagination.pagination.limit));

      const response = await fetch(`${url}?${params}`);
      const result = await response.json();
      if (!response.ok) throw result;
      return result;
    },
    {
      onSuccess(data) {
        // Keep paginator total count in sync with API
        pagination.updateData({
          total: data.count,
        });
      },
    },
  );

  // Refetch when page or limit changes
  useEffect(() => {
    refetch();
  }, [pagination.page.value, pagination.pagination.limit.value]);

  return (
    <div class="text-white space-y-4">
      {isLoading && <div>Loading products...</div>}
      {isError && <div>Error: {JSON.stringify(error)}</div>}

      {isSuccess && (
        <ul class="divide-y divide-white/10">
          {data.results.map((product) => (
            <li key={product.id} class="py-2">
              {product.name}
            </li>
          ))}
        </ul>
      )}

      <div class="flex items-center gap-4">
        {/* Pagination buttons */}
        <div class="flex gap-2">
          <button
            type="button"
            onClick={() => pagination.pagination.onBackPage()}
            disabled={!pagination.hasPrev.value}
            class="p-2 border"
          >
            {"<"}
          </button>
          <button
            type="button"
            onClick={() => pagination.pagination.onNextPage()}
            disabled={!pagination.hasNext.value}
            class="p-2 border"
          >
            {">"}
          </button>
        </div>

        {/* Limit Selector */}
        <select
          value={pagination.pagination.limit.value}
          onChange={(e) =>
            pagination.onchangeLimit(Number(e.currentTarget.value))
          }
          class="bg-transparent border p-1"
        >
          {[10, 20, 50].map((l) => (
            <option key={l} value={l}>
              {l} per page
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
```

---

## 🧪 Performance

The library is extremely lightweight (<1kb minified) and uses pure business logic without any side-effects. By leveraging Preact Signals, it avoids re-rendering the entire parent component tree, only updating the specific buttons that changed.

---

### ESPAÑOL (ES)

# @vigilio/preact-paginator

Gestionar páginas, especialmente para grandes conjuntos de datos, puede implicar matemáticas tediosas y manejo de casos extremos. `@vigilio/preact-paginator` es una utilidad especializada que abstrae la lógica de la paginación proporcionando una interfaz reactiva a través de `@preact/signals`.

## 🎯 Capacidades Clave

- **Manejo de Gaps**: Genera automáticamente marcadores "..." para rangos de páginas grandes.
- **Estado Reactivo**: Actualiza la interfaz de usuario instantáneamente cuando cambia la página actual.
- **Abstracción Matemática**: Maneja offsets, totales y límites por página sin esfuerzo.
- **Sin Opinión de UI**: Solo ganchos y lógica, trae tu propio diseño.

---

## 📥 Instalación

```bash
npm install @vigilio/preact-paginator
```

---

## 🚀 Implementación Básica

El hook proporciona todos los métodos necesarios para controlar el flujo de navegación.

```tsx
import { usePaginator } from "@vigilio/preact-paginator";

function MiPaginador({ totalItems }) {
  const { page, pages, hasNext, hasPrev, onNextPage, onPrevPage, onGoToPage } =
    usePaginator({
      total: totalItems,
      limit: 10,
      initialPage: 1,
    });

  return (
    <nav class="flex gap-2">
      <button onClick={onPrevPage} disabled={!hasPrev.value}>
        Anterior
      </button>

      {pages.value.map((p) => (
        <button
          class={page.value === p ? "active" : ""}
          onClick={() => onGoToPage(p)}
        >
          {p === "gap" ? "..." : p}
        </button>
      ))}

      <button onClick={onNextPage} disabled={!hasNext.value}>
        Siguiente
      </button>
    </nav>
  );
}
```

---

## 🔗 Integración con `@vigilio/preact-table`

Aunque `@vigilio/preact-table` tiene una señal de paginación interna, usar la biblioteca del paginator permite un control más granular sobre barras de navegación complejas.

```tsx
// Ejemplo de paginador sincronizado
const table = useTable({ ... });
const pagination = usePaginator({
    total: table.pagination.value.total,
    limit: table.pagination.value.limit
});

// Sincronizar cuando cambian los datos de la tabla
useEffect(() => {
    pagination.onTotalUpdate(table.pagination.value.total);
}, [table.pagination.value.total]);
```

---

## 🧠 Entendiendo la Lógica

### La señal `pages`

La biblioteca no solo devuelve un número. La señal `pages` devuelve un array de números y el string `'gap'`. Esto te permite renderizar barras de paginación inteligentes:

- **Rango corto**: `[1, 2, 3, 4, 5]`
- **Rango largo (inicio)**: `[1, 2, 3, 'gap', 50]`
- **Rango largo (medio)**: `[1, 'gap', 25, 26, 27, 'gap', 50]`

### Cálculo de Offsets

Si tu API requiere `offset` en lugar de `page`, usa el getter de utilidad:

```typescript
const currentOffset = (page.value - 1) * limit;
```

---

## 🛠️ Referencia de API

### Opciones del Constructor

| Parámetro     | Descripción                                               | Por Defecto |
| :------------ | :-------------------------------------------------------- | :---------- |
| `total`       | Número total de elementos en el conjunto de datos.        | `0`         |
| `limit`       | Elementos por página.                                     | `10`        |
| `initialPage` | La página para empezar.                                   | `1`         |
| `range`       | Número de páginas visibles alrededor de la página actual. | `2`         |

---

## 📈 Uso Avanzado: Sincronización de URL

Se recomienda encarecidamente sincronizar la paginación con la URL para una mejor experiencia de usuario (enlaces compartibles).

```tsx
const router = useRouter();
const { page } = usePaginator({
  initialPage: Number(router.query.page) || 1,
});

useEffect(() => {
  router.push({
    query: { ...router.query, page: page.value },
  });
}, [page.value]);
```

---

## 🌐 Ejemplo Real: Obtención de Datos (Fetching)

Combinar `@vigilio/preact-paginator` con `@vigilio/preact-fetching` permite una paginación potente y automatizada del lado del servidor con búsqueda y filtrado.

```tsx
import { useEffect } from "preact/hooks";
import { useQuery } from "@vigilio/preact-fetching";
import { usePaginator } from "@vigilio/preact-paginator";

function ListaDeProductos() {
  const pagination = usePaginator({ limit: 10 });

  const { data, refetch, isLoading, isSuccess, isError, error } = useQuery(
    "/products",
    async (url) => {
      const params = new URLSearchParams();
      // Uso de helpers internos para el offset y límite
      params.append("offset", String(pagination.pagination.offset));
      params.append("limit", String(pagination.pagination.limit));

      const response = await fetch(`${url}?${params}`);
      const result = await response.json();
      if (!response.ok) throw result;
      return result;
    },
    {
      onSuccess(data) {
        // Mantener el total del paginador sincronizado con la API
        pagination.updateData({
          total: data.count,
        });
      },
    },
  );

  // Refetch cuando cambia la página o el límite
  useEffect(() => {
    refetch();
  }, [pagination.page.value, pagination.pagination.limit.value]);

  return (
    <div class="text-white space-y-4">
      {isLoading && <div>Cargando productos...</div>}
      {isError && <div>Error: {JSON.stringify(error)}</div>}

      {isSuccess && (
        <ul class="divide-y divide-white/10">
          {data.results.map((product) => (
            <li key={product.id} class="py-2">
              {product.name}
            </li>
          ))}
        </ul>
      )}

      <div class="flex items-center gap-4">
        {/* Botones de navegación */}
        <div class="flex gap-2">
          <button
            type="button"
            onClick={() => pagination.pagination.onBackPage()}
            disabled={!pagination.hasPrev.value}
            class="p-2 border"
          >
            {"<"}
          </button>
          <button
            type="button"
            onClick={() => pagination.pagination.onNextPage()}
            disabled={!pagination.hasNext.value}
            class="p-2 border"
          >
            {">"}
          </button>
        </div>

        {/* Selector de Límite */}
        <select
          value={pagination.pagination.limit.value}
          onChange={(e) =>
            pagination.onchangeLimit(Number(e.currentTarget.value))
          }
          class="bg-transparent border p-1"
        >
          {[10, 20, 50].map((l) => (
            <option key={l} value={l}>
              {l} por página
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
```

---

## 🧪 Rendimiento

La biblioteca es extremadamente ligera (<1kb minificada) y utiliza pura lógica de negocio sin efectos secundarios. Al aprovechar Preact Signals, evita el re-renderizado de todo el árbol de componentes padre, actualizando solo los botones específicos que han cambiado.

---

### PORTUGUÊS (PT)

# @vigilio/preact-paginator

Gerenciar páginas, especialmente para grandes conjuntos de dados, pode envolver cálculos matemáticos tediosos e tratamento de casos extremos. O `@vigilio/preact-paginator` é um utilitário especializado que abstrai a lógica da paginação enquanto fornece uma interface reativa via `@preact/signals`.

## 🎯 Recursos Principais

- **Tratamento de Gaps**: Gera automaticamente marcadores "..." para grandes intervalos de páginas.
- **Estado Reativo**: Atualiza a interface instantaneamente quando a página atual muda.
- **Abstração Matemática**: Gerencia offsets, totais e limites por página perfeitamente.
- **Sem Opinião de UI**: Apenas hooks e lógica, traga seu próprio design.

---

## 📥 Instalação

```bash
npm install @vigilio/preact-paginator
```

---

## 🚀 Implementação Básica

O hook fornece todos os métodos necessários para controlar o fluxo de navegação.

```tsx
import { usePaginator } from "@vigilio/preact-paginator";

function MeuPaginador({ totalItems }) {
  const { page, pages, hasNext, hasPrev, onNextPage, onPrevPage, onGoToPage } =
    usePaginator({
      total: totalItems,
      limit: 10,
      initialPage: 1,
    });

  return (
    <nav class="flex gap-2">
      <button onClick={onPrevPage} disabled={!hasPrev.value}>
        Anterior
      </button>

      {pages.value.map((p) => (
        <button
          class={page.value === p ? "active" : ""}
          onClick={() => onGoToPage(p)}
        >
          {p === "gap" ? "..." : p}
        </button>
      ))}

      <button onClick={onNextPage} disabled={!hasNext.value}>
        Próximo
      </button>
    </nav>
  );
}
```

---

## 🔗 Integração com o `@vigilio/preact-table`

Embora o `@vigilio/preact-table` tenha um sinal de paginação interna, o uso da biblioteca do paginador permite um controle mais granular sobre barras de navegação complexas.

```tsx
// Exemplo de paginador sincronizado
const table = useTable({ ... });
const pagination = usePaginator({
    total: table.pagination.value.total,
    limit: table.pagination.value.limit
});

// Sincronizar quando os dados da tabela mudam
useEffect(() => {
    pagination.onTotalUpdate(table.pagination.value.total);
}, [table.pagination.value.total]);
```

---

## 🧠 Entendendo a Lógica

### O sinal `pages`

A biblioteca não retorna apenas um número. O sinal `pages` retorna um array de números e a string `'gap'`. Isso permite renderizar barras de paginação inteligentes:

- **Intervalo curto**: `[1, 2, 3, 4, 5]`
- **Intervalo longo (início)**: `[1, 2, 3, 'gap', 50]`
- **Intervalo longo (meio)**: `[1, 'gap', 25, 26, 27, 'gap', 50]`

### Cálculo de Offsets

Se sua API exigir `offset` em vez de `page`, use o utilitário getter:

```typescript
const currentOffset = (page.value - 1) * limit;
```

---

## 🛠️ Referência da API

### Opções do Construtor

| Parâmetro     | Descrição                                            | Padrão |
| :------------ | :--------------------------------------------------- | :----- |
| `total`       | Número total de itens no conjunto de dados.          | `0`    |
| `limit`       | Itens por página.                                    | `10`   |
| `initialPage` | A página para começar.                               | `1`    |
| `range`       | Número de páginas visíveis ao redor da página atual. | `2`    |

---

## 📈 Uso Avançado: Sincronização de URL

É altamente recomendado sincronizar a paginação com a URL para uma melhor experiência do usuário (links compartilháveis).

```tsx
const router = useRouter();
const { page } = usePaginator({
  initialPage: Number(router.query.page) || 1,
});

useEffect(() => {
  router.push({
    query: { ...router.query, page: page.value },
  });
}, [page.value]);
```

---

## 🌐 Exemplo Real: Busca de Dados (Fetching)

Combinar o `@vigilio/preact-paginator` com o `@vigilio/preact-fetching` permite uma paginação poderosa e automatizada do lado do servidor com busca e filtragem.

```tsx
import { useEffect } from "preact/hooks";
import { useQuery } from "@vigilio/preact-fetching";
import { usePaginator } from "@vigilio/preact-paginator";

function ListaDeProdutos() {
  const pagination = usePaginator({ limit: 10 });

  const { data, refetch, isLoading, isSuccess, isError, error } = useQuery(
    "/products",
    async (url) => {
      const params = new URLSearchParams();
      // Uso de helpers internos para offset e limite
      params.append("offset", String(pagination.pagination.offset));
      params.append("limit", String(pagination.pagination.limit));

      const response = await fetch(`${url}?${params}`);
      const result = await response.json();
      if (!response.ok) throw result;
      return result;
    },
    {
      onSuccess(data) {
        // Manter o total do paginador sincronizado com a API
        pagination.updateData({
          total: data.count,
        });
      },
    },
  );

  // Refetch automático quando a página ou o limite muda
  useEffect(() => {
    refetch();
  }, [pagination.page.value, pagination.pagination.limit.value]);

  return (
    <div class="text-white space-y-4">
      {isLoading && <div>Carregando produtos...</div>}
      {isError && <div>Erro: {JSON.stringify(error)}</div>}

      {isSuccess && (
        <ul class="divide-y divide-white/10">
          {data.results.map((product) => (
            <li key={product.id} class="py-2">
              {product.name}
            </li>
          ))}
        </ul>
      )}

      <div class="flex items-center gap-4">
        {/* Botões de navegação */}
        <div class="flex gap-2">
          <button
            type="button"
            onClick={() => pagination.pagination.onBackPage()}
            disabled={!pagination.hasPrev.value}
            class="p-2 border"
          >
            {"<"}
          </button>
          <button
            type="button"
            onClick={() => pagination.pagination.onNextPage()}
            disabled={!pagination.hasNext.value}
            class="p-2 border"
          >
            {">"}
          </button>
        </div>

        {/* Seletor de Limite */}
        <select
          value={pagination.pagination.limit.value}
          onChange={(e) =>
            pagination.onchangeLimit(Number(e.currentTarget.value))
          }
          class="bg-transparent border p-1"
        >
          {[10, 20, 50].map((l) => (
            <option key={l} value={l}>
              {l} por página
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
```

---

## 🧪 Performance

A biblioteca é extremamente leve (<1kb minificada) e utiliza pura lógica de negócios sem efeitos colaterais. Ao aproveitar os Preact Signals, evita a renderização de toda a árvore de componentes pai, atualizando apenas os botões específicos que mudaram.
