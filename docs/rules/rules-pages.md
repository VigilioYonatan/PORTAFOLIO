# Rules Pages - Portfolio Personal

> Definición de requerimientos de páginas y componentes.
> Sincronizado con [`rules-business.md`](./rules-business.md) y [`rules-endpoints.md`](./rules-endpoints.md).
> Estrictamente fiel a [`prompt-rules.md`](../prompt/prompt-rules.md).

## Estructura de Carpetas

> **Regla de Organización:**
>
> - `components/`: Componentes UI atómicos y reutilizables en toda la app (Buttons, inputs, tables).
> - `modules/{nombre}/`: Dominio de negocio (lógica, stores, componentes específicos).
> - `pages/.../_components/`: Componentes visuales específicos de una página (Layouts, Landing sections).

```
components/
├── extras/               # UI genérica (Buttons, Modals, Badges)
│   ├── Button.tsx
│   ├── Modal.tsx
│   ├── Badge.tsx
│   ├── Card.tsx
│   └── Loader.tsx
├── form/                 # Form Inputs & Wrappers
│   ├── form-array
│   ├── form-color
│   ├── form-area
│   ├── ...etc
├── tables/               # Data Tables (Admin)
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── ...etc

modules/
├── auth/                 # Login, Password Recovery
│   ├── components/
│   │   ├── LoginForm.tsx
│   │   └── RecoveryForm.tsx
│   ├── stores/
│   │   └── auth.store.ts
│   ├── login.tsx
│   ├── forgot-password.tsx
│   └── reset-password.tsx
├── blog/                 # Article, Community
│   └── components/
│       ├── FuturisticMDX.tsx
│       ├── FloatingReactionBar.tsx
│       └── SocialHub.tsx
├── projects/             # Project Details
│   └── components/
│       └── ProjectDetails.tsx
├── skills/               # Tech Stack Grid
│   └── components/
│       └── SkillBentoGrid.tsx
├── user/                 # Profile logic
│   └── stores/
│       └── user.store.ts

pages/
├── [...locale]/          # Rutas internacionalizadas
│   ├── _components/
│   │   ├── HeroTerminal.tsx
│   │   ├── TechOrbit.tsx
│   │   ├── WaveTimeline.tsx
│   │   ├── FloatingActionChat.tsx
│   │   ├── NeuroPlayer.tsx
│   │   └── MonstercatVisualizer.tsx
│   │   ├── legal/
│   │   │   └── LegalDoc.tsx
│   ├── layouts/
│   ├── auth/
│   │   ├── login.astro
│   │   └── forgot-password.astro
│   ├── home.astro
│   ├── skills.astro
│   ├── privacy.astro
│   ├── terms.astro
│   ├── blog/
│   │   └── [...slug].astro
│   ├── projects/
│   │   └── [...slug].astro
│   ├── 404.astro
│   └── 500.astro
├── dashboard/
    ├── _components/
    ├── pages/
    │   ├── Overview.tsx
    │   ├── Content.tsx
    │   ├── AI.tsx
    │   ├── HR.tsx
    │   ├── Inbox.tsx
    │   ├── Shared.tsx
    │   └── Settings.tsx
    ├── router.tsx    # Enrutador de las páginas del dashboard (WOUTER)
    └── [...all].astro
```

## Concepto Visual (Senior Artistic-Futuristic)

- **Aesthetic:** Dark cyberpunk, neomorfismo sutil, animaciones de frecuencia (GLSL/Shaders).
- **Inspiration:** Neurofunk/DnB vibes (ritmos complejos, líneas agresivas pero limpias).
- **Core Feature:** `FloatingMusicPlayer` persistente en Sidebar/Aside con visualizador de espectro tipo **Monstercat**.
- **Reactive UI:** Todo el diseño de la landing page (bordes, luces de fondo, sombras) reaccionará dinámicamente al nivel de sonido y bajos de la música activa.
- **Tech identity:** Enfoque en Seniority (Architecture, Performance, Scalability).

## Layouts

> **Translation Requirement**: All public pages must support 3 languages (English, Spanish, Portuguese). Dashboard pages are single-language (admin preference).

### #layout-public

**Header:**

- **Components:** `TerminalLogo` (Link Home con efecto glitch), `NavLinks` (Home, Projects, Blog, Experience, Contact), `ThemeSwitcher` (Dark/AMOLED focus).
- **Behavior:** Glassmorphism, animaciones de entrada tipo "matrix-loading" sutil.

**Aside (Left/Right):**

- **MusicPlayer:** Reproductor flotante persistente. Lista de tracks, sistema de **Favoritos** (reacción LIKE integrada), control de volumen, visualizador de audio **reactivo tipo Monstercat**.

**Footer:**

- **Components:** `StatusBadge` (Syncing with GitHub/CI-CD status), `SocialIcons`.
- **FloatingChat:** Botón flotante (Bottom-Right) que abre `ChatAIWindow`.

### #layout-dashboard

**Header (Navbar):**

- **Left:** `SidebarTrigger`, `ProjectBreadcrumbs`.
- **Right:** `SystemStatus` (CPU/Memory load mock), `NotificationBell`, `UserAdminDropdown`.

**Aside (Sidebar):**

- **Menu:** `MainSection` (Dashboard, Documents, AI Training), `ContentSection` (Projects, Blog, Experience, Music, Technologies, Testimonials), `SystemSection` (Settings).

---

## Auth Management (/login, /forgot-password) (rules-business.md #3) (Imagenes: design/auth-login.png, design/auth-forgot-password.png)

**Layout:** Null (Minimalist Full Screen).

| Status | Tarea/Feature          | id o ids de enpoints de rules-endpoints que se usaron | Roles o Permisos | Componentes                                                                                                                                                                     | Testing           | Testeado |
| :----: | :--------------------- | :---------------------------------------------------: | :--------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------- | :------: |
|  [X]   | Admin Login.           |                        [ ] 3.1                        |      public      | **LoginForm**: Input email, Input password (con toggle visibility), Submit button con efecto neón/glitch, Link recovery.                                                        | [ ] unit, [ ] e2e |   [ ]    |
|  [X]   | Password Recovery.     |                        [ ] 3.3                        |      public      | **RecoveryForm**: Input email, Submit button, Success/Error specialized modals.                                                                                                 | [ ] unit          |   [ ]    |
|  [x]   | Sections / Components. |                        [ ] 5.1                        |      public      | **WaveTimeline**: Vertical timeline with scroll-triggered animations. **NeuroPlayer**: Fixed bottom player with visualizer. **FloatingActionChat**: FAB with simulated AI chat. | [ ] unit          |   [ ]    |

## Landing / Senior Identity (/) (Role:public) (rules-business.md #1, #4, #5, #6, #7, #10, #12, #22) (Imagenes: design/web-home.png, design/web-home-starting.png, design/web-aside.png, design/web-chat.png)

**Layout:** Inherits from #layout-public.

| Status | Tarea/Feature                                         | id o ids de enpoints de rules-endpoints que se usaron | Roles o Permisos | Componentes                                                                                                                                                 | Testing            | Testeado |
| :----: | :---------------------------------------------------- | :---------------------------------------------------: | :--------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------- | :------: |
|  [x]   | Hero Section: Senior Pitch & Sound-Reactive Identity. |                   [ ] 1.1, [ ] 6.1                    |      public      | **HeroTerminal**: Efecto glitch reactivo al beat. **TechOrbit**: Partículas que orbitan con la frecuencia de la música.                                     | [ ] unit, [ ] seo  |   [ ]    |
|  [x]   | Interactive Career Timeline (DnB Wave style).         |                   [ ] 7.1, [ ] 22.2                   |      public      | **WaveTimeline**: Hitos representados como picos de frecuencia. El gradiente de la línea cambia con el volumen.                                             | [ ] unit, [ ] a11y |   [ ]    |
|  [x]   | Full-Featured Music System (Favorites & Visualizer).  |                  [ ] 12.1, [ ] 20.1                   |      public      | **NeuroPlayer**: Reproductor avanzado con sistema de **Favoritos**. **MonstercatVisualizer**: Barras de frecuencia clásicas que reaccionan al audio actual. | [ ] units          |   [ ]    |
|  [x]   | Floating Chat (Senior AI Assistant).                  |                  [ ] 16.1, [ ] 18.1                   |      public      | **FloatingActionChat**: Botón en esquina inferior derecha. Modal animado con IA context-aware.                                                              | [ ] unit           |   [ ]    |

---

## Tech Stack & Skills (/skills) (Role:public) (rules-business.md #10, #11) (Imagenes: design/web-skills.png)

**Layout:** Inherits from #layout-public.

| Status | Tarea/Feature               | id o ids de enpoints de rules-endpoints que se usaron | Roles o Permisos | Componentes                                                                                                                                         | Testing            | Testeado |
| :----: | :-------------------------- | :---------------------------------------------------: | :--------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------- | :------: |
|  [x]   | Grid de Tecnologías Senior. |                       [ ] 10.1                        |      public      | **SkillBentoGrid**: Categorías (Frontend: React/Next, Backend: Node/Nest/Go, DevOps: Docker/K8s/CI-CD, Mobile: React Native, AI: Ollama/Langchain). | [ ] unit, [ ] perf |   [ ]    |

---

## Legal Pages (/privacy, /terms) (Role:public) (rules-business.md #1) (Imagenes: N/A)

**Layout:** Inherits from #layout-public.

| Status | Tarea/Feature    | id o ids de enpoints de rules-endpoints que se usaron | Roles o Permisos | Componentes                                                    | Testing  | Testeado |
| :----: | :--------------- | :---------------------------------------------------: | :--------------: | :------------------------------------------------------------- | :------- | :------: |
|  [ ]   | Privacy Policy   |                        [ ] 1.1                        |      public      | **LegalDoc**: Renderizado de políticas con tipografía legible. | [ ] unit |   [ ]    |
|  [ ]   | Terms of Service |                        [ ] 1.1                        |      public      | **LegalDoc**: Renderizado de términos con tipografía legible.  | [ ] unit |   [ ]    |

---

## Blog & Project Details (/blog/:slug, /projects/:slug) (Role:public) (rules-business.md #6, #9, #19, #20) (Imagenes: design/web-blog-[slug].png)

**Layout:** Inherits from #layout-public.

| Status | Tarea/Feature                       | id o ids de enpoints de rules-endpoints que se usaron | Roles o Permisos | Componentes                                                                                           | Testing           | Testeado |
| :----: | :---------------------------------- | :---------------------------------------------------: | :--------------: | :---------------------------------------------------------------------------------------------------- | :---------------- | :------: |
|  [x]   | Content Article with Neumorphic UI. |              [ ] 6.2, [ ] 9.2, [ ] 19.2               |      public      | **FuturisticMDX**: Renderer de Markdown con syntax highlighting tipo VSCode. **FloatingReactionBar**. | [ ] unit, [ ] seo |   [ ]    |
|  [x]   | Community Interaction.              |                  [ ] 19.1, [ ] 20.1                   |      public      | **SocialHub**: Comentarios con hilos, reacciones animadas (Lottie).                                   | [ ] e2e           |   [ ]    |

---

## Dashboard: Core Management (/dashboard) (Role:admin) (rules-business.md #1, #21, #23) (Imagenes: design/dashboard-layout.png, design/dashboard-header.png, design/dashboard-analitycs.png)

**Layout:** Inherits from #layout-dashboard.

| Status | Tarea/Feature         | id o ids de enpoints de rules-endpoints que se usaron | Roles o Permisos | Componentes                                                                                                                                  | Testing           | Testeado |
| :----: | :-------------------- | :---------------------------------------------------: | :--------------: | :------------------------------------------------------------------------------------------------------------------------------------------- | :---------------- | :------: |
|  [x]   | Admin Control Center. |    [ ] 2.1, [ ] 21.1, [ ] 21.2, [ ] 21.3, [ ] 23.1    |    role:ADMIN    | **AnalyticsGrid**: Gráficos de pulso (Recruiter trends) con RadarChart. **NotificationCenter**: Feed de acciones en tiempo real con polling. | [ ] unit, [ ] e2e |   [ ]    |

---

## Admin: Content Manager (/dashboard/content) (Role:admin) (rules-business.md #6, #8, #9) (Imagenes: design/dashboard-content.png)

**Layout:** Inherits from #layout-dashboard.

| Status | Tarea/Feature                | id o ids de enpoints de rules-endpoints que se usaron | Roles o Permisos | Componentes                                                                                                                                               | Testing           | Testeado |
| :----: | :--------------------------- | :---------------------------------------------------: | :--------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------- | :------: |
|  [x]   | Gestión de Proyectos (CRUD). |               [ ] 6.3, [ ] 6.4, [ ] 6.5               |    role:ADMIN    | **ProjectTable**: Tabla con buscador, filtros por categoría y switch de visibilidad. **ProjectForm**: Modal con editor Markdown y dropzone para imágenes. | [ ] unit, [ ] e2e |   [ ]    |
|  [x]   | Sincronización GitHub.       |                        [ ] 6.6                        |    role:ADMIN    | **SyncButton**: Botón con feedback de carga y websockets para updates en tiempo real de estrellas.                                                        | [ ] e2e           |   [ ]    |
|  [x]   | Blog Engine (Posts & Cats).  |               [ ] 8.2, [ ] 9.3, [ ] 9.4               |    role:ADMIN    | **PostBentoGrid**: Vista previa de artículos. **CategoryManager**: Mini-CRUD de categorías en columna lateral.                                            | [ ] unit          |   [ ]    |

---

## Admin: RAG Workspace (/dashboard/ai) (Role:admin) (rules-business.md #13, #15, #16, #23) (Imagenes: design/dashboard-ai.png)

**Layout:** Inherits from #layout-dashboard.

| Status | Tarea/Feature              | id o ids de enpoints de rules-endpoints que se usaron | Roles o Permisos | Componentes                                                                                                                | Testing           | Testeado |
| :----: | :------------------------- | :---------------------------------------------------: | :--------------: | :------------------------------------------------------------------------------------------------------------------------- | :---------------- | :------: |
|  [x]   | Document Training (RAG).   |                  [ ] 13.1, [ ] 13.3                   |    role:ADMIN    | **DocumentDropzone**: Subida de PDFs con barra de progreso circular. **IndexStatus**: Badge animado (PENDING -> READY).    | [ ] unit, [ ] e2e |   [ ]    |
|  [x]   | UI AI Model Configuration. |                  [ ] 15.1, [ ] 15.2                   |    role:ADMIN    | **ModelConfigForm**: Sliders para Temp, ChunkSize, Overlap. Dropdown de modelos (GPT-4, Claude).                           | [ ] unit          |   [ ]    |
|  [x]   | AI Insight Generator.      |                  [ ] 23.1, [ ] 23.2                   |    role:ADMIN    | **InsightsRadar**: Gráfico de araña con temas detectados por la IA en conversaciones.                                      | [ ] e2e           |   [ ]    |
|  [x]   | Chat History & Sessions.   |                  [ ] 16.2, [ ] 18.2                   |    role:ADMIN    | **ConversationList**: Sidebar con lista de chats anónimos. **ChatViewer**: Visor de mensajes con visualización de fuentes. | [ ] unit, [ ] e2e |   [ ]    |

---

## Admin: HR & Social Proof (/dashboard/hr) (Role:admin) (rules-business.md #5, #7, #22) (Imagenes: design/dashboard-hr.png, design/web-experience.png)

**Layout:** Inherits from #layout-dashboard.

| Status | Tarea/Feature                   | id o ids de enpoints de rules-endpoints que se usaron | Roles o Permisos | Componentes                                                                                                                  | Testing           | Testeado |
| :----: | :------------------------------ | :---------------------------------------------------: | :--------------: | :--------------------------------------------------------------------------------------------------------------------------- | :---------------- | :------: |
|  [x]   | Testimonials Manager (CRUD).    |               [ ] 5.2, [ ] 5.3, [ ] 5.4               |    role:ADMIN    | **TestimonialTable**: Lista con avatar, autor y empresa. **TestimonialForm**: Modal con editor de contenido y upload avatar. | [ ] unit, [ ] e2e |   [ ]    |
|  [x]   | Work Experience Manager (CRUD). |               [ ] 7.2, [ ] 7.3, [ ] 7.4               |    role:ADMIN    | **ExperienceTimeline**: Vista cronológica editable. **ExperienceForm**: Modal con fechas, descripción y toggle "is_current". | [ ] unit, [ ] e2e |   [ ]    |
|  [x]   | Work Milestones Manager (CRUD). |             [ ] 22.1, [ ] 22.3, [ ] 22.4              |    role:ADMIN    | **MilestoneList**: Hitos agrupados por experiencia. **MilestoneForm**: Modal con icono picker y fecha.                       | [ ] unit          |   [ ]    |

---

## Admin: Communication (/dashboard/inbox) (Role:admin) (rules-business.md #4) (Imagenes: design/dashboard-inbox.png)

**Layout:** Inherits from #layout-dashboard.

| Status | Tarea/Feature          | id o ids de enpoints de rules-endpoints que se usaron | Roles o Permisos | Componentes                                                                                                                  | Testing           | Testeado |
| :----: | :--------------------- | :---------------------------------------------------: | :--------------: | :--------------------------------------------------------------------------------------------------------------------------- | :---------------- | :------: |
|  [x]   | Contact Messages Inbox |                   [ ] 4.2, [ ] 4.3                    |    role:ADMIN    | **MessageList**: Inbox con indicador de no leídos. **MessageDetail**: Vista de mensaje con botón "Mark as Read" y respuesta. | [ ] unit, [ ] e2e |   [ ]    |

---

## Admin: Media & Tech (/dashboard/shared) (Role:admin) (rules-business.md #10, #12) (Imagenes: design/dashboard-shared.png)

**Layout:** Inherits from #layout-dashboard.

| Status | Tarea/Feature             | id o ids de enpoints de rules-endpoints que se usaron | Roles o Permisos | Componentes                                                                                                                   | Testing  | Testeado |
| :----: | :------------------------ | :---------------------------------------------------: | :--------------: | :---------------------------------------------------------------------------------------------------------------------------- | :------- | :------: |
|  [x]   | Music Library Management. |             [ ] 12.2, [ ] 12.3, [ ] 12.4              |    role:ADMIN    | **AudioList**: Lista con drag-and-drop para reordenar pistas. **WaveEditor**: Visualización simple de forma de onda al subir. | [ ] unit |   [ ]    |
|  [x]   | Tech Stack Catalog.       |             [ ] 10.2, [ ] 10.3, [ ] 10.4              |    role:ADMIN    | **TechIconGrid**: Selector de iconos con preview. Categorización por tipo (Frontend/Backend).                                 | [ ] unit |   [ ]    |

---

## Admin: Settings (/dashboard/settings) (Role:admin) (rules-business.md #1, #2) (Imagenes: design/dashboard-settings.png)

**Layout:** Inherits from #layout-dashboard.

| Status | Tarea/Feature           | id o ids de enpoints de rules-endpoints que se usaron | Roles o Permisos | Componentes                                                                                       | Testing  | Testeado |
| :----: | :---------------------- | :---------------------------------------------------: | :--------------: | :------------------------------------------------------------------------------------------------ | :------- | :------: |
|  [x]   | Interface & Appearance. |                        [ ] 1.2                        |    role:ADMIN    | **ThemeCustomizer**: Color pickers para primario/secundario. Preview en tiempo real del branding. | [ ] e2e  |   [ ]    |
|  [x]   | Admin Profile.          |                        [ ] 2.2                        |    role:ADMIN    | **AdminCard**: Cambio de avatar, username y password con validación de fuerza.                    | [ ] unit |   [ ]    |

---

## ✅ Verificación de Páginas (OBLIGATORIO)

### Landing & Identity

- [ ] rules-pages.md, [ ] encabezado, [ ] layout, [ ] endpoints, [ ] roles, [ ] componentes (Futuristic focus), [ ] testing checklist, [ ] fidelidad rules-business

### Admin Management

- [ ] rules-pages.md, [ ] encabezado, [ ] layout, [ ] endpoints, [ ] roles, [ ] componentes (Ultra detailed), [ ] testing checklist, [ ] fidelidad rules-business

---

## ✅ Verificación FINAL (Senior Design 10/10)

- [x] **Aesthetics**: Diseño futurista/artístico integrado con enfoque en música electrónica.
- [x] **Tech Stack**: Incluye Figma, Socket.io, Mobile y DevOps en la visualización.
- [ ] `ProjectDetails`: Specialized data visualization page.
- [x] `BlogReader`: Reading environment with progress and time.
- [x] **Music Player**: Reproductor flotante persistente documentado.
- [x] **Floating Chat**: Botón de chat posicionado y funcional según requerimientos.
- [x] **Identity**: El diseño proyecta una imagen de Senior Developer.
- [x] **Admin Coverage**: Todas las entidades administrativas tienen su página de gestión documentada.
- [ ] **Fidelidad Total**: 100% alineado con `rules-class.md`, `rules-business.md` y `rules-endpoints.md`.

```

```
