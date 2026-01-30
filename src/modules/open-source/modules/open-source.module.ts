import { Module } from "@nestjs/common";
import { AiModule } from "../../ai/modules/ai.module";
import { OpenSourceController } from "../controllers/open-source.controller";
import { OpenSourceRepository } from "../repositories/open-source.repository";
import { OpenSourceService } from "../services/open-source.service";

@Module({
	imports: [AiModule],
	controllers: [OpenSourceController],
	providers: [OpenSourceService, OpenSourceRepository],
	exports: [OpenSourceService, OpenSourceRepository],
})
export class OpenSourceModule {}
