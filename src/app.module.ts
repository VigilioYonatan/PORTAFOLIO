import { DrizzleExceptionFilter } from "@infrastructure/filters/drizzle-exception.filter";
import { HttpExceptionFilter } from "@infrastructure/filters/http-exception.filter";
import { InitialCacheMiddleware } from "@infrastructure/middlewares/initial.middleware";
import { AppConfigModule } from "@infrastructure/modules/config.module";
import { AppCacheModule } from "@infrastructure/providers/cache";
import { DatabaseModule } from "@infrastructure/providers/database";
import { AppLoggerModule } from "@infrastructure/providers/logger";
import { AiModule } from "@modules/ai/modules/ai.module";
import { AnalyticsModule } from "@modules/analytics/modules/analytics.module";
import { SessionConfigService } from "@modules/auth/config/session.config";
import { HybridAuthGuard } from "@modules/auth/guards/hybrid.guard";
import { RolesGuard } from "@modules/auth/guards/roles.guard";
import { AuthModule } from "@modules/auth/modules/auth.module";
import { BlogCategoryModule } from "@modules/blog-category/blog-category.module";
import { BlogPostModule } from "@modules/blog-post/blog-post.module";
import { ContactModule } from "@modules/contact/modules/contact.module";
// import { DemoModule } from "@modules/demo/demo.module";
import { DocumentModule } from "@modules/documents/document.module";
import { MusicModule } from "@modules/music/music.module";
import { NotificationModule } from "@modules/notification/notification.module";
import { OpenSourceModule } from "@modules/open-source/modules/open-source.module";
import { PortfolioConfigModule } from "@modules/portfolio-config/portfolio-config.module";
import { ProjectModule } from "@modules/project/project.module";
import { TecheableModule } from "@modules/techeable/techeable.module";
import { TechnologyModule } from "@modules/technology/technology.module";
import { TenantModule } from "@modules/tenant/modules/tenant.module";
import { TestimonialModule } from "@modules/testimonial/modules/testimonial.module";
import { UploadModule } from "@modules/uploads/modules/upload.module";
import { UserModule } from "@modules/user/user.module";
import { WebModule } from "@modules/web/modules/web.module";
import { WorkExperienceModule } from "@modules/work-experience/work-experience.module";
import { WorkMilestoneModule } from "@modules/work-milestone/work-milestone.module";
import type { MiddlewareConsumer, NestModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ThrottlerModule } from "@nestjs/throttler";
import { ChatModule } from "./modules/chat/chat.module";
import { SocialModule } from "./modules/social/social.module";

@Module({
	imports: [
		EventEmitterModule.forRoot(),
		AppConfigModule,
		AppCacheModule,
		AppLoggerModule,
		DatabaseModule,
		ThrottlerModule.forRoot([
			{
				ttl: 60000, // 1 minute
				limit: 100, // 100 requests per minute
			},
		]),
		UploadModule,
		AiModule,
		AuthModule,
		TenantModule,
		UserModule,
		ContactModule,
		DocumentModule,
		ChatModule,
		SocialModule,
		PortfolioConfigModule,
		ProjectModule,
		BlogCategoryModule,
		BlogPostModule,
		WorkExperienceModule,
		TecheableModule,
		TechnologyModule,
		MusicModule,
		NotificationModule,
		AnalyticsModule,
		TestimonialModule,
		WorkMilestoneModule,
		OpenSourceModule,
		WebModule,
	],
	providers: [
		SessionConfigService,
		{ provide: APP_FILTER, useClass: HttpExceptionFilter },
		{ provide: APP_FILTER, useClass: DrizzleExceptionFilter },
		{ provide: APP_GUARD, useClass: HybridAuthGuard },
		{ provide: APP_GUARD, useClass: RolesGuard },
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(InitialCacheMiddleware).forRoutes("*");
	}
}
