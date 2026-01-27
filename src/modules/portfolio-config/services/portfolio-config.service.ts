import { PortfolioConfigCache } from "@modules/portfolio-config/cache/portfolio-config.cache";
import type { PortfolioConfigUpdateDto } from "@modules/portfolio-config/dtos/portfolio-config.update.dto";
import { PortfolioConfigRepository } from "@modules/portfolio-config/repositories/portfolio-config.repository";
import type { PortfolioConfigShowSchema } from "@modules/portfolio-config/schemas/portfolio-config.schema";
import type { ProjectSchema } from "@modules/project/schemas/project.schema";
import { ProjectService } from "@modules/project/services/project.service";
import type { WorkExperienceSchema } from "@modules/work-experience/schemas/work-experience.schema";
import { WorkExperienceService } from "@modules/work-experience/services/work-experience.service";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import type {
	PortfolioConfigShowResponseDto,
	PortfolioConfigUpdateResponseDto,
	PortfolioConfigCvResultDto,
} from "../dtos/portfolio-config.response.dto";

@Injectable()
export class PortfolioConfigService {
	private readonly logger = new Logger(PortfolioConfigService.name);

	constructor(
		private readonly portfolioConfigRepository: PortfolioConfigRepository,
		private readonly portfolioConfigCache: PortfolioConfigCache,
		private readonly workExperienceService: WorkExperienceService,
		private readonly projectService: ProjectService,
	) {}

	/**
	 * Obtiene la configuración global del portfolio
	 * Estrategia: Cache-first con fallback a DB
	 *
	 * @param tenant_id ID del tenant
	 * @returns Configuración del portfolio
	 * @throws NotFoundException si no existe configuración
	 */
	async show(tenant_id: number): Promise<PortfolioConfigShowResponseDto> {
		this.logger.log({ tenant_id }, "Fetching portfolio configuration");

		// 1. Try Cache
		let config = await this.portfolioConfigCache.get(tenant_id);

		if (!config) {
			// 2. Try DB
			config = await this.portfolioConfigRepository.show(tenant_id);

			if (!config) {
				this.logger.warn({ tenant_id }, "Portfolio configuration not found");
				throw new NotFoundException("Portfolio configuration not found");
			}

			// 3. Set Cache
			await this.portfolioConfigCache.set(tenant_id, config);
		}

		return { success: true, config };
	}

	/**
	 * Actualiza la configuración global del portfolio
	 * Invalida el cache tras la actualización
	 *
	 * @param tenant_id ID del tenant
	 * @param body Datos a actualizar
	 * @returns Configuración actualizada
	 */
	async update(
		tenant_id: number,
		body: PortfolioConfigUpdateDto,
	): Promise<PortfolioConfigUpdateResponseDto> {
		this.logger.log({ tenant_id }, "Updating portfolio configuration");

		const config = await this.portfolioConfigRepository.update(tenant_id, body);

		// Invalidate cache
		await this.portfolioConfigCache.invalidate(tenant_id);

		return { success: true, config };
	}

	/**
	 * Genera y retorna el CV en formato texto/PDF
	 * NO usa cache según rules-endpoints.md
	 *
	 * @param tenant_id ID del tenant
	 * @returns Buffer con contenido del CV y metadatos
	 * @throws NotFoundException si no existe configuración
	 */
	async downloadCv(tenant_id: number): Promise<PortfolioConfigCvResultDto> {
		this.logger.log({ tenant_id }, "Generating CV for download");

		// 1. Fetch all data in parallel
		const [config, experienceRes, projectsRes] = await Promise.all([
			this.portfolioConfigRepository.show(tenant_id),
			this.workExperienceService.index(tenant_id, {
				limit: 100,
				is_visible: true,
			}),
			this.projectService.index(tenant_id, {
				limit: 100,
				is_visible: true,
			}),
		]);

		if (!config) {
			this.logger.warn({ tenant_id }, "Portfolio config not found");
			throw new NotFoundException("Portfolio configuration not found");
		}

		// 2. Format content
		const experiences = experienceRes.results;
		const projects = projectsRes.results;

		const cvContent = this.generateCvContent(config, experiences, projects);

		const buffer = Buffer.from(cvContent, "utf-8");
		const filename = `cv-${config.name.toLowerCase().replace(/\s+/g, "-")}.txt`;

		return {
			buffer,
			filename,
			contentType: "text/plain; charset=utf-8",
		};
	}

	/**
	 * Genera el contenido del CV en formato texto
	 */
	private generateCvContent(
		config: PortfolioConfigShowSchema,
		experiences: WorkExperienceSchema[],
		projects: ProjectSchema[],
	): string {
		const sections: string[] = [];

		// Header
		sections.push("=".repeat(60));
		sections.push(`         ${config.name.toUpperCase()}`);
		sections.push(`         ${config.profile_title}`);
		sections.push("=".repeat(60));
		sections.push("");

		// Contact
		sections.push("[ CONTACTO ]");
		sections.push(`Email:     ${config.email}`);
		if (config.phone) sections.push(`Teléfono:  ${config.phone}`);
		if (config.address) sections.push(`Dirección: ${config.address}`);

		if (config.social_links) {
			if (config.social_links.linkedin)
				sections.push(`LinkedIn:  ${config.social_links.linkedin}`);
			if (config.social_links.github)
				sections.push(`GitHub:    ${config.social_links.github}`);
		}
		sections.push("");

		// Bio
		sections.push("[ PERFIL PROFESIONAL ]");
		sections.push(
			config.biography
				.replace(/^#+\s*/gm, "")
				.replace(/\*\*/g, "")
				.replace(/\*/g, "")
				.replace(/`/g, ""),
		);
		sections.push("");

		// Experience
		if (experiences.length > 0) {
			sections.push("[ EXPERIENCIA LABORAL ]");
			for (const exp of experiences) {
				const startDateObj = new Date(exp.start_date);
				const start = !Number.isNaN(startDateObj.getTime())
					? startDateObj.toLocaleDateString("es-ES", {
							year: "numeric",
							month: "long",
						})
					: "N/A";

				let end = "";
				if (exp.is_current) {
					end = "Actualidad";
				} else if (exp.end_date) {
					const endDateObj = new Date(exp.end_date);
					end = !Number.isNaN(endDateObj.getTime())
						? endDateObj.toLocaleDateString("es-ES", {
								year: "numeric",
								month: "long",
							})
						: "N/A";
				}
				sections.push(`${exp.company} | ${exp.position}`);
				sections.push(`Periodo: ${start} - ${end}`);
				sections.push(exp.description);
				sections.push("-".repeat(30));
			}
			sections.push("");
		}

		// Projects
		if (projects.length > 0) {
			sections.push("[ PROYECTOS DESTACADOS ]");
			for (const project of projects) {
				sections.push(`${project.title.toUpperCase()}`);
				sections.push(project.description);
				if (project.website_url) sections.push(`URL: ${project.website_url}`);
				if (project.impact_summary) {
					sections.push(`Impacto: ${project.impact_summary}`);
				}
				sections.push("-".repeat(30));
			}
			sections.push("");
		}

		// Footer
		sections.push("=".repeat(60));
		sections.push(`Generado automáticamente - ${new Date().toISOString()}`);
		sections.push("=".repeat(60));

		return sections.join("\n");
	}
}
