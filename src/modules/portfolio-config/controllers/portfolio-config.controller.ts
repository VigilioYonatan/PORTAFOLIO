import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
import { Public } from "@modules/auth/decorators/public.decorator";
import { Roles } from "@modules/auth/decorators/roles.decorator";
import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import {
	PortfolioConfigShowResponseClassDto,
	PortfolioConfigUpdateResponseClassDto,
} from "@modules/portfolio-config/dtos/portfolio-config.response.class.dto";
import { PortfolioConfigUpdateClassDto } from "@modules/portfolio-config/dtos/portfolio-config.update.class.dto";
import {
	type PortfolioConfigUpdateDto,
	portfolioConfigUpdateDto,
} from "@modules/portfolio-config/dtos/portfolio-config.update.dto";
import { PortfolioConfigService } from "@modules/portfolio-config/services/portfolio-config.service";
import {
	Body,
	Controller,
	Get,
	HttpCode,
	Put,
	Req,
	Res,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBody,
	ApiOperation,
	ApiProduces,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import type { Request, Response } from "express";

@ApiTags("Configuración del Portfolio")
@UseGuards(AuthenticatedGuard)
@Controller("config")
export class PortfolioConfigController {
	constructor(
		private readonly portfolioConfigService: PortfolioConfigService,
	) {}

	/**
	 * GET /config
	 * Obtiene la configuración global del sitio (identidad, branding y SEO para la landing)
	 *
	 * Referencia: rules-endpoints.md #1.1
	 * Rol: public
	 */
	@Public()
	@Get("/")
	@ApiOperation({
		summary: "Obtener configuración del portfolio",
		description:
			"Obtiene la configuración global del sitio (identidad, branding y SEO para la landing).",
	})
	@ApiResponse({
		status: 200,
		type: PortfolioConfigShowResponseClassDto,
		description: "Configuración del portfolio",
	})
	show(@Req() req: Request): Promise<PortfolioConfigShowResponseClassDto> {
		return this.portfolioConfigService.show(req.locals.tenant.id);
	}

	/**
	 * PUT /config
	 * Actualiza los datos de identidad y parámetros visuales del portfolio
	 *
	 * Referencia: rules-endpoints.md #1.2
	 * Rol: ADMIN (role_id = 1)
	 */
	@Roles(1) // ADMIN only
	@HttpCode(200)
	@Put("/")
	@ApiOperation({
		summary: "Actualizar configuración del portfolio",
		description:
			"Actualiza los datos de identidad y parámetros visuales del portfolio (Solo Admin).",
	})
	@ApiBody({ type: PortfolioConfigUpdateClassDto })
	@ApiResponse({
		status: 200,
		type: PortfolioConfigUpdateResponseClassDto,
		description: "Configuración actualizada",
	})
	update(
		@Req() req: Request,
		@Body(new ZodPipe(portfolioConfigUpdateDto)) body: PortfolioConfigUpdateDto,
	): Promise<PortfolioConfigUpdateResponseClassDto> {
		return this.portfolioConfigService.update(req.locals.tenant.id, body);
	}

	/**
	 * GET /config/cv/download
	 * Genera y descarga dinámicamente el CV en formato texto basado en la información actual de la DB
	 *
	 * Referencia: rules-endpoints.md #1.3
	 * Rol: public
	 * Cache: NO (siempre genera desde DB)
	 */
	@Public()
	@Get("/cv/download")
	@ApiOperation({
		summary: "Descargar CV",
		description:
			"Genera y descarga dinámicamente el CV basado en la información actual de la DB.",
	})
	@ApiProduces("text/plain")
	@ApiResponse({
		status: 200,
		description: "Archivo CV para descargar",
	})
	async downloadCv(@Req() req: Request, @Res() res: Response): Promise<void> {
		const { buffer, filename, contentType } =
			await this.portfolioConfigService.downloadCv(req.locals.tenant.id);

		res.set({
			"Content-Type": contentType,
			"Content-Disposition": `attachment; filename="${filename}"`,
			"Content-Length": buffer.length,
		});

		res.send(buffer);
	}
}
