import { Module } from "@nestjs/common";
import { TestimonialCache } from "../cache/testimonial.cache";
import { TestimonialController } from "../controllers/testimonial.controller";
import { TestimonialRepository } from "../repositories/testimonial.repository";
import { TestimonialService } from "../services/testimonial.service";

@Module({
	controllers: [TestimonialController],
	providers: [TestimonialService, TestimonialRepository, TestimonialCache],
	exports: [TestimonialService, TestimonialRepository],
})
export class TestimonialModule {}
