import { z } from "@infrastructure/config/zod-i18n.config";
import { timeStampSchema } from "@infrastructure/schemas/time_stamp.schema";

export const socialCommentSchema = z.object({
	id: z.number().int().positive(), // Identificador único
	name: z.string().min(1).max(100), // Nombre del autor
	surname: z.string().min(1).max(100), // Apellido del autor
	content: z.string().min(1).max(1000), // Contenido del comentario (requerido)
	commentable_id: z.number().int().positive(), // Identificador de la entidad relacionada
	commentable_type: z.enum(["PORTFOLIO_PROJECT", "BLOG_POST"]), // Tipo de entidad relacionada
	visitor_id: z.uuid().nullable(), // Identificador del visitante (opcional)
	ip_address: z.string().max(45).nullable(), // Dirección IP del visitante (opcional)
	is_visible: z.boolean(), // ¿Es visible en el sitio?
	tenant_id: z.number().int().positive(), // ID del tenant
	user_id: z.number().int().positive().nullable(), // ID del admin que responde (opcional)
	reply: z.string().nullable(), // Respuesta del administrador (opcional)
	...timeStampSchema.shape, // created_at, updated_at
});

export type SocialCommentSchema = z.infer<typeof socialCommentSchema>;
