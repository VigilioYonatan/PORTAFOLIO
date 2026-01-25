import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
import { Public } from "@modules/auth/decorators/public.decorator";
import { Roles } from "@modules/auth/decorators/roles.decorator";
import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
	Req,
	UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { TestimonialQueryClassDto } from "../dtos/testimonial.query.class.dto";
import {
	TestimonialDestroyResponseClassDto,
	TestimonialIndexResponseClassDto,
	TestimonialStoreResponseClassDto,
	TestimonialUpdateResponseClassDto,
} from "../dtos/testimonial.response.class.dto";
import type {
	TestimonialDestroyResponseDto,
	TestimonialIndexResponseDto,
	TestimonialStoreResponseDto,
	TestimonialUpdateResponseDto,
} from "../dtos/testimonial.response.dto";
import { TestimonialStoreClassDto } from "../dtos/testimonial.store.class.dto";
import {
	type TestimonialStoreDto,
	testimonialStoreDto,
} from "../dtos/testimonial.store.dto";
import { TestimonialUpdateClassDto } from "../dtos/testimonial.update.class.dto";
import {
	type TestimonialUpdateDto,
	testimonialUpdateDto,
} from "../dtos/testimonial.update.dto";
import { TestimonialService } from "../services/testimonial.service";

@ApiTags("Testimonios")
@UseGuards(AuthenticatedGuard)
@Controller("testimonials")
export class TestimonialController {
	constructor(private readonly testimonialService: TestimonialService) {}

	@Public()
	@Get("/")
	@ApiOperation({ summary: "Lista testimonios visibles" })
	@ApiResponse({
		status: 200,
		type: TestimonialIndexResponseClassDto,
		description: "Lista de testimonios visibles paginada",
	})
	index(
		@Req() req: Request,
		@Query() query: TestimonialQueryClassDto,
	): Promise<TestimonialIndexResponseDto> {
		const tenant_id = req.locals.tenant.id;
		return this.testimonialService.index(tenant_id, {
			...query,
			is_visible: true,
		});
	}

	@Roles(1, 3)
	@HttpCode(201)
	@Post("/")
	@ApiOperation({ summary: "Crear testimonio" })
	@ApiBody({ type: TestimonialStoreClassDto })
	@ApiResponse({
		status: 201,
		type: TestimonialStoreResponseClassDto,
		description: "Testimonio creado exitosamente",
	})
	store(
		@Req() req: Request,
		@Body(new ZodPipe(testimonialStoreDto)) body: TestimonialStoreDto,
	): Promise<TestimonialStoreResponseDto> {
		const tenant_id = req.locals.tenant.id;
		return this.testimonialService.store(tenant_id, body);
	}

	@Roles(1, 3)
	@Put("/:id")
	@ApiOperation({ summary: "Actualizar testimonio" })
	@ApiBody({ type: TestimonialUpdateClassDto })
	@ApiResponse({
		status: 200,
		type: TestimonialUpdateResponseClassDto,
		description: "Testimonio actualizado exitosamente",
	})
	update(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
		@Body(new ZodPipe(testimonialUpdateDto)) body: TestimonialUpdateDto,
	): Promise<TestimonialUpdateResponseDto> {
		const tenant_id = req.locals.tenant.id;
		return this.testimonialService.update(tenant_id, id, body);
	}

	@Roles(1, 3)
	@Delete("/:id")
	@ApiOperation({ summary: "Eliminar testimonio" })
	@ApiResponse({
		status: 200,
		type: TestimonialDestroyResponseClassDto,
		description: "Testimonio eliminado exitosamente",
	})
	destroy(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<TestimonialDestroyResponseDto> {
		const tenant_id = req.locals.tenant.id;
		return this.testimonialService.destroy(tenant_id, id);
	}
}
