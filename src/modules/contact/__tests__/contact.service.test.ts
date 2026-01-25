import { paginator } from "@infrastructure/utils/server/helpers";
import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContactCache } from "../cache/contact.cache";
import type { ContactStoreDto } from "../dtos/contact.store.dto";
import { ContactRepository } from "../repositories/contact.repository";
import type { ContactMessageSchema } from "../schemas/contact-message.schema";
import { ContactService } from "../services/contact.service";

vi.mock("@infrastructure/utils/server/helpers", () => ({
	paginator: vi.fn(),
}));

describe("ContactService", () => {
	let service: ContactService;
	let repository: ContactRepository;

	const mockContactRepository = {
		store: vi.fn(),
		index: vi.fn(),
		showById: vi.fn(),
		update: vi.fn(),
		destroy: vi.fn(),
	};

	const mockContactCache = {
		invalidateLists: vi.fn(),
		getList: vi.fn(),
		setList: vi.fn(),
		invalidate: vi.fn(),
	};

	const mockMessage: ContactMessageSchema = {
		id: 1,
		tenant_id: 1,
		name: "John Doe",
		email: "john@example.com",
		message: "Hello",
		is_read: false,
		ip_address: "127.0.0.1",
		created_at: new Date(),
		updated_at: new Date(),
		deleted_at: null,
		phone_number: null,
		subject: null,
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ContactService,
				{ provide: ContactRepository, useValue: mockContactRepository },
				{ provide: ContactCache, useValue: mockContactCache },
			],
		}).compile();

		service = module.get<ContactService>(ContactService);
		repository = module.get<ContactRepository>(ContactRepository);
		vi.clearAllMocks();
	});

	describe("store", () => {
		it("should create a contact message", async () => {
			const body: ContactStoreDto & Pick<ContactMessageSchema, "ip_address"> = {
				name: "John Doe",
				email: "john@example.com",
				message: "Hello",
				phone_number: null,
				subject: null,
				ip_address: "127.0.0.1",
			};
			mockContactRepository.store.mockResolvedValue(mockMessage);

			const result = await service.store(1, body);

			expect(result.success).toBe(true);
			expect(result.data).toEqual(mockMessage);
			expect(repository.store).toHaveBeenCalledWith(
				1,
				expect.objectContaining({ ...body, is_read: false }),
			);
		});
	});

	describe("index", () => {
		it("should return paginated messages", async () => {
			const query = { limit: 10, offset: 0 };
			// Mock paginator properly
			vi.mocked(paginator).mockResolvedValue({
				success: true,
				count: 1,
				results: [mockMessage],
				next: null,
				previous: null,
			});

			const result = await service.index(1, query);

			expect(result.success).toBe(true);
			expect(paginator).toHaveBeenCalled();
		});
	});

	describe("markAsRead", () => {
		it("should mark message as read", async () => {
			const updatedMessage = { ...mockMessage, is_read: true };
			mockContactRepository.showById.mockResolvedValue(mockMessage);
			mockContactRepository.update.mockResolvedValue(updatedMessage);

			// Fix: call with body
			const result = await service.markAsRead(1, 1, { is_read: true });

			expect(result.success).toBe(true);
			expect(result.data.is_read).toBe(true);
			expect(repository.update).toHaveBeenCalledWith(1, 1, { is_read: true });
		});

		it("should throw NotFoundException if message not found", async () => {
			mockContactRepository.showById.mockResolvedValue(null);
			// Fix: call with body
			await expect(
				service.markAsRead(1, 999, { is_read: true }),
			).rejects.toThrow(NotFoundException);
		});
	});

	describe("destroy", () => {
		it("should delete message", async () => {
			mockContactRepository.showById.mockResolvedValue(mockMessage);
			mockContactRepository.destroy.mockResolvedValue(mockMessage);

			const result = await service.destroy(1, 1);

			expect(result.success).toBe(true);
			expect(repository.destroy).toHaveBeenCalledWith(1, 1);
		});

		it("should throw NotFoundException if message not found", async () => {
			mockContactRepository.showById.mockResolvedValue(null);
			await expect(service.destroy(1, 999)).rejects.toThrow(NotFoundException);
		});
	});
});
