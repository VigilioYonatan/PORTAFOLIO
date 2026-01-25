import { createZodDto } from "nestjs-zod";
import { testimonialStoreDto } from "./testimonial.store.dto";

export class TestimonialStoreClassDto extends createZodDto(
	testimonialStoreDto,
) {}
