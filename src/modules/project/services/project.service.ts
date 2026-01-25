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
import type { ProjectSchema } from "../schemas/project.schema";

@Injectable()
export class ProjectService {
	private readonly logger = new Logger(ProjectService.name);

	constructor(
		private readonly projectRepository: ProjectRepository,
		private readonly projectCache: ProjectCache,
	) {}

	async index(
		tenant_id: number,
		query?: ProjectQueryDto,
	): Promise<ProjectIndexResponseDto> {
		this.logger.log({ tenant_id }, "Listing projects");

		return await paginator<ProjectQueryDto, ProjectSchema>("/projects", {
			filters: query,
			cb: async (filters, _isClean) => {
				return await this.projectRepository.index(tenant_id, filters);
			},
		});
	}

	async store(
		tenant_id: number,
		body: ProjectStoreDto,
	): Promise<ProjectStoreResponseDto> {
		this.logger.log({ tenant_id }, "Creating project");
		const project = await this.projectRepository.store(tenant_id, body);

		// Cache Write-Through + Invalidate lists
		await this.projectCache.setBySlug(tenant_id, project);
		await this.projectCache.invalidateLists(tenant_id);

		return { success: true, project };
	}

	async update(
		tenant_id: number,
		id: number,
		body: ProjectUpdateDto,
	): Promise<ProjectUpdateResponseDto> {
		this.logger.log({ tenant_id, id }, "Updating project");
		const project = await this.projectRepository.update(id, tenant_id, body);
		if (!project) {
			this.logger.warn({ tenant_id, id }, "Project not found for update");
			throw new NotFoundException(`Project #${id} not found`);
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
		const project = await this.projectRepository.destroy(id, tenant_id);

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
			await this.projectRepository.update(id, tenant_id, {
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
				"Unexpected error syncing with GitHub: " + (error as Error).message,
			);
		}
	}
}
