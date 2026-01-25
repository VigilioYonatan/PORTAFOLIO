import { paginator } from "@infrastructure/utils/server";
import { Injectable, Logger } from "@nestjs/common";
import type { NotificationQueryDto } from "../dtos/notification.query.dto";
import type {
	NotificationDestroyAllResponseDto,
	NotificationIndexResponseDto,
	NotificationUpdateResponseDto,
} from "../dtos/notification.response.dto";
import type { NotificationUpdateDto } from "../dtos/notification.update.dto";
import { NotificationRepository } from "../repositories/notification.repository";
import type { NotificationSchema } from "../schemas/notification.schema";

@Injectable()
export class NotificationService {
	private readonly logger = new Logger(NotificationService.name);

	constructor(
		private readonly notificationRepository: NotificationRepository,
	) {}

	async indexNotifications(
		tenant_id: number,
		query: NotificationQueryDto,
	): Promise<NotificationIndexResponseDto> {
		this.logger.log({ tenant_id }, "Listing notifications");

		return await paginator<NotificationQueryDto, NotificationSchema>(
			"/notifications",
			{
				filters: query,
				cb: async (filters, _isClean) => {
					return this.notificationRepository.index(tenant_id, filters);
				},
			},
		);
	}

	async updateNotification(
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
		return { success: true, notification: notification };
	}

	async destroyAllNotifications(
		tenant_id: number,
	): Promise<NotificationDestroyAllResponseDto> {
		this.logger.log({ tenant_id }, "Deleting all notifications");

		const { count } = await this.notificationRepository.destroyAll(tenant_id);
		return { success: true, count };
	}
}
