import { Module } from "@nestjs/common";
import { TechnologyCache } from "./cache/technology.cache";
import { TechnologyController } from "./controllers/technology.controller";
import { TechnologyRepository } from "./repositories/technology.repository";
import { TechnologyService } from "./services/technology.service";

@Module({
	controllers: [TechnologyController],
	providers: [TechnologyService, TechnologyRepository, TechnologyCache],
	exports: [TechnologyService, TechnologyRepository, TechnologyCache],
})
export class TechnologyModule {}
