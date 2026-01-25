import { z } from "@infrastructure/config/zod-i18n.config";
import { createPaginatorSchema } from "@infrastructure/schemas/paginator.schema";
import { testimonialSchema } from "../schemas/testimonial.schema";

// --- Index / List ---
export const testimonialIndexResponseDto =
	createPaginatorSchema(testimonialSchema);
export type TestimonialIndexResponseDto = z.infer<
	typeof testimonialIndexResponseDto
>;

// --- Store ---
export const testimonialStoreResponseDto = z.object({
	success: z.literal(true),
	testimonial: testimonialSchema,
});
export type TestimonialStoreResponseDto = z.infer<
	typeof testimonialStoreResponseDto
>;

// --- Update ---
export const testimonialUpdateResponseDto = z.object({
	success: z.literal(true),
	testimonial: testimonialSchema,
});
export type TestimonialUpdateResponseDto = z.infer<
	typeof testimonialUpdateResponseDto
>;

// --- Destroy ---
export const testimonialDestroyResponseDto = z.object({
	success: z.literal(true),
	message: z.string(),
});
export type TestimonialDestroyResponseDto = z.infer<
	typeof testimonialDestroyResponseDto
>;

// --- Generic ---
export const testimonialResponseDto = z.object({
	success: z.literal(true),
	testimonial: testimonialSchema,
});
export type TestimonialResponseDto = z.infer<typeof testimonialResponseDto>;
