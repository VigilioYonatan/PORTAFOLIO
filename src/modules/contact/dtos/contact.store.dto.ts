import { z } from "@infrastructure/config/zod-i18n.config";
import { contactMessageSchema } from "@modules/contact/schemas/contact-message.schema";

export const contactStoreDto = contactMessageSchema.pick({
	name: true,
	email: true,
	message: true,
	phone_number: true,
	subject: true,
});

export type ContactStoreDto = z.infer<typeof contactStoreDto>;
