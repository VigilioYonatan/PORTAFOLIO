import { Module } from "@nestjs/common";
import { UsageCache } from "../caches/usage.cache";
import { UsageController } from "../controllers/usage.controller";
import { UsageRepository } from "../repositories/usage.repository";
import { UsageService } from "../services/usage.service";

@Module({
	controllers: [UsageController],
	providers: [UsageService, UsageRepository, UsageCache],
	exports: [UsageService, UsageRepository],
})
export class UsageModule {}
