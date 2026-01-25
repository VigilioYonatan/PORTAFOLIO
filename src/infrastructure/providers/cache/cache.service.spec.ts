import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CacheService } from "./cache.service";

describe("CacheService", () => {
	let service: CacheService;
	let cacheManagerMock: any;
	let storeMock: any;

	beforeEach(async () => {
		// Mock Memory Store
		storeMock = {
			keys: vi.fn(),
		};

		cacheManagerMock = {
			store: storeMock,
			get: vi.fn(),
			set: vi.fn(),
			del: vi.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheService,
				{
					provide: CACHE_MANAGER,
					useValue: cacheManagerMock,
				},
			],
		}).compile();

		service = module.get<CacheService>(CacheService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("deleteByPattern (Memory Store)", () => {
		it("should delete keys matching the pattern", async () => {
			const pattern = "user:1:*";
			// key prefixes are handled by the caller or simple string matching in memory
			const existingKeys = [
				"user:1:profile",
				"user:1:settings",
				"user:2:profile",
			];

			storeMock.keys.mockResolvedValue(existingKeys);

			await service.deleteByPattern(pattern);

			// Should delete user:1:profile and user:1:settings
			expect(cacheManagerMock.del).toHaveBeenCalledWith("user:1:profile");
			expect(cacheManagerMock.del).toHaveBeenCalledWith("user:1:settings");
			// Should NOT delete user:2:profile
			expect(cacheManagerMock.del).not.toHaveBeenCalledWith("user:2:profile");
			expect(cacheManagerMock.del).toHaveBeenCalledTimes(2);
		});

		it("should handle empty keys gracefully", async () => {
			storeMock.keys.mockResolvedValue([]);
			await service.deleteByPattern("any:*");
			expect(cacheManagerMock.del).not.toHaveBeenCalled();
		});
	});
});
