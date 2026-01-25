import { z } from "@infrastructure/config/zod-i18n.config";
import { timeStampSchema } from "@infrastructure/schemas/time_stamp.schema";

export const socialReactionSchema = z
	.object({
		id: z.number().int().positive(), // Identificador único
		type: z.enum(["LIKE", "LOVE", "CLAP", "FIRE"]).default("LIKE"), // Tipo de reacción, requerido
		reactable_id: z.number().int().positive(), // Identificador de la entidad reaccionada
		reactable_type: z.enum([
			"PORTFOLIO_PROJECT",
			"BLOG_POST",
			"SOCIAL_COMMENT",
			"MUSIC_TRACK",
		]), // Tipo de entidad reaccionada
		visitor_id: z.string().uuid(), // Identificador único del visitante (requerido)
		tenant_id: z.number().int().positive(), // ID del tenant
		...timeStampSchema.shape, // created_at, updated_at
	})
	.strict();

export type SocialReactionSchema = z.infer<typeof socialReactionSchema>;
