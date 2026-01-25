import type { Environments } from "@infrastructure/config/server";
import { Global, Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { DRIZZLE, PG_POOL } from "./database.const";
import { schema } from "./database.schema";
import { DatabaseService } from "./database.service";

const logger = new Logger("DatabaseModule");

@Global()
@Module({
	imports: [ConfigModule],
	providers: [
		{
			provide: PG_POOL,
			inject: [ConfigService],
			useFactory: async (configService: ConfigService<Environments>) => {
				const connectionString = configService.getOrThrow("DATABASE_URL");
				logger.log(`🔌 DatabaseModule using: ${connectionString}`);

				if (connectionString.startsWith("pglite://")) {
					const { getSharedPGlite } = await import(
						"../../config/server/pglite-shared.js"
					);

					const pathName = connectionString.replace("pglite://", "");
					return await getSharedPGlite(pathName);
				}

				const pool = new Pool({ connectionString });

				pool.on("connect", () => logger.debug("New client connected to pool"));
				pool.on("error", (err) =>
					logger.error("Unexpected error on idle client", err),
				);

				// Verificar conexión a la base de datos
				try {
					const client = await pool.connect();
					await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
					client.release();
					logger.log("\x1b[32m✓ Base de datos conectada correctamente\x1b[0m");
				} catch (error) {
					logger.error(
						"\x1b[31m✗ Error conectando a la base de datos\x1b[0m",
						error,
					);
					throw error;
				}
				return pool;
			},
		},
		{
			provide: DRIZZLE,
			inject: [ConfigService, PG_POOL],
			useFactory: async (
				configService: ConfigService<Environments>,
				pool: Pool | any, // Use any for PGlite compatibility
			) => {
				const isDev = configService.getOrThrow("NODE_ENV") === "DEVELOPMENT";
				const connectionString = configService.getOrThrow("DATABASE_URL");

				if (connectionString.startsWith("pglite://")) {
					const { drizzle: drizzlePGLite } = await import("drizzle-orm/pglite");
					return drizzlePGLite(pool, { schema });
				}

				const db = drizzle(pool, {
					schema,
					logger: isDev,
				});
				return db;
			},
		},
		DatabaseService,
	],
	exports: [DRIZZLE, PG_POOL, DatabaseService],
})
export class DatabaseModule {}
