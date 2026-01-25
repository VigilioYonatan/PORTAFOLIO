# Rules class
> Este archivo no debe ser modificado por ti.
> Directrices para diseño de esquemas de base de datos.  
> Compatible con **PostgreSQL**
> Recuerda que docs/rules/_\_.md son el corazón de todo el proyecto, de ahi sacaras toda la información para realizar todo estar 100% fiel a docs/rules/_\_.md
> Recuerda usar buenas practicas de relaciones como MANY to many, many to one, one to many, one to one y sobre todo POLYMORPHIC usar %% Reactable -> Community.social_reaction

            %% Commentable -> Community.social_comment
            %% Reportable -> Community.content_report

> si usa jsonb pon lo que habra ahi un objeto array ejemplo +settings_ai: jsonb -- Keys (boolean): is_biometrics, is_ai_grading, is_ai_proctoring, is_ai_tutors, is_ai_summaries, is_ai_moderation, is_learning_paths, is_blockchain

> si usa enum pon lo que habra ahi un objeto array ejemplo +plan: enum -- 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE'

> Que sea compatible mermaid markdown

## si es un booleano que empieze con is\_

## 📝 Nomenclatura

| Regla               | Ejemplo                               |
| ------------------- | ------------------------------------- |
| Usar `snake_case`   | `social_media`, `open_source_project` |
| No usar `camelCase` | ~~`socialMedia`~~, ~~`userId`~~       |
| Tablas en singular  | `project`, `skill`                    |
| FK con sufijo `_id` | `portfolio_id`, `skill_id`            |

---

## 🗂️ Orden de Campos

### 1. PK primero

```sql
+id: int [PK]
```

### 2. Campos principales (más importantes)

```sql
+title: varchar[200](UQ)
+description: text
+name: varchar[100]
```

UQ = Unique
UQC = Unique Compuesto

### 3. Agrupar por tipo como en el siguiente ejemplo

**Textos juntos:**

```sql
+company: varchar[100]
+role: varchar[100]
+location: varchar[100]
+dni: varchar[100]
+ruc: varchar[100]
+telephone: varchar[100]
+email: varchar[100]
No poner texto cosas que se suman por ejemplos numeros ni decimales
```

**URLs juntas:**

```sql
+demo_url: varchar[500]
+oficial_url: varchar[500]
+repo_url: varchar[500]
```

**Números juntos:**

```sql
+stars: int
+forks: int
+level: int
No poner int cosas que SON textos como ruc, dni, etc
```

**Decimales:**

```sql
+igv: decimal
+price: decimal
+discount: decimal
```

**Booleans juntos:**

```sql
+is_public: boolean
+preferred: boolean
```

**Fechas juntas (al final antes de FK):**

```sql
+start_date: date
+end_date: date
+created_at: timestamp


Si la class tiene created_at tambien tendra updated_at OBLIGATORIO
```

### 4. FK al final

```sql
+portfolio_id: int [FK]
```

---

## 📊 Tipos de Datos, NO PONER resto, solo es un GUIA

> **Nota:** Usar corchetes `text[X]` en lugar de paréntesis para evitar que Mermaid cree líneas extra.

| Tipo        | Uso                                      | Longitud sugerida |
| ----------- | ---------------------------------------- | ----------------- |
| `int`       | IDs, contadores                          | -                 |
| `text[50]`  | Nombres cortos, iconos                   | 50                |
| `text[100]` | Nombres, roles, empresas                 | 100               |
| `text[200]` | Títulos, valores                         | 200               |
| `text[500]` | URLs, thumbnails                         | 500               |
| `text`      | Descripciones largas                     | -                 |
| `enum`      | Tipos de datos limitados y en mayusculas | -                 |
| `jsonb`     | Arrays flexibles                         | -                 |
| `boolean`   | Flags                                    | -                 |
| `date`      | Fechas sin hora                          | -                 |
| `timestamp` | Fechas con hora                          | -                 |

---

## ❓ Nullable

### Notación

```
+campo: tipo?     -- Nullable (puede ser NULL)
+campo: tipo      -- NOT NULL (requerido)
```

### Ejemplos de campos nullable

```
+demo_url: varchar[500]?      -- Proyecto puede no tener demo
+oficial_url: varchar[500]?   -- Sitio oficial es nullable
+end_date: date?              -- Trabajo actual no tiene fecha fin
+thumbnail: varchar[500]?     -- Imagen es nullable
+location: varchar[100]?      -- Ubicación puede no especificarse
+achievements: jsonb?         -- Logros son nullable
```

### Campos que NUNCA son nullable

- `id` (PK)
- `created_at`
- `portfolio_id` (FK)
- Campos de identificación (`title`, `name`, `company`)

## 🔗 Relaciones

| Tipo     | Cuándo usar                                  |
| -------- | -------------------------------------------- |
| **1:N**  | `portfolio` → `projects`                     |
| **N:M**  | `project` ↔ `skill` (tabla pivote)           |
| **JSON** | Datos flexibles sin queries (`achievements`) |

### Tablas Pivote

```sql
class project_skill {
    +project_id: int [FK]
    +skill_id: int [FK]
}
```

---

## ✅ Cuándo usar JSON

**Sí usar:**

- Datos variables/flexibles
- No necesitas indexar/buscar
- Arrays simples de strings
- Metadatos de archivos

**No usar:**

- Datos que necesitas reutilizar (ej: `skills`)
- Campos con FK
- Datos que requieren validación estricta

---

## 📁 Estructura de Archivos (JSONB)

Para uploads de archivos (imágenes, documentos), usar JSONB con esta estructura:

### Esquema TypeScript

```typescript
interface FileUpload {
    key: string;           // AWS S3 key
    name: string;          // Nombre original del archivo
    size: number;          // Peso en bytes
    mimetype: string;      // Tipo MIME (image/png, application/pdf)
    dimension?: number;    // Dimensión (para imágenes, ej: 1920)
    created_at: Date;      // Fecha de subida del archivo
}

// En la entidad
images: FileUpload[];      // Array de archivos


Imporante las propiedades de FileUpload no deben estar dentro de un objeto o array

// Correcto
images: FileUpload[];

// Incorrecto
files: {
    images: FileUpload[];
};
```

````

### Cuándo usar JSONB vs Tabla para archivos

| Usar JSONB                          | Usar Tabla                                |
| ----------------------------------- | ----------------------------------------- |
| Archivos siempre van con su entidad | Reutilizar archivo en múltiples entidades |
| No necesitas buscar por archivo     | Buscar archivos por nombre/tipo           |
| Estructura simple                   | Historial de versiones                    |
| Portfolio, blogs                    | Sistemas de archivos complejos            |

---

## 📦 Enums

### Definición PostgreSQL

```sql
CREATE TYPE skill_category AS ENUM (
    'FRONTEND',
    'BACKEND',
    'DATABASE',
    'DEVOPS'
);
````

### Valores en minúsculas

```sql
-- ❌ incorrecto
'in_progress', 'completed'

-- ✅ correcto
'IN_PROGRESS', 'Completed'
```

---

## 🎨 Mermaid Best Practices

### 1. Dirección del diagrama

```
%% TB = Top to Bottom (jerarquías)
%% LR = Left to Right (flujos)
classDiagram
    direction TB
```

### 2. Comentarios para secciones

```
%% ============================================
%% CORE ENTITIES
%% ============================================
```

### 3. Nomenclatura de Relaciones

Usar nombres descriptivos para las relaciones:

| Tipo         | Sintaxis Mermaid                     | Descripción                           |
| ------------ | ------------------------------------ | ------------------------------------- |
| **1-N**      | `entity_a "1" -- "*" entity_b : 1-N` | Uno a muchos                          |
| **N-M**      | `entity_a "*" -- "*" entity_b : N-M` | Muchos a muchos (tabla pivote)        |
| **1-1**      | `entity_a "1" -- "1" entity_b : 1-1` | Uno a uno                             |
| **SelfRef**  | `entity "1" -- "*" entity : SelfRef` | Auto-referencia (FK → PK misma tabla) |
| **1-N-Poly** | `entity "1" -- "*" poly : 1-N-Poly`  | Polimórfico uno a muchos              |
| **N-M-Poly** | `entity "*" -- "*" poly : N-M-Poly`  | Polimórfico muchos a muchos           |

### 4. Ejemplos de Relaciones

```
%% ✅ Nomenclatura compatible con Mermaid (usar guiones, no dos puntos)
category "1" -- "*" product : 1-N
category "1" -- "*" category : SelfRef
student "*" -- "*" course : N-M
user "1" -- "1" profile : 1-1

%% Polimórficos
post "1" -- "*" comment : 1-N-Poly
review "1" -- "*" comment : 1-N-Poly

%% ❌ Evitar (sin descripción o con caracteres especiales)
portfolio --> project
category "1" --> "*" product : 1:N  %% El ":" causa errores
```

### 5. Estereotipos para enums

```
class skill_category {
    <<enumeration>>
    frontend
    backend
}
```

### 6. Dividir diagramas grandes

- Un diagrama por módulo/namespace
- Enums separados del modelo principal
- ER diagram para relaciones

### 7. Tema oscuro

```
%%{init: {'theme': 'dark'}}%%
classDiagram
    class User
```

### 8. Notas explicativas

```
classDiagram
    class User
    note for User "Tabla principal de usuarios"
```

### 9. Links clickeables (HTML export)

```
classDiagram
    class User
    click User href "https://docs.com/user"
```

### 10. Namespaces (Mermaid 10+)

```
classDiagram
    namespace Documents {
        class Skill
        class Project
    }
    namespace Communication {
        class Contact
    }
```

### Verificación de Clases (OBLIGATORIO)

Al final de rules-class.md debes agregar una sección llamada "Verificación de Clases" donde listes TODAS las clases definidas.
Cada clase debe tener una sola línea con checkboxes marcados [x] (o dejados en blanco [ ] si falta) y [?] cuando no era necesario verificando lo siguiente:

#### Formato Requerido por Clase:

```markdown
#### nombre_de_clase

- [x] rules-class.md, [x] nomenclatura, [x] orden de campos, [x] enums y tipos_datos, [x] json y nullable, [x] nomeclatura de relaciones
```

Esto sirve para asegurar que no olvidaste ninguna regla de nomenclatura, orden, nullabilidad o relaciones.

---

# 🔗 Rules Endpoints

> **Archivo:** [`docs/rules/rules-endpoints.md`](../rules/rules-endpoints.md)
>
> Este archivo define todos los endpoints, debe contener una tabla con la columna `Status` (checkbox) y `Testeado` (checkbox) para realizar tracking de pruebas.
> Al principio de todo darás un resumen de lo que hace el sistema, claro usando para separar "-" información

### Plantilla de Tabla de Endpoints

Esto es un ejemplo de como debe ser la tabla de endpoints. Para cada módulo (ej. `Experience`, `Projects`), crear una tabla con la siguiente estructura: el id es único para cada endpoint. el primero 1.1 es el id del rules-business.md y el otro ya es el subindice del endpoint, recuerda que esta sincorinizado con rules-business.md.

> **Nota:** Cuando se requiera paginación, agregar siempre los query params `offset` y `limit` en el endpoint o descripción.

---

# 💼 Rules Business

> **Archivo:** [`docs/rules/rules-business.md`](../rules/rules-business.md)
>
> Este archivo define las reglas de negocio, permisos y validaciones, claro si hay roles o permisos agrega tambien quien hara tal cosa, si es publico o privado. SI hay auntenticacion tambien

### Formato de Reglas

1.  **Agrupar por Entidad**: Crear una sección `##` por cada entidad del sistema.
2.  **Lista de Acciones**: Definir claramente qué se puede hacer con la entidad.
3.  **Restricciones**: Usar "blockquotes" o notas para reglas críticas (ej: campos únicos, validaciones especiales).
4.  **Si es paginación:** Agregar offset y limit explícitamente.
5.  **poner a que class o clasess pertenece** ## 1. Product (rules-class.md/product) si perteneces varias clases pones varias ponlo un id numeral al principuio para diferenciar

**Ejemplo de estructura:**
Esto es solo un ejemplo, debes crear una tabla con la siguiente estructura:

```markdown
## 1. Product (rules-class.md/product)

- Crear un producto.
- Leer todos los productos (con paginación offset/limit).
- Leer un producto por ID.
- Actualizar un producto.
- Eliminar un producto.

> [!IMPORTANT]
> El SKU del producto debe ser único.
```

### Verificación de Reglas de Negocio (OBLIGATORIO)

Al final de rules-business.md debes agregar una sección llamada "Verificación de Reglas de Negocio" donde listes TODOS los módulos definidos.
Cada módulo debe tener una sola línea con checkboxes marcados [x] (o dejados en blanco [ ] si falta) y [?] cuando no era necesario verificando lo siguiente:

#### Formato Requerido por Módulo:

```markdown
### 1. nombre_del_modulo

- [x] rules-business.md, [x] roles, [x] validaciones, [x] reglas de negocio, [x] fidelidad rules-class
```

Esto sirve para asegurar que no olvidaste documentar roles, validaciones, reglas de negocio y que está sincronizado con rules-class.md.

---

# 📄 Rules Pages

> **Archivo:** [`docs/rules/rules-pages.md`](../rules/rules-pages.md)
>
> Este archivo define los requerimientos de cada página y componente del sistema.
> SOn las vistas de paginas psdt los enpoints que se usaran de rules-endpoints.md, si hay un componente que no usa ninguna api undpoint endpoint GET POST PUT DELETE poner null nomas
> Recuerda que son paginas de astro o rutas de wouter react
> claro si hay roles o permisos agrega tambien quien hara tal cosa, si es publico o privado.
> agrega dos tipos de vistas, por que hay diferentes roles o permisos y hay clientes , admin, etc. que tendrán diferentes vistas o no podrán ver ciertas cosas ya sabes, es por eso que en titulo de la pagina debes poner el rol o permiso, ejemplo: ## dashboard (/dashboard) (Role:user) (rules-business.md #1) y otra vista seria ## dashboard (/dashboard) (Role:admin) (rules-business.md #1)

### Definición de Layouts

Antes de definir las páginas, se debe agregar una sección `## Layouts` donde se definan los diseños reutilizables mediante IDs únicos (ej. `#layout-dashboard`).

**Estructura de Layout:**

1.  **Header:** Elementos del encabezado.
2.  **Aside:** Elementos del menú lateral (si existe).
3.  **Footer:** Elementos del pie de página.
4.  **Structure:** (Nullable) Estructura general (ej. Split Screen).

**Ejemplo:**

```markdown
## Layouts

### #layout-dashboard

**Header:** Search, Notifications.
**Aside:** Navigation, etc.
**Footer:** Copyright, links, etc.
```

### Formato de Requerimientos

4.  **Layout**: Especificar herencia de los layouts definidos en `rules-pages.md` (ej: `#layout-dashboard`). Si agrega elementos, especificarlos. Ejemplo `**Layout:** Inherits from #layout-dashboard. Fixed Button: Create Item`.
5.  **Tablas**: Todo requerimiento debe estar en una tabla.
6.  **Columnas**: `Status` (checkbox) `Tarea/Feature` (descripción), `endpoint` (id de lops enpoints que se usaran), `Testeado` (checkbox, si cuenta con tests).
7.  **Encabezado**: `## page_name (/ruta) (rules-business.md #ID)` donde #ID es el identificador de la regla de negocio, si hay varios #1,#2. Si agrupa rutas no usar `*`, poner las rutas separadas por coma, ejemplo `/login, /register`,etc no usar /\*.
8.  **Columnas**: `Status`, `Tarea/Feature`, `endpoint`, `Roles o Permisos` (ej: `role:admin,cliente permisos:store-user-permission`) claro si no hay permisos omitir, `Componentes` (**ULTRA DETALLADO**: Nombre en negrita + descripción completa de elementos UI: inputs, botones, estados, colores, validaciones, sub-componentes. Ej: `**LoginForm**: Input email, Input password (show/hide toggle), Checkbox "Remember me", Link "Forgot password?", Submit button con loading, Google OAuth button`), `Testing`, `Testeado`.

**Ejemplo de estructura:**

```markdown
## dashboard (/dashboard) (Role:user) (rules-business.md #1)

Recuerda que eres experto en react y nextjs y diseñador de todos los tiempos y crear paginas que se vean bien y esteticas rutas etc.
REcuerda tambien que el diseño debe ser fiel al de los componentes que se usan en el proyecto como tambien debe tener sentido no poner por poner.

**Layout:** Inherits from #layout-dashboard.

EN componentes pondrá el tipo de componente que es Card, Form, Table, Chart,button,Dropdowns,MOdal (aunque si se ve mal en algunos casos no lo uses ), etc. etc, hay miles de componentes personalizados recuerda que puede ir mas de un componente, claro si hay mas de un componente.
QUe no pierda el diseño que sean fiel el diseño de los componentes que se usan en el proyecto.
| Status | Tarea/Feature |id o ids de enpoints de class-business, son apis que se usaran en ese componente| Roles o Permisos | Componentes | Testing | Testeado |
| :----: | :-------------------------------- | :------: | :------: | :------: | :------ | :------: |
| [ ] | Mostrar resumen de estadísticas. | [ ] 1.1 | admin \| cliente permisos:view-dashboard | Card, recuerda que puede ir mas de un componente, claro si hay mas de un componente| [ ] unit, [ ] e2e, [ ] coverage, [ ] reglas de oro, [ ] TypeScript Governance, [ ] practicas senior, [ ] sweetModal,apis, [ ] tablas, [ ] paginator, [ ] imprimir informacion api, [ ] formularios y refetch(data), [ ] modals, [ ] roles, [ ] seo | [ ] |
| [ ] | Gráficos de actividad reciente. | [ ] 1.2 | admin permisos:view-analytics | Chart | [ ] unit, [ ] e2e, [ ] coverage, [ ] reglas de oro, [ ] TypeScript Governance, [ ] practicas senior, [ ] sweetModal,apis, [ ] tablas, [ ] paginator, [ ] imprimir informacion api, [ ] formularios y refetch(data), [ ] modals, [ ] roles, [ ] seo | [ ] |
| [ ] | Listado de últimos items creados. | [ ] 1.3 | admin \| cliente permisos:list-items | Table | [ ] unit, [ ] e2e, [ ] coverage, [ ] reglas de oro, [ ] TypeScript Governance, [ ] practicas senior, [ ] sweetModal,apis, [ ] tablas, [ ] paginator, [ ] imprimir informacion api, [ ] formularios y refetch(data), [ ] modals, [ ] roles, [ ] seo | [ ] |
```

### Verificación de Páginas (OBLIGATORIO)

Al final de rules-pages.md debes agregar una sección llamada "Verificación de Páginas" donde listes TODAS las páginas/secciones definidas.
Cada página debe tener una sola línea con checkboxes marcados [x] (o dejados en blanco [ ] si falta) y [?] cuando no era necesario verificando lo siguiente:

#### Formato Requerido por Página:

```markdown
### Chat

- [x] rules-pages.md, [x] encabezado, [x] layout, [x] endpoints, [x] roles, [x] componentes, [x] testing checklist, [x] fidelidad rules-business
```

Esto sirve para asegurar que no olvidaste documentar encabezados (formato `## page_name (/ruta) (rules-business.md #ID)` sin wildcards), layouts, endpoints, roles, componentes y que está sincronizado con rules-business.md y rules-endpoints.md.

---

# 🌟 Ejemplo Integral de Implementación

Al implementar una nueva funcionalidad (ej. `Coupon`), se debe documentar en los 3 archivos de la siguiente manera:

### 1. En `rules-business.md`

```markdown
## Coupon

- Crear un cupón de descuento.
- Leer todos los cupones.
- Validar un cupón por código.

> [!WARNING]
> Los cupones no pueden eliminarse si ya han sido usados en una orden.
```

### 2. En `rules-endpoints.md`

```markdown
## 🎫 Coupon, agrega tambien query o body psdt pon ? en los que son opcionales, claro no usamos opcional usamos null, que se va a necesitar para los endpoints, testing unit, e2e, coverage, convension de prompt-backend.md

Usar Pick, Omit, etc de typescript
No usar Partial y recuerda que si quieres actualizar solo unos cuantops de un schema crear otro endpoint ejemplo PUT /example/:id actualizacion normal, /example/:id/change-password, como viste no use partial, cree otro endpoint, NO USAR PARTIAL y usa Pick<>, ah verdad en rules-business o rules class una propiedad de una clase puede estar nullable, pero ya sabes que en los endpoint hay veces que es necesario sea requerido, asi que en Omit o Pick cuando algo que estaba en nullable agrega required:username es un ejemplo, SOLO para campos de las clases que estaban en nullable.
Claro poner SSE en los endpoints que se van a necesitar, claro si no hay SSE omitir, SEE eventsource se usa mucho en chatbots con IA, no es necesario websocket socket.io etc..

| id  | Status |              Método              | Endpoint              | query o body                                               | Descripción                                 |             Roles o Permisos             | Testing                         | prompt-backend.md                                                                                                                             |
| :-- | :----: | :------------------------------: | :-------------------- | :--------------------------------------------------------- | :------------------------------------------ | :--------------------------------------: | :------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 |  [ ]   |              `GET`               | `/coupons`            | limit, offset                                              | Listar cupones paginados (limit, offset)    |     role:admin permisos:list-coupons     | [ ] unit, [ ] e2e, [ ] coverage | [ ] schemas, [ ] dtos, [ ] entities, [ ] controllers & swagger, [ ] services, [ ] cache (5min TTL), [ ] seeder, [ ] buenas practicas          |
| 1.2 |  [ ]   |              `POST`              | `/coupons`            | body: `Omit<Coupon, "id" \| "created_at" \| "updated_at">` | Crear nuevo cupón.                          |     role:admin permisos:store-coupon     | [ ] unit, [ ] e2e, [ ] coverage | [ ] schemas, [ ] dtos, [ ] entities, [ ] controllers & swagger, [ ] services, [ ] cache (invalidar coupons), [ ] seeder, [ ] buenas practicas |
| 1.3 |  [ ]   |              `POST`              | `/coupons/use`        | body: `Pick<Coupon, "code">` & required:username,password  | Validar y descontar uso de cupón.           |                  public                  | [ ] unit, [ ] e2e, [ ] coverage | [ ] schemas, [ ] dtos, [ ] entities, [ ] controllers & swagger, [ ] services, [ ] cache (no cache), [ ] seeder, [ ] buenas practicas          |
| 1.4 |  [ ]   | `SOCKET.IO` o `SSE-EVENTSOURCE`, | `chat/send` (ejemplo) | body: `Pick<Message, "message" \| "to" \| "from">`         | Enviar mensaje via socket o recibir stream. | role:admin,cliente permisos:send-message | [ ] unit, [ ] e2e, [ ] coverage | [ ] schemas, [ ] dtos, [ ] entities, [ ] controllers & swagger, [ ] services, [ ] cache (no cache), [ ] seeder, [ ] buenas practicas          |

> [!IMPORTANT]
> **Política de Cache en columna `prompt-backend.md`**:
>
> - **GET (lectura)**: Usar TTL según frecuencia de cambio: `(1min TTL)`, `(5min TTL)`, `(1h TTL)`, `(24h TTL)`
> - **POST/PUT/PATCH/DELETE**: Invalidar cache relacionada: `(invalidar users)`, `(invalidar user:id)`, `(invalidar jobs)`
> - **Endpoints públicos/sensibles**: Usar `(no cache)` para auth, demo, mensajes
>
> Ejemplos:
>
> - `[ ] cache (5min TTL)` → Cache de lectura con TTL de 5 minutos
> - `[ ] cache (invalidar users)` → Invalida cache de lista de usuarios
> - `[ ] cache (invalidar user:id)` → Invalida cache de usuario específico
> - `[ ] cache (no cache)` → Sin cache (auth, SSE, tiempo real)
```

### 3. En `rules-pages.md`

```markdown
## Coupon (/dashboard/coupons) (rules-business.md #1)

// EN imagen habra la ruta de la imagen del diseño posdt el nombre dewbe ser unico

**Layout:** Inherits from #layout-dashboard. Fixed Button: Create Coupon.

| Status | Tarea/Feature                                        | id o ids de enpoints de rules-endpoints que se usaron |       Roles o Permisos        | Componentes | Testing                                                                                                                                                                                                                                            | Testeado |
| :----: | :--------------------------------------------------- | :---------------------------------------------------: | :---------------------------: | :---------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
|  [ ]   | Tabla CRUD de cupones.                               |                   [ ] 1.1, [ ] 1.3                    | admin permisos:manage-coupons |    Table    | [ ] unit, [ ] e2e, [ ] coverage, [ ] reglas de oro, [ ] TypeScript Governance, [ ] practicas senior, [ ] sweetModal,apis, [ ] tablas, [ ] paginator, [ ] imprimir informacion api, [ ] formularios y refetch(data), [ ] modals, [ ] roles, [ ] seo | [ ]      |
|  [ ]   | Columna de estado (Activo/Expirado).                 |                        [ ] 1.2                        |  admin permisos:view-coupons  |   Column    | [ ] unit, [ ] e2e, [ ] coverage, [ ] reglas de oro, [ ] TypeScript Governance, [ ] practicas senior, [ ] sweetModal,apis, [ ] tablas, [ ] paginator, [ ] imprimir informacion api, [ ] formularios y refetch(data), [ ] modals, [ ] roles, [ ] seo | [ ]      |
|  [ ]   | Modal de creación con Generador de Código aleatorio. |                        [ ] 1.3                        |  admin permisos:store-coupon  |    Modal    | [ ] unit, [ ] e2e, [ ] coverage, [ ] reglas de oro, [ ] TypeScript Governance, [ ] practicas senior, [ ] sweetModal,apis, [ ] tablas, [ ] paginator, [ ] imprimir informacion api, [ ] formularios y refetch(data), [ ] modals, [ ] roles, [ ] seo | [ ]      |
```

---
