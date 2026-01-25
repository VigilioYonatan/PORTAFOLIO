import { z } from "@infrastructure/config/zod-i18n.config";
import { testimonialSchema } from "../schemas/testimonial.schema";

export const testimonialStoreDto = testimonialSchema.omit({
	id: true,
	created_at: true,
	updated_at: true,
});

export type TestimonialStoreDto = z.infer<typeof testimonialStoreDto>;
