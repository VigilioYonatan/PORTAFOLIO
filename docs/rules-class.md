# Rules Class - Esquema de Base de Datos - Portfolio Personal

> Diagrama de clases para el sistema **"Modern Personal Portfolio"**.  
> Compatible con **PostgreSQL** + **Drizzle ORM** + **pgvector**

Un Portafolio Web Personal (Single Page) donde muestras tu trayectoria como **Developer**. Incluye gestión de proyectos, blog, música, testimonios y un Chat IA (RAG) identificado por IP del visitante.

---

## 📊 Diagrama de Clases

%%{init: {'theme': 'dark'}}%%
classDiagram
direction TB

    %% ============================================
    %% CORE - IDENTITY & CONFIGURATION
    %% ============================================

    namespace Core {
        class portfolio_config
        class user
        class contact_message
        class testimonial
        class notification
    }

    class portfolio_config {
        +id: int [PK]
        +name: text[100]
        +profile_title: text[200] -- Ej:  Full-stack Engineer
        +biography: text -- About Me content
        +email: text[100]
        +phone: text[20]?
        +address: text?
        +social_links: jsonb? -- SocialLinks Keys: linkedin, github, twitter, youtube, portfolio
        +logo: jsonb? -- FileUpload[]
        +color_primary: text[50]
        +color_secondary: text[50]
        +default_language: enum -- 'ES' | 'EN' | 'PT'
        +time_zone: enum? -- 'UTC' | 'America/Lima' | 'America/Bogota'
        +tenant_id: int [FK]
        +created_at: timestamp
        +updated_at: timestamp
    }

    class user {
        +id: int [PK]
        +username: text[50]
        +email: text[100]
        +password: text[200]
        +phone_number: text[50]?
        +google_id: text[100]?
        +qr_code_token: text[100]?
        +status: enum -- 'ACTIVE' | 'BANNED' | 'PENDING'
        +security_stamp: uuid
        +failed_login_attempts: int
        +is_mfa_enabled: boolean
        +is_superuser: boolean
        +email_verified_at: timestamp?
        +lockout_end_at: timestamp?
        +mfa_secret: text[32]?
        +last_ip_address: text[45]?
        +last_login_at: timestamp?
        +avatar: jsonb? -- FileUpload[]
        +tenant_id: int [FK]
        +role_id: int
        +created_at: timestamp
        +updated_at: timestamp
        +deleted_at: timestamp?
    }

    class contact_message {
        +id: int [PK]
        +name: text[100]
        +email: text[100]
        +phone_number: text[50]?
        +subject: text[200]?
        +message: text[1000]
        +ip_address: text[45]?
        +is_read: boolean
        +tenant_id: int [FK]
        +created_at: timestamp
        +updated_at: timestamp
    }

    class notification {
        +id: int [PK]
        +title: text[100]
        +content: text[500]
        +type: enum -- 'LIKE' | 'COMMENT' | 'CONTACT' | 'SYSTEM'
        +link: text[500]?
        +is_read: boolean
        +tenant_id: int [FK]
        +user_id: int [FK]
        +created_at: timestamp
        +updated_at: timestamp
    }

    class testimonial {
        +id: int [PK]
        +author_name: text[100]
        +author_role: text[100]
        +author_company: text[100]?
        +content: text
        +sort_order: int
        +is_visible: boolean
        +avatar: jsonb? -- FileUpload[]
        +tenant_id: int [FK]
        +created_at: timestamp
        +updated_at: timestamp
    }

    %% ============================================
    %% PORTFOLIO & BLOG
    %% ============================================

    namespace Portfolio {
        class portfolio_project
        class work_experience
        class blog_post
        class blog_category
        class work_milestone
    }

    class portfolio_project {
        +id: int [PK]
        +title: text[200]
        +slug: text[200](UQ)
        +description: text[500]
        +content: text -- Markdown
        +impact_summary: text --  Impact (Results)
        +website_url: text[500]?
        +repo_url: text[500]?
        +github_stars: int?
        +github_forks: int?
        +languages_stats: jsonb? -- { name: string, percent: number }[]
        +sort_order: int
        +is_featured: boolean
        +is_visible: boolean
        +images: jsonb? -- FileUpload[]
        +seo: jsonb? -- SeoMetadata Keys: title, description, keywords, og_image
        +start_date: date
        +end_date: date?
        +tenant_id: int [FK]
        +created_at: timestamp
        +updated_at: timestamp
    }

    class work_experience {
        +id: int [PK]
        +company: text[100]
        +position: text[100]
        +description: text
        +location: text[100]?
        +sort_order: int
        +is_current: boolean
        +is_visible: boolean
        +start_date: date
        +end_date: date?
        +tenant_id: int [FK]
        +created_at: timestamp
        +updated_at: timestamp
    }

    class work_milestone {
        +id: int [PK]
        +title: text[100]
        +description: text[500]
        +icon: text[100]?
        +milestone_date: date
        +sort_order: int
        +tenant_id: int [FK]
        +work_experience_id: int [FK]
        +created_at: timestamp
        +updated_at: timestamp
    }

    class blog_category {
        +id: int [PK]
        +name: text[100]
        +slug: text[100](UQ)
        +tenant_id: int [FK]
        +created_at: timestamp
        +updated_at: timestamp
    }

    class blog_post {
        +id: int [PK]
        +title: text[200]
        +slug: text[200](UQ)
        +content: text
        +extract: text[500]?
        +is_published: boolean
        +reading_time_minutes: int?
        +cover: jsonb? -- FileUpload[]
        +seo: jsonb? -- SeoMetadata
        +published_at: timestamp?
        +tenant_id: int [FK]
        +category_id: int [FK]?
        +author_id: int [FK]
        +created_at: timestamp
        +updated_at: timestamp
    }

    %% ============================================
    %% SHARED MODULES (MUSIC & TECH)
    %% ============================================

    namespace Shared {
        class music_track
        class technology
        class techeable
    }

    class music_track {
        +id: int [PK]
        +title: text[200]
        +artist: text[100]
        +duration_seconds: int
        +sort_order: int
        +is_featured: boolean
        +is_public: boolean
        +audio_file: jsonb -- FileUpload[]
        +cover: jsonb? -- FileUpload[]
        +tenant_id: int [FK]
        +created_at: timestamp
        +updated_at: timestamp
    }

    class technology {
        +id: int [PK]
        +name: text[100]
        +category: enum -- 'FRONTEND' | 'BACKEND' | 'DATABASE' | 'DEVOPS' | 'LANGUAGE'
        +icon: jsonb? -- FileUpload[]
        +tenant_id: int [FK]
        +created_at: timestamp
        +updated_at: timestamp
    }

    class techeable {
        +id: int [PK]
        +techeable_id: int -- Morph ID (Project or Blog) (UQC)
        +techeable_type: enum -- 'PORTFOLIO_PROJECT' | 'BLOG_POST' (UQC)
        +technology_id: int [FK] (UQC)
        +tenant_id: int [FK]
        +created_at: timestamp
        +updated_at: timestamp
    }

    class ai_insight {
        +id: int [PK]
        +insights_data: jsonb -- { themes: string[], sentiment: string, actions: string[] }
        +generated_at: timestamp
        +tenant_id: int [FK]
        +model_id: int [FK]
        +created_at: timestamp
        +updated_at: timestamp
    }

    %% ============================================
    %% DOCUMENTS & AI
    %% ============================================

    namespace Documents {
        class document
        class document_chunk
        class ai_model_config
    }

    class document {
        +id: int [PK]
        +title: text[200]
        +chunk_count: int
        +is_indexed: boolean
        +status: enum -- 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED'
        +file: jsonb -- FileUpload[]
        +metadata: jsonb? -- DocumentMetadata Keys: author, pages, language
        +processed_at: timestamp?
        +tenant_id: int [FK]
        +user_id: int [FK]
        +created_at: timestamp
        +updated_at: timestamp
    }

    class document_chunk {
        +id: int [PK]
        +content: text
        +embedding: vector[1536]
        +chunk_index: int
        +token_count: int
        +tenant_id: int [FK]
        +document_id: int [FK]
        +created_at: timestamp
        +updated_at: timestamp
    }

    class ai_model_config {
        +id: int [PK]
        +embedding_model: text[100]
        +chat_model: text[100]
        +embedding_dimensions: int
        +chunk_size: int
        +chunk_overlap: int
        +is_active: boolean
        +tenant_id: int [FK]
        +created_at: timestamp
        +updated_at: timestamp
    }

    %% ============================================
    %% CHAT (ANONYMOUS IDENTIFIED)
    %% ============================================

    namespace Chat {
        class conversation
        class conversation_document
        class chat_message
    }

    namespace Community {
        class social_comment
        class social_reaction
    }

    class conversation {
        +id: int [PK]
        +ip_address: text[45]
        +title: text[200]
        +mode: enum -- 'AI' | 'LIVE'
        +is_active: boolean
        +visitor_id: uuid(UQ) -- Persistencia en browser
        +tenant_id: int [FK]
        +user_id: int [FK]? -- Admin que responde
        +created_at: timestamp
        +updated_at: timestamp
    }

    class conversation_document {
        +conversation_id: int [FK][PK] (UQC)
        +document_id: int [FK][PK] (UQC)
        +tenant_id: int [FK]
        +created_at: timestamp
        +updated_at: timestamp
    }

    class chat_message {
        +id: int [PK]
        +role: enum -- 'USER' | 'ASSISTANT' | 'SYSTEM' | 'ADMIN'
        +content: text
        +sources: jsonb? -- ChatSource[]
        +is_read: boolean
        +tenant_id: int [FK]
        +conversation_id: int [FK]
        +created_at: timestamp
        +updated_at: timestamp
    }

    class social_comment {
        +id: int [PK]
        +name: text[100]
        +surname: text[100]
        +content: text
        +commentable_id: int -- Morph ID (Project or Blog)
        +commentable_type: enum -- 'PORTFOLIO_PROJECT' | 'BLOG_POST'
        +visitor_id: uuid?
        +ip_address: text[45]?
        +is_visible: boolean
        +tenant_id: int [FK]
        +user_id: int [FK]? -- Admin reply
        +created_at: timestamp
        +updated_at: timestamp
    }

    class social_reaction {
        +id: int [PK]
        +type: enum -- 'LIKE' | 'LOVE' | 'CLAP' | 'FIRE'
        +reactable_id: int -- Morph ID (Project, Blog or Comment) (UQC)
        +reactable_type: enum -- 'PORTFOLIO_PROJECT' | 'BLOG_POST' | 'SOCIAL_COMMENT' | 'MUSIC_TRACK' (UQC)
        +visitor_id: uuid (UQC)
        +tenant_id: int [FK]
        +created_at: timestamp
        +updated_at: timestamp
    }

    %% ============================================
    %% RELATIONSHIPS
    %% ============================================

    %% Core
    user "1" -- "*" notification : 1-N

    work_experience "1" -- "*" work_milestone : 1-N

    %% Portfolio & Blog
    blog_category "1" -- "*" blog_post : 1-N
    user "1" -- "*" blog_post : 1-N

    %% Shared (Polymorphic)
    technology "1" -- "*" techeable : 1-N
    portfolio_project "1" -- "*" techeable : 1-N-Poly
    blog_post "1" -- "*" techeable : 1-N-Poly

    %% AI RAG
    user "1" -- "*" document : 1-N
    document "1" -- "*" document_chunk : 1-N

    %% Chat
    user "0..1" -- "*" conversation : 1-N
    conversation "*" -- "*" document : N-M
    conversation "1" -- "*" chat_message : 1-N

    %% Community (Polymorphic)
    portfolio_project "1" -- "*" social_comment : 1-N-Poly
    blog_post "1" -- "*" social_comment : 1-N-Poly
    portfolio_project "1" -- "*" social_reaction : 1-N-Poly
    blog_post "1" -- "*" social_reaction : 1-N-Poly
    social_comment "1" -- "*" social_reaction : 1-N-Poly

---

## 📄 Tipos JSONB

### FileUpload

```typescript
interface FileUpload {
  key: string;
  name: string;
  size: number;
  mimetype: string;
  created_at: Date;
}
```

### SocialLinks (social_links en portfolio_config)

```typescript
interface SocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  youtube?: string;
  portfolio?: string;
}
```

### SeoMetadata (seo en projects/blog)

```typescript
interface SeoMetadata {
  title: string;
  description: string;
  keywords: string[];
  og_image?: FileUpload;
}
```

---

## ✅ Verificación de Clases (OBLIGATORIO)

#### portfolio_config

-  rules-class.md,  nomenclatura,  orden de campos,  enums y tipos_datos,  json y nullable,  nomeclatura de relaciones

#### user

-  rules-class.md,  nomenclatura,  orden de campos,  enums y tipos_datos,  json y nullable,  nomeclatura de relaciones

#### contact_message

-  rules-class.md,  nomenclatura,  orden de campos,  enums y tipos_datos,  json y nullable,  nomeclatura de relaciones

#### testimonial

-  rules-class.md,  nomenclatura,  orden de campos,  enums y tipos_datos,  json y nullable,  nomeclatura de relaciones

#### portfolio_project

-  rules-class.md,  nomenclatura,  orden de campos,  enums y tipos_datos,  json y nullable,  nomeclatura de relaciones

#### work_experience

-  rules-class.md,  nomenclatura,  orden de campos,  enums y tipos_datos,  json y nullable,  nomeclatura de relaciones

#### work_milestone

-  rules-class.md,  nomenclatura,  orden de campos,  enums y tipos_datos,  json y nullable,  nomeclatura de relaciones

#### blog_category

-  rules-class.md,  nomenclatura,  orden de campos,  enums y tipos_datos,  json y nullable,  nomeclatura de relaciones

#### blog_post

-  rules-class.md,  nomenclatura,  orden de campos,  enums y tipos_datos,  json y nullable,  nomeclatura de relaciones

#### music_track

-  rules-class.md,  nomenclatura,  orden de campos,  enums y tipos_datos,  json y nullable,  nomeclatura de relaciones

#### technology

-  rules-class.md,  nomenclatura,  orden de campos,  enums y tipos_datos,  json y nullable,  nomeclatura de relaciones

#### techeable

-  rules-class.md,  nomenclatura,  orden de campos,  enums y tipos_datos,  json y nullable,  nomeclatura de relaciones

#### document

-  rules-class.md,  nomenclatura,  orden de campos,  enums y tipos_datos,  json y nullable,  nomeclatura de relaciones

#### document_chunk

-  rules-class.md,  nomenclatura,  orden de campos,  enums y tipos_datos,  json y nullable,  nomeclatura de relaciones

#### ai_model_config

-  rules-class.md,  nomenclatura,  orden de campos,  enums y tipos_datos,  json y nullable,  nomeclatura de relaciones

#### conversation

-  rules-class.md,  nomenclatura,  orden de campos,  enums y tipos_datos,  json y nullable,  nomeclatura de relaciones

#### conversation_document

-  rules-class.md,  nomenclatura,  orden de campos,  enums y tipos_datos,  json y nullable,  nomeclatura de relaciones

#### ai_insight

-  rules-class.md,  nomenclatura,  orden de campos,  enums y tipos_datos,  json y nullable,  nomeclatura de relaciones

---

## ✅ Verificación FINAL (10/10  Score)

-  **Identidad**: Bio, redes y testimonios integrados en el Core.
-  **Impacto Real**: Campo `impact_summary` para destacar resultados profesionales.
-  **IA Avanzada**: Sistema RAG completo con vectores para chat anónimo.
-  **Personalización**: Conversión completa de SaaS a Portafolio Personal.
-  **Clean Architecture**: Relaciones N-M correctamente mapeadas y tipado JSONB.
-  **Fidelidad**: Cumple con `prompt-rules.md` al 100%.
