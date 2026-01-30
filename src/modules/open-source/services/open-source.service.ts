import { slugify } from "@infrastructure/utils/hybrid/slug.utils";
import { paginator } from "@infrastructure/utils/server";
import { AI_TECHNICAL_PROTECTION } from "@modules/ai/const/ai-prompts.const";
import { AiService } from "@modules/ai/services/ai.service";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { Lang } from "@src/i18n";
import type { OpenSourceQueryDto } from "../dtos/open-source.query.dto";
import type {
	OpenSourceDestroyResponseDto,
	OpenSourceIndexResponseDto,
	OpenSourceShowResponseDto,
	OpenSourceStoreResponseDto,
	OpenSourceUpdateResponseDto,
} from "../dtos/open-source.response.dto";
import type { OpenSourceStoreDto } from "../dtos/open-source.store.dto";
import type { OpenSourceUpdateDto } from "../dtos/open-source.update.dto";
import { OpenSourceRepository } from "../repositories/open-source.repository";
import type { OpenSourceSchema } from "../schemas/open-source.schema";

@Injectable()
export class OpenSourceService {
	private readonly logger = new Logger(OpenSourceService.name);

	constructor(
		private readonly openSourceRepository: OpenSourceRepository,
		private readonly aiService: AiService,
	) {}

	async index(
		tenant_id: number,
		query?: OpenSourceQueryDto,
	): Promise<OpenSourceIndexResponseDto> {
		return await paginator<OpenSourceQueryDto, OpenSourceSchema>(
			"/opensource",
			{
				filters: query,
				cb: async (filters) => {
					return await this.openSourceRepository.index(tenant_id, filters);
				},
			},
		);
	}

	async show(
		tenant_id: number,
		id: number,
	): Promise<OpenSourceShowResponseDto> {
		const result = await this.openSourceRepository.show(tenant_id, id);
		if (!result) {
			throw new NotFoundException(`Open Source project #${id} not found`);
		}
		return { success: true, open_source: result };
	}

	async showBySlug(
		tenant_id: number,
		slug: string,
		language?: Lang,
	): Promise<OpenSourceShowResponseDto> {
		const result = await this.openSourceRepository.showBySlug(
			tenant_id,
			slug,
			language,
		);
		if (!result) {
			throw new NotFoundException(`Open Source project "${slug}" not found`);
		}
		return { success: true, open_source: result };
	}

	async store(
		tenant_id: number,
		body: OpenSourceStoreDto,
	): Promise<OpenSourceStoreResponseDto> {
		this.logger.log({ tenant_id }, "Creating open source project");
		const slug = slugify(body.name);

		const result = await this.openSourceRepository.store(tenant_id, {
			...body,
			slug,
			language: "es",
			parent_id: null,
		});

		// Auto-translate (original is always Spanish)
		this.generateTranslations(tenant_id, result).catch((err) =>
			this.logger.error("Error generating translations", err),
		);

		return { success: true, open_source: result };
	}

	private async generateTranslations(
		tenant_id: number,
		originalProject: OpenSourceSchema,
	) {
		const targetLanguages = ["en", "pt"];

		const translations = await Promise.all(
			targetLanguages.map(async (lang) => {
				try {
					const prompt = `
					Translate the following open source project content to ${lang === "en" ? "English" : "Portuguese"}.
					${AI_TECHNICAL_PROTECTION}
					
					Return a JSON object with the following structure:
					{
						"name": "Translated Name",
						"description": "Translated Description",
						"content": "Translated Content (Markdown or null)",
						"slug": "translated-slug"
					}
					Original Data:
					Name: ${originalProject.name}
					Description: ${originalProject.description}
					Content: ${originalProject.content || ""}
				`;

					const jsonResponse = await this.aiService.generate({
						model: "openai/gpt-4o-mini",
						temperature: 0.3,
						system:
							"You are a professional translator. Return only valid JSON.",
						messages: [{ role: "user", content: prompt }],
					});

					const cleanJson = jsonResponse.replace(/```json|```/g, "").trim();
					const translated = JSON.parse(cleanJson);

					const {
						id,
						created_at,
						updated_at,
						tenant_id: t_id,
						...rest
					} = originalProject;

					return {
						...rest,
						name: translated.name,
						description: translated.description,
						content: translated.content,
						slug: translated.slug,
						language: lang as "en" | "pt",
						parent_id: originalProject.id,
					};
				} catch (error) {
					this.logger.error(
						`Failed to translate open source #${originalProject.id} to ${lang}`,
						error,
					);
					return null;
				}
			}),
		);

		const validTranslations = translations.filter((t) => t !== null);
		if (validTranslations.length > 0) {
			await this.openSourceRepository.bulkStore(tenant_id, validTranslations);
			this.logger.log(
				`Created ${validTranslations.length} translations for open source #${originalProject.id}`,
			);
		}
	}

	async update(
		tenant_id: number,
		id: number,
		body: OpenSourceUpdateDto,
	): Promise<OpenSourceUpdateResponseDto> {
		const result = await this.openSourceRepository.update(tenant_id, id, body);
		if (!result) {
			throw new NotFoundException(`Open Source project #${id} not found`);
		}
		return { success: true, open_source: result };
	}

	async destroy(
		tenant_id: number,
		id: number,
	): Promise<OpenSourceDestroyResponseDto> {
		const result = await this.openSourceRepository.destroy(tenant_id, id);
		if (!result) {
			throw new NotFoundException(`Open Source project #${id} not found`);
		}
		return {
			success: true,
			message: "Open Source project deleted successfully",
		};
	}
}
