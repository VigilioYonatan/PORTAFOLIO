import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { TecheableCache } from "../cache/techeable.cache";
import type {
	TecheableDestroyResponseDto,
	TecheableStoreResponseDto,
} from "../dtos/techeable.response.dto";
import type { TecheableStoreDto } from "../dtos/techeable.store.dto";
import { TecheableRepository } from "../repositories/techeable.repository";
import type { TecheableSchema } from "../schemas/techeable.schema";

@Injectable()
export class TecheableService {
	private readonly logger = new Logger(TecheableService.name);

	constructor(
		private readonly techeableRepository: TecheableRepository,
		private readonly techeableCache: TecheableCache,
	) {}

	async store(
		tenant_id: number,
		body: TecheableStoreDto,
	): Promise<TecheableStoreResponseDto> {
		this.logger.log({ tenant_id }, "Creating techeable link");
		const techeable = await this.techeableRepository.store(tenant_id, body);

		// Invalidate related caches (Project or Post would need invalidation too ideally)
		await this.techeableCache.invalidateLists(tenant_id);

		return { success: true, techeable };
	}

	async destroy(
		tenant_id: number,
		id: number,
	): Promise<TecheableDestroyResponseDto> {
		this.logger.log({ tenant_id, id }, "Deleting techeable link");
		const result = await this.techeableRepository.destroy(tenant_id, id);

		if (!result) {
			throw new NotFoundException(`Techeable #${id} not found`);
		}

		await this.techeableCache.invalidateLists(tenant_id);
		return { success: true, message: "Techeable deleted successfully" };
	}
}
