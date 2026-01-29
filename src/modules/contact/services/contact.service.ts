import { paginator } from "@infrastructure/utils/server";
import { ContactCache } from "@modules/contact/cache/contact.cache";
import type { ContactQueryDto } from "@modules/contact/dtos/contact.query.dto";
import type { ContactStoreDto } from "@modules/contact/dtos/contact.store.dto";
import { ContactRepository } from "@modules/contact/repositories/contact.repository";
import type { ContactMessageSchema } from "@modules/contact/schemas/contact-message.schema";
import { NotificationService } from "@modules/notification/services/notification.service";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import type {
	ContactDestroyResponseDto,
	ContactIndexResponseDto,
	ContactStoreResponseDto,
	ContactUpdateResponseDto,
} from "../dtos/contact.response.dto";

@Injectable()
export class ContactService {
	private readonly logger = new Logger(ContactService.name);

	constructor(
		private readonly contactRepository: ContactRepository,
		private readonly contactCache: ContactCache,
		private readonly notificationService: NotificationService,
	) {}

	async store(
		tenant_id: number | null,
		body: ContactStoreDto & { ip_address?: string | null },
	): Promise<ContactStoreResponseDto> {
		this.logger.log(
			{ tenant_id, email: body.email },
			"Creating contact message",
		);
		try {
			const message = await this.contactRepository.store(tenant_id, {
				...body,
				ip_address: body.ip_address ?? null,
				is_read: false,
				deleted_at: null,
			});

			if (tenant_id) {
				await this.contactCache.invalidateLists(tenant_id);

				// Send push notification to Admin
				this.notificationService.sendPushNotification(tenant_id, 1, {
					title: `New Message: ${body.subject || "Contact"}`,
					body: `${body.name}: ${body.message.substring(0, 50)}...`,
					url: "/dashboard/inbox",
					icon: "/favicon.ico",
				});
			}

			return { success: true, message };
		} catch (error) {
			this.logger.error("Contact store failed", error);
			throw error;
		}
	}

	async index(
		tenant_id: number,
		query: ContactQueryDto,
	): Promise<ContactIndexResponseDto> {
		this.logger.log({ tenant_id }, "Listing contact messages");
		return await paginator<ContactQueryDto, ContactMessageSchema>(
			"/contact-message",
			{
				filters: query,
				cb: async (filters, isClean) => {
					if (isClean) {
						const cached = await this.contactCache.getList(tenant_id, filters);
						if (cached) return cached;
					}

					const result = await this.contactRepository.index(tenant_id, filters);

					if (isClean) {
						await this.contactCache.setList(tenant_id, filters, result);
					}

					return result;
				},
			},
		);
	}

	async markAsRead(
		tenant_id: number,
		id: number,
		body: { is_read: boolean },
	): Promise<ContactUpdateResponseDto> {
		this.logger.log(
			{ tenant_id, id, is_read: body.is_read },
			"Updating contact message read status",
		);

		let message = await this.contactRepository.showById(tenant_id, id);
		if (!message) {
			this.logger.warn({ tenant_id, id }, "Contact message not found");
			throw new NotFoundException(`Contact message #${id} not found`);
		}

		message = await this.contactRepository.update(tenant_id, id, {
			is_read: body.is_read,
		});

		await this.contactCache.invalidate(tenant_id, id);
		await this.contactCache.invalidateLists(tenant_id);

		return { success: true, message };
	}

	async destroy(
		tenant_id: number,
		id: number,
	): Promise<ContactDestroyResponseDto> {
		this.logger.log({ tenant_id, id }, "Deleting contact message");

		const exists = await this.contactRepository.showById(tenant_id, id);
		if (!exists) {
			this.logger.warn(
				{ tenant_id, id },
				"Contact message not found for deletion",
			);
			throw new NotFoundException(`Contact message #${id} not found`);
		}

		await this.contactRepository.destroy(tenant_id, id);

		await this.contactCache.invalidate(tenant_id, id);
		await this.contactCache.invalidateLists(tenant_id);

		return {
			success: true,
			message: "Contact message deleted successfully",
		};
	}
}
