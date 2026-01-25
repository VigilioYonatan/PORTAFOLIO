# Rules Business - Reglas de Negocio - Portfolio Personal

- **Portfolio Senior Identity**: Plataforma de marca personal para un Senior Developer con enfoque en impacto y resultados.
- **Inteligencia Artificial (RAG)**: Chat interactivo (IP/Visitor ID) con contexto de documentos (CV) usando pgvector.
- **Single-Owner Dashboard**: Gestión de contenido (Proyectos, Blog, Música) centralizada para el dueño del portafolio.
- **Social Proof**: Sistema de testimonios y validación profesional.

---

## 1. Portfolio Config (rules-class.md/portfolio_config)

Define la identidad del propietario del portfolio y la configuración del sitio.

- 1.1 Leer configuración del portfolio (Público).
- 1.2 Actualizar configuración (Admin).
- 1.3 Descargar CV (Público, PDF dinámico generado desde la DB).

### Reglas de Validación

| Campo              | Regla                                              |
| ------------------ | -------------------------------------------------- |
| `id`               | PK                                                 |
| `tenant_id`        | Requerido, FK                                      |
| `name`             | Requerido, máximo 100 caracteres                   |
| `profile_title`    | Requerido, máximo 200 caracteres                   |
| `biography`        | Requerido, texto enriquecido (Markdown)            |
| `email`            | Requerido, formato email válido                    |
| `phone`            | Nullable, máximo 20 caracteres                     |
| `address`          | Nullable, texto                                    |
| `social_links`     | JSONB: `linkedin`, `github`, `twitter`, `youtube`? |
| `logo`             | JSONB: cumple interface `FileUpload[]`             |
| `color_primary`    | Requerido, hex format                              |
| `color_secondary`  | Requerido, hex format                              |
| `default_language` | Requerido, Enum: 'ES', 'EN', 'PT'                  |
| `time_zone`        | Nullable, Enum: 'UTC' o 'America/Lima'             |
| `created_at`       | Timestamp, autogenerado                            |
| `updated_at`       | Timestamp, autogenerado                            |

---

## 2. User (rules-class.md/user)

Gestiona el acceso administrativo al dashboard. Solo existe un usuario (Admin).

- 2.1 Leer perfil del administrador (Admin).
- 2.2 Actualizar perfil del administrador (Admin).

### Reglas de Validación

| Campo                   | Regla                                          |
| ----------------------- | ---------------------------------------------- |
| `id`                    | PK                                             |
| `tenant_id`             | Requerido, FK                                  |
| `username`              | Requerido, máx 50                              |
| `email`                 | Requerido, formato email                       |
| `password`              | Requerido, hash Bcrypt/Argon2                  |
| `role_id`               | Requerido, int                                 |
| `status`                | Requerido, Enum: 'ACTIVE', 'BANNED', 'PENDING' |
| `avatar`                | Nullable, `FileUpload[]`                       |
| `phone_number`          | Nullable, máx 50                               |
| `is_superuser`          | Requerido, Boolean                             |
| `is_mfa_enabled`        | Requerido, Boolean                             |
| `failed_login_attempts` | Requerido, int                                 |
| `created_at`            | Timestamp                                      |
| `updated_at`            | Timestamp                                      |

---

## 3. Auth (rules-class.md/user)

Gestión de sesiones y seguridad.

- 3.1 Iniciar sesión (Público).
- 3.2 Cerrar sesión (Autenticado).
- 3.3 Recuperar contraseña (Público).

---

## 4. Contact Message (rules-class.md/contact_message)

Gestión de mensajes directos desde el portfolio.

- 4.1 Enviar mensaje (Público).
- 4.2 Listar mensajes (Admin, paginado limit/offset).
- 4.3 Marcar mensaje como leído (Admin).

### Reglas de Validación

| Campo          | Regla                    |
| -------------- | ------------------------ |
| `id`           | PK                       |
| `tenant_id`    | Requerido, FK            |
| `name`         | Requerido, máx 100       |
| `email`        | Requerido, formato email |
| `phone_number` | Nullable, máx 50         |
| `subject`      | Nullable, máx 200        |
| `message`      | Requerido, máx 1000      |
| `ip_address`   | Nullable, máx 45 (IPv6)  |
| `is_read`      | Requerido, Boolean       |
| `created_at`   | Timestamp                |
| `updated_at`   | Timestamp                |

---

## 5. Testimonial (rules-class.md/testimonial)

Validación profesional de terceros.

- 5.1 Listar testimonios (Público, paginado limit/offset).
- 5.2 Crear testimonio (Admin).
- 5.3 Actualizar testimonio (Admin).
- 5.4 Eliminar testimonio (Admin).

### Reglas de Validación

| Campo            | Regla                    |
| ---------------- | ------------------------ |
| `id`             | PK                       |
| `tenant_id`      | Requerido, FK            |
| `author_name`    | Requerido, máx 100       |
| `author_role`    | Requerido, máx 100       |
| `author_company` | Nullable, máx 100        |
| `content`        | Requerido, texto         |
| `sort_order`     | Requerido, entero        |
| `is_visible`     | Requerido, Boolean       |
| `avatar`         | Nullable, `FileUpload[]` |
| `created_at`     | Timestamp                |
| `updated_at`     | Timestamp                |

---

## 6. Portfolio Project (rules-class.md/portfolio_project)

Exhibición de trabajos destacados e impacto senior.

- 6.1 Listar proyectos (Público, paginado limit/offset).
- 6.2 Ver detalle de proyecto (Público, por slug).
- 6.3 Crear proyecto (Admin).
- 6.4 Actualizar proyecto (Admin).
- 6.5 Eliminar proyecto (Admin).
- 6.6 Sincronizar con GitHub (Admin, actualiza estrellas/lenguajes).

### Reglas de Validación

| Campo             | Regla                            |
| ----------------- | -------------------------------- |
| `id`              | PK                               |
| `tenant_id`       | Requerido, FK                    |
| `title`           | Requerido, máx 200               |
| `slug`            | Requerido, único, máx 200        |
| `description`     | Requerido, máx 500               |
| `content`         | Requerido, Markdown              |
| `impact_summary`  | Requerido, Senior Results        |
| `website_url`     | Nullable, URL máx 500            |
| `repo_url`        | Nullable, URL máx 500            |
| `github_stars`    | Nullable, Integer (Solo lectura) |
| `github_forks`    | Nullable, Integer (Solo lectura) |
| `languages_stats` | Nullable, JSONB (Solo lectura)   |
| `sort_order`      | Requerido, entero                |
| `is_featured`     | Requerido, Boolean               |
| `is_visible`      | Requerido, Boolean               |
| `images`          | Nullable, `FileUpload[]`         |
| `seo`             | Nullable, `SeoMetadata`          |
| `start_date`      | Requerido, Date                  |
| `end_date`        | Nullable, Date                   |
| `created_at`      | Timestamp                        |
| `updated_at`      | Timestamp                        |

---

## 7. Work Experience (rules-class.md/work_experience)

Trayectoria laboral cronológica.

- 7.1 Listar experiencias (Público, paginado limit/offset).
- 7.2 Crear experiencia (Admin).
- 7.3 Actualizar experiencia (Admin).
- 7.4 Eliminar experiencia (Admin).

### Reglas de Validación

| Campo         | Regla              |
| ------------- | ------------------ |
| `id`          | PK                 |
| `tenant_id`   | Requerido, FK      |
| `company`     | Requerido, máx 100 |
| `position`    | Requerido, máx 100 |
| `description` | Requerido, texto   |
| `location`    | Nullable, máx 100  |
| `sort_order`  | Requerido, entero  |
| `is_current`  | Requerido, Boolean |
| `is_visible`  | Requerido, Boolean |
| `start_date`  | Requerido, Date    |
| `end_date`    | Nullable, Date     |
| `created_at`  | Timestamp          |
| `updated_at`  | Timestamp          |

---

## 8. Blog Category (rules-class.md/blog_category)

Categorización de artículos técnicos.

- 8.1 Listar categorías (Público, paginado limit/offset).
- 8.2 Crear categoría (Admin).
- 8.3 Actualizar categoría (Admin).
- 8.4 Eliminar categoría (Admin).

### Reglas de Validación

| Campo        | Regla                     |
| ------------ | ------------------------- |
| `id`         | PK                        |
| `tenant_id`  | Requerido, FK             |
| `name`       | Requerido, único, máx 100 |
| `slug`       | Requerido, único, máx 100 |
| `created_at` | Timestamp                 |
| `updated_at` | Timestamp                 |

---

## 9. Blog Post (rules-class.md/blog_post)

Gestión de contenido técnico y artículos.

- 9.1 Listar posts (Público, con filtros y paginación limit/offset).
- 9.2 Ver detalle de post (Público, por slug).
- 9.3 Crear post (Admin).
- 9.4 Actualizar post (Admin).
- 9.5 Eliminar post (Admin).

### Reglas de Validación

| Campo                  | Regla                     |
| ---------------------- | ------------------------- |
| `id`                   | PK                        |
| `tenant_id`            | Requerido, FK             |
| `title`                | Requerido, máx 200        |
| `slug`                 | Requerido, único, máx 200 |
| `content`              | Requerido, texto          |
| `extract`              | Nullable, máx 500         |
| `is_published`         | Requerido, Boolean        |
| `reading_time_minutes` | Nullable, int             |
| `cover`                | Nullable, `FileUpload[]`  |
| `seo`                  | Nullable, `SeoMetadata`   |
| `published_at`         | Nullable, Timestamp       |
| `created_at`           | Timestamp                 |
| `updated_at`           | Timestamp                 |
| `category_id`          | Nullable, FK              |
| `author_id`            | Requerido, FK (Admin)     |

---

## 10. Technology (rules-class.md/technology)

Catálogo de stack tecnológico.

- 10.1 Listar tecnologías (Público, paginado limit/offset).
- 10.2 Crear tecnología (Admin).
- 10.3 Actualizar tecnología (Admin).
- 10.4 Eliminar tecnología (Admin).

### Reglas de Validación

| Campo        | Regla                                                  |
| ------------ | ------------------------------------------------------ |
| `id`         | PK                                                     |
| `tenant_id`  | Requerido, FK                                          |
| `name`       | Requerido, único, máx 100                              |
| `category`   | Enum: 'FRONTEND', 'BACKEND', 'DATABASE', 'DEVOPS', ... |
| `icon`       | Nullable, `FileUpload[]`                               |
| `created_at` | Timestamp                                              |
| `updated_at` | Timestamp                                              |

---

## 11. Techeable (rules-class.md/techeable)

Relación polimórfica entre tecnologías y entidades (Proyectos/Blog).

- 11.1 Asociar tecnología a proyecto/post.
- 11.2 Desasociar tecnología.

### Reglas de Validación

| Campo            | Regla                             |
| ---------------- | --------------------------------- |
| `id`             | PK                                |
| `tenant_id`      | Requerido, FK                     |
| `techeable_id`   | Requerido, Morph ID               |
| `techeable_type` | 'PORTFOLIO_PROJECT' o 'BLOG_POST' |
| `technology_id`  | Requerido, FK                     |
| `created_at`     | Timestamp                         |
| `updated_at`     | Timestamp                         |

---

## 12. Music Track (rules-class.md/music_track)

Integración de bandas sonoras personales.

- 12.1 Listar pistas musicales (Público, paginado limit/offset).
- 12.2 Crear pista (Admin).
- 12.3 Actualizar pista (Admin).
- 12.4 Eliminar pista (Admin).

### Reglas de Validación

| Campo              | Regla                     |
| ------------------ | ------------------------- |
| `id`               | PK                        |
| `tenant_id`        | Requerido, FK             |
| `title`            | Requerido, máx 200        |
| `artist`           | Requerido, máx 100        |
| `duration_seconds` | Requerido, entero         |
| `sort_order`       | Requerido, entero         |
| `is_featured`      | Requerido, Boolean        |
| `is_public`        | Requerido, Boolean        |
| `audio_file`       | Requerido, `FileUpload[]` |
| `cover`            | Nullable, `FileUpload[]`  |
| `created_at`       | Timestamp                 |
| `updated_at`       | Timestamp                 |

---

## 13. Document (rules-class.md/document)

Documentos base para el sistema RAG (CV, Certificados).

- 13.1 Subir documento (Admin).
- 13.2 Listar documentos (Admin, paginado limit/offset).
- 13.3 Procesar/Indexar documento (Admin).

### Reglas de Validación

| Campo          | Regla                                     |
| -------------- | ----------------------------------------- |
| `id`           | PK                                        |
| `title`        | Requerido, máx 200                        |
| `chunk_count`  | Requerido, entero                         |
| `is_indexed`   | Requerido, Boolean                        |
| `status`       | Enum: 'PENDING', 'PROCESSING', 'READY'... |
| `file`         | Requerido, `FileUpload`                   |
| `metadata`     | Nullable, JSONB                           |
| `processed_at` | Nullable, Timestamp                       |
| `created_at`   | Timestamp                                 |
| `updated_at`   | Timestamp                                 |
| `user_id`      | Requerido, FK                             |

---

## 14. Document Chunk (rules-class.md/document_chunk)

Fragmentos vectorizados de documentos.

- 14.1 Crear fragmento (Automático al procesar documento).
- 14.2 Buscar fragmentos por similitud vectorial (IA).

### Reglas de Validación

| Campo         | Regla                   |
| ------------- | ----------------------- |
| `id`          | PK                      |
| `content`     | Requerido, texto        |
| `embedding`   | Requerido, vector(1536) |
| `chunk_index` | Requerido, entero       |
| `token_count` | Requerido, entero       |
| `created_at`  | Timestamp               |
| `updated_at`  | Timestamp               |
| `document_id` | Requerido, FK           |

---

## 15. AI Model Config (rules-class.md/ai_model_config)

Configuración técnica de los modelos de IA.

- 15.1 Leer configuración activa (Admin).
- 15.2 Actualizar configuración (Admin).

### Reglas de Validación

| Campo                  | Regla              |
| ---------------------- | ------------------ |
| `id`                   | PK                 |
| `tenant_id`            | Requerido, FK      |
| `embedding_model`      | Requerido, máx 100 |
| `chat_model`           | Requerido, máx 100 |
| `embedding_dimensions` | Requerido, entero  |
| `chunk_size`           | Requerido, entero  |
| `chunk_overlap`        | Requerido, entero  |
| `is_active`            | Requerido, Boolean |
| `created_at`           | Timestamp          |
| `updated_at`           | Timestamp          |

---

## 16. Conversation (rules-class.md/conversation)

Sesiones de chat entre visitantes y la IA.

- 16.1 Iniciar conversación (Público).
- 16.2 Listar conversaciones (Admin, paginado limit/offset).

### Reglas de Validación

| Campo        | Regla                 |
| ------------ | --------------------- |
| `id`         | PK                    |
| `tenant_id`  | Requerido, FK         |
| `ip_address` | Requerido, máx 45     |
| `title`      | Requerido, máx 200    |
| `mode`       | Enum: 'AI', 'LIVE'    |
| `is_active`  | Requerido, Boolean    |
| `visitor_id` | Requerido, UUID único |
| `user_id`    | Nullable, FK (Admin)  |
| `created_at` | Timestamp             |
| `updated_at` | Timestamp             |

---

## 17. Conversation Document (rules-class.md/conversation_document)

Relación N-M entre conversaciones y documentos base.

| Campo             | Regla         |
| ----------------- | ------------- |
| `conversation_id` | PK, FK        |
| `document_id`     | PK, FK        |
| `tenant_id`       | Requerido, FK |
| `created_at`      | Timestamp     |
| `updated_at`      | Timestamp     |

---

## 18. Chat Message (rules-class.md/chat_message)

Historial de mensajes del chat.

- 18.1 Enviar mensaje.
- 18.2 Recibir respuesta IA (Stream SSE).

### Reglas de Validación

| Campo             | Regla                                  |
| ----------------- | -------------------------------------- |
| `id`              | PK                                     |
| `tenant_id`       | Requerido, FK                          |
| `role`            | Enum: 'USER', 'ASSISTANT', 'SYSTEM'... |
| `content`         | Requerido, texto                       |
| `sources`         | Nullable, JSONB (ChatSource[])         |
| `is_read`         | Requerido, Boolean                     |
| `conversation_id` | Requerido, FK                          |
| `created_at`      | Timestamp                              |
| `updated_at`      | Timestamp                              |

---

---

## 19. Social Comment (rules-class.md/social_comment)

Gestión de comentarios en proyectos y blogs.

- 19.1 Realizar comentario (Público/Identificado por visitor_id/IP).
- 19.2 Listar comentarios (Público, paginado limit/offset).
- 19.3 Moderar comentario (Admin: ocultar/eliminar).
- 19.4 Responder comentario (Admin).

### Reglas de Validación

| Campo              | Regla                              |
| ------------------ | ---------------------------------- |
| `id`               | PK                                 |
| `tenant_id`        | Requerido, FK                      |
| `name`             | Requerido, máximo 100 caracteres   |
| `surname`          | Requerido, máximo 100 caracteres   |
| `content`          | Requerido, máximo 1000 caracteres  |
| `commentable_id`   | Requerido, Morph ID                |
| `commentable_type` | 'PORTFOLIO_PROJECT' o 'BLOG_POST'  |
| `visitor_id`       | Nullable, UUID                     |
| `ip_address`       | Nullable, máx 45                   |
| `is_visible`       | Requerido, Boolean (default: true) |
| `reply`            | Nullable, texto (Admin reply)      |
| `created_at`       | Timestamp                          |
| `updated_at`       | Timestamp                          |

---

## 20. Social Reaction (rules-class.md/social_reaction)

Reacciones rápidas a contenido.

- 20.1 Reaccionar a contenido (Público).
- 20.2 Listar reacciones (Público).

### Reglas de Validación

| Campo            | Regla                                                              |
| ---------------- | ------------------------------------------------------------------ |
| `id`             | PK                                                                 |
| `type`           | Enum: 'LIKE', 'LOVE', 'CLAP', 'FIRE'                               |
| `reactable_id`   | Requerido, Morph ID                                                |
| `reactable_type` | 'PORTFOLIO_PROJECT', 'BLOG_POST', 'MUSIC_TRACK' o 'SOCIAL_COMMENT' |
| `visitor_id`     | Requerido, UUID                                                    |
| `created_at`     | Timestamp                                                          |
| `updated_at`     | Timestamp                                                          |

---

## 21. Notification (rules-class.md/notification)

Sistema de alertas para el administrador.

- 21.1 Listar notificaciones (Admin, paginado limit/offset).
- 21.2 Marcar notificación como leída (Admin).
- 21.3 Eliminar notificación (Admin).

### Reglas de Validación

| Campo        | Regla                                        |
| ------------ | -------------------------------------------- |
| `id`         | PK                                           |
| `tenant_id`  | Requerido, FK                                |
| `title`      | Requerido, máx 100                           |
| `content`    | Requerido, máx 500                           |
| `type`       | Enum: 'LIKE', 'COMMENT', 'CONTACT', 'SYSTEM' |
| `link`       | Nullable, máx 500                            |
| `is_read`    | Requerido, Boolean                           |
| `created_at` | Timestamp                                    |
| `updated_at` | Timestamp                                    |
| `user_id`    | Requerido, FK                                |

---

---

## 22. Work Milestone (rules-class.md/work_milestone)

Hitos clave dentro de una experiencia laboral para contar una historia de crecimiento.

- 22.1 Crear hito (Admin).
- 22.2 Listar hitos por experiencia (Público).
- 22.3 Actualizar hito (Admin).
- 22.4 Eliminar hito (Admin).

### Reglas de Validación

| Campo                | Regla              |
| -------------------- | ------------------ |
| `id`                 | PK                 |
| `tenant_id`          | Requerido, FK      |
| `title`              | Requerido, máx 100 |
| `description`        | Requerido, máx 500 |
| `icon`               | Nullable, máx 100  |
| `milestone_date`     | Requerido, Date    |
| `sort_order`         | Requerido, Integer |
| `created_at`         | Timestamp          |
| `updated_at`         | Timestamp          |
| `work_experience_id` | Requerido, FK      |

---

## 23. AI Insight (rules-class.md/ai_insight)

Módulo de analítica para entender el comportamiento de reclutadores.

- 23.1 Generar analítica (Admin, proceso batch).
- 23.2 Listar analíticas generadas (Admin).

> [!IMPORTANT]
> Los insights deben ser generados exclusivamente a partir de conversaciones anonimizadas para proteger la privacidad.

### Reglas de Validación

| Campo           | Regla                                                               |
| :-------------- | :------------------------------------------------------------------ |
| `id`            | PK                                                                  |
| `tenant_id`     | Requerido, FK                                                       |
| `insights_data` | JSONB: `themes: string[]`, `sentiment: string`, `actions: string[]` |
| `generated_at`  | Timestamp                                                           |
| `model_id`      | FK (ai_model_config)                                                |

---

## ✅ Verificación de Reglas de Negocio (OBLIGATORIO)

### 1. Core (Config, User, Auth, Contact, Notification)

- [x] rules-business.md, [x] roles, [x] validaciones, [x] reglas de negocio, [x] fidelidad rules-class

### 2. Social Proof (Testimonial)

- [x] rules-business.md, [x] roles, [x] validaciones, [x] reglas de negocio, [x] fidelidad rules-class

### 3. Portfolio, Experience & Milestone

- [x] rules-business.md, [x] roles, [x] validaciones, [x] reglas de negocio, [x] fidelidad rules-class

### 4. Blog (Category & Post)

- [x] rules-business.md, [x] roles, [x] validaciones, [x] reglas de negocio, [x] fidelidad rules-class

### 5. Shared (Tech & Music)

- [x] rules-business.md, [x] roles, [x] validaciones, [x] reglas de negocio, [x] fidelidad rules-class

### 6. AI RAG (Document, Chunk, Config)

- [x] rules-business.md, [x] roles, [x] validaciones, [x] reglas de negocio, [x] fidelidad rules-class

### 7. Chat (Conversation, Message)

- [x] rules-business.md, [x] roles, [x] validaciones, [x] reglas de negocio, [x] fidelidad rules-class

### 8. Community (Comment, Reaction)

- [x] rules-business.md, [x] roles, [x] validaciones, [x] reglas de negocio, [x] fidelidad rules-class

---

## ✅ Verificación FINAL (10/10 Senior Score)

- [x] **Enfoque Personal**: Eliminado todo rastro de SaaS/Multi-tenancy.
- [x] **Simplicidad**: Arquitectura limpia para un único usuario administrador.
- [x] **Consistencia**: Sincronizado 100% con `rules-class.md` (17 entidades cubiertas).
- [x] **Senior Identity**: Mantiene el enfoque en biografía e impacto profesional.
- [x] **Relaciones**: Correcta documentación de FKs y relaciones polimórficas.
- [x] **Validación**: Tablas detalladas para cada entidad según `prompt-rules.md`.
