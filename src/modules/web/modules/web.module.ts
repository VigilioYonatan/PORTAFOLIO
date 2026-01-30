import { BlogPostModule } from "@modules/blog-post/blog-post.module";
import { ContactModule } from "@modules/contact/modules/contact.module";
import { MusicModule } from "@modules/music/music.module";
import { OpenSourceModule } from "@modules/open-source/modules/open-source.module";
import { PortfolioConfigModule } from "@modules/portfolio-config/portfolio-config.module";
import { ProjectModule } from "@modules/project/project.module";
import { TechnologyModule } from "@modules/technology/technology.module";
import { WorkExperienceModule } from "@modules/work-experience/work-experience.module";
import { Module } from "@nestjs/common";
import { WebController } from "../controllers/web.controller";
import { WebService } from "../services/web.service";

@Module({
	imports: [
		MusicModule,
		ContactModule,
		BlogPostModule,
		ProjectModule,
		TechnologyModule,
		WorkExperienceModule,
		OpenSourceModule,
		PortfolioConfigModule,
	],
	controllers: [WebController],
	providers: [WebService],
})
export class WebModule {}
