import path from "node:path";
import { fileURLToPath } from "node:url";
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/**
 * E2E Tests configuration - uses REAL PostgreSQL database
 *
 * Usage: pnpm test:e2e:db
 */
// Set default DATABASE_URL for E2E tests if not defined
// In local, it should be picked from .env.test by the SetupTestDb or vite-env-setup
if (!process.env.DATABASE_URL) {
	// We can leave it empty or point to a default that is likely correct
}

export default defineConfig({
	plugins: [swc.vite()],
	test: {
		environment: "node",
		globals: true,
		pool: "forks",
		isolate: false,
		fileParallelism: false,
		testTimeout: 30000,
		// Minimal setup - does NOT mock DATABASE_URL
		setupFiles: [
			path.join(
				__dirname,
				"src",
				"infrastructure",
				"config",
				"server",
				"setup-e2e-real.ts",
			),
		],
		// Only E2E tests
		include: ["**/*.e2e.test.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			reportsDirectory: "./coverage/e2e",
			include: ["src/modules/**/*.ts"],
			exclude: [
				"**/*.dto.ts",
				"**/*.schema.ts",
				"**/*.module.ts",
				"**/index.ts",
				"**/*.interface.ts",
				"**/*.factory.ts",
				"**/*.entity.ts",
				"**/__tests__/**",
			],
		},
	},
	resolve: {
		alias: {
			"@modules": path.join(__dirname, "src", "modules"),
			"@infrastructure": path.join(__dirname, "src", "infrastructure"),
			"@assets": path.join(__dirname, "src", "assets"),
			"@components": path.join(__dirname, "src", "components"),
			"@hooks": path.join(__dirname, "src", "hooks"),
			"@stores": path.join(__dirname, "src", "stores"),
			"@src": path.join(__dirname, "src"),
		},
	},
});
