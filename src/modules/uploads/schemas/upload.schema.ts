import { z } from "@infrastructure/config/zod-i18n.config";
import { customDateSchema } from "@infrastructure/schemas/time_stamp.schema";
export function filesSchema(dimensions?: number[]) {
	return z.object({
		dimension: z
			.number()
			.refine((input) => !dimensions || dimensions.includes(input), {
				message: "Dimension Incorrecta",
			})
			.optional(),
		key: z.string(),
		name: z.string(),
		original_name: z.string(),
		size: z.number(),
		mimetype: z.string(),
		created_at: customDateSchema.optional(),
	});
}

export type FilesSchema = z.infer<ReturnType<typeof filesSchema>>;
