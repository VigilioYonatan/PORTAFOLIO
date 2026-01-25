import { createZodDto } from "nestjs-zod";
import {
	testimonialDestroyResponseDto,
	testimonialIndexResponseDto,
	testimonialResponseDto,
	testimonialStoreResponseDto,
	testimonialUpdateResponseDto,
} from "./testimonial.response.dto";

export class TestimonialIndexResponseClassDto extends createZodDto(
	testimonialIndexResponseDto,
) {}
export class TestimonialStoreResponseClassDto extends createZodDto(
	testimonialStoreResponseDto,
) {}
export class TestimonialUpdateResponseClassDto extends createZodDto(
	testimonialUpdateResponseDto,
) {}
export class TestimonialDestroyResponseClassDto extends createZodDto(
	testimonialDestroyResponseDto,
) {}
export class TestimonialResponseClassDto extends createZodDto(
	testimonialResponseDto,
) {}
