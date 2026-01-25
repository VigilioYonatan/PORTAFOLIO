import { AiConfigSeeder } from "@modules/ai/seeders/ai-config.seeder";
import { BlogCategorySeeder } from "@modules/blog-category/seeders/blog-category.seeder";
import { BlogPostSeeder } from "@modules/blog-post/seeders/blog-post.seeder";
import { ConversationSeeder } from "@modules/chat/seeders/conversation.seeder";
import { ContactSeeder } from "@modules/contact/seeders/contact.seeder";
import { MusicTrackSeeder } from "@modules/music/seeders/music.seeder";
import { PortfolioConfigSeeder } from "@modules/portfolio-config/seeders/portfolio-config.seeder";
import { TechnologySeeder } from "@modules/technology/seeders/technology.seeder";
import { TenantSeeder } from "@modules/tenant/seeders/tenant.seeder";
import { UserSeeder } from "@modules/user/seeders/user.seeder";
import { WorkExperienceSeeder } from "@modules/work-experience/seeders/work-experience.seeder";
import { WorkMilestoneSeeder } from "@modules/work-milestone/seeders/work-milestone.seeder";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { schema } from "../database.schema";
import { DRIZZLE } from "../database.service";

@Injectable()
export class SeederService {
	private readonly logger = new Logger(SeederService.name);

	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
		// Base seeders
		private readonly tenantSeeder: TenantSeeder,
		private readonly userSeeder: UserSeeder,
		private readonly contactSeeder: ContactSeeder,
		private readonly technologySeeder: TechnologySeeder,
		private readonly workExperienceSeeder: WorkExperienceSeeder,
		private readonly workMilestoneSeeder: WorkMilestoneSeeder,
		private readonly blogCategorySeeder: BlogCategorySeeder,
		private readonly blogPostSeeder: BlogPostSeeder,
		private readonly musicTrackSeeder: MusicTrackSeeder,
		private readonly portfolioConfigSeeder: PortfolioConfigSeeder,
		private readonly conversationSeeder: ConversationSeeder,
		private readonly aiConfigSeeder: AiConfigSeeder,
	) {}

	async run() {
		this.logger.log("🌱 Iniciando Seeding...");

		await this.resetDatabase();
		// ==========================================
		// FASE 1: Base & Tenant / User
		// ==========================================
		this.logger.log("📦 Fase 1: Seeders base (Roles, Tenant & User)...");

		const tenants = await this.tenantSeeder.run();
		const savedTenants = tenants;
		const tenantId = savedTenants[0].id;

		const users = await this.userSeeder.run();
		const userId = users[0].id; // Assign first user as admin/author

		// ==========================================
		// FASE 2: Feature Modules
		// ==========================================
		this.logger.log("📁 Fase 2: Feature Modules...");

		// Contact Messages
		this.logger.log("   - Contact Messages...");
		await this.contactSeeder.run(tenantId);

		this.logger.log("   - Portfolio Config...");
		await this.portfolioConfigSeeder.run(tenantId);

		this.logger.log("   - AI Config...");
		await this.aiConfigSeeder.run(tenantId);

		this.logger.log("   - Technologies...");
		await this.technologySeeder.run(tenantId);

		this.logger.log("   - Work Experiences...");
		await this.workExperienceSeeder.run(tenantId);

		this.logger.log("   - Work Milestones...");
		await this.workMilestoneSeeder.run(tenantId);

		this.logger.log("   - Blog Categories...");
		const categories = await this.blogCategorySeeder.run(tenantId);
		const categoryId = categories.length > 0 ? categories[0].id : undefined;

		this.logger.log("   - Blog Posts...");
		await this.blogPostSeeder.run(tenantId, userId, categoryId);

		this.logger.log("   - Music Tracks...");
		await this.musicTrackSeeder.run(tenantId);

		this.logger.log("   - Conversations...");
		await this.conversationSeeder.run(tenantId);

		this.logger.log("✅ Seeding completado exitosamente.");
		process.exit(0);
	}

	private async resetDatabase() {
		this.logger.warn("🗑️  Limpiando tablas...");

		const query = sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;
		const result = await this.db.execute(query);

		const tables = result.rows.map((row) => row.tablename);

		const tablesToDelete = tables.filter(
			(tableName) =>
				tableName !== "__drizzle_migrations" && tableName !== "migrations",
		);

		if (tablesToDelete.length === 0) {
			this.logger.warn("⚠️  No se encontraron tablas para limpiar.");
			return;
		}

		const truncateQuery = `TRUNCATE TABLE ${tablesToDelete
			.map((t) => `"${t}"`)
			.join(", ")} RESTART IDENTITY CASCADE;`;

		this.logger.log(`🔥 Ejecutando: ${truncateQuery}`);

		await this.db.execute(sql.raw(truncateQuery));
	}
}
