import { AI_TECHNICAL_PROTECTION } from "@modules/ai/const/ai-prompts.const";
import { paginator } from "@infrastructure/utils/server";
import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { ProjectCache } from "../cache/project.cache";
import type { ProjectQueryDto } from "../dtos/project.query.dto";
import type {
	ProjectDestroyResponseDto,
	ProjectIndexResponseDto,
	ProjectShowResponseDto,
	ProjectStoreResponseDto,
	ProjectSyncResponseDto,
	ProjectUpdateResponseDto,
} from "../dtos/project.response.dto";
import type { ProjectStoreDto } from "../dtos/project.store.dto";
import type { ProjectUpdateDto } from "../dtos/project.update.dto";
import { ProjectRepository } from "../repositories/project.repository";
import type {  ProjectWithRelations } from "../schemas/project.schema";
import { AiService } from "@modules/ai/services/ai.service";
import { type ProjectSchema } from "../schemas/project.schema";

@Injectable()
export class ProjectService {
	private readonly logger = new Logger(ProjectService.name);

	constructor(
		private readonly projectRepository: ProjectRepository,
		private readonly projectCache: ProjectCache,
		private readonly aiService: AiService,
	) {}

	async index(
		tenant_id: number,
		query?: ProjectQueryDto,
	): Promise<ProjectIndexResponseDto> {
		this.logger.log({ tenant_id }, "Listing projects");

		return await paginator<ProjectQueryDto, ProjectWithRelations>("/projects", {
			filters: query,
			cb: async (filters, isClean) => {
				// If clean query, try cache first
				if (isClean) {
					// 1. Try Cache
					const cached = await this.projectCache.getList(tenant_id, filters);
					if (cached) {
						return cached;
					}
				}
				// 2. Try DB
				const result = await this.projectRepository.index(tenant_id, filters);
				if (isClean) {
					// 3. Set Cache (Only for clean queries)
					await this.projectCache.setList(tenant_id, filters, result);
				}

				return result;
			},
		});
	}

	async store(
		tenant_id: number,
		body: ProjectStoreDto,
	): Promise<ProjectStoreResponseDto> {
		this.logger.log({ tenant_id }, "Creating project");
		const { techeables, ...rest } = body;
		// 1. Store Project
		const project = await this.projectRepository.store(tenant_id, {
			...rest,
			github_stars: 0,
			github_forks: 0,
			languages_stats: [],
			language: "es",
			parent_id: null,
		});

		// 2. Store Relations
		if (techeables && techeables.length > 0) {
			await this.projectRepository.storeTecheables(
				tenant_id,
				project.id,
				techeables,
			);
		}

		// Auto-translate (manual creation is always Spanish original)
		this.generateTranslations(tenant_id, project, techeables).catch((err) =>
			this.logger.error("Error generating translations", err),
		);

		await this.projectCache.invalidateLists(tenant_id);

		return { success: true, project };
	}

	private async generateTranslations(
		tenant_id: number,
		originalProject: ProjectSchema,
		techeables?: number[],
	) {
		const targetLanguages = ["en", "pt"];

		const translations = await Promise.all(
			targetLanguages.map(async (lang) => {
				try {
					const prompt = `
					Translate the following project content to ${lang === "en" ? "English" : "Portuguese"}.
					${AI_TECHNICAL_PROTECTION}
					
					Return a JSON object with the following structure:
					{
						"title": "Translated Title",
						"description": "Translated Description",
						"content": "Translated Content (Markdown)",
						"impact_summary": "Translated Impact Summary",
						"slug": "translated-slug"
					}
					Original Data:
					Title: ${originalProject.title}
					Description: ${originalProject.description}
					Content: ${originalProject.content}
					Impact Summary: ${originalProject.impact_summary}
				`;

					const jsonResponse = await this.aiService.generate({
						model: "openai/gpt-4o-mini",
						temperature: 0.3,
						system: "You are a professional translator. Return only valid JSON.",
						messages: [{ role: "user", content: prompt }],
					});

					const cleanJson = jsonResponse.replace(/```json|```/g, "").trim();
					const translated = JSON.parse(cleanJson);

					const { id, created_at, updated_at, tenant_id: t_id, ...rest } = originalProject;

					return {
						...rest,
						title: translated.title,
						description: translated.description,
						content: translated.content,
						impact_summary: translated.impact_summary,
						slug: translated.slug,
						language: lang as "en" | "pt",
						parent_id: originalProject.id,
					};
				} catch (error) {
					this.logger.error(
						`Failed to translate project #${originalProject.id} to ${lang}`,
						error,
					);
					return null;
				}
			}),
		);

		const validTranslations = translations.filter((t) => t !== null);
		if (validTranslations.length > 0) {
			const insertedProjects = await this.projectRepository.bulkStore(
				tenant_id,
				validTranslations,
			);

			// Copy relations (technologies) for all translated projects
			if (techeables && techeables.length > 0) {
				await Promise.all(
					insertedProjects.map((p) =>
						this.projectRepository.storeTecheables(tenant_id, p.id, techeables),
					),
				);
			}

			this.logger.log(
				`Created ${validTranslations.length} translations for project #${originalProject.id}`,
			);
		}
	}

	async update(
		tenant_id: number,
		id: number,
		body: ProjectUpdateDto,
	): Promise<ProjectUpdateResponseDto> {
		this.logger.log({ tenant_id, id }, "Updating project");
		const { techeables, ...rest } = body;

		// 1. Update Project
		const project = await this.projectRepository.update(tenant_id, id, rest);
		if (!project) {
			this.logger.warn({ tenant_id, id }, "Project not found for update");
			throw new NotFoundException(`Project #${id} not found`);
		}

		// 2. Sync Relations
		if (techeables) {
			await this.projectRepository.destroyTecheables(tenant_id, id);
			if (techeables.length > 0) {
				await this.projectRepository.storeTecheables(tenant_id, id, techeables);
			}
		}

		await this.projectCache.invalidate(tenant_id, project.slug);
		await this.projectCache.invalidateLists(tenant_id);

		return { success: true, project };
	}

	async showBySlug(
		tenant_id: number,
		slug: string,
	): Promise<ProjectShowResponseDto> {
		this.logger.log({ tenant_id, slug }, "Fetching project by slug");

		// 1. Try Cache
		let project = await this.projectCache.getBySlug(tenant_id, slug);

		if (!project) {
			// 2. Try DB
			project = await this.projectRepository.showBySlug(tenant_id, slug);

			if (!project) {
				this.logger.warn({ tenant_id, slug }, "Project not found by slug");
				throw new NotFoundException(`Project '${slug}' not found`);
			}

			// 3. Set Cache
			await this.projectCache.setBySlug(tenant_id, project);
		}

		return { success: true, project };
	}

	async destroy(
		tenant_id: number,
		id: number,
	): Promise<ProjectDestroyResponseDto> {
		this.logger.log({ tenant_id, id }, "Deleting project");
		const project = await this.projectRepository.destroy(tenant_id, id);

		if (!project) {
			this.logger.warn({ tenant_id, id }, "Project not found for deletion");
			throw new NotFoundException(`Project #${id} not found`);
		}

		// Invalidate single + lists
		await this.projectCache.invalidate(tenant_id, project.slug);
		await this.projectCache.invalidateLists(tenant_id);

		return { success: true, message: "Project deleted successfully" };
	}

	async sync(tenant_id: number, id: number): Promise<ProjectSyncResponseDto> {
		this.logger.log({ tenant_id, id }, "Syncing project with GitHub");

		// 1. Get Project
		const project = await this.projectRepository.showById(tenant_id, id);
		if (!project) {
			this.logger.warn({ tenant_id, id }, "Project not found for sync");
			throw new NotFoundException(`Project #${id} not found`);
		}

		if (!project.repo_url) {
			throw new BadRequestException("Project does not have a repository URL");
		}

		// 2. Parse User/Repo
		const regex = /github\.com\/([^/]+)\/([^/]+)/;
		const match = project.repo_url.match(regex);

		if (!match) {
			throw new BadRequestException("Invalid GitHub repository URL");
		}

		const owner = match[1];
		const repo = match[2].replace(".git", "");

		try {
			// 3. Fetch Data
			const [repoRes, langRes] = await Promise.all([
				fetch(`https://api.github.com/repos/${owner}/${repo}`),
				fetch(`https://api.github.com/repos/${owner}/${repo}/languages`),
			]);

			if (!repoRes.ok) {
				this.logger.error(
					{ status: repoRes.status },
					"Failed to fetch repo data",
				);
				throw new BadRequestException(
					"Failed to fetch repository data from GitHub",
				);
			}

			if (!langRes.ok) {
				this.logger.error(
					{ status: langRes.status },
					"Failed to fetch language stats",
				);
				throw new BadRequestException("Failed to fetch language stats");
			}

			const repoData = await repoRes.json();
			const langData = await langRes.json();

			// 4. Update Project
			await this.projectRepository.update(tenant_id, id, {
				github_stars: repoData.stargazers_count,
				github_forks: repoData.forks_count,
				languages_stats: langData,
			});

			// 5. Invalidate Cache
			await this.projectCache.invalidate(tenant_id, project.slug);
			await this.projectCache.invalidateLists(tenant_id);

			return {
				success: true,
				message: "Project synced with GitHub successfully",
			};
		} catch (error) {
			this.logger.error({ error }, "Error syncing with GitHub");
			if (error instanceof BadRequestException) throw error;
			throw new BadRequestException(
				`Unexpected error syncing with GitHub: ${(error as Error).message}`,
			);
		}
	}
}
