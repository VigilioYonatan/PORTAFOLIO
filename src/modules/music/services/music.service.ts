import { type PaginatorResult, paginator } from "@infrastructure/utils/server";
import { type MusicTrackDestroyResponseDto, type MusicTrackShowResponseDto, type MusicTrackStoreResponseDto, type MusicTrackUpdateResponseDto } from "../dtos/music.response.dto";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { MusicTrackCache } from "../cache/music.cache";
import type { MusicQueryDto } from "../dtos/music.query.dto";
import type { MusicStoreDto } from "../dtos/music.store.dto";
import type { MusicUpdateDto } from "../dtos/music.update.dto";
import { MusicTrackRepository } from "../repositories/music.repository";
import type { MusicTrackSchema } from "../schemas/music.schema";

@Injectable()
export class MusicService {
	private readonly logger = new Logger(MusicService.name);

	constructor(
		private readonly repository: MusicTrackRepository,
		private readonly cache: MusicTrackCache,
	) {}

	async index(
		tenant_id: number,
		query: MusicQueryDto,
	): Promise<PaginatorResult<MusicTrackSchema>> {
		return await paginator<MusicQueryDto, MusicTrackSchema>("/music", {
			filters: query,
			cb: async (filters, isClean) => {
				if (isClean) {
					const cached = await this.cache.getList<[MusicTrackSchema[], number]>(
						tenant_id,
						filters,
					);
					if (cached) return cached;
				}

				const result = await this.repository.index(tenant_id, filters);

				if (isClean) {
					await this.cache.setList(tenant_id, filters, result);
				}

				return result;
			},
		});
	}

	async store(
		tenant_id: number,
		body: MusicStoreDto,
	): Promise<MusicTrackStoreResponseDto> {
		this.logger.log({ tenant_id }, "Creating music track");
		const music = await this.repository.store(tenant_id, body);

		await this.cache.invalidateLists(tenant_id);

		return { success: true, music };
	}

	async show(
		tenant_id: number,
		id: number,
	): Promise<MusicTrackShowResponseDto> {
		this.logger.log({ tenant_id, id }, "Showing music track");
		const music = await this.repository.showById(tenant_id, id);
		if (!music) {
			throw new NotFoundException(`Music track #${id} not found`);
		}
		return { success: true, music };
	}

	async update(
		tenant_id: number,
		id: number,
		body: MusicUpdateDto,
	): Promise<MusicTrackUpdateResponseDto> {
		this.logger.log({ tenant_id, id }, "Updating music track");

		await this.show(tenant_id, id);

		const music = await this.repository.update(tenant_id, id, body);

		await this.cache.invalidateLists(tenant_id);

		return { success: true, music };
	}

	async destroy(
		tenant_id: number,
		id: number,
	): Promise<MusicTrackDestroyResponseDto> {
		this.logger.log({ tenant_id, id }, "Deleting music track");

		await this.show(tenant_id, id);

		await this.repository.destroy(tenant_id, id);

		await this.cache.invalidateLists(tenant_id);

		return { success: true, message: "Music track deleted successfully" };
	}
}
