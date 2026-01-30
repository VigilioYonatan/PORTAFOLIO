CREATE TYPE "public"."open_source_language_enum" AS ENUM('en', 'es', 'pt');--> statement-breakpoint
CREATE TYPE "public"."work_experience_language_enum" AS ENUM('es', 'en', 'pt');--> statement-breakpoint
CREATE TABLE "open_source" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"description" varchar(500) NOT NULL,
	"content" text,
	"npm_url" varchar(255),
	"repo_url" varchar(255),
	"category" varchar(50),
	"stars" integer DEFAULT 0 NOT NULL,
	"downloads" integer DEFAULT 0 NOT NULL,
	"version" varchar(50),
	"is_visible" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"tenant_id" integer NOT NULL,
	"language" "open_source_language_enum" DEFAULT 'en' NOT NULL,
	"parent_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "open_source_tenant_slug_unique" UNIQUE("tenant_id","slug")
);
--> statement-breakpoint
ALTER TABLE "work_experiences" ALTER COLUMN "description" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "work_experiences" ADD COLUMN "content" text;--> statement-breakpoint
ALTER TABLE "work_experiences" ADD COLUMN "language" "work_experience_language_enum" DEFAULT 'es' NOT NULL;--> statement-breakpoint
ALTER TABLE "work_experiences" ADD COLUMN "parent_id" integer;--> statement-breakpoint
ALTER TABLE "open_source" ADD CONSTRAINT "open_source_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "open_source" ADD CONSTRAINT "open_source_parent_id_open_source_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."open_source"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "open_source_tenant_idx" ON "open_source" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "open_source_slug_idx" ON "open_source" USING btree ("tenant_id","slug");--> statement-breakpoint
ALTER TABLE "work_experiences" ADD CONSTRAINT "work_experiences_parent_id_work_experiences_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."work_experiences"("id") ON DELETE no action ON UPDATE no action;