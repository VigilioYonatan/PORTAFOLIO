import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TechnologyCache } from "../cache/technology.cache";
import { TechnologyRepository } from "../repositories/technology.repository";
import type { TechnologySchema } from "../schemas/technology.schema";
import { TechnologyService } from "../services/technology.service";
import { TechnologyFactory } from "./technology.factory";

describe("TechnologyService", () => {
	let service: TechnologyService;
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
		get: ReturnType<typeof vi.fn>;
		set: ReturnType<typeof vi.fn>;
		invalidateLists: ReturnType<typeof vi.fn>;
		invalidate: ReturnType<typeof vi.fn>;
	};

	const TENANT_ID = 1;

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
			get: vi.fn(),
			set: vi.fn(),
			invalidateLists: vi.fn(),
			invalidate: vi.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TechnologyService,
				{ provide: TechnologyRepository, useValue: repository },
				{ provide: TechnologyCache, useValue: cache },
			],
		}).compile();

		service = module.get<TechnologyService>(TechnologyService);
	});

	describe("index", () => {
		it("should return cached list if available", async () => {
			const tech = TechnologyFactory.createSchema({ id: 1 });
			const cachedTuple: [TechnologySchema[], number] = [[tech], 1];
			vi.mocked(cache.getList).mockResolvedValue(cachedTuple);

			const result = await service.index(TENANT_ID, {});

			expect(cache.getList).toHaveBeenCalledWith(
				TENANT_ID,
				expect.objectContaining({ limit: 20, offset: 0 }),
			);
			expect(repository.index).not.toHaveBeenCalled();
			// Service returns PaginatorResult, but paginator constructs it from tuple
			expect(result.results).toEqual([tech]);
			expect(result.count).toBe(1);
		});

		it("should fetch from repository and cache if not in cache", async () => {
			const tech = TechnologyFactory.createSchema({ id: 1 });
			const dbResult: [TechnologySchema[], number] = [[tech], 1];
			vi.mocked(cache.getList).mockResolvedValue(null);
			vi.mocked(repository.index).mockResolvedValue(dbResult);

			const result = await service.index(TENANT_ID, {});

			expect(repository.index).toHaveBeenCalledWith(
				TENANT_ID,
				expect.objectContaining({ limit: 20, offset: 0 }),
			);
			expect(cache.setList).toHaveBeenCalledWith(
				TENANT_ID,
				expect.objectContaining({ limit: 20, offset: 0 }),
				dbResult,
			);
			expect(result.results).toEqual([tech]);
			expect(result.count).toBe(1);
		});
	});

	describe("show", () => {
		it("should throw NotFoundException if technology does not exist", async () => {
			vi.mocked(cache.get).mockResolvedValue(null);
			vi.mocked(repository.showById).mockResolvedValue(null);

			await expect(service.show(TENANT_ID, 999)).rejects.toThrow(
				NotFoundException,
			);
		});

		it("should return from cache if available", async () => {
			const tech = TechnologyFactory.createSchema({ id: 1 });
			vi.mocked(cache.get).mockResolvedValue(tech);

			const result = await service.show(TENANT_ID, 1);

			expect(cache.get).toHaveBeenCalledWith(TENANT_ID, 1);
			expect(repository.showById).not.toHaveBeenCalled();
			expect(result.technology).toEqual(tech);
		});
	});

	describe("store", () => {
		it("should create technology and invalidate cache", async () => {
			const body = TechnologyFactory.createStoreDto();
			const tech = TechnologyFactory.createSchema({ ...body, id: 1 });
			vi.mocked(repository.store).mockResolvedValue(tech);

			const result = await service.store(TENANT_ID, body);

			expect(repository.store).toHaveBeenCalledWith(TENANT_ID, body);
			expect(cache.invalidateLists).toHaveBeenCalledWith(TENANT_ID);
			expect(result.technology).toEqual(tech);

		});
	});

	describe("update", () => {
		it("should update technology and invalidate caches", async () => {
			const id = 1;
			const body = { name: "Updated Name", category: "AI" as const };
			const existingTech = TechnologyFactory.createSchema({ id, name: "Old" });
			const updatedTech = TechnologyFactory.createSchema({
				id,
				name: "Updated Name",
			});

			// Mock show() dependency (cache miss -> repo hit)
			vi.mocked(cache.get).mockResolvedValue(null);
			vi.mocked(repository.showById).mockResolvedValue(existingTech);

			vi.mocked(repository.update).mockResolvedValue(updatedTech);

			const result = await service.update(TENANT_ID, id, body);

			expect(repository.update).toHaveBeenCalledWith(TENANT_ID, id, body);
			expect(cache.invalidate).toHaveBeenCalledWith(TENANT_ID, id);
			expect(cache.invalidateLists).toHaveBeenCalledWith(TENANT_ID);
			expect(result.technology).toEqual(updatedTech);
		});

		it("should throw NotFoundException if technology not found during update", async () => {
			vi.mocked(cache.get).mockResolvedValue(null);
			vi.mocked(repository.showById).mockResolvedValue(null);

			await expect(
				service.update(TENANT_ID, 999, { name: "New", category: "AI" }),
			).rejects.toThrow(NotFoundException);

			expect(repository.update).not.toHaveBeenCalled();
		});
	});

	describe("destroy", () => {
		it("should delete technology and invalidate caches", async () => {
			const id = 1;
			const tech = TechnologyFactory.createSchema({ id });
			vi.mocked(repository.destroy).mockResolvedValue(tech);

			const result = await service.destroy(TENANT_ID, id);

			expect(repository.destroy).toHaveBeenCalledWith(TENANT_ID, id);
			expect(cache.invalidate).toHaveBeenCalledWith(TENANT_ID, id);
			expect(cache.invalidateLists).toHaveBeenCalledWith(TENANT_ID);
			expect(result.message).toBe("Technology deleted successfully");
		});

		it("should throw NotFoundException if technology not found during delete", async () => {
			vi.mocked(repository.destroy).mockResolvedValue(
				undefined as unknown as TechnologySchema,
			); // Simulate null return from repo

			await expect(service.destroy(TENANT_ID, 999)).rejects.toThrow(
				NotFoundException,
			);
		});
	});
});
