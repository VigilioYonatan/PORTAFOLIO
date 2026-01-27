/** biome-ignore-all lint/suspicious/noConsole: <explanation> */
/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import { existsSync } from "node:fs";
import path from "node:path";
import { schema } from "@infrastructure/providers/database/database.schema";
import * as bcrypt from "bcrypt";
import { config } from "dotenv";
import { sql } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate as migrateNodePg } from "drizzle-orm/node-postgres/migrator";
import {
	drizzle as drizzlePGLite,
	type PgliteDatabase,
} from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { Pool } from "pg";

let usingDedicatedTestDb = false;
export type TestDb =
	| NodePgDatabase<typeof schema>
	| PgliteDatabase<typeof schema>;
let db: TestDb | null = null;
let pool: Pool | null = null;
let pgliteInstance: any = null;

/**
 * Load test environment variables
 */
export function loadTestEnv(): string {
	if (existsSync(".env.test")) {
		config({ path: ".env.test", override: true });
		usingDedicatedTestDb = true;
	} else {
		config({ path: ".env", override: true });
		usingDedicatedTestDb = false;
	}

	return process.env.DATABASE_URL || "";
}

/**
 * Get or create database connection for E2E tests
 */
export async function getTestDb(): Promise<TestDb> {
	if (db) return db;

	const connString = loadTestEnv();

	if (connString.startsWith("pglite://")) {
		const { getSharedPGlite } = await import("./pglite-shared.js");
		const pathName = connString.replace("pglite://", "");
		pgliteInstance = await getSharedPGlite(pathName);
		db = drizzlePGLite(pgliteInstance, { schema });

		// Standalone migration
		console.log("📜 Running migrations on PGlite...");
		try {
			await migrate(db, {
				migrationsFolder: path.join(process.cwd(), "drizzle/migrations"),
			});
			console.log("✅ Migrations completed.");
		} catch (err) {
			console.error("❌ Migration failed:", err);
			throw err;
		}

		return db;
	}

	console.log("🐘 Connecting to real PostgreSQL for tests...");
	pool = new Pool({ connectionString: connString });

	// Ensure vector extension exists (idempotent, no schema reset)
	if (usingDedicatedTestDb) {
		console.log("🔌 Ensuring vector extension...");
		const client = await pool.connect();
		try {
			await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
			console.log("✅ Vector extension ready.");
		} catch (error) {
			console.warn(
				"⚠️ Could not create vector extension (might need superuser):",
				error,
			);
		} finally {
			client.release();
		}
	}

	db = drizzle(pool, { schema, logger: true });

	// Standalone migration for real PG (idempotent - only runs new migrations)
	try {
		await migrateNodePg(db as NodePgDatabase<typeof schema>, {
			migrationsFolder: path.join(process.cwd(), "drizzle/migrations"),
		});
		console.log("✅ Migrations completed.");
	} catch (err: any) {
		if (err?.cause?.code === "42710") {
			console.warn(
				"⚠️ Migration warning: Enum value already exists, proceeding...",
			);
		} else {
			console.error("❌ Migration failed:", err);
			throw err;
		}
	}

	return db;
}

/**
 * Close database connection
 */
export async function closeTestDb(): Promise<void> {
	if (pool) {
		await pool.end();
		pool = null;
	}
	if (pgliteInstance && typeof pgliteInstance.close === "function") {
		await pgliteInstance.close();
		pgliteInstance = null;
	}
	db = null;
}

/**
 * Get the test database pool for provider overrides
 */
export function getTestPool(): Pool | null {
	return pool;
}

export async function cleanAllTestData(database: TestDb): Promise<void> {
	const connString = process.env.DATABASE_URL || "";
	const isPGLite = connString.startsWith("pglite://");

	if (usingDedicatedTestDb || isPGLite) {
		try {
			// Use TRUNCATE ... IF EXISTS pattern for PostgreSQL
			await database.execute(
				sql`DO $$
        BEGIN
          IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
            TRUNCATE users, tenant_setting, tenants RESTART IDENTITY CASCADE;
          END IF;
        END $$;`,
			);
		} catch (_err) {
			// Tables might not exist yet on first run, ignore error
			console.warn("⚠️ cleanAllTestData skipped - tables may not exist yet");
		}
	}
}

export async function seedLocalhostTenant(database: TestDb): Promise<number> {
	const existing = await database.execute(
		sql`SELECT id FROM tenants WHERE slug = 'localhost' LIMIT 1`,
	);
	if (existing.rows.length > 0) {
		return (existing.rows[0] as any).id;
	}

	const result = await database.execute(sql`
    INSERT INTO tenants (name, slug, domain, email, plan, is_active, created_at, updated_at)
    VALUES ('Localhost Tenant', 'localhost', 'localhost', 'test@localhost.com', 'ENTERPRISE', true, NOW(), NOW())
    RETURNING id
  `);
	const tenantId = (result.rows[0] as { id: number })?.id;
	if (tenantId) {
		const hashedPassword = await bcrypt.hash("password", 10);

		await database.execute(sql`
      INSERT INTO tenant_setting (tenant_id, is_verified, color_primary, color_secondary, default_language, time_zone, created_at, updated_at)
      VALUES (${tenantId}, true, '#000000', '#ffffff', 'EN', 'UTC', NOW(), NOW())
    `);

		await database.execute(sql`
      INSERT INTO users (username, email, password, role_id, tenant_id, is_superuser, security_stamp, created_at, updated_at)
      VALUES ('admin', 'admin@localhost.com', ${hashedPassword}, 1, ${tenantId}, true, '550e8400-e29b-41d4-a716-446655440000', NOW(), NOW())
    `);

		await database.execute(sql`
      INSERT INTO users (username, email, password, role_id, tenant_id, is_superuser, security_stamp, created_at, updated_at)
      VALUES ('user', 'user@localhost.com', ${hashedPassword}, 2, ${tenantId}, false, '550e8400-e29b-41d4-a716-446655440005', NOW(), NOW())
    `);

		return tenantId;
	}
	throw new Error("Failed to seed localhost tenant");
}

export async function setupTestDb(): Promise<TestDb> {
	const database = await getTestDb();
	await cleanAllTestData(database);
	await seedLocalhostTenant(database);
	return database;
}

export async function teardownTestDb(): Promise<void> {
	if (db) {
		await cleanAllTestData(db);
	}
	await closeTestDb();
}
