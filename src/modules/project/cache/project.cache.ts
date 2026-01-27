import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { toNull } from "@infrastructure/utils/server";
import { Injectable } from "@nestjs/common";
import type { ProjectQueryDto } from "../dtos/project.query.dto";
import type { ProjectSchema, ProjectWithRelations } from "../schemas/project.schema";

@Injectable()
export class ProjectCache {
	private readonly PREFIX = "project";

	constructor(private readonly cacheService: CacheService) {}

	private getListsKey(tenant_id: number, query: ProjectQueryDto): string {
		return `${this.PREFIX}:${tenant_id}:lists:${JSON.stringify(query)}`;
	}

	async getList(
		tenant_id: number,
		query: ProjectQueryDto,
	): Promise<[ProjectSchema[], number] | null> {
		const result = await this.cacheService.get<[ProjectSchema[], number]>(
			this.getListsKey(tenant_id, query),
		);
		return toNull(result);
	}

	async setList(
		tenant_id: number,
		query: ProjectQueryDto,
		result: [ProjectSchema[], number],
	): Promise<void> {
		await this.cacheService.set(
			this.getListsKey(tenant_id, query),
			result,
			this.cacheService.CACHE_TIMES.HOUR,
		);
	}

	private getSlugKey(tenant_id: number, slug: string): string {
		return `${this.PREFIX}:${tenant_id}:slug:${slug}`;
	}

	async getBySlug(
		tenant_id: number,
		slug: string,
	): Promise<ProjectWithRelations | null> {
		const cache = await this.cacheService.get<ProjectWithRelations>(
			this.getSlugKey(tenant_id, slug),
		);
		return toNull(cache);
	}

	async setBySlug(tenant_id: number, project: ProjectSchema): Promise<void> {
		await this.cacheService.set(
			this.getSlugKey(tenant_id, project.slug),
			project,
			this.cacheService.CACHE_TIMES.HOUR,
		);
	}

	async invalidate(tenant_id: number, slug: string): Promise<void> {
		await this.cacheService.del(this.getSlugKey(tenant_id, slug));
	}

	async invalidateLists(tenant_id: number): Promise<void> {
		await this.cacheService.deleteByPattern(`${this.PREFIX}:${tenant_id}:*`);
	}
}
