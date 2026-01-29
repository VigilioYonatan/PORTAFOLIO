import { NotificationModule } from "@modules/notification/notification.module";
import { Module } from "@nestjs/common";
import { SocialCache } from "./caches/social.cache";
import { SocialRepository } from "./repositories/social.repository";
import { SocialService } from "./services/social.service";
import { SocialController } from "./social.controller";
import { SocialCommentController } from "./social-comment.controller";

@Module({
	imports: [NotificationModule],
	controllers: [SocialController, SocialCommentController],
	providers: [SocialService, SocialRepository, SocialCache],
	exports: [SocialService],
})
export class SocialModule {}
