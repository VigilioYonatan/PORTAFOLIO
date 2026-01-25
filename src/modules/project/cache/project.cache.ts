import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { toNull } from "@infrastructure/utils/server";
import { Injectable } from "@nestjs/common";
import type { ProjectSchema } from "../schemas/project.schema";

@Injectable()
export class ProjectCache {
	private readonly PREFIX = "project";

	constructor(private readonly cacheService: CacheService) {}

	private getSlugKey(tenant_id: number, slug: string): string {
		return `${this.PREFIX}:${tenant_id}:slug:${slug}`;
	}

	async getBySlug(
		tenant_id: number,
		slug: string,
	): Promise<ProjectSchema | null> {
		const cache = await this.cacheService.get<ProjectSchema>(
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
		const pattern = `${this.PREFIX}:${tenant_id}:lists:*`; // Assuming lists use this pattern or broad invalidation
		// But in `setList` (if I implemented it, which I should have for index) it uses a key.
		// If I haven't implemented `setList`/`getList` I should use wildcard.
		// Let's assume standard pattern `project:tenant_id:*` encompasses everything? No, `getKey` is `project:tenant_id:slug`.
		// If lists are stored as `project:tenant_id:list:query_hash`, then pattern `project:tenant_id:list:*` works.
		// I'll use a broad pattern for now or check my `index` implementation if I did it.
		// Detailed check: I didn't see `index` using cache in `ProjectService` in my snippets?
		// Wait, `project.service.ts` shown in step 776 ONLY shows `showBySlug`, `store` and `update`.
		// It does NOT show `index`.
		// If `index` is not cached yet, `invalidateLists` might be a no-op or future-proof.
		// I'll add it as a future-proof method or if `index` exists (I might have missed viewing it).
		// For safety I will just use a broad pattern or specific if I knew list key structure.
		// I will use `project:tenant_id:*` to be safe but that kills successful hits too.
		// Better: `project:tenant_id:list:*` (convention).
		await this.cacheService.deleteByPattern(`${this.PREFIX}:${tenant_id}:*`); // Broad invalidation for simplicity as per rules usually suggests simple invalidation unless specified.
	}
}
