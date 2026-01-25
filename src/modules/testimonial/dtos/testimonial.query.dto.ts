import { z } from "@infrastructure/config/zod-i18n.config";
import { querySchema } from "@infrastructure/schemas/query.schema";
import { testimonialSchema } from "../schemas/testimonial.schema";

export const testimonialQueryDto = testimonialSchema
	.pick({
		is_visible: true,
	})
	.partial()
	.extend(querySchema.shape);

export type TestimonialQueryDto = z.infer<typeof testimonialQueryDto>;
