import * as fs from "node:fs";
import * as path from "node:path";
import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { now } from "@infrastructure/utils/hybrid";
import { slugify } from "@infrastructure/utils/hybrid/slug.utils";
import { Inject, Injectable } from "@nestjs/common";
import { sql } from "drizzle-orm";
import { type NodePgDatabase } from "drizzle-orm/node-postgres";
import { openSourceEntity } from "../entities/open-source.entity";

@Injectable()
export class OpenSourceSeeder {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async run(tenantId: number) {
		const contentDir = path.join(
			process.cwd(),
			"src/modules/open-source/seeders/content",
		);

		const libsMetadata = [
			{
				name: "@vigilio/sweet",
				file: "sweet.md",
				npm_url: "https://www.npmjs.com/package/@vigilio/sweet",
				repo_url: "https://github.com/vigilio/sweet",
				category: "UI Library",
				stars: 156,
				downloads: 12500,
				version: "v1.4.2",
				sort_order: 1,
				description: {
					en: "Powerful and lightweight UI component library for React and Preact, centered on modal systems and interactive alerts with a modern design system.",
					es: "Biblioteca de componentes de interfaz de usuario potente y ligera para React y Preact, enfocada en sistemas de modales y alertas interactivas.",
					pt: "Biblioteca de componentes de interface de usuário poderosa e leve para React e Preact, focada em sistemas de modais e alertas interativos.",
				},
			},
			{
				name: "@vigilio/preact-fetching",
				file: "preact-fetching.md",
				npm_url: "https://www.npmjs.com/package/@vigilio/preact-fetching",
				repo_url: "https://github.com/vigilio/preact-fetching",
				category: "Core / Utilities",
				stars: 92,
				downloads: 8400,
				version: "v2.0.5",
				sort_order: 2,
				description: {
					en: "State-of-the-art data fetching for Preact. Powerful caching, automatic synchronization, and optimistic UI management inspired by React Query.",
					es: "Gestión de datos de última generación para Preact. Potente caché, sincronización automática y gestión optimista de la interfaz.",
					pt: "Gerenciamento de busca de dados de última geração para Preact. Cache poderoso, sincronização automática e gerenciamento otimista de interface.",
				},
			},
			{
				name: "@vigilio/preact-table",
				file: "preact-table.md",
				npm_url: "https://www.npmjs.com/package/@vigilio/preact-table",
				repo_url: "https://github.com/vigilio/preact-table",
				category: "UI / Table",
				stars: 45,
				downloads: 2100,
				version: "v1.1.0",
				sort_order: 3,
				description: {
					en: "The definitive headless table hook for Preact. Managed state for sorting, pagination, filtering, and selection with a focus on extreme performance.",
					es: "El hook de tabla headless definitivo para Preact. Estado gestionado para ordenación, paginación, filtrado y selección.",
					pt: "O hook de tabela headless definitivo para Preact. Estado gerenciado para ordenação, paginação, filtragem e seleção.",
				},
			},
			{
				name: "@vigilio/preact-paginator",
				file: "preact-paginator.md",
				npm_url: "https://www.npmjs.com/package/@vigilio/preact-paginator",
				repo_url: "https://github.com/vigilio/preact-paginator",
				category: "Core / Utilities",
				stars: 28,
				downloads: 1800,
				version: "v0.1.3",
				sort_order: 4,
				description: {
					en: "Lightweight, framework-agnostic pagination logic for Preact applications. Effortlessly manage page generation, gap handling, and state synchronization.",
					es: "Lógica de paginación ligera y agnóstica para aplicaciones Preact. Gestiona la generación de páginas y sincronización de estado.",
					pt: "Lógica de paginação leve e agnóstica para aplicações Preact. Gerencie a geração de páginas e sincronização de estado sem esforço.",
				},
			},
			{
				name: "@vigilio/valibot",
				file: "valibot.md",
				npm_url: "https://www.npmjs.com/package/@vigilio/valibot",
				repo_url: "https://github.com/vigilio/valibot",
				category: "Core / Validation",
				stars: 62,
				downloads: 4500,
				version: "v0.20.1",
				sort_order: 5,
				description: {
					en: "High-performance schema validation and transformation library. A specialized fork of Valibot optimized for enterprise applications and complex data structures.",
					es: "Biblioteca de validación y transformación de esquemas de alto rendimiento. Un fork especializado de Valibot optimizado para empresas.",
					pt: "Biblioteca de validação e transformação de esquemas de alto desempenho. Um fork especializado do Valibot otimizado para empresas.",
				},
			},
			{
				name: "@vigilio/next-api",
				file: "next-api.md",
				npm_url: "https://www.npmjs.com/package/@vigilio/next-api",
				repo_url: "https://github.com/vigilio/next-api",
				category: "Backend / Tooling",
				stars: 41,
				downloads: 2800,
				version: "v0.6.0",
				sort_order: 6,
				description: {
					en: "The ultimate framework for Next.js API routes. Brings NestJS-like decorators, dependency injection, and centralized validation to the world of Serverless APIs.",
					es: "El framework definitivo para rutas API de Next.js. Aporta decoradores tipo NestJS e inyección de dependencias.",
					pt: "O framework definitivo para rotas de API do Next.js. Traz decoradores estilo NestJS e injeção de dependências.",
				},
			},
			{
				name: "@vigilio/express",
				file: "express.md",
				npm_url: "https://www.npmjs.com/package/@vigilio/express",
				repo_url: "https://github.com/vigilio/express",
				category: "Backend / Tooling",
				stars: 120,
				downloads: 5400,
				version: "v1.0.0",
				sort_order: 7,
				description: {
					en: "The ultimate decorator-based framework for Express.js. Simplifies routing, dependency injection, and middleware management with a clean, declarative API.",
					es: "El framework basado en decoradores definitivo para Express.js. Simplifica el enrutamiento y la inyección de dependencias.",
					pt: "O framework baseado em decoradores definitivo para Express.js. Simplifica o roteamento e a injeção de dependências.",
				},
			},
		];

		for (const metadata of libsMetadata) {
			const filePath = path.join(contentDir, metadata.file);
			if (!fs.existsSync(filePath)) continue;

			const fullContent = fs.readFileSync(filePath, "utf-8");

			const contentMap: Record<string, string> = {};

			// Robust parsing using headers instead of splitting by '---' (which might exist in content)
			const enHeader = "### ENGLISH (EN)";
			const esHeader = "### ESPAÑOL (ES)";
			const ptHeader = "### PORTUGUÊS (PT)";

			const enIndex = fullContent.indexOf(enHeader);
			const esIndex = fullContent.indexOf(esHeader);
			const ptIndex = fullContent.indexOf(ptHeader);

			const indices = [
				{ lang: "en", index: enIndex },
				{ lang: "es", index: esIndex },
				{ lang: "pt", index: ptIndex },
			]
				.filter((i) => i.index !== -1)
				.sort((a, b) => a.index - b.index);

			for (let i = 0; i < indices.length; i++) {
				const current = indices[i];
				const next = indices[i + 1];
				const start =
					current.index +
					(current.lang === "en"
						? enHeader.length
						: current.lang === "es"
							? esHeader.length
							: ptHeader.length);
				const end = next ? next.index : fullContent.length;

				contentMap[current.lang] = fullContent
					.slice(start, end)
					.replace(/^-+|-+$/g, "") // remove leading/trailing --- if any
					.trim();
			}

			const slug = slugify(metadata.name);

			// Seed ES (Main) - Following blog-post pattern (ES as base)
			const [esLib] = await this.db
				.insert(openSourceEntity)
				.values({
					tenant_id: tenantId,
					name: metadata.name,
					slug: slug,
					description: metadata.description.es,
					content: contentMap.es || "Contenido en desarrollo...",
					npm_url: metadata.npm_url,
					repo_url: metadata.repo_url,
					category: metadata.category,
					stars: metadata.stars,
					downloads: metadata.downloads,
					version: metadata.version,
					is_visible: true,
					sort_order: metadata.sort_order,
					language: "es",
					created_at: now().toDate(),
					updated_at: now().toDate(),
				})
				.returning();

			// Seed EN
			if (contentMap.en) {
				await this.db.insert(openSourceEntity).values({
					tenant_id: tenantId,
					name: metadata.name,
					slug: `${slug}-en`,
					description: metadata.description.en,
					content: contentMap.en,
					npm_url: metadata.npm_url,
					repo_url: metadata.repo_url,
					category: metadata.category,
					stars: metadata.stars,
					downloads: metadata.downloads,
					version: metadata.version,
					is_visible: true,
					sort_order: metadata.sort_order,
					language: "en",
					parent_id: esLib.id,
					created_at: now().toDate(),
					updated_at: now().toDate(),
				});
			}

			// Seed PT
			if (contentMap.pt) {
				await this.db.insert(openSourceEntity).values({
					tenant_id: tenantId,
					name: metadata.name,
					slug: `${slug}-pt`,
					description: metadata.description.pt,
					content: contentMap.pt,
					npm_url: metadata.npm_url,
					repo_url: metadata.repo_url,
					category: metadata.category,
					stars: metadata.stars,
					downloads: metadata.downloads,
					version: metadata.version,
					is_visible: true,
					sort_order: metadata.sort_order,
					language: "pt",
					parent_id: esLib.id,
					created_at: now().toDate(),
					updated_at: now().toDate(),
				});
			}
		}

		// Final check
		const count = await this.db
			.select({ count: sql`count(*)` })
			.from(openSourceEntity);
		// biome-ignore lint/suspicious/noConsole: Seeder verify
		console.log(`📊 Total open-source projects in DB: ${count[0].count}`);
	}
}
