ALTER TABLE "projects" ALTER COLUMN "start_date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "end_date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "technologies" ALTER COLUMN "icon" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "work_experiences" ALTER COLUMN "start_date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "work_experiences" ALTER COLUMN "end_date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "work_milestones" ALTER COLUMN "milestone_date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "status" text DEFAULT 'in_dev' NOT NULL;