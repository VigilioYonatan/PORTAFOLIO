import { paginator } from "@infrastructure/utils/server";
import { Injectable, Logger } from "@nestjs/common";
import * as webpush from "web-push";
import { NotificationCache } from "../caches/notification.cache";
import type { NotificationQueryDto } from "../dtos/notification.query.dto";
import type {
	NotificationDestroyAllResponseDto,
	NotificationIndexResponseDto,
	NotificationUpdateResponseDto,
} from "../dtos/notification.response.dto";
import type { NotificationUpdateDto } from "../dtos/notification.update.dto";
import type {
	SendNotificationDto,
	SubscriptionStoreDto,
} from "../dtos/subscription.store.dto";
import { NotificationRepository } from "../repositories/notification.repository";
import { SubscriptionRepository } from "../repositories/subscription.repository";
import type { NotificationSchema } from "../schemas/notification.schema";

@Injectable()
export class NotificationService {
	private readonly logger = new Logger(NotificationService.name);

	constructor(
		private readonly notificationRepository: NotificationRepository,
		private readonly cache: NotificationCache,
		private readonly subscriptionRepository: SubscriptionRepository,
	) {
		// Initialize VAPID (In production use ConfigService)
		webpush.setVapidDetails(
			"mailto:admin@vigilio.com",
			"BNHhKhWwwUQXbFqbSmHAuIXBfFIzfAPOxrImmxkih8rPZ_TK7ftRUj5iuyMLK3nLTvN2huaTXCAPTq5C8yZ227Q",
			"Th-luq2VLebgIG3MvvUk4P59ZMDTBbYIjH0P_FKlaTQ",
		);
	}

	async subscribe(
		tenant_id: number,
		user_id: number,
		body: SubscriptionStoreDto,
	) {
		return await this.subscriptionRepository.store(tenant_id, user_id, body);
	}

	async sendPushNotification(
		tenant_id: number,
		user_id: number,
		payload: SendNotificationDto,
	) {
		const subscriptions = await this.subscriptionRepository.getByUser(
			tenant_id,
			user_id,
		);

		const notifications = subscriptions.map((sub) => {
			return webpush
				.sendNotification(
					{
						endpoint: sub.endpoint,
						keys: sub.keys,
					},
					JSON.stringify(payload),
				)
				.catch((err) => {
					if (err.statusCode === 410 || err.statusCode === 404) {
						this.subscriptionRepository.deleteByEndpoint(sub.endpoint);
					}
					this.logger.error("Error sending push", err);
				});
		});

		await Promise.all(notifications);
		return { success: true };
	}

	async index(
		tenant_id: number,
		query: NotificationQueryDto,
	): Promise<NotificationIndexResponseDto> {
		this.logger.log({ tenant_id }, "Listing notifications");

		return await paginator<NotificationQueryDto, NotificationSchema>(
			"/notifications",
			{
				filters: query,
				cb: async (filters, isClean) => {
					// If clean query, try cache first
					if (isClean) {
						const cached = await this.cache.getList(tenant_id, filters);
						if (cached) return cached;
					}

					const result = await this.notificationRepository.index(
						tenant_id,
						filters,
					);

					if (isClean) {
						await this.cache.setList(tenant_id, filters, result);
					}

					return result;
				},
			},
		);
	}

	async update(
		tenant_id: number,
		id: number,
		body: NotificationUpdateDto,
	): Promise<NotificationUpdateResponseDto> {
		this.logger.log({ tenant_id, id }, "Updating notification");

		const notification = await this.notificationRepository.update(
			tenant_id,
			id,
			body,
		);
		await this.cache.invalidateLists(tenant_id);
		return { success: true, notification };
	}

	async destroyAll(
		tenant_id: number,
	): Promise<NotificationDestroyAllResponseDto> {
		this.logger.log({ tenant_id }, "Deleting all notifications");

		const { count } = await this.notificationRepository.destroyAll(tenant_id);
		await this.cache.invalidateLists(tenant_id);
		return { success: true, count };
	}
}
