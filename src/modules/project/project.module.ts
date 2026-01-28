import { AiModule } from "@modules/ai/modules/ai.module";
import { Module } from "@nestjs/common";
import { ProjectCache } from "./cache/project.cache";
import { ProjectController } from "./controllers/project.controller";
import { ProjectRepository } from "./repositories/project.repository";
import { ProjectService } from "./services/project.service";

@Module({
	imports: [AiModule],
	controllers: [ProjectController],
	providers: [ProjectService, ProjectRepository, ProjectCache],
	exports: [ProjectService],
})
export class ProjectModule {}
