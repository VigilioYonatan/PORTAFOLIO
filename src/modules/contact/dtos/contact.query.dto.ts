import { z } from "@infrastructure/config/zod-i18n.config";
import { querySchema } from "@infrastructure/schemas/query.schema";
import { contactMessageSchema } from "@modules/contact/schemas/contact-message.schema";

export const contactQueryDto = contactMessageSchema
	.pick({
		is_read: true,
	})
	.partial()
	.extend(querySchema.shape);

export type ContactQueryDto = z.infer<typeof contactQueryDto>;
