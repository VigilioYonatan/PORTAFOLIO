import { z } from "@infrastructure/config/zod-i18n.config";
import { timeStampSchema } from "@infrastructure/schemas/time_stamp.schema";
import { UPLOAD_CONFIG } from "@modules/uploads/const/upload.const";
import { filesSchema } from "@modules/uploads/schemas/upload.schema";

export const testimonialSchema = z
	.object({
		id: z.number().int().positive(), // identificador único
		author_name: z.string().min(1).max(100), // nombre del autor
		author_role: z.string().min(1).max(100), // rol/cargo del autor
		author_company: z.string().max(100).nullable(), // empresa del autor
		content: z.string().min(1), // contenido del testimonio
		sort_order: z.number().int(), // orden de aparición
		is_visible: z.boolean(), // visibilidad pública
		avatar: z
			.array(filesSchema(UPLOAD_CONFIG.testimonial.avatar!.dimensions))
			.nullable(), // avatar del autor
		tenant_id: z.number().int().positive(),
		...timeStampSchema.shape,
	})
	.strict();

export type TestimonialSchema = z.infer<typeof testimonialSchema>;
