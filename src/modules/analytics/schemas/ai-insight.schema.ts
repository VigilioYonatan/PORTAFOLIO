import { z } from "@infrastructure/config/zod-i18n.config";
import { timeStampSchema } from "@infrastructure/schemas/time_stamp.schema";

export const aiInsightSchema = z
	.object({
		id: z.number().int().positive(), // identificador único
		tenant_id: z.number().int().positive(), // ID del tenant
		insights_data: z.object({
			themes: z.array(z.string()), // temas clave
			sentiment: z.string(), // sentimiento general
			actions: z.array(z.string()), // acciones recomendadas
		}),
		model_id: z.number().int().positive().nullable(), // ID del modelo AI usado
		generated_at: z.date().nullable(), // fecha de generación
		...timeStampSchema.shape,
	})

export type AiInsightSchema = z.infer<typeof aiInsightSchema>;
