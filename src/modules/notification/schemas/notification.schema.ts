import { z } from "@infrastructure/config/zod-i18n.config";
import { timeStampSchema } from "@infrastructure/schemas/time_stamp.schema";

export const notificationSchema = z
	.object({
		id: z.number().int().positive(), // Identificador único
		tenant_id: z.number().int().positive(), // ID del tenant
		user_id: z.number().int().positive(), // ID del admin al que pertenece la alerta (requerido)
		type: z.enum(["LIKE", "COMMENT", "CONTACT", "SYSTEM"]), // Tipo de alerta
		title: z.string().min(1).max(100), // Título de la notificación
		content: z.string().min(1).max(500), // Breve resumen o contenido
		link: z.string().max(500).nullable(), // Enlace directo a la acción relacionada (opcional)
		is_read: z.boolean(), // Estado de lectura
		...timeStampSchema.shape, // created_at, updated_at
	})
	.strict();

export type NotificationSchema = z.infer<typeof notificationSchema>;
