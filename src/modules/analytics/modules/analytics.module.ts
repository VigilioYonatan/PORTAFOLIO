import { AiModule } from "@modules/ai/modules/ai.module";
import { ChatModule } from "@modules/chat/chat.module";
import { Module } from "@nestjs/common";
import { AiInsightCache } from "../cache/ai-insight.cache";
import { AiInsightController } from "../controllers/ai-insight.controller";
import { AiInsightRepository } from "../repositories/ai-insight.repository";
import { AiInsightService } from "../services/ai-insight.service";

@Module({
	imports: [AiModule, ChatModule],
	controllers: [AiInsightController],
	providers: [AiInsightService, AiInsightRepository, AiInsightCache],
	exports: [],
})
export class AnalyticsModule {}
