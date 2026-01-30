import { z } from "@infrastructure/config/zod-i18n.config";
import { timeStampSchema } from "@infrastructure/schemas/time_stamp.schema";

export const openSourceSchema = z.object({
	id: z.number().int().positive(),
	name: z.string().min(1).max(150),
	slug: z.string().min(1).max(200),
	description: z.string().min(1).max(500),
	content: z.string().nullable(),
	npm_url: z.url().max(255).nullable(),
	repo_url: z.url().max(255).nullable(),
	category: z.string().max(50).nullable(),
	stars: z.number().int().nonnegative(),
	downloads: z.number().int().nonnegative(),
	version: z.string().max(50).nullable(),
	is_visible: z.boolean(),
	sort_order: z.number().int(),
	tenant_id: z.number().int().positive(),
	language: z.enum(["en", "es", "pt"]),
	parent_id: z.number().int().positive().nullable(),
	...timeStampSchema.shape,
});

export type OpenSourceSchema = z.infer<typeof openSourceSchema>;
