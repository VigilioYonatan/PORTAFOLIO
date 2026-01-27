import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { MusicTrackCache } from "../cache/music.cache";
import { MusicTrackRepository } from "../repositories/music.repository";
import type { MusicTrackSchema } from "../schemas/music.schema";
import { MusicService } from "../services/music.service";
import { MusicFactory } from "./music.factory";

const TENANT_ID = 1;

describe("MusicService", () => {
	let service: MusicService;
	let repository: {
		index: ReturnType<typeof vi.fn>;
		store: ReturnType<typeof vi.fn>;
		showById: ReturnType<typeof vi.fn>;
		update: ReturnType<typeof vi.fn>;
		destroy: ReturnType<typeof vi.fn>;
	};
	let cache: {
		getList: ReturnType<typeof vi.fn>;
		setList: ReturnType<typeof vi.fn>;
		invalidateLists: ReturnType<typeof vi.fn>;
	};

	beforeEach(async () => {
		repository = {
			index: vi.fn(),
			store: vi.fn(),
			showById: vi.fn(),
			update: vi.fn(),
			destroy: vi.fn(),
		};

		cache = {
			getList: vi.fn(),
			setList: vi.fn(),
			invalidateLists: vi.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				MusicService,
				{ provide: MusicTrackRepository, useValue: repository },
				{ provide: MusicTrackCache, useValue: cache },
			],
		}).compile();

		service = module.get<MusicService>(MusicService);
		vi.clearAllMocks();
	});

	describe("store", () => {
		it("should create a music track and invalidate cache", async () => {
			const body = MusicFactory.createDto();
			const track: MusicTrackSchema = {
				...body,
				id: 1,
				tenant_id: TENANT_ID,
				created_at: new Date(),
				updated_at: new Date(),
			};
			vi.mocked(repository.store).mockResolvedValue(track);
			vi.mocked(cache.invalidateLists).mockResolvedValue(undefined);

			const result = await service.store(TENANT_ID, body);

			expect(repository.store).toHaveBeenCalledWith(TENANT_ID, body);
			expect(cache.invalidateLists).toHaveBeenCalledWith(TENANT_ID);
			expect(result).toEqual({ success: true, music: track });
		});
	});

	describe("show", () => {
		it("should return a music track by ID", async () => {
			const track: MusicTrackSchema = MusicFactory.createSchema({ id: 1 });
			vi.mocked(repository.showById).mockResolvedValue(track);

			const result = await service.show(TENANT_ID, 1);

			expect(repository.showById).toHaveBeenCalledWith(TENANT_ID, 1);
			expect(result).toEqual({ success: true, music: track });
		});

		it("should throw NotFoundException if track does not exist", async () => {
			vi.mocked(repository.showById).mockResolvedValue(null);

			await expect(service.show(TENANT_ID, 999)).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe("update", () => {
		it("should update a music track and invalidate cache", async () => {
			const existingTrack: MusicTrackSchema = MusicFactory.createSchema({
				id: 1,
			});
			const updateBody = MusicFactory.createDto({ title: "Updated Title" });
			const updatedTrack: MusicTrackSchema = {
				...existingTrack,
				...updateBody,
			};

			vi.mocked(repository.showById).mockResolvedValue(existingTrack);
			vi.mocked(repository.update).mockResolvedValue(updatedTrack);
			vi.mocked(cache.invalidateLists).mockResolvedValue(undefined);

			const result = await service.update(TENANT_ID, 1, updateBody);

			expect(repository.showById).toHaveBeenCalledWith(TENANT_ID, 1);
			expect(repository.update).toHaveBeenCalledWith(TENANT_ID, 1, updateBody);
			expect(cache.invalidateLists).toHaveBeenCalledWith(TENANT_ID);
			expect(result).toEqual({ success: true, music: updatedTrack });
		});

		it("should throw NotFoundException if track does not exist", async () => {
			vi.mocked(repository.showById).mockResolvedValue(null);

			await expect(
				service.update(TENANT_ID, 999, MusicFactory.createDto()),
			).rejects.toThrow(NotFoundException);
		});
	});

	describe("destroy", () => {
		it("should delete a music track and invalidate cache", async () => {
			const track: MusicTrackSchema = MusicFactory.createSchema({ id: 1 });
			vi.mocked(repository.showById).mockResolvedValue(track);
			vi.mocked(repository.destroy).mockResolvedValue(track);
			vi.mocked(cache.invalidateLists).mockResolvedValue(undefined);

			const result = await service.destroy(TENANT_ID, 1);

			expect(repository.showById).toHaveBeenCalledWith(TENANT_ID, 1);
			expect(repository.destroy).toHaveBeenCalledWith(TENANT_ID, 1);
			expect(cache.invalidateLists).toHaveBeenCalledWith(TENANT_ID);
			expect(result).toEqual({
				success: true,
				message: "Music track deleted successfully",
			});
		});

		it("should throw NotFoundException if track does not exist", async () => {
			vi.mocked(repository.showById).mockResolvedValue(null);

			await expect(service.destroy(TENANT_ID, 999)).rejects.toThrow(
				NotFoundException,
			);
		});
	});
});
