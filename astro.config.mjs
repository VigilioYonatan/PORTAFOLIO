import path from "node:path";
import { fileURLToPath } from "node:url";
import node from "@astrojs/node";
import preact from "@astrojs/preact";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";
import { loadEnv } from "vite";

const { PUBLIC_PORT, PORT } = loadEnv(process.env.NODE_ENV, process.cwd(), "");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
	output: "server",

	integrations: [preact({ compat: true })],
	i18n: {
		defaultLocale: "es",
		locales: ["es", "en", "pt"],
		routing: {
			prefixDefaultLocale: false, // "es" está en "/", "en" está en "/en"
		},
	},
	env: {
		schema: {
			PUBLIC_NAME_APP: envField.string({
				context: "client",
				access: "public",
			}),
			PUBLIC_ENV: envField.string({
				context: "client",
				access: "public",
			}),
			PUBLIC_URL: envField.string({
				context: "client",
				access: "public",
			}),
			PUBLIC_PORT: envField.string({
				context: "client",
				access: "public",
			}),
			PUBLIC_HMAC_KEY: envField.string({
				context: "client",
				access: "public",
			}),
			PUBLIC_VAPID_EMAIL: envField.string({
				context: "client",
				access: "public",
			}),
			PUBLIC_VAPID_KEY: envField.string({
				context: "client",
				access: "public",
			}),
		},
	},
	adapter: node({ mode: "middleware" }),
	vite: {
		server: {
			proxy: {
				"/api": {
					target: `http://localhost:${PORT || 3004}`,
					changeOrigin: true,
				},
			},
		},
		ssr: {
			noExternal: [
				"react-hook-form",
				"react-lite-youtube-embed",
				"@tinymce/tinymce-react",
				"@streamspark/react-video-player",
				"@mdxeditor/editor",
			],
		},
		plugins: [
			tailwindcss(),
			// {
			// 	name: "treat-js-files-as-jsx",
			// 	async transform(code, id) {
			// 		if (!id.match(/node_modules\/(@vigilio|motion-dom)\/.*\.(js|mjs)$/))
			// 			return null;
			// 		return transformWithEsbuild(code, id, {
			// 			loader: "jsx",
			// 			jsx: "automatic",
			// 		});
			// 	},
			// },
		],
		resolve: {
			alias: {
				"@modules": path.join(__dirname, "src", "modules"),
				"@infrastructure": path.join(__dirname, "src", "infrastructure"),
				"@assets": path.join(__dirname, "src", "assets"),
				"@components": path.join(__dirname, "src", "components"),
				"@pages": path.join(__dirname, "src", "pages"),
				"@i18n": path.join(__dirname, "src", "i18n"),
				"@hooks": path.join(__dirname, "src", "hooks"),
				"@stores": path.join(__dirname, "src", "stores"),
				"@src": path.join(__dirname, "src"),
				"react/jsx-runtime": "preact/jsx-runtime",
				react: "preact/compat",
				"react-dom": "preact/compat",
			},
		},
		// optimizeDeps: {
		// 	esbuildOptions: {
		// 		loader: {
		// 			".js": "jsx",
		// 		},
		// 	},
		// 	include: [
		// 		"lucide-preact",
		// 		"motion",
		// 		"@vigilio/preact-paginator",
		// 		"@vigilio/preact-fetching",
		// 		"@vigilio/preact-table",
		// 		"@vigilio/sweet",
		// 		"react-hook-form",
		// 		"react-lite-youtube-embed",
		// 		"@tinymce/tinymce-react",
		// 		"@streamspark/react-video-player",
		// 	],
		// },
	},
	prefetch: {
		prefetchAll: true,
		defaultStrategy: "tap", // Prefetch en el tap (clic) para mejorar UX
	},
	test: {
		// happy-dom is faster and lighter than jsdom (2026 best practice)
		environment: "happy-dom",
		setupFiles: [
			path.resolve(
				__dirname,
				"./src/infrastructure/config/server/setup-test.ts",
			),
		],
		globals: true,
		include: ["**/*.e2e.test.ts", "**/*.test.ts"],
		pool: "forks",
	},
	server: {
		port: Number(process.env.PORT || PUBLIC_PORT),
		watch: {
			ignored: ["**/.sessions/**"], // Ignorar carpeta de sesiones para evitar hot reload infinito
		},
	},
});
