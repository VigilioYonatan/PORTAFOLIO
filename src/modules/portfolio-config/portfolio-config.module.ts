import { PortfolioConfigCache } from "@modules/portfolio-config/cache/portfolio-config.cache";
import { PortfolioConfigController } from "@modules/portfolio-config/controllers/portfolio-config.controller";
import { PortfolioConfigRepository } from "@modules/portfolio-config/repositories/portfolio-config.repository";
import { PortfolioConfigService } from "@modules/portfolio-config/services/portfolio-config.service";
import { ProjectModule } from "@modules/project/project.module";
import { WorkExperienceModule } from "@modules/work-experience/work-experience.module";
import { Module } from "@nestjs/common";

@Module({
	imports: [WorkExperienceModule, ProjectModule],
	controllers: [PortfolioConfigController],
	providers: [
		PortfolioConfigRepository,
		PortfolioConfigService,
		PortfolioConfigCache,
	],
	exports: [
		PortfolioConfigRepository,
		PortfolioConfigService,
		PortfolioConfigCache,
	],
})
export class PortfolioConfigModule {}
