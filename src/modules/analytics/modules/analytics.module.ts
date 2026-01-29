import { AiModule } from "@modules/ai/modules/ai.module";
import { ChatModule } from "@modules/chat/chat.module";
import { DocumentModule } from "@modules/documents/document.module";
import { UserModule } from "@modules/user/user.module";
import { Module } from "@nestjs/common";
import { AiInsightCache } from "../cache/ai-insight.cache";
import { AiInsightController } from "../controllers/ai-insight.controller";
import { DashboardController } from "../controllers/dashboard.controller";
import { AiInsightRepository } from "../repositories/ai-insight.repository";
import { AiInsightService } from "../services/ai-insight.service";
import { DashboardService } from "../services/dashboard.service";

@Module({
	imports: [AiModule, ChatModule, DocumentModule, UserModule],
	controllers: [AiInsightController, DashboardController],
	providers: [
		AiInsightService,
		AiInsightRepository,
		AiInsightCache,
		DashboardService,
	],
	exports: [],
})
export class AnalyticsModule {}
