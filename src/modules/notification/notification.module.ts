import { Module } from "@nestjs/common";
import { NotificationCache } from "./caches/notification.cache";
import { NotificationController } from "./controllers/notification.controller";
import { NotificationRepository } from "./repositories/notification.repository";
import { SubscriptionRepository } from "./repositories/subscription.repository";
import { NotificationService } from "./services/notification.service";

@Module({
	controllers: [NotificationController],
	providers: [
		NotificationService,
		NotificationRepository,
		NotificationCache,
		SubscriptionRepository,
	],
	exports: [NotificationService, NotificationCache, SubscriptionRepository],
})
export class NotificationModule {}
