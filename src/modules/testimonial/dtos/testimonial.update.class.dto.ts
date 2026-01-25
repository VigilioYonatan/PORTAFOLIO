import { createZodDto } from "nestjs-zod";
import { testimonialUpdateDto } from "./testimonial.update.dto";

export class TestimonialUpdateClassDto extends createZodDto(
	testimonialUpdateDto,
) {}
