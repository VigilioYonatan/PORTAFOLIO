CREATE EXTENSION IF NOT EXISTS vector;
CREATE TYPE "public"."chat_role_enum" AS ENUM('USER', 'ASSISTANT', 'SYSTEM', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."chat_mode_enum" AS ENUM('AI', 'LIVE');--> statement-breakpoint
CREATE TYPE "public"."document_status_enum" AS ENUM('PENDING', 'PROCESSING', 'READY', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."notification_type_enum" AS ENUM('LIKE', 'COMMENT', 'CONTACT', 'SYSTEM');--> statement-breakpoint
CREATE TYPE "public"."default_language_enum" AS ENUM('ES', 'EN', 'PT');--> statement-breakpoint
CREATE TYPE "public"."time_zone_enum" AS ENUM('UTC', 'America/Lima', 'America/Bogota');--> statement-breakpoint
CREATE TYPE "public"."reaction_type_enum" AS ENUM('LIKE', 'LOVE', 'CLAP', 'FIRE');--> statement-breakpoint
CREATE TYPE "public"."technology_category_enum" AS ENUM('FRONTEND', 'BACKEND', 'DATABASE', 'DEVOPS', 'LANGUAGE');--> statement-breakpoint
CREATE TYPE "public"."language_enum" AS ENUM('ES', 'EN', 'PT');--> statement-breakpoint
CREATE TYPE "public"."timezone_enum" AS ENUM('UTC', 'America/Lima', 'America/New_York', 'America/Bogota', 'America/Mexico_City');--> statement-breakpoint
CREATE TYPE "public"."plan_enum" AS ENUM('FREE', 'BASIC', 'PRO', 'ENTERPRISE');--> statement-breakpoint
CREATE TYPE "public"."user_status_enum" AS ENUM('ACTIVE', 'BANNED', 'PENDING');--> statement-breakpoint
CREATE TABLE "ai_model_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"chat_model" text DEFAULT 'gpt-4o-mini' NOT NULL,
	"embedding_model" text DEFAULT 'text-embedding-3-small' NOT NULL,
	"embedding_dimensions" integer DEFAULT 1536 NOT NULL,
	"system_prompt" text,
	"temperature" numeric(3, 2) DEFAULT 0.7 NOT NULL,
	"max_tokens" integer DEFAULT 2000 NOT NULL,
	"chunk_size" integer DEFAULT 1000 NOT NULL,
	"chunk_overlap" integer DEFAULT 200 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"insights_data" jsonb NOT NULL,
	"model_id" integer,
	"generated_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"tenant_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_categories_tenant_slug_unique" UNIQUE("tenant_id","slug"),
	CONSTRAINT "blog_categories_tenant_name_unique" UNIQUE("tenant_id","name")
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"extract" varchar(500),
	"is_published" boolean DEFAULT false NOT NULL,
	"reading_time_minutes" integer,
	"cover" jsonb,
	"seo" jsonb,
	"published_at" timestamp with time zone,
	"category_id" integer,
	"author_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_tenant_slug_unique" UNIQUE("tenant_id","slug")
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"role" "chat_role_enum" DEFAULT 'USER' NOT NULL,
	"content" text NOT NULL,
	"sources" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"conversation_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_documents" (
	"conversation_id" integer NOT NULL,
	"document_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversation_documents_conversation_id_document_id_pk" PRIMARY KEY("conversation_id","document_id")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"ip_address" varchar(45) NOT NULL,
	"title" varchar(200) NOT NULL,
	"mode" "chat_mode_enum" DEFAULT 'AI' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"visitor_id" uuid NOT NULL,
	"tenant_id" integer NOT NULL,
	"user_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"name" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone_number" varchar(50),
	"subject" varchar(200),
	"message" text NOT NULL,
	"ip_address" varchar(45),
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "document_chunks" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1536),
	"chunk_index" integer NOT NULL,
	"token_count" integer NOT NULL,
	"document_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"chunk_count" integer DEFAULT 0 NOT NULL,
	"is_indexed" boolean DEFAULT false NOT NULL,
	"status" "document_status_enum" DEFAULT 'PENDING' NOT NULL,
	"file" jsonb NOT NULL,
	"metadata" jsonb,
	"processed_at" timestamp with time zone,
	"user_id" integer NOT NULL,
	"tenant_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music_tracks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"artist" varchar(100) NOT NULL,
	"duration_seconds" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"audio_file" jsonb NOT NULL,
	"cover" jsonb DEFAULT '[]'::jsonb,
	"tenant_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"type" "notification_type_enum" NOT NULL,
	"title" varchar(100) NOT NULL,
	"content" text NOT NULL,
	"link" varchar(500),
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"profile_title" varchar(200) NOT NULL,
	"biography" text NOT NULL,
	"email" varchar(100) NOT NULL,
	"phone" varchar(20),
	"address" text,
	"social_links" jsonb,
	"logo" jsonb,
	"color_primary" varchar(50) NOT NULL,
	"color_secondary" varchar(50) NOT NULL,
	"default_language" "default_language_enum" DEFAULT 'ES' NOT NULL,
	"time_zone" time_zone_enum,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "portfolio_config_tenant_unique" UNIQUE("tenant_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"description" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"impact_summary" text NOT NULL,
	"website_url" varchar(500),
	"repo_url" varchar(500),
	"github_stars" integer DEFAULT 0,
	"github_forks" integer DEFAULT 0,
	"languages_stats" jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'in_dev' NOT NULL,
	"images" jsonb,
	"seo" jsonb,
	"tenant_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_tenant_slug_unique" UNIQUE("tenant_id","slug")
);
--> statement-breakpoint
CREATE TABLE "social_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"surname" varchar(100) NOT NULL,
	"content" text NOT NULL,
	"commentable_id" integer NOT NULL,
	"commentable_type" varchar(50) NOT NULL,
	"visitor_id" varchar(50),
	"ip_address" varchar(45),
	"is_visible" boolean DEFAULT true NOT NULL,
	"user_id" integer,
	"reply" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"type" "reaction_type_enum" DEFAULT 'LIKE' NOT NULL,
	"reactable_id" integer NOT NULL,
	"reactable_type" varchar(50) NOT NULL,
	"visitor_id" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "techeables" (
	"id" serial PRIMARY KEY NOT NULL,
	"techeable_id" integer NOT NULL,
	"techeable_type" text NOT NULL,
	"technology_id" integer NOT NULL,
	"tenant_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_techeable_technology" UNIQUE("techeable_id","techeable_type","technology_id","tenant_id")
);
--> statement-breakpoint
CREATE TABLE "technologies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" "technology_category_enum" NOT NULL,
	"icon" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tenant_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "technologies_tenant_name_unique" UNIQUE("tenant_id","name")
);
--> statement-breakpoint
CREATE TABLE "tenant_setting" (
	"id" serial PRIMARY KEY NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"color_primary" varchar(50) DEFAULT '#000000' NOT NULL,
	"color_secondary" varchar(50) DEFAULT '#ffffff' NOT NULL,
	"default_language" "language_enum" DEFAULT 'ES' NOT NULL,
	"time_zone" timezone_enum DEFAULT 'UTC',
	"tenant_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_setting_tenant_id_unique" UNIQUE("tenant_id")
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"domain" varchar(100),
	"logo" jsonb,
	"email" varchar(100) NOT NULL,
	"phone" varchar(20),
	"address" text,
	"plan" "plan_enum" DEFAULT 'FREE' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"trial_ends_at" timestamp,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug"),
	CONSTRAINT "tenants_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_name" varchar(100) NOT NULL,
	"author_role" varchar(100) NOT NULL,
	"author_company" varchar(100),
	"content" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"avatar" jsonb,
	"tenant_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_quota" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"documents_count" integer DEFAULT 0 NOT NULL,
	"messages_count" integer DEFAULT 0 NOT NULL,
	"tokens_count" integer DEFAULT 0 NOT NULL,
	"storage_bytes" bigint DEFAULT 0 NOT NULL,
	"tenant_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usage_quota_tenant_year_month_unique" UNIQUE("tenant_id","year","month")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL,
	"phone_number" varchar(50),
	"password" varchar(200) NOT NULL,
	"google_id" varchar(100),
	"qr_code_token" varchar(100),
	"status" "user_status_enum" DEFAULT 'PENDING' NOT NULL,
	"security_stamp" uuid DEFAULT gen_random_uuid() NOT NULL,
	"failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"is_mfa_enabled" boolean DEFAULT false NOT NULL,
	"is_superuser" boolean DEFAULT false NOT NULL,
	"email_verified_at" timestamp,
	"lockout_end_at" timestamp,
	"mfa_secret" text,
	"last_ip_address" varchar(45),
	"last_login_at" timestamp with time zone,
	"avatar" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"role_id" integer NOT NULL,
	"tenant_id" integer NOT NULL,
	CONSTRAINT "user_email_tenant_unique" UNIQUE("tenant_id","email"),
	CONSTRAINT "user_qr_token_unique" UNIQUE("qr_code_token")
);
--> statement-breakpoint
CREATE TABLE "work_experiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"company" varchar(100) NOT NULL,
	"position" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"location" varchar(100),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"tenant_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" varchar(500) NOT NULL,
	"icon" varchar(100),
	"milestone_date" date NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"work_experience_id" integer NOT NULL,
	"tenant_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_model_config" ADD CONSTRAINT "ai_model_config_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_model_id_ai_model_config_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ai_model_config"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_categories" ADD CONSTRAINT "blog_categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_category_id_blog_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."blog_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_documents" ADD CONSTRAINT "conversation_documents_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_documents" ADD CONSTRAINT "conversation_documents_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_tracks" ADD CONSTRAINT "music_tracks_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_config" ADD CONSTRAINT "portfolio_config_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_comments" ADD CONSTRAINT "social_comments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_comments" ADD CONSTRAINT "social_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_reactions" ADD CONSTRAINT "social_reactions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "techeables" ADD CONSTRAINT "techeables_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "techeables" ADD CONSTRAINT "techeables_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technologies" ADD CONSTRAINT "technologies_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_setting" ADD CONSTRAINT "tenant_setting_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_quota" ADD CONSTRAINT "usage_quota_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_experiences" ADD CONSTRAINT "work_experiences_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_milestones" ADD CONSTRAINT "work_milestones_work_experience_id_work_experiences_id_fk" FOREIGN KEY ("work_experience_id") REFERENCES "public"."work_experiences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_milestones" ADD CONSTRAINT "work_milestones_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_model_config_tenant_idx" ON "ai_model_config" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ai_insights_tenant_idx" ON "ai_insights" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "blog_categories_tenant_idx" ON "blog_categories" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "blog_posts_tenant_idx" ON "blog_posts" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "blog_posts_category_idx" ON "blog_posts" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "blog_posts_author_idx" ON "blog_posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "chat_messages_conversation_idx" ON "chat_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "chat_messages_tenant_idx" ON "chat_messages" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "conversations_tenant_idx" ON "conversations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "conversations_visitor_idx" ON "conversations" USING btree ("visitor_id");--> statement-breakpoint
CREATE INDEX "conversations_user_idx" ON "conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "conversations_tenant_visitor_idx" ON "conversations" USING btree ("tenant_id","visitor_id");--> statement-breakpoint
CREATE INDEX "idx_contact_msgs_tenant" ON "contact_messages" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_contact_msgs_tenant_read" ON "contact_messages" USING btree ("tenant_id","is_read");--> statement-breakpoint
CREATE INDEX "document_chunks_document_idx" ON "document_chunks" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "documents_tenant_idx" ON "documents" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "documents_user_idx" ON "documents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "music_tracks_tenant_idx" ON "music_tracks" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "notifications_tenant_idx" ON "notifications" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "notifications_read_idx" ON "notifications" USING btree ("tenant_id","is_read");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "projects_tenant_idx" ON "projects" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "social_comments_commentable_idx" ON "social_comments" USING btree ("commentable_id","commentable_type");--> statement-breakpoint
CREATE INDEX "social_comments_tenant_idx" ON "social_comments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "social_comments_visitor_idx" ON "social_comments" USING btree ("visitor_id");--> statement-breakpoint
CREATE INDEX "social_reactions_reactable_idx" ON "social_reactions" USING btree ("reactable_id","reactable_type");--> statement-breakpoint
CREATE INDEX "social_reactions_tenant_idx" ON "social_reactions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "social_reactions_visitor_idx" ON "social_reactions" USING btree ("visitor_id");--> statement-breakpoint
CREATE INDEX "technologies_tenant_idx" ON "technologies" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_testimonials_visible_sort" ON "testimonials" USING btree ("is_visible","sort_order");--> statement-breakpoint
CREATE INDEX "idx_testimonials_tenant" ON "testimonials" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "usage_quota_tenant_idx" ON "usage_quota" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "work_experiences_tenant_idx" ON "work_experiences" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "work_milestones_tenant_idx" ON "work_milestones" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "work_milestones_experience_idx" ON "work_milestones" USING btree ("work_experience_id");