import { z } from "@infrastructure/config/zod-i18n.config";
import { timeStampSchema } from "@infrastructure/schemas/time_stamp.schema";

export const chatMessageSchema = z.object({
	id: z.number().int().positive(), // Identificador único
	tenant_id: z.number().int().positive(), // ID del tenant (SaaS)
	role: z.enum(["USER", "ASSISTANT", "SYSTEM", "ADMIN"]), // Rol del mensaje
	content: z.string().min(1), // Contenido del mensaje (requerido)
	sources: z.array(z.record(z.string(), z.unknown())), // Sources de RAG
	is_read: z.boolean(), // Estado de lectura (requerido)
	conversation_id: z.number().int().positive(), // FK a la conversación
	...timeStampSchema.shape,
});

export type ChatMessageSchema = z.infer<typeof chatMessageSchema>;
