import { z } from "@infrastructure/config/zod-i18n.config";
import { contactMessageSchema } from "@modules/contact/schemas/contact-message.schema";

export const contactStoreDto = contactMessageSchema.pick({
	name: true,
	email: true,
	message: true,

}).extend({
	phone_number: contactMessageSchema.shape.phone_number.optional(),
	subject: contactMessageSchema.shape.subject.optional(),
});

export type ContactStoreDto = z.infer<typeof contactStoreDto>;
