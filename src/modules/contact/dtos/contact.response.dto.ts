import { z } from "@infrastructure/config/zod-i18n.config";
import { createPaginatorSchema } from "@infrastructure/schemas/paginator.schema";
import { contactMessageSchema } from "@modules/contact/schemas/contact-message.schema";

// --- Index / List ---
export const contactIndexResponseDto =
	createPaginatorSchema(contactMessageSchema);
export type ContactIndexResponseDto = z.infer<typeof contactIndexResponseDto>;

export const contactListResponseDto = contactIndexResponseDto; // Alias
export type ContactListResponseDto = ContactIndexResponseDto;

// --- Store ---
export const contactStoreResponseDto = z.object({
	success: z.literal(true),
	message: contactMessageSchema,
});
export type ContactStoreResponseDto = z.infer<typeof contactStoreResponseDto>;

// --- Update ---
export const contactUpdateResponseDto = z.object({
	success: z.literal(true),
	message: contactMessageSchema,
});
export type ContactUpdateResponseDto = z.infer<typeof contactUpdateResponseDto>;

// --- Destroy ---
export const contactDestroyResponseDto = z.object({
	success: z.literal(true),
	message: z.string(),
});
export type ContactDestroyResponseDto = z.infer<
	typeof contactDestroyResponseDto
>;

// --- Generic ---
export const contactResponseDto = z.object({
	success: z.literal(true),
	message: contactMessageSchema,
});
export type ContactResponseDto = z.infer<typeof contactResponseDto>;
