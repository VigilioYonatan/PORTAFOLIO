import { BlogPostModule } from "@modules/blog-post/blog-post.module";
import { ContactModule } from "@modules/contact/modules/contact.module";
import { MusicTrackModule } from "@modules/music/music.module";
import { ProjectModule } from "@modules/project/project.module";
import { WorkExperienceModule } from "@modules/work-experience/work-experience.module";
import { Module } from "@nestjs/common";
import { WebController } from "../controllers/web.controller";
import { SystemController } from "../controllers/system.controller";
import { WebService } from "../services/web.service";

@Module({
	imports: [
		MusicTrackModule,
		ContactModule,
		BlogPostModule,
		ProjectModule,
		WorkExperienceModule,
	],
	controllers: [WebController, SystemController],
	providers: [WebService],
})
export class WebModule {}
