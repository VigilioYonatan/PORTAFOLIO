import { z } from "@infrastructure/config/zod-i18n.config";
import { seoMetadataSchema } from "@infrastructure/schemas/seo.schema";
import {
	customDateSchema,
	timeStampSchema,
} from "@infrastructure/schemas/time_stamp.schema";
import { UPLOAD_CONFIG } from "@modules/uploads/const/upload.const";
import { filesSchema } from "@modules/uploads/schemas/upload.schema";

export const projectSchema = z
	.object({
		id: z.number().int().positive(),
		title: z.string().min(1).max(200),
		slug: z.string().min(1).max(200),
		description: z.string().min(1).max(500),
		content: z.string().min(1), // Markdown content
		impact_summary: z.string().min(1), // Senior Results
		website_url: z.string().url().max(500).nullable(),
		repo_url: z.string().url().max(500).nullable(),
		github_stars: z.number().int().nonnegative().nullable(), // Read-only from GitHub
		github_forks: z.number().int().nonnegative().nullable(), // Read-only from GitHub
		languages_stats: z
			.array(
				z.object({
					name: z.string(),
					percent: z.number(),
				}),
			)
			.nullable(), // Fixed: Array of objects {name, percent}
		sort_order: z.number().int(),
		is_featured: z.boolean(),
		is_visible: z.boolean(),
		status: z.enum(["live", "in_dev", "archived"]),
		images: z.array(filesSchema(UPLOAD_CONFIG.project.images!.dimensions)).nullable(), // JSONB: Project screenshots/images
		start_date: customDateSchema,
		end_date: customDateSchema.nullable(),
		seo: seoMetadataSchema.nullable(),
		techeables: z
			.array(z.object({ id: z.number(), technology_id: z.number() }))
			.optional(),
		tenant_id: z.number().int().positive(),
		...timeStampSchema.shape,
	})
	.strict();

export type ProjectSchema = z.infer<typeof projectSchema>;
