import { BlogPostModule } from "@modules/blog-post/blog-post.module";
import { ContactModule } from "@modules/contact/modules/contact.module";
import { MusicModule } from "@modules/music/music.module";
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
	],
	controllers: [WebController],
	providers: [WebService],
})
export class WebModule {}
