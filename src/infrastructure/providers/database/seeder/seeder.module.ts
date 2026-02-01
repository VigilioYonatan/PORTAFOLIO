import { environmentsSchema } from "@infrastructure/config/server/environments.config";
import { DatabaseModule } from "@infrastructure/providers/database/database.module";
import { AiConfigSeeder } from "@modules/ai/seeders/ai-config.seeder";
import { BlogCategorySeeder } from "@modules/blog-category/seeders/blog-category.seeder";
import { BlogPostSeeder } from "@modules/blog-post/seeders/blog-post.seeder";
import { ConversationSeeder } from "@modules/chat/seeders/conversation.seeder";
import { ContactSeeder } from "@modules/contact/seeders/contact.seeder";
import { MusicTrackSeeder } from "@modules/music/seeders/music.seeder";
import { OpenSourceSeeder } from "@modules/open-source/seeders/open-source.seeder";
import { PortfolioConfigSeeder } from "@modules/portfolio-config/seeders/portfolio-config.seeder";
import { ProjectSeeder } from "@modules/project/seeders/project.seeder";
import { TechnologySeeder } from "@modules/technology/seeders/technology.seeder";
import { TenantSeeder } from "@modules/tenant/seeders/tenant.seeder";
import { UserSeeder } from "@modules/user/seeders/user.seeder";
import { WorkExperienceSeeder } from "@modules/work-experience/seeders/work-experience.seeder";
import { WorkMilestoneSeeder } from "@modules/work-milestone/seeders/work-milestone.seeder";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppModule } from "../../../../app.module";
import { SeederService } from "./seeder.service";

@Module({
	imports: [
		AppModule,
		ConfigModule.forRoot({
			isGlobal: true,
			validate: (config) => {
				const result = environmentsSchema.safeParse(config);
				if (!result.success) {
					throw new Error("Invalid environment variables");
				}
				return result.data;
			},
			envFilePath: [".env"],
		}),
		DatabaseModule,
	],
	providers: [
		SeederService,
		// Base seeders
		TenantSeeder,
		ContactSeeder,
		TechnologySeeder,
		WorkExperienceSeeder,
		WorkMilestoneSeeder,
		UserSeeder,
		BlogCategorySeeder,
		BlogPostSeeder,
		MusicTrackSeeder,
		PortfolioConfigSeeder,
		ConversationSeeder,
		ProjectSeeder,
		AiConfigSeeder,
		OpenSourceSeeder,
	],
})
export class SeederModule {}
