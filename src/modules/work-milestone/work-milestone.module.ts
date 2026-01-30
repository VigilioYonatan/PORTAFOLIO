import { WorkExperienceModule } from "@modules/work-experience/work-experience.module.js";
import { Module } from "@nestjs/common";
import { WorkMilestoneCache } from "./cache/work-milestone.cache.js";
import { WorkMilestoneController } from "./controllers/work-milestone.controller.js";
import { WorkMilestoneRepository } from "./repositories/work-milestone.repository.js";
import { WorkMilestoneService } from "./services/work-milestone.service.js";

@Module({
	imports: [WorkExperienceModule],
	controllers: [WorkMilestoneController],
	providers: [
		WorkMilestoneService,
		WorkMilestoneRepository,
		WorkMilestoneCache,
	],
	exports: [WorkMilestoneService, WorkMilestoneRepository],
})
export class WorkMilestoneModule {}
