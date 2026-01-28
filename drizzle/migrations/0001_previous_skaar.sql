CREATE TYPE "public"."blog_post_language_enum" AS ENUM('en', 'es', 'pt');--> statement-breakpoint
CREATE TYPE "public"."project_language_enum" AS ENUM('en', 'es', 'pt');--> statement-breakpoint
CREATE TYPE "public"."project_status_enum" AS ENUM('live', 'in_dev', 'archived');--> statement-breakpoint
CREATE TYPE "public"."commentable_type_enum" AS ENUM('PORTFOLIO_PROJECT', 'BLOG_POST');--> statement-breakpoint
CREATE TYPE "public"."reactable_type_enum" AS ENUM('PORTFOLIO_PROJECT', 'BLOG_POST', 'SOCIAL_COMMENT', 'MUSIC_TRACK');--> statement-breakpoint
CREATE TYPE "public"."techeable_type_enum" AS ENUM('PORTFOLIO_PROJECT', 'BLOG_POST');--> statement-breakpoint
ALTER TYPE "public"."technology_category_enum" ADD VALUE 'MOBILE';--> statement-breakpoint
ALTER TYPE "public"."technology_category_enum" ADD VALUE 'AI';--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'in_dev'::"public"."project_status_enum";--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "status" SET DATA TYPE "public"."project_status_enum" USING "status"::"public"."project_status_enum";--> statement-breakpoint
ALTER TABLE "social_comments" ALTER COLUMN "commentable_type" SET DATA TYPE "public"."commentable_type_enum" USING "commentable_type"::"public"."commentable_type_enum";--> statement-breakpoint
ALTER TABLE "social_reactions" ALTER COLUMN "reactable_type" SET DATA TYPE "public"."reactable_type_enum" USING "reactable_type"::"public"."reactable_type_enum";--> statement-breakpoint
ALTER TABLE "techeables" ALTER COLUMN "techeable_type" SET DATA TYPE "public"."techeable_type_enum" USING "techeable_type"::"public"."techeable_type_enum";--> statement-breakpoint
ALTER TABLE "techeables" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "techeables" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "techeables" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "techeables" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "language" "blog_post_language_enum" DEFAULT 'es' NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "parent_id" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "language" "project_language_enum" DEFAULT 'es' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "parent_id" integer;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_parent_id_blog_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;