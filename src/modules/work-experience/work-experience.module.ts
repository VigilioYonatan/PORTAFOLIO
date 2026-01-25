import { Module } from "@nestjs/common";
import { WorkExperienceCache } from "./cache/work-experience.cache";
import { WorkExperienceController } from "./controllers/work-experience.controller";
import { WorkExperienceRepository } from "./repositories/work-experience.repository";
import { WorkExperienceService } from "./services/work-experience.service";

@Module({
	controllers: [WorkExperienceController],
	providers: [
		WorkExperienceService,
		WorkExperienceRepository,
		WorkExperienceCache,
	],
	exports: [
		WorkExperienceService,
		WorkExperienceRepository,
		WorkExperienceCache,
	],
})
export class WorkExperienceModule {}
