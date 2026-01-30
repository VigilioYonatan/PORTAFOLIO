import { z } from "@infrastructure/config/zod-i18n.config";
import { testimonialSchema } from "../schemas/testimonial.schema";

export const testimonialUpdateDto = testimonialSchema.omit({
	id: true,
	tenant_id: true,
	created_at: true,
	updated_at: true,
});

export type TestimonialUpdateDto = z.infer<typeof testimonialUpdateDto>;
