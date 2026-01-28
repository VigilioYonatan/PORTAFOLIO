import path from "node:path";
import { fileURLToPath } from "node:url";
import { preact } from "@preact/preset-vite";
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Unified Vitest configuration
 *
 * Commands:
 * - pnpm test:unit  → Runs unit tests (with mocks)
 * - pnpm test:e2e   → Runs E2E tests (with real PostgreSQL)
 * - pnpm test       → Runs unit tests only (for safety)
 */
export default defineConfig({
	plugins: [
		swc.vite({
			jsc: {
				parser: {
					syntax: "typescript",
					decorators: true,
					dynamicImport: true,
				},
				transform: {
					legacyDecorator: true,
					decoratorMetadata: true,
				},
			},
		}),
		preact({ exclude: [/\.ts$/] }),
	],
	test: {
		server: {
			deps: {
				inline: ["react-hook-form"],
			},
		},
		environment: "happy-dom",
		globals: true,
		pool: "forks",
		testTimeout: 30000,
		// Default: Unit tests with mocks
		setupFiles: [
			path.join(
				__dirname,
				"src",
				"infrastructure",
				"config",
				"server",
				"setup-test.ts",
			),
		],
		include: [
			"src/modules/**/*.test.{ts,tsx}",
			"src/pages/**/*.test.{ts,tsx}",
			"src/components/**/*.test.{ts,tsx}",
			"src/hooks/**/*.test.{ts,tsx}",
			"src/utils/**/*.test.{ts,tsx}",
		],
		// Exclude E2E tests by default (they need real DB)
		exclude: ["**/*.e2e.test.ts", "**/node_modules/**"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: [
				"src/modules/**/*.ts",
				"src/hooks/**/*.ts",
				"src/utils/**/*.ts"
			],
			exclude: [
				"**/*.dto.ts",
				"**/*.schema.ts",
				"**/*.module.ts",
				"**/index.ts",
				"**/*.interface.ts",
				"**/*.factory.ts",
				"**/*.entity.ts",
				"**/__tests__/**",
				"**/components/**",
			],
			thresholds: {
				statements: 10,
				branches: 5,
				functions: 6,
				lines: 10,
			},
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
			react: "preact/compat",
			"react-dom/test-utils": "preact/test-utils",
			"react-dom": "preact/compat",
			"react/jsx-runtime": "preact/jsx-runtime",
		},
	},
});
