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

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/**/*.entity.ts",
	out: "./drizzle/migrations",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
	verbose: true,
	strict: true,
});
