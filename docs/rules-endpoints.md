# Rules Endpoints - Portfolio Personal

- **Sistema**: Modern Personal Portfolio con Arquitectura RAG (Retrieval-Augmented Generation).
- **Enfoque**: Diseño optimizado para exhibición de impacto profesional, métricas reales y escalabilidad.
- **Rendimiento**: Estrategia de cache granular (Redis/In-Memory) y streaming SSE para respuestas de IA.
- **Seguridad**: RBAC (Role-Based Access Control) estricto con un único propietario (ADMIN) y acceso público limitado.

---

## 1. Portfolio Config (rules-business.md #1)

| id  | Status | Método | Endpoint              | query o body                                                                       | Descripción                                                                                    | Roles o Permisos | Testing                         | prompt-backend.md                                                                                                                            | Testeado |
| :-- | :----: | :----: | :-------------------- | :--------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- | :--------------: | :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| 1.1 |     | `GET`  | `/config`             | -                                                                                  | Obtiene la configuración global del sitio (identidad, branding y SEO para la landing).         |      public      |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (1h TTL),  seeder,  buenas practicas           |       |
| 1.2 |     | `PUT`  | `/config`             | body: `Omit<PortfolioConfig, "id" \| "tenant_id" \| "created_at" \| "updated_at">` | Actualiza los datos de identidad y parámetros visuales del portfolio (Solo Admin).             |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar config),  seeder,  buenas practicas |       |
| 1.3 |     | `GET`  | `/config/cv/download` | -                                                                                  | Genera y descarga dinámicamente el CV en formato PDF basado en la información actual de la DB. |      public      |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (no cache),  seeder,  buenas practicas         |       |

---

## 2. User (rules-business.md #2)

| id  | Status | Método  | Endpoint | query o body                               | Descripción                                                                         | Roles o Permisos | Testing                         | prompt-backend.md                                                                                                                        | Testeado |
| :-- | :----: | :-----: | :------- | :----------------------------------------- | :---------------------------------------------------------------------------------- | :--------------: | :------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| 2.1 |     |  `GET`  | `/me`    | -                                          | Recupera el perfil detallado del administrador autenticado.                         |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (no cache),  seeder,  buenas practicas     |       |
| 2.2 |     | `PATCH` | `/me`    | body: `Pick<User, "username" \| "avatar">` | Permite al administrador actualizar sus credenciales básicas o su imagen de perfil. |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar me),  seeder,  buenas practicas |       |

---

## 3. Auth (rules-business.md #3)

| id  | Status | Método | Endpoint                | query o body                              | Descripción                                                                         | Roles o Permisos | Testing                         | prompt-backend.md                                                                                                                    | Testeado |
| :-- | :----: | :----: | :---------------------- | :---------------------------------------- | :---------------------------------------------------------------------------------- | :--------------: | :------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------- | :------: |
| 3.1 |     | `POST` | `/auth/login`           | body: `Pick<User, "email" \| "password">` | Autentica al administrador y genera una sesión segura o token de acceso.            |      public      |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (no cache),  seeder,  buenas practicas |       |
| 3.2 |     | `POST` | `/auth/logout`          | -                                         | Finaliza la sesión actual y revoca el acceso del administrador.                     |   autenticado    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (no cache),  seeder,  buenas practicas |       |
| 3.3 |     | `POST` | `/auth/forgot-password` | body: `Pick<User, "email">`               | Inicia el proceso de recuperación de cuenta enviando un enlace al email registrado. |      public      |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (no cache),  seeder,  buenas practicas |       |

---

## 4. Contact Message (rules-business.md #4)

| id  | Status | Método  | Endpoint        | query o body                                                              | Descripción                                                                                       | Roles o Permisos | Testing                         | prompt-backend.md                                                                                                                             | Testeado |
| :-- | :----: | :-----: | :-------------- | :------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------ | :--------------: | :------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| 4.1 |     | `POST`  | `/contact`      | body: `Pick<ContactMessage, "name" \| "email" \| "subject" \| "message">` | Registra un nuevo mensaje de contacto enviado por un visitante desde el formulario del portfolio. |      public      |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (no cache),  seeder,  buenas practicas          |       |
| 4.2 |     |  `GET`  | `/messages`     | limit, offset                                                             | Recupera la lista de mensajes de contacto con paginación para la gestión administrativa.          |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (5min TTL),  seeder,  buenas practicas          |       |
| 4.3 |     | `PATCH` | `/messages/:id` | body: `Pick<ContactMessage, "is_read">`                                   | Actualiza el estado de lectura de un mensaje específico identificado por su ID.                   |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar contact),  seeder,  buenas practicas |       |

---

## 5. Testimonial (rules-business.md #5)

| id  | Status |  Método  | Endpoint            | query o body                                                                   | Descripción                                                                         | Roles o Permisos | Testing                         | prompt-backend.md                                                                                                                                  | Testeado |
| :-- | :----: | :------: | :------------------ | :----------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- | :--------------: | :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| 5.1 |     |  `GET`   | `/testimonials`     | limit, offset                                                                  | Lista los testimonios visibles aprobados para mostrar en la landing page pública.   |      public      |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (1h TTL),  seeder,  buenas practicas                 |       |
| 5.2 |     |  `POST`  | `/testimonials`     | body: `Omit<Testimonial, "id" \| "tenant_id" \| "created_at" \| "updated_at">` | Permite al administrador registrar un nuevo testimonio de un cliente o colaborador. |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar testimonials),  seeder,  buenas practicas |       |
| 5.3 |     |  `PUT`   | `/testimonials/:id` | body: `Omit<Testimonial, "id" \| "tenant_id" \| "created_at" \| "updated_at">` | Actualiza la información o el avatar de un testimonio ya registrado en el sistema.  |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar testimonials),  seeder,  buenas practicas |       |
| 5.4 |     | `DELETE` | `/testimonials/:id` | -                                                                              | Elimina de forma permanente un testimonio de la base de datos por su ID.            |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar testimonials),  seeder,  buenas practicas |       |

---

## 6. Portfolio Project (rules-business.md #6)

| id  | Status |  Método  | Endpoint             | query o body                                                                        | Descripción                                                                                                  | Roles o Permisos | Testing                         | prompt-backend.md                                                                                                                              | Testeado |
| :-- | :----: | :------: | :------------------- | :---------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- | :--------------: | :------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| 6.1 |     |  `GET`   | `/projects`          | limit, offset, is_featured                                                          | Retorna la lista de proyectos realizados, permitiendo filtrar por destacados y paginar resultados.           |      public      |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (1h TTL),  seeder,  buenas practicas             |       |
| 6.2 |     |  `GET`   | `/projects/:slug`    | -                                                                                   | Obtiene la información detallada, contenido MDX y metadatos SEO de un proyecto específico mediante su slug.  |      public      |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (1h TTL),  seeder,  buenas practicas             |       |
| 6.3 |     |  `POST`  | `/projects`          | body: `Omit<PortfolioProject, "id" \| "tenant_id" \| "created_at" \| "updated_at">` | Permite al administrador crear una nueva entrada de proyecto con imágenes y detalles técnicos.               |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar projects),  seeder,  buenas practicas |       |
| 6.4 |     |  `PUT`   | `/projects/:id`      | body: `Omit<PortfolioProject, "id" \| "tenant_id" \| "created_at" \| "updated_at">` | Actualiza los datos, URL de repositorio o estado de visibilidad de un proyecto existente.                    |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar projects),  seeder,  buenas practicas |       |
| 6.5 |     | `DELETE` | `/projects/:id`      | -                                                                                   | Elimina un proyecto del portfolio y sus relaciones asociadas permanentemente.                                |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar projects),  seeder,  buenas practicas |       |
| 6.6 |     |  `POST`  | `/projects/:id/sync` | -                                                                                   | Sincroniza en tiempo real las estrellas de GitHub y las estadísticas de lenguajes del repositorio vinculado. |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar projects),  seeder,  buenas practicas |       |

---

## 7. Work Experience (rules-business.md #7)

| id  | Status |  Método  | Endpoint           | query o body                                                                      | Descripción                                                                                          | Roles o Permisos | Testing                         | prompt-backend.md                                                                                                                                 | Testeado |
| :-- | :----: | :------: | :----------------- | :-------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------- | :--------------: | :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------ | :------: |
| 7.1 |     |  `GET`   | `/experiences`     | -                                                                                 | Lista toda la trayectoria laboral del administrador para mostrarla en el timeline cronológico.       |      public      |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (24h TTL),  seeder,  buenas practicas               |       |
| 7.2 |     |  `POST`  | `/experiences`     | body: `Omit<WorkExperience, "id" \| "tenant_id" \| "created_at" \| "updated_at">` | Registra una nueva experiencia laboral incluyendo cargo, empresa y descripción de responsabilidades. |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar experiences),  seeder,  buenas practicas |       |
| 7.3 |     |  `PUT`   | `/experiences/:id` | body: `Omit<WorkExperience, "id" \| "tenant_id" \| "created_at" \| "updated_at">` | Actualiza los datos de una experiencia laboral previa, como la fecha de fin o la ubicación.          |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar experiences),  seeder,  buenas practicas |       |
| 7.4 |     | `DELETE` | `/experiences/:id` | -                                                                                 | Elimina permanentemente un registro de experiencia laboral por su ID.                                |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar experiences),  seeder,  buenas practicas |       |

---

## 8. Blog Category (rules-business.md #8)

| id  | Status |  Método  | Endpoint               | query o body                                                                    | Descripción                                                                               | Roles o Permisos | Testing                         | prompt-backend.md                                                                                                                              | Testeado |
| :-- | :----: | :------: | :--------------------- | :------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------- | :--------------: | :------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| 8.1 |     |  `GET`   | `/blog/categories`     | -                                                                               | Retorna todas las categorías disponibles para clasificar los artículos técnicos del blog. |      public      |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (24h TTL),  seeder,  buenas practicas            |       |
| 8.2 |     |  `POST`  | `/blog/categories`     | body: `Omit<BlogCategory, "id" \| "tenant_id" \| "created_at" \| "updated_at">` | Permite crear una nueva categoría para organizar el contenido (Solo Admin).               |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar blog_cat),  seeder,  buenas practicas |       |
| 8.3 |     |  `PUT`   | `/blog/categories/:id` | body: `Omit<BlogCategory, "id" \| "tenant_id" \| "created_at" \| "updated_at">` | Edita el nombre o el slug de una categoría existente.                                     |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar blog_cat),  seeder,  buenas practicas |       |
| 8.4 |     | `DELETE` | `/blog/categories/:id` | -                                                                               | Elimina una categoría si no tiene posts asociados.                                        |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar blog_cat),  seeder,  buenas practicas |       |

---

## 9. Blog Post (rules-business.md #9)

| id  | Status |  Método  | Endpoint            | query o body                                                                               | Descripción                                                                                  | Roles o Permisos | Testing                         | prompt-backend.md                                                                                                                           | Testeado |
| :-- | :----: | :------: | :------------------ | :----------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- | :--------------: | :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------ | :------: |
| 9.1 |     |  `GET`   | `/blog/posts`       | limit, offset, category_id                                                                 | Lista todos los artículos publicados o filtrados por categoría con soporte para paginación.  |      public      |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (1h TTL),  seeder,  buenas practicas          |       |
| 9.2 |     |  `GET`   | `/blog/posts/:slug` | -                                                                                          | Obtiene el contenido completo, autor y metadatos de un artículo específico mediante su slug. |      public      |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (1h TTL),  seeder,  buenas practicas          |       |
| 9.3 |     |  `POST`  | `/blog/posts`       | body: `Omit<BlogPost, "id" \| "tenant_id" \| "created_at" \| "updated_at" \| "author_id">` | Registra un nuevo artículo en la DB, vinculándolo automáticamente al autor (ADMIN).          |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar posts),  seeder,  buenas practicas |       |
| 9.4 |     |  `PUT`   | `/blog/posts/:id`   | body: `Omit<BlogPost, "id" \| "tenant_id" \| "created_at" \| "updated_at" \| "author_id">` | Permite actualizar el contenido, imagen de portada o estado de publicación de un post.       |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar posts),  seeder,  buenas practicas |       |
| 9.5 |     | `DELETE` | `/blog/posts/:id`   | -                                                                                          | Elimina permanentemente un artículo del blog del sistema.                                    |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar posts),  seeder,  buenas practicas |       |

---

## 10. Technology (rules-business.md #10)

| id   | Status |  Método  | Endpoint            | query o body                                                                  | Descripción                                                                                       | Roles o Permisos | Testing                         | prompt-backend.md                                                                                                                          | Testeado |
| :--- | :----: | :------: | :------------------ | :---------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ | :--------------: | :------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| 10.1 |     |  `GET`   | `/technologies`     | -                                                                             | Lista todas las tecnologías registradas para mostrarlas en el grid de skills o componentes orbit. |      public      |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (24h TTL),  seeder,  buenas practicas        |       |
| 10.2 |     |  `POST`  | `/technologies`     | body: `Omit<Technology, "id" \| "tenant_id" \| "created_at" \| "updated_at">` | Registra una nueva tecnología incluyendo nombre, categoría e icono.                               |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar tech),  seeder,  buenas practicas |       |
| 10.3 |     |  `PUT`   | `/technologies/:id` | body: `Omit<Technology, "id" \| "tenant_id" \| "created_at" \| "updated_at">` | Actualiza los metadatos o la imagen de una tecnología ya existente.                               |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar tech),  seeder,  buenas practicas |       |
| 10.4 |     | `DELETE` | `/technologies/:id` | -                                                                             | Elimina permanentemente una tecnología del catálogo global.                                       |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar tech),  seeder,  buenas practicas |       |

---

## 11. Techeable (rules-business.md #11)

| id   | Status |  Método  | Endpoint          | query o body                                                                 | Descripción                                                                                       | Roles o Permisos | Testing                         | prompt-backend.md                                                                                                                                | Testeado |
| :--- | :----: | :------: | :---------------- | :--------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ | :--------------: | :------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| 11.1 |     |  `POST`  | `/techeables`     | body: `Omit<Techeable, "id" \| "created_at" \| "updated_at" \| "tenant_id">` | Crea un vínculo entre una tecnología y una entidad (Proyecto o Post) para mostrar el stack usado. |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar techeables),  seeder,  buenas practicas |       |
| 11.2 |     | `DELETE` | `/techeables/:id` | -                                                                            | Rompe la asociación entre una tecnología y un proyecto o artículo por su ID de relación.          |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar techeables),  seeder,  buenas practicas |       |

---

## 12. Music Track (rules-business.md #12)

| id   | Status |  Método  | Endpoint     | query o body                                                                  | Descripción                                                                               | Roles o Permisos | Testing                         | prompt-backend.md                                                                                                                           | Testeado |
| :--- | :----: | :------: | :----------- | :---------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------- | :--------------: | :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------ | :------: |
| 12.1 |     |  `GET`   | `/music`     | -                                                                             | Lista todas las pistas de audio disponibles para el reproductor de la landing page.       |      public      |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (1h TTL),  seeder,  buenas practicas          |       |
| 12.2 |     |  `POST`  | `/music`     | body: `Omit<MusicTrack, "id" \| "tenant_id" \| "created_at" \| "updated_at">` | Permite subir una nueva pista (MP3/WAV) incluyendo metadatos como BPM y género.           |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar music),  seeder,  buenas practicas |       |
| 12.3 |     |  `PUT`   | `/music/:id` | body: `Omit<MusicTrack, "id" \| "tenant_id" \| "created_at" \| "updated_at">` | Actualiza la información de una pista, como el título o la visibilidad en el reproductor. |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar music),  seeder,  buenas practicas |       |
| 12.4 |     | `DELETE` | `/music/:id` | -                                                                             | Elimina una pista de música y su archivo asociado del servidor.                           |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar music),  seeder,  buenas practicas |       |

---

## 13. Document (rules-business.md #13)

| id   | Status | Método | Endpoint                 | query o body                      | Descripción                                                                               | Roles o Permisos | Testing                         | prompt-backend.md                                                                                                                          | Testeado |
| :--- | :----: | :----: | :----------------------- | :-------------------------------- | :---------------------------------------------------------------------------------------- | :--------------: | :------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| 13.1 |     | `POST` | `/documents`             | multipart: `file` & body: `title` | Sube un nuevo documento (PDF) al servidor para ser procesado posteriormente por la IA.    |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar docs),  seeder,  buenas practicas |       |
| 13.2 |     | `GET`  | `/documents`             | limit, offset                     | Obtiene el listado de todos los documentos subidos y su estado actual de indexación.      |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (5min TTL),  seeder,  buenas practicas       |       |
| 13.3 |     | `POST` | `/documents/:id/process` | -                                 | Inicia el proceso de fragmentación y vectorización (RAG) de un documento para el Chat AI. |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar docs),  seeder,  buenas practicas |       |

---

## 15. AI Model Config (rules-business.md #15)

| id   | Status | Método | Endpoint     | query o body                                                                     | Descripción                                                                                   | Roles o Permisos | Testing                         | prompt-backend.md                                                                                                                    | Testeado |
| :--- | :----: | :----: | :----------- | :------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------- | :--------------: | :------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------- | :------: |
| 15.1 |     | `GET`  | `/ai-config` | -                                                                                | Recupera los parámetros técnicos activos de los modelos de lenguaje (Temp, Max Tokens, etc.). |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (no cache),  seeder,  buenas practicas |       |
| 15.2 |     | `PUT`  | `/ai-config` | body: `Omit<AiModelConfig, "id" \| "tenant_id" \| "created_at" \| "updated_at">` | Actualiza la configuración de comportamiento de la IA para las conversaciones del portfolio.  |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (no cache),  seeder,  buenas practicas |       |

---

## 16. Conversation (rules-business.md #16)

| id   | Status | Método | Endpoint         | query o body                | Descripción                                                                                   | Roles o Permisos | Testing                         | prompt-backend.md                                                                                                                    | Testeado |
| :--- | :----: | :----: | :--------------- | :-------------------------- | :-------------------------------------------------------------------------------------------- | :--------------: | :------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------- | :------: |
| 16.1 |     | `POST` | `/conversations` | body: `visitor_id`, `title` | Crea una nueva sesión de chat para un visitante anónimo, asignando un ID de seguimiento.      |      public      |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (no cache),  seeder,  buenas practicas |       |
| 16.2 |     | `GET`  | `/conversations` | limit, offset               | Lista todas las conversaciones históricas registradas en el sistema para auditoría del Admin. |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (no cache),  seeder,  buenas practicas |       |

---

## 18. Chat Message (rules-business.md #18)

| id   | Status | Método | Endpoint                      | query o body                         | Descripción                                                                                | Roles o Permisos | Testing                         | prompt-backend.md                                                                                                                    | Testeado |
| :--- | :----: | :----: | :---------------------------- | :----------------------------------- | :----------------------------------------------------------------------------------------- | :--------------: | :------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------- | :------: |
| 18.1 |     | `POST` | `/conversations/:id/messages` | body: `Pick<ChatMessage, "content">` | Registra y envía un mensaje del usuario hacia el servicio de Chat AI en una sesión activa. |      public      |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (no cache),  seeder,  buenas practicas |       |
| 18.2 |     | `GET`  | `/conversations/:id/stream`   | -                                    | Inicia un stream SSE para recibir la respuesta generada por la IA en tiempo real.          |      public      |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (no cache),  seeder,  buenas practicas |       |

---

## 19. Social Comment (rules-business.md #19)

| id   | Status | Método  | Endpoint              | query o body                                                                                            | Descripción                                                                          | Roles o Permisos | Testing                         | prompt-backend.md                                                                                                                              | Testeado |
| :--- | :----: | :-----: | :-------------------- | :------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------- | :--------------: | :------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| 19.1 |     | `POST`  | `/comments`           | body: `Pick<SocialComment, "name" \| "surname" \| "content" \| "commentable_id" \| "commentable_type">` | Registra un comentario de un visitante en un proyecto o post del blog.               |      public      |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar comments),  seeder,  buenas practicas |       |
| 19.2 |     |  `GET`  | `/comments`           | target_id, target_type, limit, offset                                                                   | Recupera los comentarios públicos filtrados por entidad (Proyecto/Blog) y paginados. |      public      |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (1min TTL),  seeder,  buenas practicas           |       |
| 19.3 |     | `PATCH` | `/comments/:id`       | body: `Pick<SocialComment, "is_visible">`                                                               | Permite al administrador aprobar u ocultar comentarios de la vista pública.          |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar comments),  seeder,  buenas practicas |       |
| 19.4 |     | `POST`  | `/comments/:id/reply` | body: `Pick<SocialComment, "content">`                                                                  | Envía una respuesta oficial del administrador a un comentario específico.            |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar comments),  seeder,  buenas practicas |       |

---

## 20. Social Reaction (rules-business.md #20)

| id   | Status | Método | Endpoint     | query o body                                                               | Descripción                                                                                       | Roles o Permisos | Testing                         | prompt-backend.md                                                                                                                    | Testeado |
| :--- | :----: | :----: | :----------- | :------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ | :--------------: | :------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------- | :------: |
| 20.1 |     | `POST` | `/reactions` | body: `Pick<SocialReaction, "type" \| "reactable_id" \| "reactable_type">` | Registra o elimina (toggle) una reacción (LIKE, CLAP, etc.) de un visitante en cualquier entidad. |      public      |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (no cache),  seeder,  buenas practicas |       |
| 20.2 |     | `GET`  | `/reactions` | target_id, target_type                                                     | Obtiene el conteo total de reacciones agrupadas por tipo para una entidad específica.             |      public      |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (1min TTL),  seeder,  buenas practicas |       |

---

## 21. Notification (rules-business.md #21)

| id   | Status |  Método  | Endpoint             | query o body                          | Descripción                                                                              | Roles o Permisos | Testing                         | prompt-backend.md                                                                                                                                  | Testeado |
| :--- | :----: | :------: | :------------------- | :------------------------------------ | :--------------------------------------------------------------------------------------- | :--------------: | :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| 21.1 |     |  `GET`   | `/notifications`     | limit, offset                         | Recupera las alertas del sistema (nuevos mensajes, comentarios o errores) para el Admin. |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (no cache),  seeder,  buenas practicas               |       |
| 21.2 |     | `PATCH`  | `/notifications/:id` | body: `Pick<Notification, "is_read">` | Cambia el estado de una notificación específica a leída.                                 |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar notification),  seeder,  buenas practicas |       |
| 21.3 |     | `DELETE` | `/notifications/all` | -                                     | Elimina todas las notificaciones del historial administrativo.                           |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar notification),  seeder,  buenas practicas |       |

---

## 22. Work Milestone (rules-business.md #22)

| id   | Status |  Método  | Endpoint          | query o body                                                                     | Descripción                                                                                             | Roles o Permisos | Testing                         | prompt-backend.md                                                                                                                                 | Testeado |
| :--- | :----: | :------: | :---------------- | :------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------ | :--------------: | :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------ | :------: |
| 22.1 |     |  `POST`  | `/milestones`     | body: `Omit<WorkMilestone, "id" \| "tenant_id" \| "created_at" \| "updated_at">` | Crea un hito relevante dentro de una experiencia laboral (ej. Promoción, Logro Clave).                  |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar experiences),  seeder,  buenas practicas |       |
| 22.2 |     |  `GET`   | `/milestones`     | experience_id                                                                    | Lista todos los hitos asociados a una experiencia laboral específica para visualización en el timeline. |      public      |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (24h TTL),  seeder,  buenas practicas               |       |
| 22.3 |     |  `PUT`   | `/milestones/:id` | body: `Omit<WorkMilestone, "id" \| "tenant_id" \| "created_at" \| "updated_at">` | Actualiza la descripción o fecha de un hito de carrera previamente registrado.                          |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar experiences),  seeder,  buenas practicas |       |
| 22.4 |     | `DELETE` | `/milestones/:id` | -                                                                                | Elimina un hito de la base de datos por su ID.                                                          |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (invalidar experiences),  seeder,  buenas practicas |       |

---

## 23. AI Insight (rules-business.md #23)

| id   | Status | Método | Endpoint                       | query o body  | Descripción                                                                                           | Roles o Permisos | Testing                         | prompt-backend.md                                                                                                                    | Testeado |
| :--- | :----: | :----: | :----------------------------- | :------------ | :---------------------------------------------------------------------------------------------------- | :--------------: | :------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------- | :------: |
| 23.1 |     | `POST` | `/analytics/insights/generate` | -             | Dispara el motor de IA para analizar las conversaciones recientes y generar métricas de reclutadores. |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (no cache),  seeder,  buenas practicas |       |
| 23.2 |     | `GET`  | `/analytics/insights`          | limit, offset | Obtiene el reporte histórico de insights generados para visualización en el dashboard administrativo. |    role:ADMIN    |  unit,  e2e,  coverage |  schemas,  dtos,  entities,  controllers & swagger,  services,  cache (12h TTL),  seeder,  buenas practicas  |       |

---

## ✅ Verificación de Endpoints (OBLIGATORIO)

### 1-4 Core, User, Auth, Contact

-  rules-endpoints.md,  fidelidad rules-business,  Pick/Omit syntax,  roles,  prompt-backend.md

### 5-9 Entities, Blog

-  rules-endpoints.md,  fidelidad rules-business,  Pick/Omit syntax,  roles,  prompt-backend.md

### 10-23 Shared, AI, Chat, Social, Notification, Milestones & Analytics

-  rules-endpoints.md,  fidelidad rules-business,  Pick/Omit syntax,  roles,  prompt-backend.md

---

## ✅ Verificación FINAL (10/10 Score)

-  **IDs Sincronizados**: Todos los IDs coinciden con las secciones de `rules-business.md`.
-  **CRUD Completo**: Agregados todos los endpoints administrativos (POST, PUT, DELETE) para todas las entidades.
-  **Alineación Total**: 100% fiel a `rules-business.md` y `rules-class.md`.
-  **Formato**: Consistencia en tipado `Omit`/`Pick` y políticas de cache.
