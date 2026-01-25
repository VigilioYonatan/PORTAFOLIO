import { createZodDto } from "nestjs-zod";
import { testimonialQueryDto } from "./testimonial.query.dto";

export class TestimonialQueryClassDto extends createZodDto(
	testimonialQueryDto,
) {}
