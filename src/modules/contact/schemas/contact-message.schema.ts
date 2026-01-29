import { z } from "@infrastructure/config/zod-i18n.config";
import { timeStampSchema } from "@infrastructure/schemas/time_stamp.schema";

export const contactMessageSchema = z.object({
	id: z.number().int().positive(),
	name: z.string().min(1).max(100),
	email: z.email().max(100),
	phone_number: z.string().max(50).nullable(), // Corrected name
	subject: z.string().max(200).nullable(),
	message: z.string().min(1).max(1000),
	ip_address: z.string().max(45).nullable(),
	is_read: z.boolean(),
	tenant_id: z.number().int().positive().nullable(), // Required FK
	deleted_at: z.date().nullable(), // Kept as it was present, likely soft delete
	...timeStampSchema.shape,
});

export type ContactMessageSchema = z.infer<typeof contactMessageSchema>;
