### ENGLISH (EN)

# @vigilio/preact-fetching

Handling server state in Preact has never been easier. `@vigilio/preact-fetching` provides a powerful suite of hooks to manage asynchronous data fetching, caching, and state synchronization with a declarative API.

## 🌟 Highlight Features

- **Automatic Caching**: Minimize network requests with smart stale-while-revalidate logic.
- **Refetch on Window Focus**: Keep your data fresh automatically.
- **Optimistic Updates**: Update the UI instantly while the server processes the request.
- **Infinite Queries**: Built-in support for paginated and scrolling data.
- **Zero Dependencies**: Lightweight and optimized for Preact's signal-based reactivity.

---

## 📥 Installation

```bash
pnpm add @vigilio/preact-fetching @preact/signals tslib
```

---

## 🔍 Querying Data: `useQuery`

The primary hook for fetching data. It manages the loading, error, and success states for you.

```typescript
import { useQuery } from "@vigilio/preact-fetching";

function UserProfile({ userId }) {
    const { isLoading, data, error, refetch } = useQuery(["/users", userId], async (url) => {
        const res = await fetch(`https://api.myapp.com${url}`);
        if (!res.ok) throw new Error("Network error");
        return res.json();
    });

    if (isLoading) return <p>Loading user...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div>
            <h1>{data.name}</h1>
            <button onClick={() => refetch()}>Refresh Data</button>
        </div>
    );
}
```

### Advanced Query Options

You can fine-tune the behavior with the third argument:

```typescript
const { data } = useQuery("/news", fetchNews, {
  staleTime: 60 * 1000, // 1 minute
  refetchInterval: 5000, // Poll every 5 seconds
  enabled: !!userLoggedIn, // Dependent query
  onSuccess: (data) => console.log("New news arrived!", data),
  transformData: (data) =>
    data.map((item) => ({ ...item, date: new Date(item.date) })),
});
```

---

## ⚡ Mutating Data: `useMutation`

Use this hook for POST, PUT, DELETE, and PATCH operations.

```typescript
import { useMutation } from "@vigilio/preact-fetching";

function AddComment() {
    const { mutate, isLoading } = useMutation("/comments", async (url, body) => {
        return fetch(url, { method: 'POST', body: JSON.stringify(body) });
    }, {
        onSuccess: () => {
             alert("Comment added successfully!");
        },
        onError: (err) => alert("Failed to add comment!")
    });

    const handleSubmit = (text) => {
        mutate({ text, date: new Date() });
    };

    return (
        <button disabled={isLoading} onClick={() => handleSubmit("Hello!")}>
            {isLoading ? "Sending..." : "Submit Comment"}
        </button>
    );
}
```

---

## 🧠 Caching Logic & Internals

`@vigilio/preact-fetching` uses a centralized cache. When you use a key like `['/users', 1]`, the library checks if that data is already in memory:

1. **Fresh Data**: If `staleTime` has not passed, it returns the cached data immediately.
2. **Stale Data**: It returns the cached data but simultaneously triggers a fresh fetch in the background to update the cache.
3. **Automatic Garbage Collection**: Data that is no longer being used by any component is cleaned up after a configurable `cacheTime` (default 5 minutes).

## 📄 Summary API Reference

### Query Hooks Status

- `isLoading`: Initial fetch in progress.
- `isFetching`: Any fetch (initial or background) in progress.
- `isSuccess`: Data received successfully.
- `isError`: Request failed.
- `isPlaceholderData`: Shows true if data is currently showing stale/placeholder content.

---

### ESPAÑOL (ES)

# @vigilio/preact-fetching

Gestionar el estado del servidor en Preact nunca ha sido tan fácil. `@vigilio/preact-fetching` ofrece un potente conjunto de hooks para gestionar la obtención de datos asíncronos, el almacenamiento en caché y la sincronización del estado con una API declarativa.

## 🌟 Características Destacadas

- **Caché Automático**: Minimiza las peticiones de red con una lógica inteligente de stale-while-revalidate.
- **Refetch al Enfocar Ventana**: Mantén tus datos frescos automáticamente.
- **Actualizaciones Optimistas**: Actualiza la UI instantáneamente mientras el servidor procesa la solicitud.
- **Consultas Infinitas**: Soporte integrado para datos paginados y con scroll infinito.
- **Cero Dependencias**: Ligero y optimizado para la reactividad basada en signals de Preact.

---

## 📥 Instalación

```bash
pnpm add @vigilio/preact-fetching @preact/signals tslib
```

---

## 🔍 Consultando Datos: `useQuery`

El hook principal para obtener datos. Gestiona los estados de carga, error y éxito por ti.

```typescript
import { useQuery } from "@vigilio/preact-fetching";

function UserProfile({ userId }) {
    const { isLoading, data, error, refetch } = useQuery(["/users", userId], async (url) => {
        const res = await fetch(`https://api.myapp.com${url}`);
        if (!res.ok) throw new Error("Error de red");
        return res.json();
    });

    if (isLoading) return <p>Cargando usuario...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div>
            <h1>{data.name}</h1>
            <button onClick={() => refetch()}>Refrescar Datos</button>
        </div>
    );
}
```

### Opciones Avanzadas de Consulta

Puedes ajustar el comportamiento con el tercer argumento:

```typescript
const { data } = useQuery("/news", fetchNews, {
  staleTime: 60 * 1000, // 1 minuto
  refetchInterval: 5000, // Consultar cada 5 segundos
  enabled: !!userLoggedIn, // Consulta dependiente
  onSuccess: (data) => console.log("¡Llegaron nuevas noticias!", data),
  transformData: (data) =>
    data.map((item) => ({ ...item, date: new Date(item.date) })),
});
```

---

## ⚡ Mutando Datos: `useMutation`

Usa este hook para operaciones POST, PUT, DELETE y PATCH.

```typescript
import { useMutation } from "@vigilio/preact-fetching";

function AddComment() {
    const { mutate, isLoading } = useMutation("/comments", async (url, body) => {
        return fetch(url, { method: 'POST', body: JSON.stringify(body) });
    }, {
        onSuccess: () => {
             alert("¡Comentario añadido con éxito!");
        },
        onError: (err) => alert("¡Error al añadir comentario!")
    });

    const handleSubmit = (text) => {
        mutate({ text, date: new Date() });
    };

    return (
        <button disabled={isLoading} onClick={() => handleSubmit("¡Hola!")}>
            {isLoading ? "Enviando..." : "Enviar Comentario"}
        </button>
    );
}
```

---

## 🧠 Lógica de Caché e Internals

`@vigilio/preact-fetching` utiliza un caché centralizado. Cuando usas una clave como `['/users', 1]`, la biblioteca comprueba si esos datos ya están en memoria:

1. **Datos Frescos**: Si el `staleTime` no ha pasado, devuelve los datos en caché inmediatamente.
2. **Datos Obsoletos (Stale)**: Devuelve los datos en caché pero simultáneamente dispara una nueva petición en segundo plano para actualizar el caché.
3. **Recolección de Basura Automática**: Los datos que ya no son usados por ningún componente se limpian tras un `cacheTime` configurable (por defecto 5 minutos).

## 📄 Referencia de Resumen de API

### Estado de los Hooks de Consulta

- `isLoading`: Obtención inicial en progreso.
- `isFetching`: Cualquier obtención (inicial o en segundo plano) en progreso.
- `isSuccess`: Datos recibidos con éxito.
- `isError`: La petición falló.
- `isPlaceholderData`: Indica si los datos mostrados actualmente son obsoletos o de marcador de posición.

---

### PORTUGUÊS (PT)

# @vigilio/preact-fetching

Gerenciar o estado do servidor no Preact nunca foi tão fácil. O `@vigilio/preact-fetching` oferece um conjunto poderoso de hooks para gerenciar a busca de dados assíncronos, cache e sincronização de estado com uma API declarativa.

## 🌟 Destaques

- **Cache Automático**: Minimize as requisições de rede com uma lógica inteligente de stale-while-revalidate.
- **Refetch ao Focar Janela**: Mantenha seus dados atualizados automaticamente.
- **Atualizações Otimistas**: Atualize a interface instantaneamente enquanto o servidor processa a requisição.
- **Queries Infinitas**: Suporte integrado para dados paginados e rolagem infinita.
- **Zero Dependências**: Leve e otimizado para a reatividade baseada em signals do Preact.

---

## 📥 Instalação

```bash
pnpm add @vigilio/preact-fetching @preact/signals tslib
```

---

## 🔍 Buscando Dados: `useQuery`

O hook principal para buscar dados. Ele gerencia os estados de carregamento, erro e sucesso para você.

```typescript
import { useQuery } from "@vigilio/preact-fetching";

function UserProfile({ userId }) {
    const { isLoading, data, error, refetch } = useQuery(["/users", userId], async (url) => {
        const res = await fetch(`https://api.myapp.com${url}`);
        if (!res.ok) throw new Error("Erro de rede");
        return res.json();
    });

    if (isLoading) return <p>Carregando usuário...</p>;
    if (error) return <p>Erro: {error.message}</p>;

    return (
        <div>
            <h1>{data.name}</h1>
            <button onClick={() => refetch()}>Atualizar Dados</button>
        </div>
    );
}
```

### Opções Avançadas de Busca

Você pode ajustar o comportamento com o terceiro argumento:

```typescript
const { data } = useQuery("/news", fetchNews, {
  staleTime: 60 * 1000, // 1 minuto
  refetchInterval: 5000, // Buscar a cada 5 segundos
  enabled: !!userLoggedIn, // Busca dependente
  onSuccess: (data) => console.log("Novas notícias chegaram!", data),
  transformData: (data) =>
    data.map((item) => ({ ...item, date: new Date(item.date) })),
});
```

---

## ⚡ Alterando Dados: `useMutation`

Use este hook para operações POST, PUT, DELETE e PATCH.

```typescript
import { useMutation } from "@vigilio/preact-fetching";

function AddComment() {
    const { mutate, isLoading } = useMutation("/comments", async (url, body) => {
        return fetch(url, { method: 'POST', body: JSON.stringify(body) });
    }, {
        onSuccess: () => {
             alert("Comentário adicionado com sucesso!");
        },
        onError: (err) => alert("Falha ao adicionar comentário!")
    });

    const handleSubmit = (text) => {
        mutate({ text, date: new Date() });
    };

    return (
        <button disabled={isLoading} onClick={() => handleSubmit("Olá!")}>
            {isLoading ? "Enviando..." : "Enviar Comentário"}
        </button>
    );
}
```

---

## 🧠 Lógica de Cache e Internals

O `@vigilio/preact-fetching` utiliza um cache centralizado. Quando você usa uma chave como `['/users', 1]`, a biblioteca verifica se esses dados já estão em memória:

1. **Dados Novos (Fresh)**: Se o `staleTime` não passou, retorna os dados em cache imediatamente.
2. **Dados Antigos (Stale)**: Retorna os dados em cache, mas dispara simultaneamente uma nova busca em segundo plano para atualizar o cache.
3. **Limpeza Automática**: Dados que não estão sendo usados por nenhum componente são limpos após um `cacheTime` configurável (padrão 5 minutos).

## 📄 Referência de Status da API

### Status dos Hooks de Busca

- `isLoading`: Busca inicial em andamento.
- `isFetching`: Qualquer busca (inicial ou em segundo plano) em andamento.
- `isSuccess`: Dados recebidos com sucesso.
- `isError`: A requisição falhou.
- `isPlaceholderData`: Indica se os dados atuais são antigos ou de preenchimento.
