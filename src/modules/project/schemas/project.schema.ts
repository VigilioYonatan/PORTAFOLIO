import { LANGUAGES } from "@infrastructure/types/i18n";
import { z } from "@infrastructure/config/zod-i18n.config";
import { seoMetadataSchema } from "@infrastructure/schemas/seo.schema";
import {
	customDateSchema,
	timeStampSchema,
} from "@infrastructure/schemas/time_stamp.schema";
import { UPLOAD_CONFIG } from "@modules/uploads/const/upload.const";
import { filesSchema } from "@modules/uploads/schemas/upload.schema";
import type { TecheableSchema } from "@modules/techeable/schemas/techeable.schema";

import { PROJECT_STATUS_ENUM } from "../const/project.const";
import { defaultLang } from "@src/i18n/ui";

export const projectSchema = z
	.object({
		id: z.number().int().positive(),
		title: z.string().min(1).max(200),
		slug: z.string().min(1).max(200),
		description: z.string().min(1).max(500),
		content: z.string().min(1), // Markdown content
		impact_summary: z.string().min(1), // Senior Results
		website_url: z.url().max(500).nullable(),
		repo_url: z.url().max(500).nullable(),
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
		status: z.enum(PROJECT_STATUS_ENUM),
		images: z
			.array(filesSchema(UPLOAD_CONFIG.project.images!.dimensions))
			.nullable(), // JSONB: Project screenshots/images (Multiple)
		videos: z
			.array(filesSchema())
			.nullable(), // JSONB: Project demo videos (Multiple)
		start_date: customDateSchema,
		end_date: customDateSchema.nullable(),
		seo: seoMetadataSchema.nullable(),
		tenant_id: z.number().int().positive(),
		language: z.enum(LANGUAGES).default(defaultLang),
		parent_id: z.number().int().positive().nullable(),
		...timeStampSchema.shape,
	})


import type { TechnologySchema } from "@modules/technology/schemas/technology.schema";

export type ProjectSchema = z.infer<typeof projectSchema>;
export type ProjectWithRelations = ProjectSchema & {
	techeables: (TecheableSchema & { technology: TechnologySchema })[];
};
