import { existsSync } from "node:fs";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

const isTest = process.env.NODE_ENV === "TEST";

// Load appropriate .env file
if (isTest && existsSync(".env.test")) {
	config({ path: ".env.test", override: true });
} else {
	config();
}

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
	console.error("❌ DATABASE_URL is not defined in the environment");
}

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/**/*.entity.ts",
	out: "./drizzle/migrations",
	dbCredentials: {
		url: dbUrl!,
	},
	verbose: true,
	strict: true,
});
