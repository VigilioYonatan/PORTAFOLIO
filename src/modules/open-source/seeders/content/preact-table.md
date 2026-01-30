### ENGLISH (EN)

# @vigilio/preact-table

Modern web applications often revolve around data. Presenting that data in a performant, accessible, and feature-rich table is one of the hardest challenges in UI development. `@vigilio/preact-table` is a **headless** utility that handles the complex logic of table management while leaving the UI entirely in your hands.

## 💡 Core Philosophy

By being headless, this library doesn't ship any CSS or HTML tags. Instead, it provides a powerful `useTable` hook that manages:

- **Reactivity**: Integrated with `@preact/signals` for lightning-fast updates.
- **Flexibility**: Works with any CSS framework (Tailwind, Bootstrap, Vanilla).
- **Scalability**: Handles thousands of rows with ease using optimized rendering patterns.

---

## 📥 Installation

```bash
pnpm add @vigilio/preact-table @vigilio/preact-paginator @preact/signals
```

---

## 🚀 Implementation Guide

### 1. Define your Columns

Columns are defined as an array of objects. You can specify headers, accessors, and custom cell renderers.

```typescript
const columns = [
    { key: 'id', header: 'ID', sort: true },
    { key: 'name', header: 'Product Name', sort: true },
    {
        key: 'price',
        header: 'Price',
        cell: (val) => `\$${val.toFixed(2)}`
    },
    {
        key: 'actions',
        header: 'Actions',
        cell: (_, item) => <button onClick={() => edit(item.id)}>Edit</button>
    }
];
```

### 2. Initialize the Hook

Connect your columns and initial state to the `useTable` hook.

```tsx
import { useTable } from "@vigilio/preact-table";

function MyTable() {
  const table = useTable({
    columns,
    pagination: { limit: 20 },
    sort: { column: "name", order: "asc" },
  });

  return (
    <table>
      <thead>
        {table.headers.map((header) => (
          <th onClick={() => header.onSort()}>
            {header.label}
            {header.isSorted ? (header.isAsc ? " 🔼" : " 🔽") : ""}
          </th>
        ))}
      </thead>
      <tbody>
        {table.body.map((row) => (
          <tr>
            {row.cells.map((cell) => (
              <td>{cell.render()}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 🔄 Server-Side Integration

One of the strongest features is the seamless integration with `@vigilio/preact-fetching` for server-side operations.

```tsx
const { pagination, sort, search, updateData } = table;

const { refetch, isLoading } = useQuery(
  "/api/products",
  async (url) => {
    const params = new URLSearchParams({
      offset: String(pagination.value.offset),
      limit: String(pagination.value.limit),
      sort: sort.value.column,
      order: sort.value.order,
      q: search.value,
    });
    const res = await fetch(`\$" + "{url}?\$" + "{params}`);
    return res.json();
  },
  {
    onSuccess: (data) => updateData(data.results, { total: data.total }),
  },
);

// Refetch when table state changes
useEffect(() => {
  refetch();
}, [pagination.value.offset, sort.value, search.value]);
```

---

## 🛠️ Advanced Features

### 1. Global Search and Filtering

Instead of writing complex regex for chaque column, use the built-in search signals.

```tsx
<input
  type="text"
  placeholder="Search products..."
  value={table.search.value}
  onInput={(e) => table.search.onSearch(e.currentTarget.value)}
/>
```

### 2. Selection and Bulk Actions

Manage row selection state with boolean signals attached to each row.

```tsx
const { select } = table;

function BulkDelete() {
  const selectedCount = select.selectedIds.value.length;
  return (
    <button disabled={selectedCount === 0}>Delete {selectedCount} items</button>
  );
}
```

---

## 📖 API Table Reference

### Hook Options (`TableOptions`)

| Key            | Description                         | Type                                 |
| :------------- | :---------------------------------- | :----------------------------------- | --------- |
| `columns`      | The definition of table columns.    | `Column[]`                           |
| `pagination`   | Initial pagination state.           | `{ limit: number, offset?: number }` |
| `sort`         | Initial sorting state.              | `{ column: string, order: 'asc'      | 'desc' }` |
| `onDataUpdate` | Callback fired when data is synced. | `(data: any[]) => void`              |

### Return Object (`TableHandle`)

- `body`: Array of rows, each containing an array of cell objects.
- `headers`: Array of object containing column labels and sorting methods.
- `pagination`: The signal-based pagination controller.
- `sort`: The signal-based sorting controller.
- `search`: The signal-based search controller.

---

## 💅 Styling with Tailwind CSS

Combining the headless nature with Tailwind results in a very lean setup:

```tsx
<table class="w-full text-left">
    <thead class="bg-slate-100">
        {table.headers.map(h => (
            <th class="p-4 font-semibold text-slate-700">{h.label}</th>
        ))}
    </thead>
    <tbody class="divide-y">
        {table.body.map(r => (
            <tr class="hover:bg-slate-50 transition-colors">
                {r.cells.map(c => (
                    <td class="p-4">{c.render()}</td>
                ))}
            </tr>
        ))
    </tbody>
</table>
```

---

### ESPAÑOL (ES)

# @vigilio/preact-table

Las aplicaciones web modernas a menudo giran en torno a los datos. Presentar esos datos en una tabla de alto rendimiento, accesible y rica en funciones es uno de los desafíos más difíciles en el desarrollo de UI. `@vigilio/preact-table` es una utilidad **headless** que gestiona la compleja lógica de gestión de tablas dejando la UI totalmente en tus manos.

## 💡 Filosofía Principal

Al ser headless, esta biblioteca no incluye ninguna etiqueta CSS o HTML. En su lugar, proporciona un potente hook `useTable` que gestiona:

- **Reactividad**: Integrado con `@preact/signals` para actualizaciones ultra rápidas.
- **Flexibilidad**: Funciona con cualquier framework de CSS (Tailwind, Bootstrap, Vanilla).
- **Escalabilidad**: Gestiona miles de filas con facilidad utilizando patrones de renderizado optimizados.

---

## 📥 Instalación

```bash
pnpm add @vigilio/preact-table @vigilio/preact-paginator @preact/signals
```

---

## 🚀 Guía de Implementación

### 1. Define tus Columnas

Las columnas se definen como un array de objetos. Puedes especificar cabeceras, accesores y renderizadores de celdas personalizados.

```typescript
const columns = [
    { key: 'id', header: 'ID', sort: true },
    { key: 'name', header: 'Nombre del Producto', sort: true },
    {
        key: 'price',
        header: 'Precio',
        cell: (val) => `\$\${val.toFixed(2)}`
    },
    {
        key: 'actions',
        header: 'Acciones',
        cell: (_, item) => <button onClick={() => edit(item.id)}>Editar</button>
    }
];
```

### 2. Inicializa el Hook

Conecta tus columnas y el estado inicial al hook `useTable`.

```tsx
import { useTable } from "@vigilio/preact-table";

function MyTable() {
  const table = useTable({
    columns,
    pagination: { limit: 20 },
    sort: { column: "name", order: "asc" },
  });

  return (
    <table>
      <thead>
        {table.headers.map((header) => (
          <th onClick={() => header.onSort()}>
            {header.label}
            {header.isSorted ? (header.isAsc ? " 🔼" : " 🔽") : ""}
          </th>
        ))}
      </thead>
      <tbody>
        {table.body.map((row) => (
          <tr>
            {row.cells.map((cell) => (
              <td>{cell.render()}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 🔄 Integración con el Servidor

Una de las características más potentes es la integración fluida con `@vigilio/preact-fetching` para operaciones en el servidor.

```tsx
const { pagination, sort, search, updateData } = table;

const { refetch, isLoading } = useQuery(
  "/api/products",
  async (url) => {
    const params = new URLSearchParams({
      offset: String(pagination.value.offset),
      limit: String(pagination.value.limit),
      sort: sort.value.column,
      order: sort.value.order,
      q: search.value,
    });
    const res = await fetch(`\$" + "{url}?\$" + "{params}`);
    return res.json();
  },
  {
    onSuccess: (data) => updateData(data.results, { total: data.total }),
  },
);

// Volver a consultar cuando cambia el estado de la tabla
useEffect(() => {
  refetch();
}, [pagination.value.offset, sort.value, search.value]);
```

---

## 🛠️ Características Avanzadas

### 1. Búsqueda Global y Filtrado

En lugar de escribir regex complejos para cada columna, usa las señales de búsqueda integradas.

```tsx
<input
  type="text"
  placeholder="Buscar productos..."
  value={table.search.value}
  onInput={(e) => table.search.onSearch(e.currentTarget.value)}
/>
```

### 2. Selección y Acciones en Lote

Gestiona el estado de selección de filas con señales booleanas asociadas a cada fila.

```tsx
const { select } = table;

function BulkDelete() {
  const selectedCount = select.selectedIds.value.length;
  return (
    <button disabled={selectedCount === 0}>
      Eliminar {selectedCount} elementos
    </button>
  );
}
```

---

## 📖 Referencia de Tabla de API

### Opciones del Hook (`TableOptions`)

| Clave          | Descripción                                         | Tipo                                 |
| :------------- | :-------------------------------------------------- | :----------------------------------- | --------- |
| `columns`      | La definición de las columnas de la tabla.          | `Column[]`                           |
| `pagination`   | Estado inicial de paginación.                       | `{ limit: number, offset?: number }` |
| `sort`         | Estado inicial de ordenación.                       | `{ column: string, order: 'asc'      | 'desc' }` |
| `onDataUpdate` | Callback ejecutado cuando los datos se sincronizan. | `(data: any[]) => void`              |

---

### PORTUGUÊS (PT)

# @vigilio/preact-table

Aplicações web modernas geralmente giram em torno de dados. Apresentar esses dados em uma tabela de alto desempenho, acessível e rica em recursos é um dos maiores desafios no desenvolvimento de UI. `@vigilio/preact-table` é um utilitário **headless** que gerencia a lógica complexa de gerenciamento de tabelas enquanto deixa a interface inteiramente em suas mãos.

## 💡 Filosofia Central

Sendo headless, esta biblioteca não inclui nenhuma tag CSS ou HTML. Em vez disso, ela fornece um poderoso hook `useTable` que gerencia:

- **Reatividade**: Integrado com `@preact/signals` para atualizações ultra rápidas.
- **Flexibilidade**: Funciona com qualquer framework CSS (Tailwind, Bootstrap, Vanilla).
- **Escalabilidade**: Gerencia milhares de linhas com facilidade usando padrões de renderização otimizados.

---

## 📥 Instalação

```bash
pnpm add @vigilio/preact-table @vigilio/preact-paginator @preact/signals
```

---

## 🚀 Guia de Implementação

### 1. Defina suas Colunas

As colunas são definidas como um array de objetos. Você pode especificar cabeçalhos, acessores e renderizadores de células personalizados.

```typescript
const columns = [
    { key: 'id', header: 'ID', sort: true },
    { key: 'name', header: 'Nome do Produto', sort: true },
    {
        key: 'price',
        header: 'Preço',
        cell: (val) => `\$\${val.toFixed(2)}`
    },
    {
        key: 'actions',
        header: 'Ações',
        cell: (_, item) => <button onClick={() => edit(item.id)}>Editar</button>
    }
];
```

### 2. Inicialize o Hook

Conecte suas colunas e o estado inicial ao hook `useTable`.

```tsx
import { useTable } from "@vigilio/preact-table";

function MyTable() {
  const table = useTable({
    columns,
    pagination: { limit: 20 },
    sort: { column: "name", order: "asc" },
  });

  return (
    <table>
      <thead>
        {table.headers.map((header) => (
          <th onClick={() => header.onSort()}>
            {header.label}
            {header.isSorted ? (header.isAsc ? " 🔼" : " 🔽") : ""}
          </th>
        ))}
      </thead>
      <tbody>
        {table.body.map((row) => (
          <tr>
            {row.cells.map((cell) => (
              <td>{cell.render()}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 🔄 Integração com Servidor

Um dos recursos mais fortes é a integração perfeita com o `@vigilio/preact-fetching` para operações no lado do servidor.

```tsx
const { pagination, sort, search, updateData } = table;

const { refetch, isLoading } = useQuery(
  "/api/products",
  async (url) => {
    const params = new URLSearchParams({
      offset: String(pagination.value.offset),
      limit: String(pagination.value.limit),
      sort: sort.value.column,
      order: sort.value.order,
      q: search.value,
    });
    const res = await fetch(`\$" + "{url}?\$" + "{params}`);
    return res.json();
  },
  {
    onSuccess: (data) => updateData(data.results, { total: data.total }),
  },
);

// Refetch quando o estado da tabela muda
useEffect(() => {
  refetch();
}, [pagination.value.offset, sort.value, search.value]);
```

---

## 📖 Referência da API

### Opções do Hook (`TableOptions`)

| Chave          | Descrição                                             | Tipo                                 |
| :------------- | :---------------------------------------------------- | :----------------------------------- | --------- |
| `columns`      | A definição das colunas da tabela.                    | `Column[]`                           |
| `pagination`   | Estado inicial de paginação.                          | `{ limit: number, offset?: number }` |
| `sort`         | Estado inicial de ordenação.                          | `{ column: string, order: 'asc'      | 'desc' }` |
| `onDataUpdate` | Callback disparado quando os dados são sincronizados. | `(data: any[]) => void`              |
