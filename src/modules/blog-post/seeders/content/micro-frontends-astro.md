### ESPAÑOL (ES)

El paradigma de Micro-Frontends (MFE) ha sido tradicionalmente una espada de doble filo: promete autonomía para los equipos de desarrollo pero a menudo entrega una experiencia de usuario (UX) fragmentada, inconsistente y, lo peor de todo, extremadamente pesada. Las implementaciones clásicas basadas en Module Federation (Webpack 5) o iframes suelen resultar en "monolitos distribuidos" que descargan megabytes de JavaScript, duplicando dependencias y destrozando el Core Web Vitals.

Astro cambia fundamentalmente este juego al introducir la **Arquitectura de Islas (Islands Architecture)**. A diferencia de Next.js o Remix, que hidratan toda la página, Astro no orquesta JavaScript en el cliente; orquesta HTML en el servidor. Esto permite una arquitectura de micro-frontends que es _Zero-JS por defecto_.

#### 1. Arquitectura de Islas: El Fin de la Hidratación Masiva

![Astro Islands Architecture - Concept](./images/micro-frontends-astro/islands-architecture.png)

En una Single Page Application (SPA) tradicional, el navegador recibe un shell vacío y un bundle JS gigante que debe analizarse y ejecutarse antes de que el usuario pueda ver o interactuar con algo.
Con Astro, el servidor renderiza HTML puro. Las partes interactivas son "islas" aisladas.

**Escenario Realista:** Un Dashboard de E-commerce.

- **Barra de Navegación**: Equipo de Diseño (React). Interactivo para dropdowns.
- **Lista de Productos**: Equipo de Catálogo (Vue). Interactivo para filtros.
- **Banner Promocional**: Equipo de Marketing (HTML/CSS puro). Estático.
- **Carrito Lateral**: Equipo de Checkout (Svelte). Altamente reactivo.

```astro
---
// index.astro
// Importamos componentes de diferentes frameworks sin conflictos
import Header from '../modules/core/Header.jsx';
import ProductGrid from '../modules/catalog/ProductGrid.vue';
import PromoBanner from '../modules/marketing/Banner.astro';
import CartSidebar from '../modules/checkout/Cart.svelte';

// Data fetching en el servidor (build time o request time)
const products = await fetch('https://api.store.com/products').then(r => r.json());
---

<html lang="es">
  <head>
    <title>Tienda Enterprise</title>
  </head>
  <body>
    <!-- Hidratación inmediata: Necesario para la navegación LCP -->
    <Header client:load user={Astro.locals.user} />

    <!-- Estático: 0kb de JS enviado al cliente -->
    <PromoBanner title="Rebajas de Verano" />

    <main>
      <!-- Hidratación diferida: Solo se descarga el JS de Vue cuando el usuario hace scroll y ve el componente -->
      <ProductGrid client:visible products={products} />
    </main>

    <!-- Hidratación en inactividad: Menor prioridad, se carga cuando el navegador está 'idle' -->
    <CartSidebar client:idle />
  </body>
</html>
```

**Ventaja Clave**: Si el usuario nunca hace scroll hasta el `ProductGrid`, **nunca descarga el runtime de Vue**. Esto es imposible en Next.js.

#### 2. Server Islands (Astro 4.0+): Personalización Dinámica y Caché

Un desafío clásico en arquitecturas estáticas es el contenido personalizado. ¿Cómo mostramos "Hola, Juan" o "3 ítems en el carrito" sin romper el caché del CDN?
Históricamente, hacíamos fetching en el cliente (loading spinners...). Con **Server Islands**, Astro envía la página estática desde el CDN e inyecta dinámicamente los fragmentos personalizados.

```astro
<!-- Perfil de Usuario: Se renderiza en un servidor separado y se inyecta via Streaming -->
<UserProfile server:defer>
  <!-- Fallback mostrado instantáneamente mientras carga la isla -->
  <div slot="fallback" class="animate-pulse bg-gray-200 h-10 w-10 rounded-full"></div>
</UserProfile>
```

Esto mueve la complejidad del cliente al servidor de borde (Edge), manteniendo el Time to Interactive (TTI) bajo.

#### 3. Comunicación entre Micro-Frontends: Estado Global Agnóstico

Los micro-frontends deben ser desacoplados ("share nothing"), pero la realidad exige comunicación: "Al añadir un producto en la Lista (Vue), actualiza el contador del Header (React)".
No podemos usar React Context ni Vuex. Necesitamos un gestor de estado agnóstico.

**Solución: Nano Stores**.
Pesa < 1KB y funciona en cualquier framework (o sin framework).

```typescript
// src/store/cart.store.ts
import { map } from "nanostores";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export const cartItems = map<Record<string, CartItem>>({});

export function addItem(item: CartItem) {
  const existing = cartItems.get()[item.id];
  if (existing) {
    cartItems.setKey(item.id, { ...existing, quantity: existing.quantity + 1 });
  } else {
    cartItems.setKey(item.id, { ...item, quantity: 1 });
  }
}
```

**Consumo en React (Header):**

```tsx
import { useStore } from "@nanostores/react";
import { cartItems } from "../store/cart.store";

export default function Header() {
  const cart = useStore(cartItems);
  const total = Object.values(cart).reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  return <div className="cart-icon">Items: {total}</div>;
}
```

**Escritura en Vue (ProductGrid):**

```vue
<script setup>
import { addItem } from "../store/cart.store";

const props = defineProps(["product"]);
const addToCart = () => {
  addItem({ ...props.product, quantity: 1 });
};
</script>
<template>
  <button @click="addToCart">Añadir al Carrito</button>
</template>
```

#### 4. Estrategia de Build y Deploy (Monorepo vs Polyrepo)

Para equipos grandes, recomiendo un enfoque de **Monorepo** (usando Turborepo o Nx) donde cada "módulo" (marketing, checkout) es un paquete npm interno. La aplicación Astro actúa como el "Shell" o consumidor final.

- `apps/storefront` (Astro Shell)
- `packages/ui-kit` (Design System compartido - Web Components o Lit para máxima portabilidad)
- `packages/feature-checkout` (Lógica de negocio y componentes de Svelte)
- `packages/feature-catalog` (Lógica de negocio y componentes de Vue)

Esto permite análisis estático, tipos compartidos (TypeScript) y testing de integración unificado, mitigando el "infierno de versiones" común en micro-frontends.

---

### ENGLISH (EN)

The Micro-Frontends (MFE) paradigm has traditionally been a double-edged sword: it promises autonomy for development teams but often delivers a fragmented, inconsistent User Experience (UX) and, worst of all, an extremely heavy payload. Classic implementations based on Module Federation (Webpack 5) or iframes often result in "distributed monoliths" that download megabytes of JavaScript, duplicating dependencies and destroying Core Web Vitals.

Astro fundamentally changes this game by introducing **Islands Architecture**. Unlike Next.js or Remix, which hydrate the entire page, Astro does not orchestrate JavaScript on the client; it orchestrates HTML on the server. This enables a micro-frontend architecture that is _Zero-JS by default_.

#### 1. Islands Architecture: The End of Massive Hydration

![Astro Islands Architecture - Concept](./images/micro-frontends-astro/islands-architecture.png)

In a traditional Single Page Application (SPA), the browser receives an empty shell and a giant JS bundle that must be parsed and executed before the user can see or interact with anything.
With Astro, the server renders pure HTML. The interactive parts are isolated "islands".

**Realistic Scenario:** An Enterprise E-commerce Dashboard.

- **Navigation Bar**: Design Team (React). Interactive for dropdowns.
- **Product List**: Catalog Team (Vue). Interactive for complex filtering.
- **Promotional Banner**: Marketing Team (Pure HTML/CSS). Static.
- **Side Cart**: Checkout Team (Svelte). Highly reactive.

```astro
---
// index.astro
// We import components from different frameworks without conflicts
import Header from '../modules/core/Header.jsx';
import ProductGrid from '../modules/catalog/ProductGrid.vue';
import PromoBanner from '../modules/marketing/Banner.astro';
import CartSidebar from '../modules/checkout/Cart.svelte';

// Server-side data fetching (build time or request time)
const products = await fetch('https://api.store.com/products').then(r => r.json());
---

<html lang="en">
  <head>
    <title>Enterprise Store</title>
  </head>
  <body>
    <!-- Immediate Hydration: Critical for LCP navigation -->
    <Header client:load user={Astro.locals.user} />

    <!-- Static: 0kb of JS sent to the client -->
    <PromoBanner title="Summer Sale" />

    <main>
      <!-- Deferred Hydration: Vue runtime only downloads when user scrolls to component -->
      <ProductGrid client:visible products={products} />
    </main>

    <!-- Idle Hydration: Lower priority, loads when browser is idle -->
    <CartSidebar client:idle />
  </body>
</html>
```

**Key Advantage**: If the user never scrolls down to the `ProductGrid`, **they never download the Vue runtime**. This is impossible in Next.js.

#### 2. Server Islands (Astro 4.0+): Dynamic Personalization & Caching

A classic challenge in static architectures is personalized content. How do we show "Hello, John" or "3 items in cart" without breaking CDN caching?
Historically, we did client-side fetching (loading spinners...). With **Server Islands**, Astro ships the static page from the CDN and dynamically injects personalized fragments.

```astro
<!-- User Profile: Rendered on a separate server server and injected via Streaming -->
<UserProfile server:defer>
  <!-- Fallback shown instantly while island loads -->
  <div slot="fallback" class="animate-pulse bg-gray-200 h-10 w-10 rounded-full"></div>
</UserProfile>
```

This moves complexity from the client to the Edge server, keeping Time to Interactive (TTI) low.

#### 3. Inter-Micro-Frontend Communication: Agnostic Global State

Micro-frontends should be decoupled ("share nothing"), but reality demands communication: "When adding a product in the List (Vue), update the counter in the Header (React)".
We can't use React Context or Vuex. We need an agnostic state manager.

**Solution: Nano Stores**.
Weighs < 1KB and works in any framework (or no framework).

```typescript
// src/store/cart.store.ts
import { map } from "nanostores";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export const cartItems = map<Record<string, CartItem>>({});

export function addItem(item: CartItem) {
  const existing = cartItems.get()[item.id];
  if (existing) {
    cartItems.setKey(item.id, { ...existing, quantity: existing.quantity + 1 });
  } else {
    cartItems.setKey(item.id, { ...item, quantity: 1 });
  }
}
```

**Consuming in React (Header):**

```tsx
import { useStore } from "@nanostores/react";
import { cartItems } from "../store/cart.store";

export default function Header() {
  const cart = useStore(cartItems);
  const total = Object.values(cart).reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  return <div className="cart-icon">Items: {total}</div>;
}
```

**Writing in Vue (ProductGrid):**

```vue
<script setup>
import { addItem } from "../store/cart.store";

const props = defineProps(["product"]);
const addToCart = () => {
  addItem({ ...props.product, quantity: 1 });
};
</script>
<template>
  <button @click="addToCart">Add to Cart</button>
</template>
```

#### 4. Build and Deploy Strategy (Monorepo vs Polyrepo)

For large teams, I recommend a **Monorepo** approach (using Turborepo or Nx) where each "module" (marketing, checkout) is an internal npm package. The Astro app acts as the "Shell" or final consumer.

- `apps/storefront` (Astro Shell)
- `packages/ui-kit` (Shared Design System - Web Components or Lit for maximum portability)
- `packages/feature-checkout` (Business logic and Svelte components)
- `packages/feature-catalog` (Business logic and Vue components)

This enables static analysis, shared types (TypeScript), and unified integration testing, mitigating the "version hell" common in micro-frontends.

---

### PORTUGUÊS (PT)

O paradigma de Micro-Frontends (MFE) tem sido tradicionalmente uma faca de dois gumes: promete autonomia para as equipes de desenvolvimento, mas muitas vezes entrega uma experiência de usuário (UX) fragmentada, inconsistente e, o pior de tudo, extremamente pesada. Implementações clássicas baseadas em Module Federation (Webpack 5) ou iframes costumam resultar em "monolitos distribuídos" que baixam megabytes de JavaScript, duplicando dependências e destruindo os Core Web Vitals.

O Astro muda fundamentalmente esse jogo ao introduzir a **Arquitetura de Ilhas (Islands Architecture)**. Diferente do Next.js ou Remix, que hidratam a página inteira, o Astro não orquestra JavaScript no cliente; ele orquestra HTML no servidor. Isso permite uma arquitetura de micro-frontends que é _Zero-JS por padrão_.

#### 1. Arquitetura de Ilhas: O Fim da Hidratação Massiva

![Astro Islands Architecture - Concept](./images/micro-frontends-astro/islands-architecture.png)

Em uma Single Page Application (SPA) tradicional, o navegador recebe um shell vazio e um bundle JS gigante que deve ser analisado e executado antes que o usuário possa ver ou interagir com algo.
Com Astro, o servidor renderiza HTML puro. As partes interativas são "ilhas" isoladas.

**Cenário Realista:** Um Dashboard de E-commerce.

- **Barra de Navegação**: Equipe de Design (React). Interativo para dropdowns.
- **Lista de Produtos**: Equipe de Catálogo (Vue). Interativo para filtros complexos.
- **Banner Promocional**: Equipe de Marketing (HTML/CSS puro). Estático.
- **Carrinho Lateral**: Equipe de Checkout (Svelte). Altamente reativo.

```astro
---
// index.astro
// Importamos componentes de diferentes frameworks sem conflitos
import Header from '../modules/core/Header.jsx';
import ProductGrid from '../modules/catalog/ProductGrid.vue';
import PromoBanner from '../modules/marketing/Banner.astro';
import CartSidebar from '../modules/checkout/Cart.svelte';

// Data fetching no servidor (build time ou request time)
const products = await fetch('https://api.store.com/products').then(r => r.json());
---

<html lang="pt">
  <head>
    <title>Loja Enterprise</title>
  </head>
  <body>
    <!-- Hidratação imediata: Necessário para a navegação LCP -->
    <Header client:load user={Astro.locals.user} />

    <!-- Estático: 0kb de JS enviado ao cliente -->
    <PromoBanner title="Promoção de Verão" />

    <main>
      <!-- Hidratação diferida: O runtime Vue só baixa quando o usuário rola até o componente -->
      <ProductGrid client:visible products={products} />
    </main>

    <!-- Hidratação em inatividade: Menor prioridade, carrega quando o navegador está 'idle' -->
    <CartSidebar client:idle />
  </body>
</html>
```

**Vantagem Chave**: Se o usuário nunca rolar até o `ProductGrid`, **ele nunca baixa o runtime do Vue**. Isso é impossível no Next.js.

#### 2. Server Islands (Astro 4.0+): Personalização Dinâmica e Cache

Um desafio clássico em arquiteturas estáticas é o conteúdo personalizado. Como mostramos "Olá, João" ou "3 itens no carrinho" sem quebrar o cache de CDN?
Historicamente, fazíamos fetching no cliente (loading spinners...). Com **Server Islands**, o Astro envia a página estática da CDN e injeta dinamicamente os fragmentos personalizados.

```astro
<!-- Perfil de Usuário: Renderizado em um servidor separado e injetado via Streaming -->
<UserProfile server:defer>
  <!-- Fallback mostrado instantaneamente enquanto a ilha carrega -->
  <div slot="fallback" class="animate-pulse bg-gray-200 h-10 w-10 rounded-full"></div>
</UserProfile>
```

Isso move a complexidade do cliente para o servidor de borda (Edge), mantendo o Time to Interactive (TTI) baixo.

#### 3. Comunicação entre Micro-Frontends: Estado Global Agnóstico

Os micro-frontends devem ser desacoplados ("share nothing"), mas a realidade exige comunicação: "Ao adicionar um produto na Lista (Vue), atualize o contador do Carrinho (Svelte)".
Não podemos usar React Context ou Vuex. Precisamos de um gerenciador de estado agnóstico.

**Solução: Nano Stores**.
Pesa < 1KB e funciona em qualquer framework (ou sem framework).

```typescript
// src/store/cart.store.ts
import { map } from "nanostores";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export const cartItems = map<Record<string, CartItem>>({});

export function addItem(item: CartItem) {
  const existing = cartItems.get()[item.id];
  if (existing) {
    cartItems.setKey(item.id, { ...existing, quantity: existing.quantity + 1 });
  } else {
    cartItems.setKey(item.id, { ...item, quantity: 1 });
  }
}
```

**Consumo em React (Header):**

```tsx
import { useStore } from "@nanostores/react";
import { cartItems } from "../store/cart.store";

export default function Header() {
  const cart = useStore(cartItems);
  const total = Object.values(cart).reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  return <div className="cart-icon">Itens: {total}</div>;
}
```

**Escrita em Vue (ProductGrid):**

```vue
<script setup>
import { addItem } from "../store/cart.store";

const props = defineProps(["product"]);
const addToCart = () => {
  addItem({ ...props.product, quantity: 1 });
};
</script>
<template>
  <button @click="addToCart">Adicionar ao Carrinho</button>
</template>
```

#### 4. Estratégia de Build e Deploy (Monorepo vs Polyrepo)

Para equipes grandes, recomendo uma abordagem de **Monorepo** (usando Turborepo ou Nx) onde cada "módulo" (marketing, checkout) é um pacote npm interno. A aplicação Astro atua como o "Shell" ou consumidor final.

- `apps/storefront` (Astro Shell)
- `packages/ui-kit` (Design System compartilhado - Web Components ou Lit para portabilidade máxima)
- `packages/feature-checkout` (Lógica de negócios e componentes Svelte)
- `packages/feature-catalog` (Lógica de negócios e componentes Vue)

Isso permite análise estática, tipos compartilhados (TypeScript) e testes de integração unificados, mitigando o "inferno de versões" comum em micro-frontends.
