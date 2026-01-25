import { z } from "@infrastructure/config/zod-i18n.config";
import { contactMessageSchema } from "@modules/contact/schemas/contact-message.schema";

export const contactUpdateDto = contactMessageSchema.pick({
	is_read: true,
});

export type ContactUpdateDto = z.infer<typeof contactUpdateDto>;
