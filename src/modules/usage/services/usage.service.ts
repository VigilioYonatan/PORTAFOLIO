import { Injectable, Logger } from "@nestjs/common";
import { UsageCache } from "../caches/usage.cache";
import type {
	UsageHistoryResponseDto,
	UsageIndexResponseDto,
} from "../dtos/usage.response.dto";
import type { UsageQuotaQueryDto } from "../dtos/usage-quota.query.dto";
import { UsageRepository } from "../repositories/usage.repository";

@Injectable()
export class UsageService {
	private readonly logger = new Logger(UsageService.name);

	constructor(
		private readonly usageRepository: UsageRepository,
		private readonly usageCache: UsageCache,
	) {}

	/**
	 * Get current month's usage.
	 * Creates the record if it doesn't exist (Lazy Initialization).
	 */
	async index(tenant_id: number): Promise<UsageIndexResponseDto> {
		// 1. Try Cache
		let usage = await this.usageCache.getCurrent(tenant_id);

		if (!usage) {
			// 2. Try DB
			usage = await this.usageRepository.showCurrent(tenant_id);

			if (!usage) {
				this.logger.log(
					{ tenant_id },
					"Current month usage not found, initializing...",
				);
				const now = new Date();
				usage = await this.usageRepository.store(tenant_id, {
					year: now.getFullYear(),
					month: now.getMonth() + 1,
					documents_count: 0,
					messages_count: 0,
					tokens_count: 0,
					storage_bytes: 0,
				});
			}

			// 3. Set Cache (5min TTL)
			await this.usageCache.setCurrent(tenant_id, usage);
		}

		return { success: true, usage };
	}

	async history(
		tenant_id: number,
		query: UsageQuotaQueryDto,
	): Promise<UsageHistoryResponseDto> {
		// 1. Try Cache
		let history = await this.usageCache.getHistory(tenant_id, query);

		if (!history) {
			// 2. Try DB
			history = await this.usageRepository.indexHistory(tenant_id, query);
			// 3. Set Cache (1h TTL)
			await this.usageCache.setHistory(tenant_id, query, history);
		}

		return { success: true, history };
	}
}
