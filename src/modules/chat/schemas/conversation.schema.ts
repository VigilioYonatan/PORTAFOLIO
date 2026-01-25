import { z } from "@infrastructure/config/zod-i18n.config";
import { timeStampSchema } from "@infrastructure/schemas/time_stamp.schema";

export const conversationSchema = z
	.object({
		id: z.number().int().positive(), // Identificador único
		ip_address: z.string().max(45), // Dirección IP del visitante (IPv6 compatible)
		title: z.string().min(1).max(200), // Título de la conversación (requerido)
		mode: z.enum(["AI", "LIVE"]), // Modo: AI = chatbot, LIVE = admin responde
		is_active: z.boolean(), // Estado: true = conversación activa
		visitor_id: z.uuid(), // UUID único del visitante (persistencia en browser)
		tenant_id: z.number().int().positive(), // ID del tenant (SaaS)
		user_id: z.number().int().positive().nullable(), // FK al admin que responde (opcional)
		...timeStampSchema.shape,
	})
	.strict();

export type ConversationSchema = z.infer<typeof conversationSchema>;
