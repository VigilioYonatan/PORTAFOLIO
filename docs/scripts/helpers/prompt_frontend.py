PROMPT_BASE = "Sigue rules-pages.md, PIENSA PROFUNDAMENTE y tomate tu tiempo y Si vez design/image.jpg, eso es una imagen (tienes que ver bien la imagen de ese archivo quie esta en docs/rules/design) quiere decir que harás un diseño igual a eso, como tambien los botones, dropdowns, etc  deben tener acciones, y crea el testing en los componentes usando buenas practicas senior, Crea el frontend en Preact (components, hooks, utils, estilos etc) REGLAS: 1. Tecnología: Usa Preact. No uses 'any', usa signals, si no tiene imagen entonces lo que harás, haras crearas el diseño, claro con la misma forma de diseño, SIEMPRE ser fiel al diseÑo. No modifiques tsconfig.json. Usa pnpm 2. Fuentes de Verdad: Sigue rules-pages.md. Si hay diferencias, prioriza rules-class.md y rules-business.md.OBLIGATORIO  MARCA los [ ] SI ya los hiciste en rules-page.md , MARCALO SI LO HICISTE A PIE Y LETRA, como decia en prompt-frontend son las correcciones , tienes que identar bien el codigo., Imporante: recuerda reutilizar componentes reutilizables como los componentes de src/componentes/extras , Form, Webform,Modal,Table,etc. claro si no hay un componente reutilizable crea uno y que sea dinámico y reutilizable.Si vez design/image.jpg, eso es una imagen (tienes que ver bien la imagen) quiere decir que harás un diseño igual a eso, claro puede que haya imagenes que pierdan el diseño de toda la web, entonces quiere decir que es una referencia, que no pierda el diseño. Si vez un form.control o otro componente reutilizable diferente, cambia el diseño de ese Formcontrol, WebFormcontrol, Table, eso si tiene que aver un solo WebFormControl, Puedes replicar src/components/table, crear otro por ejemplo src/components/table2 y con otro diseño claro teniendo la logica de reutilizable como table1. form y web_form NO crear src/components/form2 ,src/components/web_form2 esos FormControl,Formeditor,Formcheck,..etc deben tener si un diseño fiel a toda la web, usando las variables de css. NO OLVIDES MARCAR en rules-pages.md los [X] que ya hiciste OBLIGATORIO y claro [?] si no era necesario en ese componente Y hacerlo a pie y letra. OBLIGATORIO, fijate que el diseño es fiel la web que estamos haciendo en el diseño, como el contenido, la logica, etc.   NO modifiquies los archivos rules-class.md, rules-business.md, rules-endpoints.md y prompt-backend.py ni tampoco los prompt-frontend.md prompt-backend.md prompt-rules.md. NO uses mocks usa las apis o pasale props de web.controller.ts a los .astro . Y si vas a entrar al navegador es http://localhost:3004 , no es otro puerto."

PROMPT_CONTEXT = r'''
# 🏗️ PROMPT 1) Arquitectura del Proyecto, DEBES ser fiel a esto, psdt EL diseÑo que haras puede cambiar algunas cosas,pero siempre usar estos patrones

> [!NOTE]
> Este archivo no debe ser modificado por ti.
> Prioriza usar "satisfies" que "as" en typescript. Importante.
> Lógica específica, convenciones y reglas propias del proyecto.
> Recuerda que `docs/rules/*.md` son el corazón de todo el proyecto. De ahí sacarás toda la información para realizar todo, manteniéndote **100% fiel** a `docs/rules/*.md`.
> Si sientes que al crear una función se puede reutilizar, usa `infrastructure/utils` dependiendo de la funcionalidad. Si solo pertenece a un módulo, no la pongas en `infrastructure/utils`, solo en ese módulo.
> Recuerda: `client`, `server` o `hybrid`. Verifica si existe una función similar antes de crearla (ejemplo: `slugify` para slugs).
> Agrega interactividad osea agrega onClick, onChange, y que tenga funcionalidad, que tenga sentido y no dejar vacios.
> Tipar todas las variables y cuando tipes usar los Schemas claro si lo necesitas no crear tipos objetos por querer y no poner codigo duro,por ejemplo tiene un <select> los values de ese select deben ser tipados del schema claro si se esta usando ENUMS o number segun sea el caso, eso se llama no escribir codigo duro. usar const y poner en archivo .const.ts
> Procura usar useRef de preact en vez de document.querySelector, Importa useRef de preact.
> Las paginas que estan en dentro de un [...all].astro no tendrán SSR, eso quiero decir que se usará full wouter, nada de .astro.
>  Imporante separa store.tsx y update.tsx al crear formularios no pueden ir juntos osea difrentes componentes.

## 🏆 REGLAS DE ORO (MANDATORIO)

> **Client vs Server vs Hybrid:**
>
> - `client`: Solo se ejecuta en el cliente (tiene `window`).
> - `server`: Solo se ejecuta en el server (tiene `process.env`, DB).
> - `hybrid`: Se ejecuta en ambos (validaciones puras, formateo de fechas).

> **Reutilización (DRY):** Evita código repetido. Guárdalo en `utils/client`, `utils/server` o `utils/hybrid`.

> **Utilizar las variables de css (OBLIGATORIO):** > **Ten cuidado** Ten cuidado con los overflow-hidden y con los h-screen
> No harcodear tipos, heredar de los .schemas.ts Pick<ExampleSchema> o Omit<ExampleSchema>, ExampleSchema["field"], pero nunca harcodees tipos osea nada de as "PORTFOLIO_PROJECT" | "BLOG_POST" sino usa ExampleSchema["techeable_type"], es un ejemplo.
> **NO PONGAS ANTIGRAVITY** No escribas antigavity en el css ni html, nigun lado.

> **NO CREES otro .css** Ya no crees otro archivo .css , todo eso esta en src/assets/css/global.css


> No uses `Date` o `new Date` (API de JS). Usa `dayjs` importado de `@infrastructure/utils/hybrid/date.utils`. Ahí hay más funciones; si no hay, créala, pero usa dayjs.
> **NO CREES otro .css** Ya no crees otro archivo .css , todo eso esta en src/assets/css/global.css

```css
@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-hover: var(--hover);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius: 0.5rem;
  --font-thin: "Font-Thin", sans-serif;
  --font-light: "Font-Light", sans-serif;
  --font-medium: "Font-Medium", sans-serif;
  --font-bold: "Font-Bold", sans-serif;
  --font-black: "Font-Black", sans-serif;

  /* Radius */
  --radius-lg: 0px; /* Sharp corners for terminal feel */
  --radius-md: 0px;
  --radius-sm: 0px;

  /* Animation Utilities */
  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
  --animate-pulse-slow: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  --animate-glitch: glitch 1s linear infinite;
  --animate-scanline: scanline 8s linear infinite;
  --animate-blink: blink 1s step-end infinite;
  --animate-spin-slow: spin-slow 3s linear infinite;
}
```

```typescript
// ❌ MAL: La función que solo funciona en el cliente está en utils/server
// /utils/server/funciones.ts
export function funcionQueSolofuncionaEnELclient() {
  // tiene window.
  return LocalStorage.getItem("token"),
}

// ✅ BIEN: La función que solo funciona en el cliente está en utils/client
// /utils/client/funciones.ts
export function funcionQueSolofuncionaEnELclient() {
  // tiene window.
  return LocalStorage.getItem("token"),
}

// ❌ MAL: La función que solo funciona en el server está en utils/client
// /utils/client/funciones.ts
export function funcionQueSolofuncionaEnELserver() {
  CRYPTO.RANDOM
  return process.env
}

// ✅ BIEN: La función que solo funciona en el server está en utils/server
// /utils/server/funciones.ts
export function funcionQueSolofuncionaEnELserver() {
  CRYPTO.RANDOM
  return process.env
}
```

> No uses `Date` o `new Date` (API de JS). Usa `dayjs` importado de `@infrastructure/utils/hybrid/date.utils`. Ahí hay más funciones; si no hay, créala, pero usa dayjs.

> Las variables deben estar siempre tipadas (`const`, `let`, `var`), sea una propiedad de una clase, etc.

> Recuerda siempre usar `omit`, `pick`, etc. Debe heredar del schema, no crear propiedades por crear.

> **JSDoc en APIs**: No usar `@returns` o `@return` en los comentarios JSDoc de las funciones API (`.api.ts`), ya que los tipos de TypeScript (Generics de `useQuery`/`useMutation`) definen esto explícitamente.

> **Funciones > Arrow Functions**

```typescript
// ❌ NO PARA FUNCIONES GRANDES
const onExampleUpdate = (body: exampleUpdateDto) => { ... }

// ✅ CORRECTO
function onExampleUpdate(body: exampleUpdateDto) { ... }
```

> **Usar useForm y <Form />** Usar resolver de zod

```typescript
// ❌ MAL
const nameValue = useSignal("");
const emailValue = useSignal("");
const passwordValue = useSignal("");

// Esto es mal
<form>
<input type="text" />
<input type="email" />
<input type="password" />
</form>


// ✅ BIEN
const exampleStoreForm = useForm({
  resolver: zodResolver(exampleStoreDto),
});
function onExampleStore(body: exampleStoreDto) { ... }
```

<Form onSubmit={onExampleStore} {...exampleStoreForm}>
</Form>
---

### TypeScript Governance

#### Prohibiciones

```typescript
// ❌ PROHIBIDO
const data: any = ...
const items = []
const isOpen = useSignal(false) // falta tipar

// ✅ CORRECTO
const data: unknown = ...
const items: Item[] = []
const isOpen = useSignal<boolean>(false)

// ❌ PROHIBIDO, usar await import
const fs = await import("node:fs/promises")

// ✅ CORRECTO
import fs from "node:fs/promises"
```

#### Tipado Estricto

```typescript
// ❌ Tipos mágicos
type: "group"; // esto es string

// ✅ Union types explícitos
type Type = "group" | "file";

// ❌ Tipos inline en Generics (Signals, etc)
const view = useSignal<"users" | "roles" | "activity">("users");

// ✅ Correcto (Tipo definido afuera y exportado si es necesario)
export type UserViewMode = "users" | "roles" | "activity";
const view = useSignal<UserViewMode>("users");
```

#### Usa Tipos de Librerías

```typescript
// ❌ NO INVENTES
icon: FunctionalComponent<any>
children: React.ReactNode

// ✅ USA LOS CORRECTOS
icon: LucideIcon
children: JSX.Element | JSX.Element[]
```

#### Pick/Omit para Tipos Parciales (Heredar de un Schema)

```typescript
// example.schema.ts
export type exampleWithoutPassword = Omit<example, "password">;
export type exampleBasicInfo = Pick<example, "id" | "name" | "email">;
```

---

## 📦 1.1 Stack del Proyecto - FRONTEND y BACKEND

```json
{
  "zod": "^4.x",
  "nestjs": "^11.x",
  "astro": "^5.x",
  "drizzle-orm": "^0.45+",
  "vitest": "^4.x",
  "preact": "latest",
  "tailwindcss": "^4.x"
}
```

---

## 🔄 1.2 Antes de Dar Código - FRONTEND y BACKEND

1. **Verifica la versión** en `package.json`.
2. **Busca documentación actual** de esa versión.
3. **NO asumas** sintaxis de versiones anteriores.
4. **Pregunta** si no estás seguro.
5. **Dame opciones** si hay varias alternativas.

---

## 🚨 1.3 Nuevas Librerías - FRONTEND y BACKEND

**ANTES de sugerir una librería que NO está en `package.json`:**

1. **AVÍSAME** que vas a usar una librería nueva.
2. **EXPLICA** por qué la necesitas.
3. **DAME OPCIONES** si hay alternativas.
4. **ESPERA MI APROBACIÓN** antes de usarla.

### Ejemplo:

```text
⚠️ Para implementar esto necesito una librería nueva:

Opciones:
1. `dayjs` - Ya la tienes instalada ✅. Solo usar dayjs si usas fechas, no usar new Date() la api de js.
2. `luxon` - Más completa pero pesada (~70KB).

¿Cuál prefieres? Recomiendo dayjs que ya está instalada.
```

---

## 📚 1.4 Librerías ya Instaladas - FRONTEND y BACKEND

Antes de sugerir instalar algo, verifica si ya existe:

| Funcionalidad  | Librería                                   |
| :------------- | :----------------------------------------- |
| **Fechas**     | `dayjs`                                    |
| **Validación** | `zod`                                      |
| **Cache**      | `cache-manager` + `keyv`                   |
| **Logger**     | `nestjs-pino`                              |
| **ORM**        | `drizzle-orm`                              |
| **Testing**    | `vitest`                                   |
| **Linting**    | `@biomejs/biome`                           |
| **Icons**      | `lucide-preact` o `BrandIcon simple-icons` |

---

## ✅ 1.5 Checklist Pre-Commit - FRONTEND y BACKEND

- [ ] No hay `any` en el código.
- [ ] Todos los inputs validados con Zod.
- [ ] Tests pasan: `pnpm test`.
- [ ] Lint pasa: `pnpm biome`.
- [ ] Commit sigue **Conventional Commits**.

---

## 📚 Ejemplos de Código

## 📁 1.6 Estructura de Módulos - FRONTEND y BACKEND

```text
modules/
└── feature/
    ├── utils/hybrid|client|server     # Utilidades: .client (solo cliente), .server (solo servidor), .hybrid (ambos)
    ├── components/     # Componentes Preact
    ├── controllers/    # Solo HTTP handling
    ├── services/       # Lógica de negocio
    ├── repositories/   # Acceso a datos
    ├── modules/        # Sub-modulo
    ├── dtos/           # Schemas Zod + types
    ├── entities/       # Drizzle tables
    ├── guards/         # Auth guards
    ├── seeders/        # Seeders
    ├── apis/hybrid|client|server          # APIs
    ├── const/          # Constantes
    ├── schemas/        # Schemas Zod + types
    ├── utils/          # Utilidades
    └── __tests__/      # Tests frontend y backend
        |── product.service.test.ts
        |── product.factory.ts
        |── product.e2e.test.ts
        |── product.store.test.tsx
        |── product.index.test.tsx
        |── product.show.test.tsx
        |── product.update.test.tsx
```

## 📚 1.7 Ejemplos de Código - FRONTEND y BACKEND

> [!IMPORTANT]
> Si hay schemas que pertenecen al mismo ejemplo (products, categories, brands), como se relacionan entre sí, se crean en la misma carpeta.

```text
modules/
└── products/
    ├── utils/hybrid|client|server
    ├── dtos/
        ├── product.index.dto.ts
        ├── product.show.dto.ts
        ├── product.store.dto.ts
        ├── product.update.dto.ts
        ├── product.destroy.dto.ts
        ├── brand.index.dto.ts
        ├── brand.show.dto.ts
        ├── brand.store.dto.ts
        ├── brand.update.dto.ts
        ├── brand.destroy.dto.ts
        ├── category.index.dto.ts
        ├── category.show.dto.ts
        ├── category.store.dto.ts
        ├── category.update.dto.ts
        ├── category.destroy.dto.ts
    ├── entities/
        ├── product.entity.ts
        ├── brand.entity.ts
        ├── category.entity.ts
    ├── seeders/
        ├── product.seeder.ts
        ├── brand.seeder.ts
        ├── category.seeder.ts
    ├── const/
        ├── product.const.ts
        ├── brand.const.ts
        ├── category.const.ts
    ├── schemas/
        ├── product.schema.ts
        ├── brand.schema.ts
        ├── category.schema.ts
    ├── apis/
        ├── product.store.api.ts
        ├── brand.store.api.ts
        ├── category.store.api.ts
        ├── product.update.api.ts
        ├── brand.update.api.ts
        ├── category.update.api.ts
        ├── product.destroy.api.ts
        ├── brand.destroy.api.ts
        ├── category.destroy.api.ts
    ├── utils/
        ├── hybrid|client|server/
        ├── product.utils.ts
        ├── brand.utils.ts
        ├── category.utils.ts
    ├── repositories/
        ├── product.repository.ts
        ├── brand.repository.ts
        ├── category.repository.ts
    ├── services/
        ├── product.service.ts
        ├── brand.service.ts
        ├── category.service.ts
    ├── controllers/
        ├── product.controller.ts
        ├── brand.controller.ts
        ├── category.controller.ts
    ├── modules/
        ├── product.module.ts
        ├── brand.module.ts
        ├── category.module.ts
    ├── components/
        ├── product.store.tsx
        ├── product.update.tsx
        ├── product.index.tsx
        ├── brand.store.tsx
        ├── brand.update.tsx
        ├── brand.index.tsx
        ├── category.store.tsx
        ├── category.update.tsx
        ├── category.index.tsx
    |---- __tests__
```

### 2.17 middleware.ts

Middleware para páginas que viene desde el backend de NestJS.

```ts
export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  const locals =
    PUBLIC_ENV === "development"
      ? JSON.parse(context.request.headers.get("x-astro-locals") || "{}")
      : context.locals;
  Object.assign(context.locals, locals);

  // Así puedes usar middleware para acceder y todo eso
  if (pathname.startsWith("/dashboard")) {
    // Verificar si hay usuario autenticado en la sesión
    const example = context.locals.example;
    if (!example) {
      // Redirigir a login si no está autenticado
      return context.redirect("/auth/login");
    }
  }

  // En producción, context.locals ya viene lleno gracias al adaptador de Node.
  return next();
});
```

---

# ⚛️ 3.0 Buenas Prácticas Frontend (Preact + Signals)

> Estándares senior para desarrollo frontend con Preact.
> Recuerda que `docs/rules/*.md` son el corazón de todo el proyecto. De ahí sacarás toda la información para realizar todo, manteniéndote **100% fiel** a `docs/rules/*.md`.

---

## 🏛️ 3.1 Stack Tecnológico

- **Runtime**: Preact (mentalidad React de Alto Rendimiento)
- **State**: `@preact/signals`
- **Routing**: `wouter-preact`
- **Icons**: `lucide-preact` y `brand-icon-simple-icons` para marcas
- **Motion**: `motion` (Motion One - imperativo, ~3KB)
- **CSS**: Tailwind CSS 4.1.18 (usando `tailwindcss@4.1.18`)

---

## 🎬 3.2 Motion - Animaciones Optimizadas

> [!IMPORTANT]
> Usamos `motion` (Motion One) con API imperativa, **NO** `motion/react`.
> Si ves que estás repitiendo mucho código en componentes, crea un componente reutilizable. Si es un componente grande, crea una carpeta en `src/components/extras`.
> **Reduce el bundle en ~15KB y mejora el rendimiento.**

### ❌ NO USAR

- `motion/react` (bundle pesado).

### ✅ OBLIGATORIO

- `motion` Hooks Reutilizables (imperativo, ~3KB).

```typescript
// src/hooks/useMotion.ts
import { useEntranceAnimation, useHoverScale, animate } from "@hooks/use-motion";

// Entrance animation
function Card() {
  const ref = useEntranceAnimation(0.1); // delay 0.1s
  return <div ref={ref}>Animated Card</div>;
}

// Hover scale
function Button() {
  const { ref, onMouseEnter, onMouseLeave } = useHoverScale(1.05);
  return (
    <button ref={ref} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      Hover Me
    </button>
  );
}

// Staggered list
function List({ items }) {
  return items.map((item, i) => {
    // const ref = useStaggeredEntrance(i); // Implementar si existe
    return <div key={item.id}>{item.name}</div>;
  });
}
```

### 3.3 Hooks Disponibles

| Hook                          | Uso                       |
| :---------------------------- | :------------------------ |
| `useEntranceAnimation(delay)` | Fade in + slide from left |

### 3.4 Alternativas CSS para Animaciones Simples

```tsx
// ✅ Usar Tailwind para animaciones simples
<div class="transition-all duration-300 hover:scale-105" />
<div class="animate-pulse" />
<div class="animate-in fade-in slide-in-from-bottom-4 duration-300" />
```

---

## ⚠️ Reglas Críticas

### 3.5 Signals > useState

```typescript
// ❌ NO USAR
const [count, setCount] = useState(0);

// ✅ OBLIGATORIO (tipado)
const count = useSignal<number>(0);
```

### 3.6 Evita React

```typescript
// ❌ NO USAR
React.createContext();
React.ReactNode;

// ✅ CORRECTO
createContext();
JSX.Element;
```

### 3.7 Eventos con Lógica

```typescript
// ✅ Inline si es solo 1-2 líneas
onClick={() => {
    count.value++;
}}

// ✅ Función si es +3 líneas
onClick={onFunctionMoreThanThreeLines}

// ❌ Incorrecto: siempre usar llaves {}
onClick={() => count.value++}
```

---

## 📝 3.9 Formularios (`useForm` + Zod)

> [!IMPORTANT]
> **PROHIBIDO DEFINIR DTOS O TIPOS INLINE EN LOS COMPONENTES**.
> Todo tipado de formulario debe provenir de un esquema Zod exportado explícitamente en el archivo `*.schema.ts`. Esto evita duplicación de lógica y asegura que el `resolver` y el tipo de `useForm` estén siempre sincronizados.

### ❌ MAL: Definir tipos `Pick`/`Omit` o tipos inline en el componente

```typescript
// JobStore.tsx
type JobStoreDto = Pick<JobPositionSchema, "title" | "description">;

export function JobStore() {
  const form = useForm<JobStoreDto>({
    resolver: zodResolver(
      jobPositionSchema.pick({ title: true, description: true }), // ESTO es MAL, esto es un dto
    ),
    // ...
  });
}
```

### ✅ BIEN: Exportar el esquema y el tipo desde el archivo `.dto.ts`

```typescript
// job-position.dto.ts
export const jobPositionStoreDto = jobPositionSchema.pick({
  title: true,
  description: true,
});
export type JobPositionStoreDto = z.infer<typeof jobPositionStoreDto>;

// JobStore.tsx
import {
  jobPositionStoreDto,
  type JobPositionStoreDto,
} from "../schemas/job-position.schema";

export function JobStore() {
  const form = useForm<JobPositionStoreDto>({
    resolver: zodResolver(jobPositionStoreDto),
    // ...
  });
}
```

### 3.8 class vs className

```tsx
// ✅ En JSX directo: Siempre usar "class"
<div class="flex gap-4">

// ✅ En props: usar "className"
interface Props {
    className?: string;
}
```

---

## 🎨 Tailwind CSS v4

### Zero-Config con CSS

```css
/* style.css */
@theme {
  --color-brand: #3b82f6;
}
```

### Logical Properties

```tsx
// ✅ International by default
<div class="ms-4"> <!-- Margin Start (no ml-4) -->
```

### No @apply

```css
/* ❌ PROHIBIDO */
.btn {
  @apply bg-blue-500;
}
```

```tsx
/* ✅ CORRECTO - usa clases directamente */
<button class="bg-blue-500">
```

### Variables Dinámicas

```tsx
<div style={{ "--w": `${percent}%` }} class="w-[var(--w)]" />
```

---

## 🧩 Arquitectura de Componentes

### 1. Function Declarations

```typescript
// ✅ Mejor stack traces
export function Button() { ... }
```

### 2. Dumb UI

```tsx
// ✅ Sin fetching interno
<ProfileCard data={user} />
```

### 3. Composición con Slots

```tsx
<Shell sidebar={<nav>...</nav>} content={<main>...</main>} />
```

### 4. One-Hook Pattern

```typescript
// ❌ Desestructurado
const { data, submit } = useFormController();

// ✅ Objeto completo (más limpio)
const formController = useFormController();
```

### 5. Discriminated Unions

```typescript
type State =
  | { status: "loading" }
  | { status: "success"; data: User }
  | { status: "error"; error: string };
```

---

## 🚀 Performance

### Lazy Loading

```typescript
// Rutas
const Settings = lazy(() => import("./pages/Settings"));

// Componentes pesados
const Chart = lazy(() => import("./components/Chart"));
```

### Imágenes, videos y archivos

```tsx
// ✅ Imprimir imagen, en este caso en componentes de react
 <img
            src={printFileWithDimension(props.images, DIMENSION_IMAGE.xs)[0]} // DIMENSION_IMAGE.xs escoges la dimension de la imagen de la entidad claro  export const UPLOAD_CONFIG de ahi sacas el tipo de DIMENSION que le pertence y escoges el tamaño de la imagen segun que lo necesites
            alt={props.name}
            width={DIMENSION_IMAGE.xs}
            height={DIMENSION_IMAGE.xs}
            alt={pros.name}
            title={props.name}
            class="w-full h-full object-cover"
          />

          // en componentes de astro
import { Image } from "astro:assets";
          <Image
      class="w-full h-full object-cover"
      width={DIMENSION_IMAGE.xs}
      height={DIMENSION_IMAGE.xs}
      src={printFileWithDimension(props.images, DIMENSION_IMAGE.xs)[0]}
      ...mas propiedades astro con buen seo y otmización
    />


    // SI vas a imprimir muchas imagenes, tambien funciona con otros tipos
    printFileWithDimension(props.images, DIMENSION_IMAGE.xs).map((image, index) => (
      <image
        key={index}
        class="w-full h-full object-cover"
        width={DIMENSION_IMAGE.xs}
        height={DIMENSION_IMAGE.xs}
        src={image}
        ...mas propiedades astro con buen seo y otmización
      />
    ))
```

### Font Display

```css
@font-face {
  font-display: swap;
}
```

### Virtualización

```typescript
// Listas > 50 items
import { useVirtual } from "react-virtual";
```

### Memoización

```typescript
const handleClick = useCallback(() => ..., []);
const activeUsers = useMemo(() => users.filter(u => u.active), [users]);
```

---

### Sweet Modal

```typescript
import {sweetModal} from "@vigilio/sweet";
export type Icon = "danger" | "success" | "warning" | "info";
export interface SwalProps {
    title?: string; // titulo del modal
    text?: string; // texto del modal
    icon?: Icon; // icono del modal
    customIcon?: string | HTMLElement; // icono personalizado
    html?: string | HTMLElement; // puede ir string html, muy bueno para personalizar el mensaje, cuando lo usas eliminar title,text,icon,customIcon, util si el mensaje quieres personalizar el mensaje
    showCloseButton?: boolean; // mostrar boton de cerrar
    showCancelButton?: boolean; // mostrar boton de cancelar
    confirmButtonText?: string; // texto del boton de confirmar
    confirmButtonAriaLabel?: string; // texto del boton de confirmar
    cancelButtonText?: string; // texto del boton de cancelar
    cancelButtonAriaLabel?: string; // texto del boton de cancelar
    showConfirmButton?: boolean; // mostrar boton de confirmar
    timer?: number; // tiempo en ms para cerrar el modal
    position?: "center" | "end" | "start"; // posicion del modal
}

    sweetModal({}).then((res)=>{
        if(res.isConfirmed){
            console.log("ok");
            // you can use sweet
        }
    });
PROPS

// YOU CAN USE callback
sweetModal((onclose)=>{...swallprops})
```

### Vigilio/preact-fetching

```typescript
const showUser = useQuery("/users", getUsers, options);
const { isLoading, data, isSuccess,isFetching,isError,...rest} = useQuery("/users", getUsers);

// claro hay muchas opciones que no usaremos pero es bueno saber que tiene esto useQuery
const options = {
    skipFetching: false, // skip fetch ->default false
    placeholderData: null, //placeholder  ->default null
    transformData: null, //transform success data ->default null
    staleTime: null, // if you want refetch for a seconds 1 = 1000 ms
    refetchIntervalInBackground: false, // when the client change the page, it will refetch
    onError: null, // callback when the fetch is not success (err)=>{} //default null
    onSuccess: null, // callback when the fetch is  success (data)=>{} //default null
    refetchOnReconnect: false, // when the net back it fetching // default false
    delay: null, // delay to consume fetch //default null
    clean: true, // it no clean when refetch data //default clean
    isCaching?: boolean | number | null; //default no cache, usa localstorage para que guarde, puede ir numeros que son md, booleanos true que es para siempre, null es default que no cacheara
    isMemory?: boolean | number | null; //  lo mismo que isCaching pero es en memortia nomas si recargas la pagina se pierde
};


----

useMutation
// claro hay muchas opciones que no usaremos pero es bueno saber que tiene esto useQuery
const options = {
    onSuccess?: (data) => {};
    onError?: (error) => {};
    transformData?: (data) => Data; // you cand modify response data
}

const { mutateAsync,mutate, isLoading, isSuccess, ...rest } = useMutation(
    "/users",
    addUser,
    options
);
```

## Usar tablas

###

Esto es un ejemplo de una tabla para mostrar para que te guies, el diseño puede cambiar dependiendo de la necesidad y el diseño solo es un ejemplo nada mas para que te guies de como usar tablas,etc

**IMPORTANTE: Definición de Tipos para UseTable (Estandarización)**

Al definir los tipos para una tabla en el archivo `*.index.api.ts`, **TIENE QUE ESTAR ARRIBA DE LA FUNCIÓN** y seguir estrictamente esta estructura:

```typescript
// 1. Definir paginadores secundarios (acciones, selects, etc.)
export type EntityIndexSecondaryPaginator = "action" | "select";

// 2. Definir métodos disponibles (refetch, etc.)
export type EntityIndexMethods = {
  refetch: (clean?: boolean) => void;
};

// 3. Unir todo en el tipo de la tabla
export type EntityIndexTable = UseTable<
  EntityIndexSchema, // El schema de la entidad
  EntityIndexSecondaryPaginator, // Los paginadores extra
  EntityIndexMethods // Los métodos
>;

/**
 * entityIndex - /api/v1/entities
 * @method GET
 */
export function entityIndexApi(table: EntityIndexTable) { ... }
```

```tsx
function CursoTypeIndex() {
    const campusContext = useCampusContext();
    const cursoTypeShow = useSignal<CursoTypeSchemaFromServer | null>(null);
    const cursoTypeEdit = useSignal<CursoTypeSchemaFromServer | null>(null);
    const cursoTypeDestroyMutate = cursoTypeDestroyApi();


    const columns: Columns<
        CursoTypeSchemaFromServer,
        CursoTypeIndexSecondaryPaginator,
        EntityIndexMethods
    > = [
        {
            key: "code",
            header: "Código",
            isSort: true,
            // Recuerda que puedes usar mas childrens ejemplo, columns:[{key:"code",header:"Código",isSort:true,children:[{key:"code",header:"Código",isSort:true,cell:(props)=>{return <div>{props.code}</div>},...mas}]
            //colSpan: 2,
            // rowSpan: 2,
        },
        {
            key: "name",
            header: "Nombre",
            isSort: true,
            cell: (props) => {
                return (
                    <div className="max-w-[300px] line-clamp-3">
                        {props.name}
                    </div>
                );
            },
        },
        {
            key: "color",
            header: "Color",
            cell: (props) => {
                return (
                    <Badge
                        variant="primary"
                        className="fill-white! text-white!"
                        style={{ backgroundColor: props.color }}
                    >
                        {props.color}
                    </Badge>
                );
            },
        },
        {
            key: "icon_id",
            header: "Icono",
            cell: (props) => {
                return (
                    <div
                        dangerouslySetInnerHTML={{
                            __html: campusContext.icons.find(
                                (icon) => icon.id === props.icon_id
                            )?.icon as string,
                        }}
                        class="[&>svg]:w-8! [&>svg]:h-8! [&>svg]:stroke-gray-500"
                    />
                );
            },
        },
        {
            key: "cantidad_cursos",
            header: "Cantidad de cursos",
            cell: (props) => {
                return <span>{props.cantidad_cursos}</span>;
            },
        },
        {
            key: "created_at",
            header: "Fechas",
            cell: (props) => {
                return (
                    <div class="flex  gap-2 flex-col">
                        <Badge className="flex items-center gap-2 fill-gray-500">
                            <>
                                <CalendarIconSolid {...sizeIcon.small} />
                                {formatDateTz(props.created_at!)}
                            </>
                        </Badge>
                        {props.updated_at && (
                            <Badge className="flex items-center gap-2 fill-gray-500">
                                <>
                                    <PenToSquareIconSolid {...sizeIcon.small} />
                                    {formatDateTz(props.updated_at!)}
                                </>
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            key: "example_academic_id",
            header: "example",
            cell: (props) => {
                return (
                    <div class="flex flex-col items-center">
                        <Byexample example={props.example_academic} />
                    </div>
                );
            },
            isSort: true,
        },
        {
            key: "action",
            header: "Acciones",
            cell: (props, _, methods) => {
                return (
                    <EllipsisMenu
                        position="left"
                        isLoading={
                            (cursoTypeDestroyMutate.isLoading &&
                                cursoTypeDestroyMutate.body === props.id) ||
                            false
                        }
                    >
                        <div class="flex flex-col w-[200px] justify-starts">
                            <button
                                type="button"
                                className="flex items-center text-black fill-black gap-2 hover:bg-primary/80 rounded-lg  py-2 px-4 hover:text-white hover:fill-white"
                                onClick={() => {
                                    cursoTypeShow.value = props;
                                }}
                            >
                                <EyeIconSolid {...sizeIcon.medium} /> Más
                                información
                            </button>
                            <Button
                                type="button"
                                onClick={() => {
                                    cursoTypeEdit.value = props;
                                }}
                            >
                                <PenToSquareIconSolid {...sizeIcon.medium} />{" "}
                                Editar
                            </button>
                            <button
                                disabled={
                                    (cursoTypeDestroyMutate.isLoading &&
                                        cursoTypeDestroyMutate.body ===
                                            props.id) ||
                                    false // importante usar este false para evitar error de tipado
                                }
                                onClick={() => {
                                    sweetModal({
                                        title: "¿Estas seguro de eliminar este tipo de clase?",
                                    }).then(({ isConfirmed }) => {
                                        if (isConfirmed) {
                                            cursoTypeDestroyMutate.mutate(
                                                props.id,
                                                {
                                                    onSuccess() {
                                                      onSuccess(data) {
                                                    // 	table.updateData({ // esto viene de la api exampleIndexApi
                                                    // 		result: data.results,
                                                    // 		count: data.count,
                                                    //     methods:{
                                                    //       refetch:query.refetch // (props, _, methods) esto va a methods, claro ahi puede poner mas metodos, pero en este caso solo esto
                                                    //     }
                                                    // 	});
                                                    // },
                                                        methods.updateData( // esto se pone dentro de la api, ahi se transforma,en este caso no usare refetch por que no quiere consumir api de backend para ahorrar recursos al servidor
                                                            (old, count) => ({
                                                                result: old.filter(
                                                                    (old) =>
                                                                        old.id !==
                                                                        props.id
                                                                ),
                                                                count:
                                                                    count - 1,
                                                            })
                                                        );
                                                        campusContext.destroyCursoTypes(
                                                            props.id
                                                        );
                                                        sweetModal({
                                                            title: "Tipo de clase eliminado correctamente",
                                                            icon: "success",
                                                            showCancelButton:
                                                                true,
                                                        });
                                                    },
                                                    onError(error) {
                                                        sweetModal({
                                                            title: "Error al eliminar la no vedad",
                                                            text: error.message,
                                                            icon: "danger",
                                                            showCancelButton:
                                                                true,
                                                        });
                                                    },
                                                }
                                            );
                                        }
                                    });
                                }}
                            >
                                <TrashIconSolid {...sizeIcon.medium} /> Eliminar
                            </button>
                        </div>
                    </EllipsisMenu>
                );
            },
        },
    ];
    const table = useTable({
        columns,
        pagination: { limit: 10 },
    });

    const cursoTypeIndexQuery = cursoTypeIndexApi(table);
    const isOpenStoreCursoType = useSignal<boolean>(false);

    useEffect(() => {
    categoryIndexQuery.refetch(false);
  }, [
    table.pagination.page, // para que funcione next y prev button
    table.pagination.value.limit, // para que funcione limite cantidad personalziable
    table.search.debounceTerm, // para que funcione busqueda
    parentId.value, // esto es personalizado
    table.sort.value, // para que funcione ordenamiento
     table.filters.value, // si hay filtros
  ]);
    return (
        <>
            <Table query={cursoTypeIndexQuery} table={table}>
                <Card className="p-4 justify-center">
                    <div class="flex flex-col sm:flex-row justify-between gap-4 ">
                        <Button
                            type="button"
                            className="flex items-center gap-2  "
                            onClick={() => {
                                isOpenStoreCursoType.value = true;
                            }}
                        >
                            <PlusIconSolid {...sizeIcon.medium} />
                            Nuevo tipo de curso
                        </Button>
                        <div class="flex gap-4">
                            <FilterSystem.search />
                            <FilterSystem.filters /> <select
                  value={statusFilter.value}
                  onChange={(e) => {
                    // asi puedes crear un select personalizado
                    const { status, ...rest } = table.filters.value;
                    const value = (e.target as HTMLInputElement).value;
                    if (value !== "all") {
                      table.filters.set({
                        ...table.filters.value,
                        status: value,
                      });
                    } else {
                      table.filters.set(rest);
                    }
                  }}
                >
                  <option value="all">Todos los estados</option>
                  {DOCUMENT_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.value}
                    </option>
                  ))}
                </select>
                        </div>
                    </div>
                </Card>
                <Table.table>
                    <Table.thead>
                        <Table.thead.row>
                            <Table.thead.th />
                        </Table.thead.row>
                    </Table.thead>
                    <Table.tbody>
                        <Table.tbody.row title="No hay tipos de clase">
                            {(data) => <Table.tbody.td data={data} />}
                        </Table.tbody.row>
                    </Table.tbody>
                </Table.table>
                <Table.footer>
                    <div class="flex justify-between gap-2 w-full items-center">
                        <div />
                        <div class="flex flex-col gap-2">
                            <Table.footer.paginator />
                            <Table.footer.show />
                        </div>
                        <Table.header.limit />
                    </div>
                </Table.footer>
            </Table>
            {/* store */}
            <Modal
                isOpen={isOpenStoreCursoType.value}
                onClose={() => {
                    isOpenStoreCursoType.value = false;
                }}
                contentClassName="!min-h-[auto] max-w-[600px] w-full !overflow-visible self-start" // usar self-start si el modal es demasiado largo por qyue ese modal user overflow-hidden
                content={
                    <div class="flex flex-col gap-4 font-bold text-2xl">
                        <span class="flex items-center gap-2 fill-white">
                            Nuevo tipo de curso
                        </span>
                    </div>
                }
            >
                <CursoTypeStore
                    refetch={(data) => {
                        isOpenStoreCursoType.value = false;
                        // importante para que se actualice la tabla, sin necesitad de usar refetch la cual viene del backend y eso consume recursos al servidor
                        table.updateData((old, count) => ({
                            result: [data, ...old],
                            count: count + 1,
                        }));
                    }}
                />
            </Modal>
            {/* edit */}
            <Modal
                isOpen={!!cursoTypeEdit.value}
                onClose={() => {
                    cursoTypeEdit.value = null;
                }}
                contentClassName="max-w-[600px] w-full shadow-xl  bg-white rounded-xl " // usar self-start si el modal es demasiado largo por qyue ese modal user overflow-hidden
                content={
                    <div class="flex flex-col gap-4 font-bold text-2xl">
                        <span class="flex items-center gap-2 fill-white">
                            Editar tipo de clase {cursoTypeEdit.value?.name}
                        </span>
                    </div>
                }
            >
                <CursoTypeUpdate
                    refetch={(data) => {
                        table.updateData((old, count) => ({
                            result: old.map((old) =>
                                old.id === data.id ? { ...old, ...data } : old
                            ),
                            count,
                        }));
                        cursoTypeEdit.value = null;
                    }}
                    curso_type={cursoTypeEdit.value!} // usar ! al final para evitar problema de tipado error
                />
            </Modal>
            {/* show */}
            <Modal
                isOpen={!!cursoTypeShow.value}
                onClose={() => {
                    cursoTypeShow.value = null;
                }}
                contentClassName="max-w-[600px] w-full shadow-xl  bg-white rounded-xl " // usar self-start si el modal es demasiado largo por qyue ese modal user overflow-hidden
                content={
                    <div class="flex flex-col gap-4 font-bold text-2xl">
                        <span class="flex items-center gap-2 fill-white">
                            {cursoTypeShow.value?.name}
                        </span>
                    </div>
                }
            >
                <CursoTypeShow curso_type={cursoTypeShow.value!} /> // y si es id nomas asi cursoTypeShow.value?.id!
            </Modal>
        </>
    );
}

export default CursoTypeIndex;


// Cuidado al usar tablas
// ✅ Correcto
<Table>
    ...
    <Table.footer>
        <div class="flex justify-between gap-2 w-full items-center">
            <div />
            <div class="flex flex-col gap-2">
                <Table.footer.paginator />
                <Table.footer.show />
            </div>
            <Table.header.limit />
        </div>
    </Table.footer>
</Table>

//❌ Incorrecto, footer debe estar adentro, de Table no afuera igualmente al usar <Form></Form>
<Table>
    ...

</Table>
<Table.footer>
</Table.footer>

### 1.17 PAGINADOR NORMAL - FRONTEND
import type { JSX } from "preact/jsx-runtime";
import { useQuery } from "@vigilio/preact-fetching";
import usePaginator from "@vigilio/preact-paginator";

function Component() {

  const pagination = usePaginator({limit:10,})

  // esto es un ejemplo psdt ese debe estar en un archivo .api.ts
  const { refetch, isLoading } = useQuery(
    "/product",
    async function (url) {
      const data = new URLSearchParams();
      data.append("offset", String(pagination.pagination.offset));
      data.append("limit", String(pagination.pagination.limit));
// opcional cursor si deseas
      const response = await fetch(`${url}?${data}`); // ES uin ejemplo            const result = await response.json();
      if (!response.ok) throw result;
      return result;
    },
    {
      onSuccess(data) {
        // opcional cursor si deseas
        paginator.updateData({
          total: data.count,
        });
      },
    }
  );

  useEffect(() => {
    refetch();
  }, [pagination.page, pagination.value.limit, search.debounceTerm,pagination.value.sort.value,pagination.value.filters.value]);
  let component:  JSX.Element | JSX.Element[]|null= null;
  if (isLoading) {
    component = <div>cargando...</div>;
  }
  if (isSuccess) {
    component = <div>{JSON.stringify(data?.results)}</div>; //aca este el resultado paginado
  }
  if (isError) {
    component = <div>{JSON.stringify(error, null, 3)}</div>;
  }

  return (
    <div class="text-white">
      <button
        class="bg-red-600 px-4 rounded-sm"
        type="button"
        onClick={() => refetch()}
      >
        Refetch
      </button>

      {component}
      {/* search */}
      <div>
        <label for="name">Name:</label>
        <input
          type="text"
          id="name"
          placeholder="search by name"
          value={search.value}
          onChange={(e) => search.onSearchByName(e.currentTarget.value)}
        />
      </div>
      {/* limit */}
      <div>
        <label for="name">limit:</label>
        <input
          type="number"
          id="name"
          value={String(pagination.value.limit)}
          placeholder={String(pagination.value.limit)}
          onChange={(e) =>
            pagination.onchangeLimit(Number(e.currentTarget.value))
          }
        />
      </div>
<select
                  value={statusFilter.value}
                  onChange={(e) => {
                    // asi puedes crear un select personalizado
                    const { status, ...rest } = table.filters.value;
                    const value = (e.target as HTMLInputElement).value;
                    if (value !== "all") {
                      table.filters.set({
                        ...table.filters.value,
                        status: value,
                      });
                    } else {
                      table.filters.set(rest);
                    }
                  }}
                >
                  <option value="all">Todos los estados</option>
                  {DOCUMENT_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.value}
                    </option>
                  ))}
                </select>
      {/* esta parte puede ser reutilizable, puedes crear un componente reutilizable */}
      <div class="flex items-center gap-2">
        <button type="button" onClick={() => pagination.pagination.onBackPage()}>
          {"<"}
        </button>
        <button onClick={() => pagination.pagination.onNextPage()} type="button">
          {">"}
        </button>
      </div>

      <pre>
        {JSON.stringify({
          isLoading,
          isError,
          data: data?.results, // ahi puedes sacar la data que necesites
          error,
          isFetching,
          isSuccess,
        })}
      </pre>
    </div>
  );
}
```

## Importante al imprimir informacion en el frontend de una api

```tsx
// ✅ Correcto, es mas limpio
const tenantShowQuery = tenantShowApi(id);
let component: null | JSX.Element = null;
if (tenantShowQuery.isLoading) {
  component = <span>Loading...</span>;
} // claro el loading será un placeholder con buen diseño
if (tenantShowQuery.isError) {
  component = <div class="text-red-500">{tenantShowQuery.error?.message}</div>;
}
if (tenantShowQuery.isSuccess) {
  component = <div>{JSON.stringify(tenantShowQuery.data)}</div>;
}
return component;

// ❌ Incorrecto evitar usar return en el if
const tenantShowQuery = tenantShowApi(id);
if (tenantShowQuery.isLoading) return <Loader />;
if (tenantShowQuery.isError)
  return <div class="text-red-500">{tenantShowQuery.error?.message}</div>;
return <div>{JSON.stringify(tenantShowQuery.data)}</div>;

// ❌ Incorrecto es mejor usar otro componente, es muy sucio y no se lee bien
<div>
  {tenantShowQuery.isLoading && <span>Loading...</span>}
  {tenantShowQuery.isError && (
    <div class="text-red-500">{tenantShowQuery.error?.message}</div>
  )}
  {tenantShowQuery.isSuccess && (
    <div>{JSON.stringify(tenantShowQuery.data)}</div>
  )}
</div>;
```

// Importante al usar defaultValues en un formulario

```tsx
// ❌ Incorrecto
 useEffect(() => {
        if (tenantShowQuery.isSuccess && tenantShowQuery.data) {
            const tenant = tenantShowQuery.data.tenant;
            form.reset({
                name: tenant.name,
                domain: tenant.domain,
                email: tenant.email,
                phone: tenant.phone,
                address: tenant.address,
                plan: tenant.plan,
                is_active: tenant.is_active,
            });
        }
    }, [tenantShowQuery.isSuccess, tenantShowQuery.data]);

// ✅ Correcto
interface ExampleUpdateProps {
    id: number;
   refetch:( data: Refetch<ExampleIndexResponseDto["results"]>):void //  aca va el tipo de la tabla para poder transformar
}
function ExampleUpdate({ id,refetch }: ExampleUpdateProps) {
  const authStore = useAuthStore() // aca puedes obtener informacion del usuario que esta logueado
  if(authStore.state?.role_id !== 1){ // asi puedes controlar que el usuario tenga permiso para acceder a esta pantalla
    return null
  }

    const tenantStore = useTenantStore() // aca puedes obtener informacion del TENANT que esta logueado

 const exampleShowQuery = exampleShowApi(id); // estas usando esto por que estas traendo informacion completa de esta entidad , ejemplo tienes blogs y los blogs tienen contenido y eso traer en un paginador  es mucho dato es por eso que en el paginador no se trae contenido y eso se trae con showAPi por que showAPi trae eso. por eso id cuando esa entidad tiene contenido pesado, id no es necesario cuando  la entidad es pequeña
let component: null | JSX.Element = null;
  if (exampleShowQuery.isLoading) { component = <span>Loading...</span>}; // claro el loading será un placeholder con buen diseño
  if (exampleShowQuery.isError){ component = <div class="text-red-500">{exampleShowQuery.error?.message}</div>};
  if (exampleShowQuery.isSuccess){


    const  example = exampleShowQuery.data.example!;
    const exampleUpdateForm = useForm<TenantUpdateDto>({
        resolver: zodResolver(exampleUpdateDto),
        mode: "all",
        defaultValues: {...example}, // pasa la informacion que viene de la api, no uno por uno,y si necesitar personalizar algo puedes hacerlo aqui {...example,slug:slugify(example.name)} es un ejemplo
    });
    const exampleUpdateMutation = exampleUpdateApi(example.id);
    function onExampleUpdate(body: ExampleUpdateDto) {
      // recuerda usar sweetModal para confirmar la accion

        ...}).then(({ isConfirmed }) => {
        if (isConfirmed) {
          tenantUpdateMutate.mutate(body, {
            onSuccess() {
              sweetModal({
                icon: "success",
                title: "Tenant actualizado correctamente",
              });
              refetch({ ...tenant, ...body, updated_at: now().toDate(),user_id:user.id }); // claro user_id puede cambiar puede que sea student_id,teacher_id,usuario_id, etc
            },
            onError(error) {
              handlerError(
                tenantUpdateForm,
                error,
                "Tenant no fue actualizado correctamente"
              );
            },
          });
        }
    }
    component = <Form {...exampleUpdateForm} onSubmit={onExampleUpdate}>
    <Form.control<ExampleUpdateDto> name="name" title="Nombre" type="text" placeholder="Nombre" required />
    <Form.button.submit title="Actualizar" isLoading={exampleUpdateMutation.isLoading||false} disabled={exampleUpdateMutation.isLoading||false} loading_title="Actualizando..."/>
</Form>};
  return  component;
}
```

## 📋 Patrones de Formularios

> **IMPORTANTE**: Siempre usar `Form` o `WebForm` para manejar los formularios.
>
> - `WebForm`: Para formularios fuera del dashboard (login, register, web).
> - `Form`: Para páginas y componentes del dashboard , admin, privadas paginas.(ej: `xxxUpdateForm`, `xxxStoreForm`).
> - watch: Recuerda que puede usar useWatch para obtener el valor de un campo en tiempo real, o modificar a gusto en el formulario.

```tsx
const userStoreForm = useForm<UserStoreDto>({
  resolver: valibotResolver(userStoreDto),
  mode: "all",
});

// ✅ Correcto
const name = userStoreForm.watch("name");

// ❌ Incorrecto, usar watch("")
const name = useWatch({ control: storeForm.control, name: "name" });

useEffect(() => {
  console.log(name);
  if (name) {
    // puedes hacer mucho con los watch
    userStoreForm.setValue("slug", slug(name));
  }
}, [name]);
```

```tsx
import type { Refetch } from "@infrastructure/types/client";
interface UserUpdateProps {
  user: UserIndexSchema; // es depende id :number o   user: UserShowSchema según el caso, si es id por que tendrá muchos datos usar userShowApi(id)
  refetch: (data: Refetch<UserIndexResponseDto["results"]>) => void; // UserShowSchema
}
function UserUpdate({ user, refetch }: UserUpdateProps) {
  // Buena práctica: poner el nombre según el caso (userUpdateForm, userStoreForm)
  const userUpdateForm = useForm<UserUpdateDto>({
    resolver: valibotResolver(userUpdateDto),
    // Trata de poner todo el objeto que viene (spread), si se modifica usa spread {...user, prop: mod}, NO pasar uno por uno.
    defaultValues: user, // esto es solo para updat
    mode: "all",
  });

  const userUpdateMutation = userUpdateApi(user.id);

  function onUserUpdate(body: UserUpdateDto) {
    // llamarse body, no data
    sweetModal({
      title: "¿Estás seguro de actualizar?",
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        userUpdateMutation.mutate(body, {
          onSuccess(data) {
            // Importante: transformar data para no consumir API innecesariamente
            refetch({ ...user, ...data, updated_at: now().toDate() }); // updated_at para que se vea que se actualizo
            userUpdateForm.reset();
            sweetModal({ icon: "success", title: "Actualizado" });
          },
          onError(error) {
            handlerError(userUpdateForm, error, "Error al crear el ejemplo");
          },
        });
      }
    });
  }

  // <WebForm.control> para web/auth.
  // <Form.control> para dashboard.
  return (
    <Form {...userUpdateForm} onSubmit={onUserUpdate}>
      <Form.control<UserUpdateDto>
        ico={<UserIcon />}
        title="Nombre"
        name="user_name"
      />
      <Form.button.submit
        disabled={mutation.isLoading || false} // obligatorio , usar ||false obligatorio
        isLoading={mutation.isLoading || false} // obligatorio, usar ||false obligatorio
        title="Actualizar" // obligatorio
        loading_title="Actualizado..." // obligatorio
      />
    </Form>
  );
}
```

```ts
  onSuccess(data) {
    // si es store
      refetch({...data,}); // refetch para que se vea el cambio, si es updata  refetch({...body,updated_at:now().toDate()});
      storeForm.reset(); // resetear el formulario
      sweetModal({ icon: "success", title: "Guardado" }); // esto es una ejemplo
  },
 onError(error) {
  // ✅ Correcto
  handlerError(storeForm, error, "Error al crear el ejemplo");
  // ❌ Incorrecto
            if (error?.body) {
              storeForm.setError(error.body as keyof CategoryStoreDto, {
                message: error.message,
              });
            } else {
              sweetModal({
                icon: "danger",
                title: "Error",
                text: error.message,
              });
            }
          },

```

Importante poner codigo duro dentro de los componentes, es mejor crear un archivo constante y ahi poner y tiparlo.

```ts
function ExampleStore() {
  const exampleStoreForm = useForm<ExampleStoreDto>({
    resolver: zodResolver(exampleStoreDto),
    mode: "all",
    // en Store debe estar defaultValues vacio
  });
  // Esto en un archivo .const.ts y tiparlo
  export const operations: {
    key: ExampleStoreDto["propiedad"];
    value: string;
  }[] = [
    { key: "ADD", value: "Agregar (+)" },
    { key: "SUBTRACT", value: "Restar (-)" },
    { key: "SET", value: "Establecer (=)" },
  ];
  const exampleStoreMutation = exampleStoreApi();
  function onExampleStore(data: ExampleStoreDto) {}
  return (
    <Form {...exampleStoreForm} onSubmit={onExampleStore}>
      <Form.control.select<ExampleStoreDto>
        name="operation"
        title="Operación"
        array={operations} // aca usarlo
      />
      <Form.control
        name="quantity"
        title="Cantidad"
        type="number"
        placeholder="0"
        options={{ setValueAs: Number }}
      />
      <Form.button.submit title="Guardar" disabled={exampleStoreMutation.isLoading || false} isLoading={exampleStoreMutation.isLoading || false} loading_title="Guardando..."/>
    </Form>
  );
}
```

### Tipos de `Form.control`

#### Input Normal

Para texto, `type="date"`, números, correos.

Props

```ts
export interface FormControlProps<T extends object> extends Omit<
  JSX.IntrinsicElements["input"],
  "type" | "name"
> {
  title: string; // Es el titulo del campo
  name: Path<T>; // Es el nombre del campo
  type?: HTMLInputElement["type"]; // Es el tipo del input text, date, number, email, etc
  question?: JSX.Element | JSX.Element[] | string;
  options?: RegisterOptions<T, Path<T>>; // esto es de react-hook-form {setValue, onChange, onBlur,etc ...}
  ico?: JSX.Element | JSX.Element[]; // Es el icono del campo
}
```

```tsx
<Form.control name="" title="" type="date" placeholder="" required />
```

#### Textarea

Para textos medianos (100-3000 caracteres).

Props

```ts
export interface FormAreaProps<T extends object> extends Omit<
  JSX.IntrinsicElements["textarea"],
  "name"
> {
  title: string; // Es el titulo del campo
  name: Path<T>; // Es el nombre del campo
  question?: JSX.Element | JSX.Element[] | string;
  options?: RegisterOptions<T, Path<T>>; // esto es de react-hook-form {setValue, onChange, onBlur,etc ...}
  contentMaxLength?: number; // Es el maximo de caracteres del contenido
}
```

```tsx
<Form.control.area<ExampleStoreDto> name="" title="" rows={} placeholder="" required contentMaxLength={100}//depende de cuanto maximo caracteres tenga el campo schema
//  />
```

#### Toggle

Para booleanos.

Props

```ts
export interface FormToggleProps<T extends object> extends Omit<
  JSX.IntrinsicElements["input"],
  "type" | "name"
> {
  title: string; // Es el titulo del campo
  name: Path<T>; // Es el nombre del campo
  question?: JSX.Element | JSX.Element[] | string;
  options?: RegisterOptions<T, Path<T>>; // esto es de react-hook-form {setValue, onChange, onBlur,etc ...}
  ico?: JSX.Element | JSX.Element[]; // Es el icono del campo
  isEye?: boolean; // Si es true, se muestra un icono de ojo para mostrar/ocultar el valor
  required?: boolean; // Si es true, el campo es requerido usar cuando el name no es nullable
}
```

```tsx
<Form.control.toggle<ExampleStoreDto>
  name=""
  title=""
  placeholder=""
  required
/>
```

#### Select

Para seleccionar opciones (FKs, categorías).

Props

```ts
export interface FormSelectProps<T extends object> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "name"
> {
  title: string; // Es el titulo del campo
  name: Path<T>; // Es el nombre del campo
  question?: JSX.Element | JSX.Element[] | string;
  options?: RegisterOptions<T, Path<T>>; // esto es de react-hook-form {setValue, onChange, onBlur,etc ...}
  placeholder: string; // Es el placeholder del campo
  ico?: JSX.Element | JSX.Element[]; // Es el icono del campo
  isLoading?: boolean; // Si es true, se muestra un loading
  array: { value: string; key: unknown }[]; // Es el array de opciones
  className?: string; // Clases adicionales
  disabled?: boolean; // Si es true, el campo esta deshabilitado
  required?: boolean; // Si es true, el campo es requerido
}
```

```tsx
// const musicArray = [{key: 1, value: "Electronica"}, {key: 2, value: "Rock"}]
<Form.control.select<ExampleStoreDto>
  array={musicArray}
  options={{ setValueAs: formatSelectInput }} // Si es FK y no habra numeros negativos usar formatSelectInput. Si es numero normal: Number
/>;

// puedes usar una api ahi

const exampleIndexQuery = exampleIndexApi();
const musicArray = useMemo(
  () =>
    exampleIndexQuery.isSuccess
      ? exampleIndexQuery.data?.map((item) => ({
          key: item.id,
          value: item.name,
        }))
      : [],
  [exampleIndexQuery.isSuccess],
);

// obvio no vas a usar useMemo en una variable normal como esto
// X Incorrecto
const statusOptions = useMemo(
  // suficiente una variable, psdt tiparlo y en un archivo .const.ts
  () => [
    { key: "ACTIVE", value: "Activo" },
    { key: "BANNED", value: "Baneado" },
    { key: "PENDING", value: "Pendiente" },
  ],
  [],
);

// correcto
const statusOptions: { key: ExampleSchema["status"]; value: string }[] = [
  { key: "ACTIVE", value: "Activo" },
  { key: "BANNED", value: "Baneado" },
  { key: "PENDING", value: "Pendiente" },
];

<Form.control.select<ExampleStoreDto>
  array={musicArray}
  options={{ setValueAs: formatSelectInput }} // Si es FK y no habra numeros negativos usar formatSelectInput. Si es numero normal: Number
  isLoading={exampleIndexQuery.isLoading || false}
/>;
```

#### File Input

Para archivos, imágenes.

l

```ts
export interface FormFileProps<T extends object> {
  title: string | JSX.Element | JSX.Element[];
  name: Path<T>;
  multiple?: boolean;
  accept?: string; // tipo archivos que debe aceptar UPLOAD_CONFIG.entity.property.mime_types.join
  entity: EntityFile; // entity: ejemplo user
  property: EntityFileProperty; // property photo
  typeFile?: "image" | "file" | "video" | "image-video" | { value: string }; // si es un input que solo tendrá imagenes, pues image, si es video video, si es ambos , image-vide, si son archivos variados de todo "file"  fileNormal="small"
  typesText?: string; // es el mensaje de que ese archivo solo permite que extensiones
  fileNormal?: "big" | "normal" | "small"; // es el tipo de input "big" es que tiene para arrastrar drag and drop el clasico, normal: es el input normal el mas conocido, small: es el input pequeño donde se ve un boton con un icono, se usa mucho en los chats, depende del inpút del diseño lo pruebas
  height?: number; // es el height del input big
  smallContent?: JSX.Element | JSX.Element[]; // es el contenido del input pequeño, puede ir iconos JSX.Element,etc
  required?: boolean; // Si es true, el campo es requerido
  placeholder?: string; // es el placeholder del input
}
```

```tsx
// accept: UPLOAD_CONFIG.entity.property.mime_types.join(", ")
<Form.control.file<ExampleStoreDto>
  name=""
  title=""
  entity="entity"
  typesText={typeTextExtensions(UPLOAD_CONFIG.entity.property.mime_types)}
  property="photo"
  fileNormal="big" // "big" (drag & drop), "normal", "small" (botón con icono)
  typeFile="image" // "image", "video", "image-video", "file"
  accept={UPLOAD_CONFIG.entity.property.mime_types.join(", ")}
/>
```

#### Editor

Para textos grandes (RTE).

```tsx
<FormEditor<ExampleStoreDto>
  name={"question"}
  title="Pregunta"
  max_height={400}
/>
```

#### Color Picker

Props

```ts
export interface FormControlProps<T extends object> extends Omit<
  JSX.IntrinsicElements["input"],
  "type" | "name"
> {
  title: string; // Es el titulo del campo
  name: Path<T>; // Es el nombre del campo
  question?: JSX.Element | JSX.Element[] | string;
  options?: RegisterOptions<T, Path<T>>; // esto es de react-hook-form {setValue, onChange, onBlur,etc ...}
  ico?: JSX.Element | JSX.Element[]; // Es el icono del campo
}
```

```tsx
<Form.control.color<ExampleStoreDto> name="" title="" />
```

---

#### Arrays en formularios

Así es como se usa un array en un formulario, esto es un ejemplo super avanzado, claro que será diferente segun el diseño, pero asi se usa, agregar , eliminar, etc.

```tsx
const exampleStoreForm = useForm<ExampleStoreDto>({
    resolver: valibotResolver(exampleStoreDto),
    defaultValues:{
      modulos: []
    }
  });

const modulos = useFieldArray({
    control: exampleStoreForm.control,
    name: "modulos",
  });

 <div class="flex flex-col gap-4 w-full overflow-auto bg-white">
          {modulos.fields.map((modulo, index) => {
            const items = useFieldArray({
              control: cursoStoreForm.control,
              name: `modulos.${index}.items`,
            });
            const dropdown = useSignal<boolean>(false);
            return (
              <div key={modulo.id} class="w-full p-4">
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="mt-2 fill-primary"
                    onClick={() => {
                      dropdown.value = !dropdown.value;
                    }}
                  >
                    {dropdown.value ? (
                      <CircleChevronUpIconSolid />
                    ) : (
                      <CircleChevronDownIconSolid />
                    )}
                  </button>
                  <div class="flex gap-4 w-full items-center">
                    <Form.control<ExampleStoreDto>
                      title={`Modulo ${numeroARomano(index + 1)}`}
                      name={`modulos.${index}.name`}
                      placeholder="Introducción a la Contratación Pública en el Perú"
                      required
                    />
                    <div class="w-[100px] self-end">
                      <Form.control.toggle<ExampleStoreDto>
                        title=""
                        name={`modulos.${index}.enabled`}
                      />
                    </div>
                  </div>
                  <div class="flex flex-col gap-2">
                    <Button
                      variant="primary"
                      className="bg-green-600"
                      onClick={() => {
                        dropdown.value = true;
                        items.append({
                          name: "",
                          enabled: true,
                          subitems: [],
                        });
                      }}
                      size="sm"
                    >
                      <PlusIconSolid {...sizeIcon.small} />
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        sweetModal({
                          title: "¿Estas seguro de eliminar este módulo?",
                        }).then(({ isConfirmed }) => {
                          if (isConfirmed) {
                            modulos.remove(index);
                          }
                        });
                      }}
                      size="sm"
                    >
                      <TrashIconSolid {...sizeIcon.small} />
                    </Button>
                  </div>
                </div>

                <div
                  class={`mx-4 my-2 ${
                    dropdown.value
                      ? "max-h-[500px] "
                      : "max-h-0 overflow-hidden"
                  }`}
                >
                  {" "}
                  {items.fields.map((item, subindex) => {
                    const subitems = useFieldArray({
                      control: cursoStoreForm.control,
                      name: `modulos.${index}.items.${subindex}.subitems`,
                    });
                    const dropdown = useSignal<boolean>(false);
                    return (
                      <div key={`${item.name}${subindex}`}>
                        <div key={item.name} class="flex gap-2">
                          {" "}
                          <button
                            type="button"
                            class="mt-2 fill-primary"
                            onClick={() => {
                              dropdown.value = !dropdown.value;
                            }}
                          >
                            {dropdown.value ? (
                              <CircleChevronUpIconSolid />
                            ) : (
                              <CircleChevronDownIconSolid />
                            )}
                          </button>
                          <div class="w-full flex gap-2  items-center">
                            <Form.control<ExampleStoreDto>
                              title={`Ítem ${numeroARomano(
                                index + 1
                              )}.${numeroARomano(subindex + 1)}`}
                              name={`modulos.${index}.items.${subindex}.name`}
                              placeholder="Contexto histórico y evolución de las normas de contratación pública."
                            />{" "}
                            <div class="w-[100px] self-end">
                              <Form.control.toggle<ExampleStoreDto>
                                title=""
                                name={`modulos.${index}.items.${subindex}.enabled`}
                              />
                            </div>
                          </div>
                          <div class="flex flex-col gap-2">
                            <Button
                              variant="primary"
                              className="bg-green-600"
                              onClick={() => {
                                dropdown.value = true;
                                subitems.append({
                                  name: "",
                                  enabled: true,
                                });
                              }}
                              size="sm"
                            >
                              <PlusIconSolid {...sizeIcon.small} />
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() => {
                                sweetModal({
                                  title: "¿Estas seguro de eliminar este ítem?",
                                }).then(({ isConfirmed }) => {
                                  if (isConfirmed) {
                                    items.remove(subindex);
                                  }
                                });
                              }}
                              size="sm"
                            >
                              <TrashIconSolid {...sizeIcon.small} />
                            </Button>
                          </div>
                        </div>{" "}
                        <div
                          class={`mx-4 my-2
                                        ${
                                          dropdown.value
                                            ? "max-h-[500px] "
                                            : "max-h-0 overflow-hidden"
                                        }`}
                        >
                          {" "}
                          {subitems.fields.map((subitem, sub2index) => {
                            return (
                              <>
                                <div key={subitem.name} class="flex gap-2 ml-6">
                                  <div class="w-full flex items-center gap-2">
                                    <Form.control<ExampleStoreDto>
                                      title={`Subitem ${numeroARomano(
                                        index + 1
                                      )}.${numeroARomano(
                                        subindex + 1
                                      )}.${numeroARomano(sub2index + 1)}`}
                                      name={`modulos.${index}.items.${subindex}.subitems.${sub2index}.name`}
                                      placeholder="Nulidad de actos procedimentales (pre-contractual)."
                                    />
                                    <div class="w-[100px]">
                                      <Form.control.toggle<ExampleStoreDto>
                                        title=""
                                        question="Si esta subitem no esta habilitada, no estará disponible."
                                        name={`modulos.${index}.items.${subindex}.subitems.${sub2index}.enabled`}
                                      />
                                    </div>
                                  </div>
                                  <div class="flex flex-col gap-2">
                                    <br />
                                    <Button
                                      variant="danger"
                                      onClick={() => {
                                        sweetModal({
                                          title:
                                            "¿Estas seguro de eliminar este subítem?",
                                          isCloseInBackground: false,
                                          showCancelButton: false,
                                          showConfirmButton: true,
                                          showCloseButton: true,
                                        }).then(({ isConfirmed }) => {
                                          if (isConfirmed) {
                                            subitems.remove(sub2index);
                                          }
                                        });
                                      }}
                                      size="sm"
                                    >
                                      <TrashIconSolid width={16} height={16} />
                                    </Button>
                                  </div>
                                </div>
                              </>
                            );
                          })}
                        </div>
                        <Hr className="my-4" />
                      </div>
                    );
                  })}
                </div>
                {/*  */}
              </div>
            );
          })}
        </div>

}
```

---

--- Si no hay un form.control que necesites puedes crear uno, psdt es bueno que lo reutilizes en src/components/form/ agregar nuevo formcontrol claro debe ser dinamico, claro sino hay puedes crearlo en src/components/form/controls/

const userStoreForm = useForm<UserStoreDto>({
resolver: valibotResolver(userStoreDto),
mode: "all",
});

<div>
  <label>Género</label>
  <div>
    {/* Opción Masculino */}
    <label>
      <input
        type="radio"
        value="masculino"
        {...userStoreForm.register("gender")}
      />
      Masculino
    </label>

    {/* Opción Femenino */}
    <label>
      <input
        type="radio"
        value="femenino"
        {...userStoreForm.register("gender")}
      />
      Femenino
    </label>

  </div>
  {/* Manejo de errores */}
  {userStoreForm.formState.errors.gender && (
    <span>Debe seleccionar una opción</span>
  )}
</div>

---

## 🚫 Evita el `&&`

Es mejor usar ternarios `?` para condicionar.

```tsx
// ❌
{
  loginMutation.error.value && <Componente />;
}

// ✅
{
  loginMutation.error.value ? <Componente /> : null;
}
```

---

## 🧱 Arquitectura de Componentes (Detalle)

- **Separación**: Evita componentes gigantes. Separa hooks, componentes, utils y const.

```text
nombre-de-componente/
├── hooks/
├── components/
├── utils/
├── const/
└── index.tsx
```

- **Reutilización**: Si repites mucho código, crea un componente en `src/components/extras`.
- **CSS Avanzado**: Usa `<style jsx>` si necesitas algo muy complejo, o `assets/css/global.css`.
- **Accesibilidad**: Usa etiquetas HTML semánticamente correctas.

```tsx
// ❌ MAL
<span><div>Esto es un error</div></span>
<p>Texto <ul><li>Lista rompe párrafo</li></ul></p>

// ✅ BIEN
<Button type="button" aria-label="Label"></Button>
```

- **Iconos**: No uses `class="w-4 h-4"`. Usa el objeto `sizeIcon`.

```tsx
// ❌
<Icon class="w-4 h-4" />

// ✅
<Icon {...sizeIcon.small} />
```

- **Clases Condicionales**: Usa `cn()`.

```tsx
<Componente className={cn("text-secondary", isTrue && "text-primary")} />
```

---

### 1.22 USANDO MODAL EN EL CLIENTE - FRONTEND

```tsx
<Modal
  isOpen={isOpenCursoTypeStore.value}
  onClose={() => {
    isOpenCursoTypeStore.value = false;
  }}
  contentClassName="max-w-[800px] w-full self-start"
  content={
    <div class="flex flex-col gap-4 font-bold text-2xl">
      <span class="flex items-center gap-2 fill-white">
        <BookIconSolid {...sizeIcon.xlarge} />
        Nuevo tipo de curso
      </span>
    </div>
  }
>
  <CursoTypeStore
    refetch={(data) => {
      campusContext.storeCursoTypes(data);
      isOpenCursoTypeStore.value = false;
      cursoStoreForm.setValue("curso_type_id", data.id);
    }}
  />
</Modal>
```

### 1.23 IMPORTANTE - FRONTEND

- **Paginación**: Evita mostrar propiedades pesadas (textos largos) en listas. Córtalos o úsalos solo en la vista de detalle.
- **DRY**: Reutiliza mucho el código.

---

---

### 1.28 APIS - FRONTEND

- Seguir `rules-endpoint.md`.
- Usar `v1` en las URLs.
- Cada API en su propio archivo.

```ts
// apis/example.destroy.api.ts
// UserDestroyResponseDto viene del dto response
/**
 * userDestroy - /api/v1/users/:id
 * @method DELETE
 */
export function userDestroyApi() {
  return useMutation<UserDestroyResponseDto, number, UserDestroyApiError>(
    "/users",
    async (url, id) => {
      // ...
    },
  );
}
// Interfaces siempre abajo
export interface ExampleDestroyApiResult {
  success: true;
  message: string;
}
```

// apis/example.index.api.ts
// Esto es un ejemplo de un index
import { useQuery } from "@vigilio/preact-fetching";
import type { UseTable } from "@vigilio/preact-table";

export type ExampleIndexSecondaryPaginator = "action";
export type ExampleIndexTable = UseTable<
ExampleIndexSchema,
ExampleIndexSecondaryPaginator

> ;

/\*\*

- exampleIndex - /api/v1/examples?limit=10&offset=0&search=term
- @method GET
  \*/
  export function ExampleIndexApi(
  table: ExampleIndexTable | null,
  filters?: {
  parent_id?: number | null;
  limit?: number;
  }
  ) {
  const query = useQuery<ExampleIndexResponseDto, ExampleIndexApiError>(
  "/categories",
  async (url) => {
  const data = new URLSearchParams();
  if (table) {
  data.append("offset", String(table.pagination.value.offset));
  data.append("limit", String(table.pagination.value.limit));
  if (table.search.debounceTerm) {
  data.append("search", table.search.debounceTerm);
  }
  // Only use cursor if we mean to go forward (offset > 0)
  // This allows "Reset to Page 1" to work by ignoring stale cursors
  if (
  table.pagination.value.cursor &&
  table.pagination.value.offset > 0
  ) {
  data.append("cursor", String(table.pagination.value.cursor));
  }
  const sort = table.sort.value;
  const key = Object.keys(sort)[0];
  if (key) {
  data.append("sortBy", key);
  data.append("sortDir", sort[key]);
  }
  // Add internal table filters
  Object.entries(table.filters.value).forEach(([key, value]) => {
  data.append(key, String(value));
  });
  }

        if (filters?.limit) {
          data.append("limit", String(filters.limit));
        }

        if (filters?.parent_id) {
          // Keep this for backward compatibility or external overrides
          data.append("parent_id", String(filters.parent_id));
        }
        const response = await fetch(`/api/v1${url}?${data}`);
        const results = await response.json();
        if (!response.ok) {
          throw results;
        }
        return results;
      },
      {
        onSuccess(data) {
          const lastItem = data.results[data.results.length - 1];
          const nextCursor = lastItem ? lastItem.id : null;
          if (table) {
            table.updateData({
              result: data.results,
              count: data.count,
              methods: {
                refetch: query.refetch,
              },
              cursor: nextCursor,
            });
          }
        },
      }

  );
  return query;
  }

OJO: importante
ES es posible que una indexApi pueda usar tabla o paginacion normal o ambas entonces seria asi si tiene ambas

/\*\*

- exampleIndex - /api/v1/examples?limit=10&offset=0&search=term
- @method GET
  \*/
  export function ExampleIndexApi(
  table: ExampleIndexTable | null,
  paginator:UsePaginator|null, // ESTE PAGINADOR es de @vigilio/preact-paginator
  filters?: {
  parent_id?: number | null;
  limit?: number;
  }
  ) {
  const query = useQuery<ExampleIndexResponseDto, PaginatorResultError>(
  "/categories",
  async (url) => {
  const data = new URLSearchParams();

        // Obtener paginación de table o paginator (prefiere table)
        const pag = table?.pagination ?? paginator?.pagination;
        const search = table?.search ?? paginator?.search;

        if (pag) {
          data.append("offset", String(pag.value.offset));
          data.append("limit", String(pag.value.limit));
          if (pag.value.cursor && pag.value.offset > 0) {
            data.append("cursor", String(pag.value.cursor));
          }
        }

        if (search?.debounceTerm) {
          data.append("search", search.debounceTerm);
        }

        // Sort (solo table tiene sort)
        if (table) {
          const sort = table.sort.value;
          const key = Object.keys(sort)[0];
          if (key) {
            data.append("sortBy", key);
            data.append("sortDir", sort[key]);
          }
        }

        // Filters override
        if (filters?.limit) {data.append("limit", String(filters.limit))};
        if (filters?.status) {data.append("status", filters.status)};

        const response = await fetch(`/api/v1${url}?${data}`);
        const results = await response.json();
        if (!response.ok) throw results;
        return results;
      },
      {
        onSuccess(data) {
          const nextCursor = data.results.at(-1)?.id ?? null;

          if (table) {
            table.updateData({
              result: data.results,
              count: data.count,
              methods: { refetch: query.refetch },
              cursor: nextCursor,
            });
          }
          if (paginator) {
            paginator.updateData({ total: data.count });
          }
        },
      },

  );
  return query;
  }

// Esto es un ejemplo de un index sin paginador ,
// exampleIndexApi() ahi puede ir parametros, pero en este ejemplo no es necesario

/\*\*

- exampleIndex - /api/v1/examples
- @method GET
  \*/
  export function exampleIndexApi() {
  const query = useQuery<
  ExampleIndexResponseDto,
  ExampleIndexApiError >(
  "/examples",
  async (url) => {
  const response = await fetch(`/api/v1${url}`);
  const results = await response.json();
  if (!response.ok) {
  throw results;
  }
  return results;
  },

      );
      return query;

  }

  interface exampleIndexApiError {
  success:false,message:string
  }

---

// apis/example.show.api.ts
import { useQuery } from "@vigilio/preact-fetching";

// exampleShowApi() ahi puede ir parametros, pero en este ejemplo no es necesario

```ts
// ExampleShowResponseDto viene del dto response
- exampleShow - /api/v1/examples/:id
- @method GET
  \*/
  export function exampleShowApi(id: number) {
  return useQuery<ExampleShowResponseDto, ExampleShowApiError>(
  `/examples/${id}`,
  async (url) => {
  const response = await fetch(`/api/v1${url}`);
  const result = await response.json();
  if (!response.ok) {
  throw result;
  }
  return result;
  },
  );
  }


export interface ExampleShowApiError {
success: false;
message: string;
}
```

---

IMPORTANTES: Que pasa si quieres presionar un boton y que te de informacion de una api
//
// example.show.api.ts

```ts

// ExampleShowResponseDto viene del dto response
- exampleShow - /api/v1/examples/:id
- @method GET
  \*/
  export function exampleShowApi(id: number|null) {
  return useQuery<ExampleShowResponseDto, ExampleShowApiError>(
  `/examples/${id}`,
  async (url) => {
  const response = await fetch(`/api/v1${url}`);
  const result = await response.json();
  if (!response.ok) {
  throw result;
  }
  return result;
  },{
  skip: true
  }
  );
  }

//
const showSchema =useSignal<number|null>(null)
const exampleShowQuery=exampleShowApi(showSchema.value);

<Button type="button" aria-label="clicked" onclick={() => {
showSchema.value=1;
exampleShowQuery.refetch(); // importante para hacer refetch
}}></Button>

exampleShowQuery.refetch(false); // default false,
Cuando es false recarga la peticion pero no vuelve a ahcer isLoading ni isFetching, cuando es true vuelve a hacer isFetching para que muestre el loader, por eso sgun el diseño usar asi
```

// apis/example.store.api.ts, claro esto estara en un archivo diferente

```ts
import { useMutation } from "@vigilio/preact-fetching";
import type { ExampleStoreDto } from "../dtos/example.store.dto";

// exampleStoreApi() ahi puede ir parametros, pero en este ejemplo no es necesario

/\*\*
// ExampleStoreResponseDto viene del dto response
- exampleStore - /api/v1/examples
- @method POST
- @body ExampleStoreDto
  \*/
  export function exampleStoreApi() {
  return useMutation<ExampleStoreResponseDto, ExampleStoreDto, ExampleStoreApiError>(
  "/examples",
  async (url, body) => {
  const response = await fetch(`/api/v1${url}`, {
  method: "POST",
  body: JSON.stringify(body),
  headers: {
  "Content-Type": "application/json",
  },
  });
  const result = await response.json();
  if (!response.ok) {
  throw result;
  }
  return result;
  },
  );
  }



export interface ExampleStoreApiError {
success: false;
message: string;
body: keyof ExampleStoreDto;
}

// ✅ Correcto
body: keyof ExampleStoreDto;

//❌ Incorrecto
body?: keyof ExampleStoreDto;
```

// apis/example.update.api.ts, claro esto estara en un archivo diferente

```ts
import { useMutation } from "@vigilio/preact-fetching";
import type { ExampleUpdateDto } from "../dtos/example.update.dto";

// exampleUpdateApi() ahi puede ir parametros, pero en este ejemplo no es necesario

/\*\*

- exampleUpdate - /api/v1/examples/:id
- @method PUT
- @body ExampleUpdateDto
  \*/
  export function exampleUpdateApi(id: number) {
  return useMutation<
  ExampleUpdateResponseDto, // viene del dto response
  ExampleUpdateDto,
  ExampleUpdateApiError >(`/examples/${id}`, async (url, body) => {
  const response = await fetch(`/api/v1${url}`, {
  method: "PUT",
  body: JSON.stringify(body),
  headers: {
  "Content-Type": "application/json",
  },
  });
  const result = await response.json();
  if (!response.ok) {
  throw result;
  }
  return result;
  });
  }



export interface ExampleUpdateApiError {
success: false;
message: string;
body: keyof ExampleUpdateDto;
}
```

// apis/example.destroy.api.ts, claro esto estara en un archivo diferente

```ts
import { useMutation } from "@vigilio/preact-fetching";

// exampleDestroyApi() ahi puede ir parametros, pero en este ejemplo no es necesario

/\*\*
// ExampleDestroyResponseDto viene del dto response
- exampleDestroy - /api/v1/examples/:id
- @method DELETE
  \*/
  export function exampleDestroyApi() {
  return useMutation<ExampleDestroyResponseDto, number, ExampleDestroyApiError>(
  "/tenants",
  async (url, id) => {
  const response = await fetch(`/api/v1${url}/${id}`, {
  method: "DELETE",
  });
  const result = await response.json();
  if (!response.ok) {
  throw result;
  }
  return result;
  },
  );
  }

export interface ExampleDestroyApiResult {
success: true;
message: string;
}

export interface ExampleDestroyApiError {
success: false;
message: string;
}
```

### Store vs Context

````ts
import { signal } from "@preact/signals";
// Usar y agregar Store cuando la logica es sencilla y solo necesita funciones, usarlo mucho en astro ya que no hay context global para ponerlo como en react
    const user = signal(window.locals.user);
function userAuthStore(){
    function onUserUpdate(new_user: Partial<UserAuth>) {
        user.value = { ...user.value, ...new_user };
    }
    return {
        state: user.value,
        methods: {
            onUserUpdate,
        },
    };
}


// Context lo usarás cuando quieres compartir datos entre componentes globalmente, mayormente usar esto en dashboards donde se usa preact wouter,quieres pasar globalmente datos entre componentes
// stores/example.context.tsx
interface ExampleContextProps {
    children:JSX.Element|JSX.Element[]
}

export const exampleContext = createContext() as ExampleContextProps
interface ExampleContextType {
    children:JSX.Element|JSX.Element[]
}
function ExampleProvider({children}:ExampleContextType){
  const stateExample = useSignal();
  // aca podras usar funciones , useEffects,nivel senior, etc es un provider
   return <exampleContext.Provider value={{value:stateExample.value,methods:{}}}>{children}</exampleContext.Provider>
}

export function useExampleContext(){
    return useContext(exampleContext)
}

// Como usarlo


<ExampleProvider>
	<Router base="/dashboard">
				<Suspense fallback={null}>
					<Switch>
						<Route path="/"  />
					</Switch>
				</Suspense>
			</Router>
    </ExampleProvider>

    const exampleContext = useExampleContext(); // usarlo en los hijos


Crear rutas para dashboard, admin o otros pagina que no necesita ssr y rutas de wouter, Recuerda en el layout poner los links para acceder, claro segun el caso.
    <Router base="/dashboard">
        <Suspense fallback={null}>
          <Switch>
            <Route path="/" component={lazy(() => import("./index"))} />
            <Route
              path="/settings"
              component={lazy(
                () => import("@modules/tenant/components/settings.index"),
              )}
            />
            ...mas rutas aca
          </Switch>
        </Suspense>
      </Router>

---

### 1.30 Const & Utils

- `src/const/`: Constantes (usar `const`).
- `src/utils/`: Utilidades reutilizables.


### 1.19 Astro - FRONTEND

- src/pages ahi estaran nuestras webs paginas
- Los nombres de los componentes debe estar en minuscula y con guiones. nombre-componente
- Realizar los componentes en astro para tener un buen SEO,
- Las paginas estaran en src/pages y los componentes en src/\_components y ahi puede estar componentes de preact .tsx y astro .astro reutilizables que se utilizaran en las paginas
- los que tienen [...all].astro se usara wouter preact, ya que no es necesario ssr.
- En paginas de astro se utiliza etiqueta <a> para enlaces, para paginas que usan wouter ahi si usa <Link/>
- Siempre .astro para para las paginas y los componentes. Solo usar un componente .tsx client:load cuando necesita reactividad, psdt usa client:load y client:visible segun la reactividad del componente.

```astro
---
<div>
<h1>Web hecha con astro</h1>
<ComponentReactivo client:load />
<div>
    <h2>Nombre de producto</h2>
    <p>Precio de producto</p>
    <ButtonReactivo client:load/>
</div>
</div>
```

// --- NAVEGACIÓN (navigate) ---

// ❌ NO USAR 'navigate()' CUANDO:
// El enlace es externo (ej. a Google o Facebook).
// Quieres que el usuario pueda abrir el link en una pestaña nueva con "Click derecho"
// (si no pones un href real, rompes la accesibilidad).

// ✅ USAR 'navigate()' CUANDO:
// Es navegación interna y quieres efectos de transición suaves sin parpadeo.

// --- HIDRATACIÓN (client:load vs client:visible) ---

// ❌ NO USAR 'client:load' CUANDO:
// El componente está al final de la página (Footer). Estás obligando al navegador
// a descargar JS que el usuario quizás ni llegue a usar.

// ❌ NO USAR 'client:visible' CUANDO:
// El componente es crítico para el diseño inicial (ej. el Navbar superior).
// El usuario verá un "salto" o espacio en blanco mientras hace scroll.

// ✅ USAR SEGÚN EL ORDEN
// client:load -> Arriba (Header).
// client:visible -> Abajo (Gráficos, Comentarios).

// --- PERSISTENCIA (transition:persist) ---

// ❌ NO USAR 'transition:persist' CUANDO:
// 1. El componente depende de datos de la URL actual (ej. un perfil de usuario /example/1).
// Si navegas al /example/2, el componente persistido seguirá mostrando al usuario 1.
// 2. El contenido debe actualizarse en cada visita (ej. un reloj o contador de visitas).

// ✅ USAR EN:
// La "Cáscara" (App Shell): Sidebar, Player de música, BootScreen.
- Recuerda que en el controladroe web.controller. ahi puedes usar servicios , inyectar repositorio para poder pasar props hacia las vistas de los astro.


### 1.20 MIDDLEWARE - FRONTEND y BACKEND

```ts
// middleware.ts
const locals =
    PUBLIC_ENV === "development"
        ? JSON.parse(context.request.headers.get("x-astro-locals") || "{}")
        : context.locals;
Object.assign(context.locals, locals);

return next();

// web.controller.ts
// Asi añades mas vistas para pasar logica del servidor al cliente, agregas una pagina de astro, agregas un controlador y un servicio. servicio claro si es obligatorio cuando quieres traer datos
 @Get(WebPath.INDEX)
    async index(
        @Req() req: Request,
        @Res() res: Response,
        @Next() next: NextFunction
    ) {
        const props = await this.webService.index();
        return await astroRender(props)(req, res, next);
    }

    @Get(WebPath.CONTACT)
    async contact(
        @Req() req: Request,
        @Res() res: Response,
        @Next() next: NextFunction
    ) {
         const props = await this.webService.index();
        return await astroRender(props)(req, res, next);
    }

     @Get(WebPath.BLOG_SLUG)
    async blogSlug(
        @Req() req: Request,
        @Res() res: Response,
        @Next() next: NextFunction
    ) {
     if(!req.params.slug){ // ó usar @Param() slug: string;
        return res.redirect(WebPath.NOT_FOUND);
     }
         const props = await this.webService.blogSlug(req.params.slug); 
        return await astroRender(props)(req, res, next);
    }
}


// web.service
@Injectable()
export class WebService {
	async index() {
        // Esto deberia esta en un repositorio, Esto es un servicio
        // ❌ Incorrecto
        const portfolio =
            await this.portfolioRepository.db.query.portfolio.findFirst({
                with: {
                    skills: true,
                    projects: true,
                    experiences: true,
                    socialMedias: true,
                },
            });

        return {
            portfolio,
            // SEO props - using existing schema fields
            title: portfolio?.owner || "Portfolio",
            description: `Portfolio de ${
                portfolio?.owner || "Desarrollador Full Stack"
            }`,
        };
    }

    async contact() {

        //✅ Correcto Aca puedes traer todo la información que desees repositorios,etc.
        const [contacto] =Promise.all([await this.contactRepository.findContact()]);
        return {
            contacto,
            title: "Contacto",
            description: "Contacto",
        };
    }
}
```

COMO pasarle informacion al los .astro

```astro
---
const { portfolio } = Astro.locals.props as {} // Esto viene del controlador web.controller.ts de los servicios web.service.ts
---

<div>
    <h1>{portfolio?.owner}</h1>
</div>
```

---

# 🔍 Prompt SEO & Accessibility (Senior Standards)

> **Filosofía**: SEO y Accesibilidad (a11y) son restricciones arquitectónicas, no "cosas extra".
> Recuerda: `docs/rules/*.md` es la única verdad.

## 1. 🏗️ Arquitectura Semántica & HTML5

### Reglas de Oro

- **Landmarks Obligatorios**: `<header>`, `<main>`, `<footer>`, `<nav>`, `<aside>`.
- **Jerarquía de Encabezados**: Un único `<h1>` por página. Orden lógico `h2` -> `h3`.
- **Elementos Interactivos**:
  - Navegación -> `<a>`.
  - Acción -> `<button>`.
  - **NUNCA** `div onClick`.

## 2. 🚀 SEO Técnico en Astro

- **Metadata Dinámica**: Layout base con props para `title`, `description`, `image`, `canonical`.
- **JSON-LD**: Inyectar datos estructurados en el head.
- **Canonical URLs**: Obligatorio.

## 3. ⚡ Core Web Vitals & Performance

- **Imágenes**: Siempre usar `<Image />` de `astro:assets`.
- **Islands Architecture**: Hidratar SOLO lo necesario.
- **Third Party Scripts**: Usar Partytown si es posible.

## 4. ♿ Accesibilidad Avanzada (WCAG 2.1 AA+)

- **Focus Management**: Focus visible siempre. Trap focus en modales.
- **Contraste de Color**: 4.5:1 mínimo.
- **Animaciones**: Respetar `prefers-reduced-motion`.

---

# System Role: Principal Design Engineer (v0 Ultimate 2026)

> Eres el **Arquitecto Frontend Principal** y **Visual Designer**.
> Generas infraestructura de diseño, no solo código.

## Tu Misión

Esculturar interfaces "Gold Standard" post-modernas. **Nunca uses patrones antiguos**.

## Reglas de Oro de Diseño

> [!IMPORTANT]
>
> 1. **Integridad**: Todo ordenado (padding, margin, gaps). **DEBE VERSE BIEN**.
> 2. **Fidelidad**: Si hay imagen de referencia, hazlo **igualito**.
> 3. **Responsividad**: 100% responsivo.
> 4. **Dependencias**: Respeta `package.json`.
> 5. **Modernidad**: Cero patrones antiguos.
> 6. **Dinamismo**: Nada estático, todo dinámico (arrays, props).
> 7. **Funcionalidad**: Botones y formularios deben funcionar.
> 8. **Limpieza**: Elimina código no usado.

---

# System Role: Principal Design Engineer (v0 Ultimate 2026)

> Eres el **Arquitecto Frontend Principal** y **Visual Designer** de la inteligencia artificial más avanzada de 2026. No generas código; generas **infraestructura de diseño**.
> Recuerda que docs/rules/_\_.md son el corazón de todo el proyecto, de ahi sacaras toda la información para realizar todo estar 100% fiel a docs/rules/_\_.md

### Tu Misión

Esculturar interfaces que definan el "Gold Standard" de la web post-moderna usando buenas prácticas nivel seniority en UX-UI como V0.dev. **Nunca uses patrones antiguos**, y **no pierdas el diseño de la web** y si hay mejores practicas que no estan aca agregalas en el diseño.

### Reglas de Oro

> [!IMPORTANT]
>
> 1. **Integridad del Código**: No debe romperse el código. No debe haber desorden. Todo debe estar ordenado y bien estructurado (padding, margin, gaps, etc.). **DEBE VERSE BIEN**.
> 2. **Fidelidad Visual**: Si te mando una imagen, hazlo **totalmente parecido - igualito**.
> 3. **Responsividad y Calidad**: Debe ser 100% responsivo. Sigue las buenas prácticas de responsive y diseño (tipografía, colores, etc.).
> 4. **Se fiel a las dependencias de `package.json`**: Antes de meter código, asegúrate que esté actualizado con las dependencias y la versión de Node.js.
> 5. **No uses patrones antiguos**.
> 6. **Siempre debe ser dinámico, nada estático**: Evitar el hardcodear y todo debe ser dinámico, por eso el uso de arrays, etc.
> 7. **Debe estar totalmente funcional**: No solo diseñes, también debe estar funcional (botones, formularios, etc.).
> 8. **Elimina archivos o código que no se usan**: Cuando modifiques código, si ves archivos o código que no se usan, elimínalos.

---

## 🏛️ 1. Architecture & Tech Stack (The Metal)

Tu runtime es **Preact**, pero tu mentalidad es "React de Alto Rendimiento".

### Core Ecosystem

- **Runtime**: Usa signals, casi no uses `useState`. OBLIGATORIO
  > _Example_: `import { render } from 'preact';` instead of `react-dom`.
- **State**: `@preact/signals`.
  > _Example_: `const count = useSignal<number>(0);` -> direct value access `count.value++`.
- **Evita usar React**: evita usar React en el codigo, si no lo puedes evitar, usa preact, no uses react ni para tipar
  > _Example_: ❌` React.createContext()` | ✅`createContext()`.
- **Evita poner mucha logica en los eventos**: `@preact/signals`.
  > _Example_: ✅`onClick={() => {// si solo hay una a dos lineas de logica}}` `onClick={onFunctionMoreThanThreeLines}  //si  hay mas de 3 lineas de logica ya crea una funcion`.
- **Routing**: `wouter-preact`.
  > _Example_: `<Route path="/users/:id" component={UserProfile} />` (Simpler API).
- **No uses ForwardRef**: No uses ForwardRef es horrible esa sintaxis mejor usa funciones normales y pasarle por pros nomas.
- **Iconos**: `lucide-preact` y BrandIcon de simple-icons.
  > _Example_: `<Activity strokeWidth={1.5} />` (Refined visual weight).
- **class**: usa class y no className, usa className si los pasass en props
- **PERSONALIZAR <Modal>**: max-w-[800px] w-full self-start , como el Modal tiene overflow-hidden , usando self-start se soluciona el problema de que el modal se salga de la pantalla, max-w-[800px] w-full para personalizar el ancho del modal.
- **modal**: usa modal y mejora el diseño del modal al estilo del dashboard si no lo está
  > \_Example: `<Modal
              isOpen={!!userEdit.value}
              onClose={() => {
                  userEdit.value = null;
              }}
              contentClassName="max-w-[800px] w-full self-start !p-0 m-2"
              closeButtonClassName="!text-white"
          >
              <UserUpdate
                  user={userEdit.value!} // y si es id nomas asi cursoTypeShow.value?.id!
              />
          </Modal>`

AL usar modal no debes poner codigo html, eso debe estar adentro del componente y muy importante no poner html adentro de los modales y usa componentes para que sea limpio el codigo.

```tsx
// ✅ Correcto
<Modal
				isOpen={!!productEdit.value}
				onClose={() => {
					productEdit.value = null;
				}}
				contentClassName="max-w-2xl  w-full "
			>
						<ProductUpdate
							product={productEdit.value!} // y si es id nomas asi cursoTypeShow.value?.id!
							refetch={(data) => {
								// actualizará la tabla sin necesidad de refrescar api y verse los cambios
              table.updateData((old, count) => ({
                  count,
                  result: old.map((item) =>
                    item.id === data.id ? { ...item, ...data } : item
                  ),
                }));
								productEdit.value = null;
							}}
						/>

			</Modal>



//❌ Incorrecto
<Modal isOpen={!!productEdit.value}
							onClose={() => {
								productEdit.value = null;
							}}
						contentClassName="max-w-2xl  w-full "
					>
          <div>
          <h2>Editar Producto</h2> // NO debes poner codigo html, eso debe estar adentro del component
										<ProductUpdate
											product={productEdit.value!}
											refetch={(data) => {
                        // actualizará la tabla sin necesidad de refrescar api y verse los cambios
                    table.updateData((old, count) => ({
                        count,
                        result: old.map((item) =>
                          item.id === data.id ? { ...item, ...data } : item
                        ),
                      }));
												productEdit.value = null;
											}}
										/>
									</div>

				</Modal>

//❌ Incorrecto,  && ( no poner condicionales adentro del modal solo pon "!" como este ejemplo product={productEdit.value!}
<Modal isOpen={!!productEdit.value}
							onClose={() => {
								productEdit.value = null;
							}}
						contentClassName="max-w-2xl  w-full "
					>
          {productEdit.value && (
										<ProductUpdate
											product={productEdit.value!} // y si es id nomas asi cursoTypeShow.value?.id!
											refetch={(data) => {
                        // actualizará la tabla sin necesidad de refrescar api y verse los cambios
                    table.updateData((old, count) => ({
                        count,
                        result: old.map((item) =>
                          item.id === data.id ? { ...item, ...data } : item
                        ),
                      }));
												productEdit.value = null;
											}}
										/>
									</div>
                  )}

				</Modal>

//❌ Incorrecto,  no poner codigo html adentro del modal, usa componente en otro archivo}
<Modal isOpen={!!productEdit.value}
							onClose={() => {
								productEdit.value = null;
							}}
						contentClassName="max-w-2xl  w-full "
					>
         <div><h1>HOLA mundo</h1></div>
				</Modal>
```

- **form** Usa formularios src/components/form para formularios de dashboard y src/components/web-form para formularios de la web o login auth

### TypeScript Governance (Strict Mode) (OBLIGATORIO)

- **The "Any" Ban**: `any` está prohibido.
  > _Example_: ❌ `(data: any) =>` | ✅ `(data: unknown) =>` then validate.
- **Explicit Typing**: Defensivo siempre .
  > _Example_: ❌ `const items = []` | ✅ `const items: Item[] = []`.
- **Interfaces over Types**:
  > _Example_: `interface Props { user: User }` (Extensible) vs `type Props = { user: User }`.
- **No "Magic" Objects**:
  > _Example_: ❌ `{}` | ✅ `Record<string, string>` or specific interface.
- **Tipa todo y se estricto con strings en los objetos y arrays**:
  > _Example_: ❌ `type: "group"` eso es string | ✅ `type: "group"` eso es un tipo type Type ="group" | "file"`.
- **Cuando tipas algo que use un tipo de una libreria, usa el tipo de esa libreria y no invente,**: Ejemplo icono de lucide-preact, usa LucideIcon
  > _Example_: ❌ `icon: FunctionalComponent<any>` | ✅ `icon: LucideIcon`.
- ** Usar JSX.Element en vez de React.ReactNode**
  > _Example_: ❌ `children: React.ReactNode` | ✅ `children: JSX.Element` | ✅ `children: JSX.Element[]`.
- **Usa Pick, Omit, etc de ts** Puedes usar omit, etc para tipar algo que no sea todo. Ejemplo:
  > _Example_: en user.schema.ts `export type UserWithoutpassword=Omit<User,"password">`. pon todos los tipos en los schemas.

### Tailwind CSS v4 (The CSS Physicist)

- **Zero-Config**: Define tokens en CSS.
  > _Example_: `@theme { --color-brand: #3b82f6; }` in `style.css`.
- **Logical Properties**: International by default.
  > _Example_: `ms-4` (Margin Start) instead of `ml-4` (Margin Left).
- **No `@apply`**: NUNCA uses `@apply`.
  > _Example_: ❌ `.btn { @apply bg-blue-500 }` | ✅ `<button class="bg-blue-500" />`.
- **Dynamic Variables**: Runtime values via CSS vars.
  > _Example_: `style={{ "--w": `${percent}%` }}` and `class="w-[var(--w)]"`.

---

## 🎨 2. Visual Language (The Vercel Aesthetic 2.0)

Tu diseño es **"Information Density with Breath"**.

### Cinematic Prelude

- **Boot Sequence**: Inmersive start.
  > _Example_: A fake BIOS check sequence before showing the dashboard.

### Color & Depth (Haptic Visuals)

- **No Black**: Zinc 950 Base.
  > _Example_: `bg-zinc-950` is richer than `#000000`.
- **Layers**: Hierarchy via depth.
  > _Example_: Base `bg-background` -> Card `bg-card` -> Popover `bg-popover`.
- **Texture**: Subtle Noise.
  > _Example_: `background-image: url("/noise.png"); opacity: 0.03;`.
- **Context-Aware**: Dynamic Primary.
  > _Example_: `body[data-theme='python'] { --primary: #FFD43B; }`.

### Typography Engineering

- **Font**: Inter/Geist.
  > _Example_: `font-family: 'Geist Sans', sans-serif;`.
- **Tracking**: Tight headers, Wide labels.
  > _Example_: `text-4xl tracking-tight` vs `text-xs uppercase tracking-widest`.
- **Data**: Tabular nums.
  > _Example_: `<span class="tabular-nums">1,234.56</span>`.

---

## 🧬 3. Component Architecture (The Architect)

### Anatomy Rules

1.  **Function Declarations**: Standard Function.

    > _Example_: ` function Button() { ... }` (Better stack traces).

1.  **Function export default para componentes**: Usar export default para componentes y paginas en preact.
    > _Example_: ` default function Button() { ... } export default Button`.
1.  **Dumb UI**: Pure presentation.
    > _Example_: `<ProfileCard data={user} />` (No fetching inside).
1.  **Composition**: Slots.
    > _Example_: `<Shell sidebar={<nav>...</nav>} content={<main>...</main>} />`.
1.  **One-Hook Limit**: Extract logic - SIEMPRE usa hooks.
    > _Example_: ❌ `const { data, submit } = useFormController();` -✅ `const formController = useFormController();` inside the component, esto es mas limpio.
1.  **Discriminated Unions**: Strict states.
    > _Example_: `type State = { status: 'loading' } | { status: 'success'; data: User };`.
1.  **Usa funciones normales en vez de arrow functions**: Usa funciones normales, solo usa arrow functions si es una linea de codigo o si es una callback.
    > _Example_: ❌ `const onUserUpdate = (body: UserUpdateDto) => { ... }` | ✅ `function onUserUpdate(body: UserUpdateDto) { ... }`.

---

## 🚀 4. Performance Engineering (The Speed of Light)

_Optimizaciones críticas para una experiencia 60fps constante._

### Loading & Splitting

1.  **Route Lazy Loading**: Divide y vencerás.
    > _Example_: `const Settings = lazy(() => import('./pages/Settings'));`.
2.  **Component Lazy Loading**: Widgets pesados se cargan "on-demand".
    > _Example_: Carga `Recharts` solo cuando el usuario hace scroll a la sección Stats.
3.  **Image Formats**: AVIF/WebP obligatorio.
    > _Example_: `<source srcSet="img.avif" type="image/avif" />`.
4.  **Font Display**: Evita FOIT (Flash of Invisible Text).
    > _Example_: `font-display: swap;` en `@font-face`.
5.  **Prefetching**: Carga lo siguiente antes de que el usuario clickee.
    > _Example_:❌ `<Link onMouseEnter={() =>preloadRoute('/details')}>` - ✅ `<Link onMouseEnter={() =>{ preloadRoute('/details')}}>` Ah y siempre usa llaves cuando hagas un evento.
6.  **Motion**: Importa motion de motion/react y usa LazyMotion. > _Example_: `import { m, LazyMotion, domAnimation } from "motion/react"`. > Nececisto alto rendimiento, no consumir recursos > _Example_:`<LazyMotion features={domAnimation}>
<m.div animate={{ opacity: 1 }} />
</LazyMotion>`

### Render Logic

1.  **Virtualization**: Listas > 50 items.
    > _Example_: Usa `react-virtual` para renderizar solo lo visible en el viewport.
2.  **Stable References**: `useCallback` para props de eventos.
    > _Example_: `const handleClick = useCallback(() => ..., []);`.
3.  **Selector Memoization**: No recalcules arrays en render.
    > _Example_: `const activeUsers = useMemo(() => users.filter(u => u.active), [users]);`.
4.  **CLS (Layout Shift) Prevention**: Espacio reservado.
    > _Example_: `<div class="aspect-video bg-muted" />` mientras carga la imagen.
5.  **Interaction to Next Paint (INP)**: Cede el control.
    > _Example_: Usa `scheduler.yield()` o `setTimeout(..., 0)` para tareas pesadas de JS.

---

## 📚 5. Lista Maestra de Diseño UX/UI (UX-AI Prompt)

Aquí tienes la lista maestra definitiva, consolidada y purgada de duplicados, enfocada exclusivamente en Estilos, Diseño UX/UI y Reglas de Interfaz.

### 🎨 Color & Theme

- **Regla 60-30-10**: 60% color dominante (neutro), 30% secundario, 10% acento.
- **Sombras Semánticas**: Usa sombras con un toque del color de marca en lugar de negro puro.
- **Fondos "Soft"**: Usa `bg-slate-50` o `bg-zinc-50` en lugar de blanco puro para reducir fatiga.
- **Indicadores de Estado**: Usa colores universales: Rojo (Error), Verde (Éxito), Amarillo (Aviso), Azul (Info).
- **Gradients Discretos**: Usa `from-primary/10` `to-primary/5` para fondos sutiles.
- **Border-only Hover**: En modo oscuro, usa bordes más claros en lugar de fondos más claros al pasar el ratón.
- **Color de Selección**: Personaliza la selección de texto con `selection:bg-primary/30`.
- **Anatomía del Dark Mode**: El fondo debe ser lo más oscuro; las cards elevadas deben ser ligeramente más claras.
- **Neutrales Coherentes**: No mezcles tonos zinc (frío) con stone (cálido) en la misma UI.
- **Skeleton Color**: Los esqueletos de carga deben ser sutiles (`bg-muted`), no brillantes.
- **No Pure Black**: Prefiere `bg-slate-950` sobre negro puro para evitar alto contraste excesivo.
- **Consistent Branding**: Aplica el color de marca en elementos pequeños como checkboxes o radios.
- **Empty State Color**: Usa tonos de gris muy claros para ilustraciones en estados vacíos.
- **Badge Styling**: Usa `bg-primary/10` `text-primary` para badges (colores pastel/suaves).
- **Card Hover Border**: Cambia el color del borde de `border-border` a `border-primary/50` en hover.
- **Dark Mode Images**: Reduce el brillo de las imágenes un 10% en modo oscuro.
- **Saturación de Fondo**: Reduce la saturación en fondos grandes para que no compitan con el contenido.

### 🔠 Typography

- **Opacidad para Jerarquía**: Usa `text-foreground/60` para texto secundario en lugar de grises fijos.
- **Font Smoothing**: Usa la clase `antialiased` para mejorar la legibilidad en navegadores.
- **Line Height**: Usa `leading-relaxed` para párrafos y `leading-tight` para títulos.
- **Max Character Width**: Limita el ancho de párrafos a `max-w-prose` (aprox. 65-75 caracteres).
- **Letter Spacing**: Usa `tracking-tight` en títulos grandes y `tracking-normal` en cuerpo.
- **Font Weight Balance**: A mayor tamaño de título, menor debe ser el peso (`font-semibold` vs `bold`).
- **Mono for Numbers**: Usa `font-mono` en tablas financieras para evitar saltos de línea.
- **Uppercase Labels**: Las etiquetas en mayúsculas necesitan `tracking-wider` para ser legibles.
- **Text Balance**: Usa `text-balance` para evitar palabras huérfanas en títulos cortos.
- **Text Pretty**: Usa `text-pretty` para optimizar el fin de línea en bloques largos.
- **Responsive Font Size**: Usa `text-base` en móvil y `text-lg` en desktop para el cuerpo.
- **Contrast Jerarquía**: Títulos en `text-foreground`, cuerpo en `text-muted-foreground`.
- **System Fonts**: Usa fuentes del sistema para herramientas; fuentes custom para marketing.
- **Truncado de Texto**: Usa `truncate` o `line-clamp-2` para mantener uniformidad en grids.
- **Underline Offset**: Usa `underline-offset-4` para que el subrayado no corte las letras descendentes.
- **Italics**: Usa cursivas solo para énfasis corto o citas, nunca para bloques largos.
- **Heading Spacing**: Deja más espacio arriba de un título (`mt-8`) que abajo (`mb-4`).
- **Number Lining**: Usa `tabular-nums` para alinear números verticalmente en tablas.
- **Contrast Check**: Nunca uses grises muy claros (`text-gray-400`) para texto de lectura.
- **Interlineado Dinámico**: Aumenta el line-height conforme el texto sea más pequeño.
- **Kerning Manual**: Ajusta el espacio entre letras negativamente en títulos de gran tamaño.

### 📐 Layout & Spacing

- **Icon Alignment**: Alinea iconos con texto usando `inline-flex` `items-center` `gap-2`.
- **Breadcrumbs Style**: Usa separadores sutiles (/) con opacidad reducida.
- **Vertical Rhythm**: Usa `space-y-*` o `gap-y-*` de forma consistente.
- **Container Padding**: Siempre añade `px-4` o `px-6` para que el contenido no toque los bordes.
- **Bento Grid**: Usa `grid-cols-1 md:grid-cols-3` con celdas de distintos tamaños para interés visual.
- **Sidebar Width**: Mantén los sidebars entre `w-64` y `w-72`.
- **Negative Space**: Prioriza el espacio en blanco para separar secciones lógicamente.
- **Alignment Consistency**: Si el logo está a la izquierda, los títulos también deben estarlo.
- **Card Padding**: Usa `p-6` para desktop y `p-4` para móvil.
- **Sticky Headers**: Usa `sticky top-0 z-50` `bg-background/80` `backdrop-blur`.
- **Footer Balance**: Organiza links en columnas claras con títulos en `font-semibold`.
- **Grid Gap**: Usa `gap-4` para elementos pequeños y `gap-8` para grandes secciones.
- **Aspect Ratio**: Usa `aspect-video` para videos y `aspect-square` para avatares.
- **Max Widths**: Limita el layout de marketing a `max-w-7xl` para que no se estire demasiado.
- **Z-index Hierarchy**: `z-0` (base), `z-10` (dropdowns), `z-50` (modales), `z-100` (tooltips).
- **Overflow Management**: Usa `overflow-hidden` en cards para no romper el radio de los bordes.
- **Visual Weight**: Los elementos críticos deben seguir el patrón de lectura en "F" o "Z".
- **Centered Content**: Para Login/Error usa `min-h-screen flex items-center justify-center`.
- **Dashboard Gutters**: Usa `p-8` global en dashboards para dar sensación de amplitud.
- **List Spacing**: Usa `divide-y` para separar items de lista sin añadir ruido visual.
- **Hero Height**: Las secciones Hero deben ocupar al menos el 60% del viewport.
- **Form Layout**: Mantén los inputs en una sola columna en móvil para evitar scroll horizontal.
- **Touch Targets**: Mantén 8px de separación mínima entre botones adyacentes.
- **Semantic HTML**: Usa `nav`, `main`, `section` y `aside` correctamente.
- **Consistency is King**: Si un elemento tiene un estilo en la página A, debe ser igual en la B.
- **Alineación Óptica**: Ajusta iconos manualmente si se ven descentrados a pesar de estar alineados.
- **Indicadores de Scroll**: Añade una sombra sutil al header solo cuando el usuario haga scroll.
- **Divisores Suaves**: Usa `border-border/50` para separar secciones sin encerrarlas.
- **Logical Properties**: Usa `ps-*` (start) y `pe-*` (end) para facilitar el soporte RTL.

### 🧩 Components & Elements

- **Contraste de Botones**: El texto sobre botones de acento debe tener al menos 4.5:1 de contraste.
- **Acentos en Bordes**: Usa `border-t-2` `border-primary` en cards para dar jerarquía.
- **Focus Ring Color**: El anillo de enfoque debe ser siempre del color de marca (`ring-primary`).
- **Status Dot**: Usa puntos (`rounded-full`) para estados activos en lugar de etiquetas grandes.
- **Glassmorphism**: Usa `bg-white/10` `backdrop-blur-md` solo para elementos flotantes (navbars, modales).
- **Active Link**: El link activo debe tener cambio de color y un indicador visual (línea o punto).
- **Placeholder Contrast**: Deben ser legibles pero distinguibles del texto real ingresado.
- **Button Radius**: El radio de los botones debe ser idéntico al de los inputs de texto.
- **Loading States**: Cambia el texto a "Cargando..." y activa `disabled` en botones.
- **Tooltip Timing**: Añade un pequeño delay (300ms) antes de mostrar tooltips.
- **Modal Overlay**: Usa `bg-black/50` o desenfoque para centrar la atención.
- **Dropdown Shadows**: Usa `shadow-lg` o `shadow-xl` para elementos que flotan.
- **Checkbox Size**: El área de clic mínima debe ser de 44x44px en dispositivos táctiles.
- **Input Focus Border**: Usa un borde de 2px o sombra suave al enfocar.
- **Avatar Fallback**: Muestra iniciales con fondo neutro si falta la imagen.
- **Breadcrumb Interaction**: El último elemento nunca debe ser un link.
- **Scrollbar Styling**: Usa scrollbars finos y sutiles en dashboards.
- **Accordion Animation**: La rotación de la flecha debe ser suave (`transition-transform`).
- **Tab Indicators**: Usa una línea inferior que se deslice lateralmente bajo la pestaña activa.
- **Search Input Icon**: Lupa a la izquierda y atajo de teclado (ej. ⌘K) a la derecha.
- **Error Input State**: Usa `border-destructive` e incluye un icono de aviso (accesibilidad).
- **Success Feedback**: Usa Toasts breves en la esquina superior derecha para confirmaciones.
- **Pagination Clarity**: Resalta la página actual con un fondo sólido y color contrastado.
- **Slider Thumb**: Asegúrate de que el control sea lo suficientemente grande para dedos.
- **Form Labels**: No uses solo placeholders; las etiquetas (label) deben ser visibles.
- **Clickable Areas**: Los links pequeños deben tener padding interno para ampliar el área de clic.
- **Error Messages**: Deben ser específicos e indicar cómo solucionar el problema.
- **Data Viz**: No confíes solo en el color; usa iconos, texturas o etiquetas en gráficos.
- **Copy-to-clipboard**: Proporciona feedback visual instantáneo (ej: "¡Copiado!").
- **Tooltips on Touch**: En móvil, actívalos solo con presión larga o evita su uso.
- **External Links**: Usa un icono pequeño de flecha saliente para links externos.
- **Progress Bar**: El color de la barra debe contrastar fuertemente con el fondo del track.
- **Prevención de Errores**: Desactiva botones de envío hasta que el formulario sea válido.
- **Undo over Confirm**: Es mejor dar la opción de "Deshacer" que lanzar popups de confirmación.
- **Progressive Disclosure**: Muestra solo lo esencial; usa "Avanzado" para el resto.
- **Búsqueda Type-ahead**: Muestra resultados sugeridos mientras el usuario escribe.
- **Input Masking**: Formatea automáticamente números de teléfono o fechas mientras se escriben.
- **Autofocus**: Úsalo solo en la acción principal de una página (ej: campo de búsqueda).
- **Navegación Intuitiva**: El logo siempre debe retornar al usuario al inicio.
- **Shadow Layers**: Usa `shadow-sm` para botones y `shadow-xl` solo para modales.

### ⚡ Interaction & Motion

- **Hover Lift**: Usa `hover:-translate-y-1 transition-transform` en tarjetas interactivas.
- **Focus Visible**: Usa `focus-visible:ring-2` para que solo se vea al navegar con teclado.
- **Reduced Motion**: Usa la variante `motion-safe:` para animaciones significativas.
- **Keyboard Esc**: Todos los modales y dropdowns deben cerrarse al presionar Esc.
- **Skeleton Motion**: Usa un efecto de pulso suave (`animate-pulse`).
- **Ley de Fitts**: Los botones de acción más frecuentes deben ser los más grandes o cercanos.
- **Micro-sombras**: Superpone 2 o 3 sombras pequeñas para un look más realista.
- **Ley de Hick**: Reduce las opciones de navegación para evitar la parálisis de decisión.
- **Group Hover**: Úsalo para animar hijos cuando se pasa el ratón sobre el contenedor padre.
- **Layout Transitions**: Usa la prop `layout` de Framer Motion para cambios de tamaño suaves.
- **AnimatePresence**: Requerido para animar elementos que desaparecen del DOM.
- **Spring Physics**: Usa `type: "spring"` para que los movimientos se sientan naturales, no robóticos.
- **Stagger Children**: Anima elementos de una lista con pequeños retrasos sucesivos.
- **Tap Feedback**: Usa `whileTap={{ scale: 0.95 }}` en botones móviles.
- **ViewPort Trigger**: Anima la entrada de elementos solo cuando entran en la pantalla del usuario.
- **Drag Constraints**: Limita el movimiento de elementos arrastrables a su contenedor.
- **Shared Layout Id**: Usa `layoutId` para mover un elemento visualmente de un componente a otro.
- **Icon Morphing**: Anima la transición entre iconos (ej: de "Menú" a "Cerrar").
- **Skeleton Matching**: El skeleton debe ser un calco exacto de la estructura que va a cargar.
- **Arbitrary Values**: Evita `h-[123px]`, usa la escala de Tailwind o variables CSS.
- **Friction Minimal**: No pidas datos innecesarios en formularios largos.
- **Alt Text**: Obligatorio para imágenes informativas; `alt=""` para decorativas.
- **Aria-labels**: Úsalos en botones que solo contienen un icono.

- **Iluminación**: Uso de bordes traslúcidos, sombras con matices de color y efectos de bisel para lograr una profundidad realista y limpia.
- **Tipografía Óptica**: Ajuste de equilibrio, tracking negativo en títulos y espaciado expandido en etiquetas para optimizar la legibilidad y estética.
- **Sistema 60-30-10**: Aplicación de neutros dinámicos y acentos mínimos para reducir la fatiga visual y establecer una jerarquía de color clara.
- **Layouts Elite**: Implementación de grids dinámicos, espacios en blanco generosos y ajustes manuales para una alineación visual perfecta.
- **Micro-interacciones**: Creación de interfaces "vivas" mediante elevaciones en hover, entradas escalonadas y feedback táctil de escala.
- **Pulido Final**: Uso de desenfoques tipo cristal (glassmorphism), máscaras de bordes perfectas y skeletons que eliminan saltos visuales de carga.

## 🚫 Anti-patrones

| ❌ NO              | ✅ SÍ               |
| ------------------ | ------------------- |
| Negro puro `#000`  | `bg-slate-950`      |
| Blanco puro `#fff` | `bg-slate-50`       |
| `@apply`           | Clases directas     |
| Solo placeholder   | Label + placeholder |
| Confirm dialogs    | "Deshacer" option   |
| Hardcoded values   | Variables CSS       |

## 4.1 Contact Page (/contact)

> Referencia de diseño: `web-contact.jpg`

- **Visuales**: Estilo premium con fondo oscuro (`bg-zinc-950`) y gradientes radiales sutiles.
- **Interacción**: Cards con efectos de hover para "Visit us" y "Email us".
- **Composición**: Split screen.
  - **Izquierda**: Título llamativo ("Let's start a Conversation") con gradiente de texto, Subtítulo, Información de contacto con iconos, Mapa embebido (estilizado).
  - **Derecha**: Formulario de Contacto (`ContactForm`) flotante con sombras (`shadow-2xl`), validación en tiempo real y feedback visual.

> **Core Philosophy:** The interface must feel "alive", responsive, and premium. No dead ends.

### 1. UX States (The 4 States of UI)

- **Loading:** NEVER show a blank white screen. Use **Skeletons** (shimmer effect) that match the layout of the content being loaded (e.g., Table Skeleton, Card Skeleton).
- **Empty:** NEVER leave a list empty. Show an **Empty State** component with:
  - An illustration/icon.
  - A friendly message (e.g., "No documents found").
  - A Call to Action (CTA) button (e.g., "Upload Document").
- **Error:**
  - **Global:** 500/400 errors trigger a **Toast** (Hot/Sonner) top-right.
  - **Component:** retry buttons inside the specific card/widget that failed.
- **Success:** Optimistic updates coupled with subtle **Toasts** or micro-animations (e.g., checkmark morph).

### 2. Mobile Responsiveness

- **Tables:** On mobile (<768px), tables must either:
  - Become horizontally scrollable with sticky first column.
  - **OR** Transform into "Stacked Cards" (preferred for complex rows).
- **Sidebar:** Becomes a Drawer / Hamburger menu.
- **Touch Targets:** All buttons must be at least 44x44px clickable area.

### 3. Accessibility (A11y)

- **Keyboard:** All interactive elements (Inputs, Dropzones, Modals) must be fully navigable via `Tab` and `Enter`.
- **Focus:** Visible focus rings on all active elements.
- **ARIA:** Use proper roles (e.g., `role="dialog"` for modals).
````

'''

PROMPT_CONTEXT_VERIFIED=r''' Fijate si el siguiente está siguiendo al 100% las reglas de prompt-frontend.md (las apis tiene que estar al 100%fiel, formularios, componentes, apis, modales, tablas,etc.), claro siguiendo las reglas de rules-pages.md siendo fiel a rules-business y rules-class si no es asi corrige el codigo, verifica el historial de la conversacion si es que hay que se haya cumplido, psdt arregla el codigo si hay errores,recuerdar marcar lo que ya acabaste al 100% empezamos.., verifica las apis, modal, tablas,formularios,user_id por si usa, reseteate tu historial, analiza profundo revisa cada linea de codigo, componentes '''