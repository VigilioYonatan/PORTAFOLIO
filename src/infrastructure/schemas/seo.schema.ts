import { z } from "@infrastructure/config/zod-i18n.config";
import { filesSchema } from "@modules/uploads/schemas/upload.schema";

export const seoMetadataSchema = z
	.object({
		title: z.string().max(200).nullable(),
		description: z.string().max(500).nullable(),
		keywords: z.array(z.string()).nullable(),
		og_image: z.array(filesSchema()).nullable(),
	})

export type SeoMetadataSchema = z.infer<typeof seoMetadataSchema>;
