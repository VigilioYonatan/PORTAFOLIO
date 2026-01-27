import { Module } from "@nestjs/common";
import { NotificationController } from "./controllers/notification.controller";
import { NotificationRepository } from "./repositories/notification.repository";
import { NotificationService } from "./services/notification.service";
import { NotificationCache } from "./caches/notification.cache";

@Module({
	controllers: [NotificationController],
	providers: [NotificationService, NotificationRepository, NotificationCache],
	exports: [NotificationService, NotificationCache],
})
export class NotificationModule {}
