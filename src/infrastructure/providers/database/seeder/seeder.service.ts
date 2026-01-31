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
	) {}

	async run() {
		this.logger.log("🌱 Iniciando Seeding...");

		await this.resetDatabase();
		// ==========================================
		// FASE 1: Base & Tenant / User
		// ==========================================
		this.logger.log("📦 Fase 1: Seeders base (Roles, Tenant & User)...");

		// const tenants = await this.tenantSeeder.run();
		// const savedTenants = tenants;
		// const tenantId = savedTenants[0].id;

		// // ==========================================
		// // FASE 2: Feature Modules
		// // ==========================================
		// this.logger.log("📁 Fase 2: Feature Modules...");

		// // Contact Messages
		// this.logger.log("   - Contact Messages...");
		// await this.contactSeeder.run(tenantId);

		// this.logger.log("   - Portfolio Config...");
		// await this.portfolioConfigSeeder.run(tenantId);

		// this.logger.log("   - Projects...");
		// await this.projectSeeder.run(tenantId);

		// this.logger.log("   - AI Config...");
		// await this.aiConfigSeeder.run(tenantId);

		// this.logger.log("   - Technologies...");
		// await this.technologySeeder.run(tenantId);

		// this.logger.log("   - Work Experiences...");
		// await this.workExperienceSeeder.run(tenantId);

		// this.logger.log("   - Work Milestones...");
		// await this.workMilestoneSeeder.run(tenantId);

		// this.logger.log("   - Blog Categories...");
		// const categories = await this.blogCategorySeeder.run(tenantId);
		// const categoryId = categories.length > 0 ? categories[0].id : undefined;

		// this.logger.log("   - Blog Posts...");
		// await this.blogPostSeeder.run(tenantId, userId, categoryId);

		// this.logger.log("   - Music Tracks...");
		// await this.musicTrackSeeder.run(tenantId);

		// this.logger.log("   - Conversations...");
		// await this.conversationSeeder.run(tenantId);

		// this.logger.log("   - Open Source Projects...");
		// await this.openSourceSeeder.run(tenantId);

		// this.logger.log("✅ Seeding completado exitosamente.");
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
