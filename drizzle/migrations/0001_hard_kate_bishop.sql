ALTER TYPE "public"."timezone_enum" ADD VALUE 'America/Bogota';--> statement-breakpoint
ALTER TYPE "public"."timezone_enum" ADD VALUE 'America/Mexico_City';--> statement-breakpoint
ALTER TABLE "techeables" DROP CONSTRAINT "techeables_tenant_unique";--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."notification_type_enum";--> statement-breakpoint
CREATE TYPE "public"."notification_type_enum" AS ENUM('LIKE', 'COMMENT', 'CONTACT', 'SYSTEM');--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "type" SET DATA TYPE "public"."notification_type_enum" USING "type"::"public"."notification_type_enum";--> statement-breakpoint
ALTER TABLE "social_reactions" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "social_reactions" ALTER COLUMN "type" SET DEFAULT 'LIKE'::text;--> statement-breakpoint
DROP TYPE "public"."reaction_type_enum";--> statement-breakpoint
CREATE TYPE "public"."reaction_type_enum" AS ENUM('LIKE', 'LOVE', 'CLAP', 'FIRE');--> statement-breakpoint
ALTER TABLE "social_reactions" ALTER COLUMN "type" SET DEFAULT 'LIKE'::"public"."reaction_type_enum";--> statement-breakpoint
ALTER TABLE "social_reactions" ALTER COLUMN "type" SET DATA TYPE "public"."reaction_type_enum" USING "type"::"public"."reaction_type_enum";--> statement-breakpoint
DROP INDEX "techeables_tenant_idx";--> statement-breakpoint
DROP INDEX "techeables_techeable_idx";--> statement-breakpoint
DROP INDEX "techeables_technology_idx";--> statement-breakpoint
ALTER TABLE "music_tracks" ALTER COLUMN "cover" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "title" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "techeables" ALTER COLUMN "techeable_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "techeables" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "techeables" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "techeables" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "techeables" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "chat_messages" ADD COLUMN "tenant_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "contact_messages" ADD COLUMN "phone_number" varchar(50);--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "link" varchar(500);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "seo" jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "start_date" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "end_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "social_comments" ADD COLUMN "visitor_id" varchar(50);--> statement-breakpoint
ALTER TABLE "social_comments" ADD COLUMN "ip_address" varchar(45);--> statement-breakpoint
ALTER TABLE "social_comments" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_comments" ADD CONSTRAINT "social_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_messages_tenant_idx" ON "chat_messages" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "social_comments_visitor_idx" ON "social_comments" USING btree ("visitor_id");--> statement-breakpoint
CREATE INDEX "social_reactions_visitor_idx" ON "social_reactions" USING btree ("visitor_id");--> statement-breakpoint
ALTER TABLE "contact_messages" DROP COLUMN "phone";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "data";--> statement-breakpoint
ALTER TABLE "techeables" ADD CONSTRAINT "unique_techeable_technology" UNIQUE("techeable_id","techeable_type","technology_id","tenant_id");