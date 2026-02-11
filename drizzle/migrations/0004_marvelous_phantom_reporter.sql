ALTER TABLE "techeables" DROP CONSTRAINT "techeables_technology_id_technologies_id_fk";
--> statement-breakpoint
ALTER TABLE "technologies" ALTER COLUMN "icon" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "techeables" ADD CONSTRAINT "techeables_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;