import { z } from "@infrastructure/config/zod-i18n.config";
import { seoMetadataSchema } from "@infrastructure/schemas/seo.schema";
import {
	customDateSchema,
	timeStampSchema,
} from "@infrastructure/schemas/time_stamp.schema";
import { UPLOAD_CONFIG } from "@modules/uploads/const/upload.const";
import { filesSchema } from "@modules/uploads/schemas/upload.schema";

export const blogPostSchema = z
	.object({
		id: z.number().int().positive(),
		tenant_id: z.number().int().positive(),
		title: z.string().min(1).max(200),
		slug: z.string().min(1).max(200),
		content: z.string().min(1),
		extract: z.string().max(500).nullable(),
		is_published: z.boolean(),
		reading_time_minutes: z.number().int().positive().nullable(),
		cover: z
			.array(filesSchema(UPLOAD_CONFIG.blog_post!.cover!.dimensions))
			.nullable(),
		seo: seoMetadataSchema.nullable(),
		published_at: customDateSchema.nullable(), // Fixed: Use customDateSchema
		category_id: z.number().int().positive().nullable(),
		author_id: z.number().int().positive(),
		...timeStampSchema.shape,
	})
	.strict();

export type BlogPostSchema = z.infer<typeof blogPostSchema>;
