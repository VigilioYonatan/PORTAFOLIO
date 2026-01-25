# 🔍 Prompt SEO & Accessibility (Senior Standards)

> **Philosophy**: SEO and Accessibility (a11y) are not "nice-to-haves" or post-development checklists. They are **architectural constraints** that dictate the structure, performance, and semantics of the application from line one.
> Recuerda que docs/rules/_\_.md son el corazón de todo el proyecto, de ahi sacaras toda la información para realizar todo estar 100% fiel a docs/rules/_\_.md

---

## 1. 🏗️ Arquitectura Semántica & HTML5

El código debe ser semánticamente correcto para garantizar que los motores de búsqueda y los lectores de pantalla interpreten la estructura sin ambigüedad.

### Reglas de Oro

- **Landmarks Obligatorios**:
  - `<header>`: Navegación y branding.
  - `<main>`: Contenido principal único por página.
  - `<footer>`: Información legal, sitemap, contacto.
  - `<nav>`: Bloques de navegación (debe tener `aria-label` si hay más de uno).
  - `<aside>`: Contenido relacionado pero no crítico.
- **Jerarquía de Encabezados**:
  - **Único `<h1>` por página**: Debe describir el contenido principal.
  - Secuencia lógica `<h2>` -> `<h3>` -> `<h4>`. **Nunca** saltar niveles (ej: de `h2` a `h4`) por razones estéticas. Usar CSS para el tamaño visual.

### Elementos Interactivos

- **Botones (`<button>`) vs Enlaces (`<a>`)**:
  - **Navegación**: Si cambia la URL o te lleva a otra página/ancla, **SIEMPRE** usa `<a>`.
  - **Acción**: Si ejecuta un script, abre un modal, o envía un formulario, **SIEMPRE** usa `<button>`.
  - **Anti-patrón**: NUNCA usar `<div onClick={...}>` o `<span onClick={...}>`. Si es absolutamente necesario por diseño, debe incluir `role="button"` y `tabIndex={0}`, y manejar eventos de teclado (`onKeyDown` para Enter/Space).

### Formularios

- **Submit Explícito**: Todo formulario debe tener un botón con `type="submit"`.
- **Labels Asociados**: Todo input debe tener un `<label>` asociado mediante `for` (HTML) / `htmlFor` (React/Preact) coincidiendo con el `id` del input. No confiar solo en `placeholder`.
- **Validación Nativa**: Usar atributos `required`, `type="email"`, `pattern` antes de JS.
- **Mensajes de Error**: Deben estar asociados al input con `aria-describedby`.

```tsx
// ✅ Correcto
<form onSubmit={handleSubmit}>
  <label htmlFor="email">Correo Electrónico</label>
  <input id="email" type="email" required aria-describedby="email-error" />
  <span id="email-error" class="error-msg">
    Email inválido
  </span>

  <button type="submit" disabled={isSubmitting}>
    {isSubmitting ? "Enviando..." : "Suscribirse"}
  </button>
</form>
```

---

## 2. 🚀 SEO Técnico en Astro

Astro permite un control granular sobre el SEO. Aprovecha el SSR y SSG para renderizar metaadatos en el servidor.

### Metadata Dinámica

- **Layout Base**: Debe aceptar props para `title`, `description`, `image` (OG), `canonical`, `noindex`.
- **Generación Dinámica**: En páginas `[slug].astro` o SSR, los metadatos deben poblarse desde la base de datos/API antes de renderizar el HTML.

```astro
---
// src/layouts/Layout.astro
interface Props {
  title: string;
  description?: string;
  image?: string; // OG Image
  canonical?: string;
  article?: boolean;
}

const { title, description, image, canonical, article } = Astro.props;
const siteTitle = "Mi App";
const fullTitle = `${title} | ${siteTitle}`;
const canonicalURL = canonical || new URL(Astro.url.pathname, Astro.site);
const socialImage = new URL(image || '/default-og.png', Astro.site);
---

<head>
  <title>{fullTitle}</title>
  <meta name="description" content={description || "Descripción por defecto"} />
  <link rel="canonical" href={canonicalURL} />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content={article ? 'article' : 'website'} />
  <meta property="og:url" content={canonicalURL} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={socialImage} />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={fullTitle} />
</head>
```

### JSON-LD (Structured Data)

Para contenido rico (artículos, productos, eventos), inyectar JSON-LD en el head.

```astro
<script type="application/ld+json" set:html={JSON.stringify(schemaData)} />
```

### URLs Canónicas & Trailing Slashes

- Configurar `build.format` en `astro.config.mjs` (recomendado `'file'` o `'directory'`) y ser consistente.
- La etiqueta `<link rel="canonical">` es obligatoria para evitar penalización por contenido duplicado (ej: `/blog` vs `/blog/`).

---

## 3. ⚡ Core Web Vitals & Performance

La velocidad de carga y estabilidad visual son factores de ranking SEO.

### Imágenes (Astro Assets)

- Usar SIEMPRE `<Image />` de `astro:assets` para imágenes locales. Esto genera automáticamente `width`, `height` (evita CLS), formatos modernos (WebP/AVIF) y lazy loading.
- Para imágenes "Above the Fold" (Hero section), usar `loading="eager"` y posiblemente `fetchpriority="high"`.

### Scripts & Hydration

- **Islands Architecture**: Hidratar SOLO los componentes que necesitan interactividad (`client:load`, `client:visible`). El resto debe ser HTML estático.
- **Third Party Scripts**: Usar `<script type="text/partytown">` para analytics y scripts pesados si es posible, moviéndolos a un web worker.

---

## 4. ♿ Accesibilidad Avanzada (WCAG 2.1 AA+)

- **Focus Management**:
  - El foco debe ser visible siempre (`outline`). Customizarlo, pero nunca quitarlo (`outline: none` sin reemplazo es ilegal).
  - Al abrir un Modal, el foco debe atraparse dentro. Al cerrar, debe volver al disparador.
  - Al navegar rutas (SPA transition), el foco debe resetearse al top o al `main`.
- **Contraste de Color**:
  - Texto normal: Ratio 4.5:1 mínimo.
  - Texto grande / UI icons: Ratio 3:1 mínimo.
- **Animaciones**:
  - Respetar `prefers-reduced-motion`.
  - Evitar flashing/parpadeo (riesgo de epilepsia).

```css
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---
