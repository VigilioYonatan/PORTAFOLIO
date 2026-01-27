import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { vi } from "vitest";
import { WorkMilestoneCache } from "../cache/work-milestone.cache";
import { WorkMilestoneRepository } from "../repositories/work-milestone.repository";
import type { WorkMilestoneSchema } from "../schemas/work-milestone.schema";
import { WorkMilestoneService } from "./work-milestone.service";

describe("WorkMilestoneService", () => {
	let service: WorkMilestoneService;
	let repository: WorkMilestoneRepository;
	let cache: WorkMilestoneCache;

	const mockRepository = {
		store: vi.fn(),
		index: vi.fn(),
		showById: vi.fn(),
		update: vi.fn(),
		destroy: vi.fn(),
	};

	const mockCache = {
		invalidateLists: vi.fn(),
		getList: vi.fn(),
		setList: vi.fn(),
		get: vi.fn(),
		set: vi.fn(),
		invalidate: vi.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				WorkMilestoneService,
				{
					provide: WorkMilestoneRepository,
					useValue: mockRepository,
				},
				{
					provide: WorkMilestoneCache,
					useValue: mockCache,
				},
			],
		}).compile();

		service = module.get<WorkMilestoneService>(WorkMilestoneService);
		repository = module.get<WorkMilestoneRepository>(WorkMilestoneRepository);
		cache = module.get<WorkMilestoneCache>(WorkMilestoneCache);

		vi.clearAllMocks();
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("store", () => {
		it("should store a milestone and invalidate cache", async () => {
			const payload = {
				title: "Test",
				description: "Desc",
				work_experience_id: 1,
				milestone_date: new Date(),
				sort_order: 1,
				icon: "icon",
			};
			const result: WorkMilestoneSchema = {
				id: 1,
				tenant_id: 1,
				created_at: new Date(),
				updated_at: new Date(),
				...payload,
			};

			mockRepository.store.mockResolvedValue(result);

			const response = await service.store(1, payload);

			expect(repository.store).toHaveBeenCalledWith(1, payload);
			// Service implementation only passes tenant_id to invalidateLists
			expect(cache.invalidateLists).toHaveBeenCalledWith(1);
			expect(response).toEqual({ success: true, milestone: result });
		});
	});

	describe("index", () => {
		it("should return cached list if available", async () => {
			const cachedList = [{ id: 1 }];
			mockCache.getList.mockResolvedValue(cachedList);

			const result = await service.index(1, { work_experience_id: 1 });

			expect(cache.getList).toHaveBeenCalledWith(1, { work_experience_id: 1 });
			expect(repository.index).not.toHaveBeenCalled();
			expect(result).toEqual({ success: true, milestones: cachedList });
		});

		it("should fetch from repository and cache if not in cache", async () => {
			mockCache.getList.mockResolvedValue(null);
			const dbList = [{ id: 1 }];
			mockRepository.index.mockResolvedValue(dbList);

			const result = await service.index(1, { work_experience_id: 1 });

			expect(repository.index).toHaveBeenCalledWith(1, {
				work_experience_id: 1,
			});
			expect(cache.setList).toHaveBeenCalledWith(
				1,
				{ work_experience_id: 1 },
				dbList,
			);
			expect(result).toEqual({ success: true, milestones: dbList });
		});
	});

	describe("update", () => {
		it("should update and invalidate cache", async () => {
			const existing = { id: 1, work_experience_id: 1 };
			mockRepository.showById.mockResolvedValue(existing);

			const updatePayload = {
				title: "Updated",
				description: "New Desc",
				milestone_date: new Date(),
				sort_order: 2,
				work_experience_id: 1,
				icon: "new-icon",
			};
			const updated = { ...existing, ...updatePayload };
			mockRepository.update.mockResolvedValue(updated);

			const result = await service.update(1, 1, updatePayload);

			expect(repository.showById).toHaveBeenCalledWith(1, 1);
			expect(repository.update).toHaveBeenCalledWith(1, 1, updatePayload);
			expect(cache.invalidate).toHaveBeenCalledWith(1, 1);
			// Service implementation only passes tenant_id to invalidateLists
			expect(cache.invalidateLists).toHaveBeenCalledWith(1);
			expect(result).toEqual({ success: true, milestone: updated });
		});

		it("should throw NotFoundException if milestone not found", async () => {
			mockRepository.showById.mockResolvedValue(null);

			await expect(
				service.update(1, 1, {
					title: "Test",
					description: "Desc",
					work_experience_id: 1,
					milestone_date: new Date(),
					sort_order: 1,
					icon: "icon",
				}),
			).rejects.toThrow(NotFoundException);
		});
	});

	describe("destroy", () => {
		it("should delete and invalidate cache", async () => {
			const existing = { id: 1, work_experience_id: 1 };
			mockRepository.showById.mockResolvedValue(existing);
			mockRepository.destroy.mockResolvedValue(existing);

			const result = await service.destroy(1, 1);

			expect(repository.showById).toHaveBeenCalledWith(1, 1);
			expect(repository.destroy).toHaveBeenCalledWith(1, 1);
			expect(cache.invalidate).toHaveBeenCalledWith(1, 1);
			// Service implementation only passes tenant_id to invalidateLists
			expect(cache.invalidateLists).toHaveBeenCalledWith(1);
			expect(result).toEqual({
				success: true,
				message: "Milestone deleted successfully",
			});
		});
	});
});
