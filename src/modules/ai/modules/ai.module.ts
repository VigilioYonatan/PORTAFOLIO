import { Module } from "@nestjs/common";
import { AiCache } from "../caches/ai.cache";
import { AiConfigController } from "../controllers/ai-config.controller";
import { AiConfigRepository } from "../repositories/ai-config.repository";
import { AiConfigSeeder } from "../seeders/ai-config.seeder";
import { AiService } from "../services/ai.service";
import { AiConfigService } from "../services/ai-config.service";

@Module({
	controllers: [AiConfigController],
	providers: [
		AiConfigRepository,
		AiConfigService,
		AiService,
		AiCache,
		AiConfigSeeder,
	],
	exports: [AiService, AiConfigService, AiConfigSeeder],
})
export class AiModule {}
