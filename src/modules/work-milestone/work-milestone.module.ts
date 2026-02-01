import { WorkExperienceModule } from "@modules/work-experience/work-experience.module";
import { Module } from "@nestjs/common";
import { WorkMilestoneCache } from "./cache/work-milestone.cache";
import { WorkMilestoneController } from "./controllers/work-milestone.controller";
import { WorkMilestoneRepository } from "./repositories/work-milestone.repository";
import { WorkMilestoneService } from "./services/work-milestone.service";

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
