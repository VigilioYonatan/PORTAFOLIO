import * as fs from "node:fs";
import * as path from "node:path";
import { faker } from "@faker-js/faker";
import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { now } from "@infrastructure/utils/hybrid";
import { Inject, Injectable } from "@nestjs/common";
import { sql } from "drizzle-orm";
import { type NodePgDatabase } from "drizzle-orm/node-postgres";

@Injectable()
export class BlogPostSeeder {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async run(tenant_id: number, author_id: number, category_id?: number) {
		const contentDir = path.join(
			process.cwd(),
			"src/modules/blog-post/seeders/content",
		);
		// biome-ignore lint/suspicious/noConsole: Seeder debug
		console.log(`Content directory: ${contentDir}`);

		const posts = [
			{
				slug: "event-driven-nestjs",
				file: "event-driven-nestjs.md",
				category: "Backend",
				es: { title: "Arquitecturas Orientadas a Eventos con NestJS" },
				en: { title: "Event-Driven Architectures with NestJS" },
				pt: { title: "Arquiteturas Orientadas a Eventos com NestJS" },
			},
			{
				slug: "postgres-performance",
				file: "postgres-performance.md",
				category: "Database",
				es: { title: "Dominando el Rendimiento en PostgreSQL" },
				en: { title: "Mastering PostgreSQL Performance" },
				pt: { title: "Dominando o Desempenho no PostgreSQL" },
			},
			{
				slug: "docker-production",
				file: "docker-production.md",
				category: "DevOps",
				es: { title: "Docker en Producción: Guía para Node.js" },
				en: { title: "Docker in Production: Node.js Guide" },
				pt: { title: "Docker em Produção: Guia para Node.js" },
			},
			{
				slug: "aws-architecture",
				file: "aws-architecture.md",
				category: "Cloud",
				es: { title: "Arquitecturas Cloud Escalables en AWS" },
				en: { title: "Scalable Cloud Architectures on AWS" },
				pt: { title: "Arquiteturas Cloud Escaláveis na AWS" },
			},
			{
				slug: "langchain-ai",
				file: "langchain-ai.md",
				category: "AI",
				es: { title: "Potenciando Aplicaciones con IA: LangChain" },
				en: { title: "Powering Applications with AI: LangChain" },
				pt: { title: "Potencializando Aplicações com IA: LangChain" },
			},
			{
				slug: "advanced-nestjs-microservices",
				file: "advanced-nestjs-microservices.md",
				category: "Backend",
				es: {
					title:
						"Microservicios NestJS de Alto Rendimiento: gRPC, NATS y Redis",
				},
				en: {
					title: "High-Performance NestJS Microservices: gRPC, NATS, and Redis",
				},
				pt: {
					title: "Microsserviços NestJS de Alto Desempenho: gRPC, NATS e Redis",
				},
			},
			{
				slug: "distributed-indexing-strategies",
				file: "distributed-indexing-strategies.md",
				category: "Database",
				es: {
					title:
						"Estrategias de Indexación Avanzadas y Optimización SQL Senior",
				},
				en: {
					title: "Advanced Indexing Strategies and Senior SQL Optimization",
				},
				pt: {
					title: "Estratégias de Indexação Avançadas e Otimização SQL Sênior",
				},
			},
			{
				slug: "kubernetes-best-practices",
				file: "kubernetes-best-practices.md",
				category: "DevOps",
				es: {
					title:
						"Kubernetes en la Empresa: Patrones de Orquestación y Resiliencia",
				},
				en: {
					title:
						"Kubernetes in the Enterprise: Orchestration and Resilience Patterns",
				},
				pt: {
					title: "Kubernetes na Empresa: Padrões de Orquestração e Resiliência",
				},
			},
			{
				slug: "rag-architecture-langchain",
				file: "rag-architecture-langchain.md",
				category: "AI",
				es: {
					title:
						"Arquitectura RAG Avanzada: Optimizando LangChain para Producción",
				},
				en: {
					title:
						"Advanced RAG Architecture: Optimizing LangChain for Production",
				},
				pt: {
					title: "Arquitetura RAG Avançada: Otimizando LangChain para Produção",
				},
			},
			{
				slug: "typescript-enterprise-patterns",
				file: "typescript-enterprise-patterns.md",
				category: "Backend",
				es: {
					title:
						"Patrones Enterprise en TypeScript: Modelado de Dominio y Tipado Estricto",
				},
				en: {
					title:
						"Enterprise Patterns in TypeScript: Domain Modeling and Strict Typing",
				},
				pt: {
					title:
						"Padrões Enterprise em TypeScript: Modelagem de Domínio e Tipagem Estrita",
				},
			},
			{
				slug: "zero-downtime-migrations",
				file: "zero-downtime-migrations.md",
				category: "Database",
				es: {
					title:
						"Migraciones de Base de Datos Zero-Downtime: Estrategias Avanzadas",
				},
				en: { title: "Zero-Downtime Database Migrations: Advanced Strategies" },
				pt: {
					title:
						"Migrações de Banco de Dados Zero-Downtime: Estratégias Avançadas",
				},
			},
			{
				slug: "observability-at-scale",
				file: "observability-at-scale.md",
				category: "DevOps",
				es: {
					title: "Observabilidad a Escala: OpenTelemetry, Prometheus y Grafana",
				},
				en: {
					title:
						"Observability at Scale: OpenTelemetry, Prometheus, and Grafana",
				},
				pt: {
					title:
						"Observabilidade em Escala: OpenTelemetry, Prometheus e Grafana",
				},
			},
			{
				slug: "advanced-security-auth",
				file: "advanced-security-auth.md",
				category: "Backend",
				es: {
					title:
						"Seguridad Avanzada: OAuth2, OIDC y Gestión de Identidad Enterprise",
				},
				en: {
					title:
						"Advanced Security: OAuth2, OIDC, and Enterprise Identity Management",
				},
				pt: {
					title:
						"Segurança Avançada: OAuth2, OIDC e Gestão de Identidade Enterprise",
				},
			},
			{
				slug: "clean-architecture-ddd",
				file: "clean-architecture-ddd.md",
				category: "Backend",
				es: {
					title:
						"Clean Architecture y DDD con NestJS: Guía para Sistemas Escalables",
				},
				en: {
					title:
						"Clean Architecture & DDD with NestJS: Guide for Scalable Systems",
				},
				pt: {
					title:
						"Clean Architecture e DDD com NestJS: Guia para Sistemas Escaláveis",
				},
			},
			{
				slug: "high-performance-ai",
				file: "high-performance-ai.md",
				category: "AI",
				es: {
					title:
						"Arquitecturas de IA de Alto Rendimiento: Vector DBs y Caching Semántico",
				},
				en: {
					title:
						"High-Performance AI Architectures: Vector DBs and Semantic Caching",
				},
				pt: {
					title:
						"Arquiteturas de IA de Alto Desempenho: Vector DBs e Cache Semântico",
				},
			},
			{
				slug: "serverless-orchestration-aws",
				file: "serverless-orchestration-aws.md",
				category: "Cloud",
				es: {
					title: "Orquestación Serverless en AWS: Step Functions y EventBridge",
				},
				en: {
					title:
						"Serverless Orchestration on AWS: Step Functions and EventBridge",
				},
				pt: {
					title: "Orquestração Serverless na AWS: Step Functions e EventBridge",
				},
			},
			{
				slug: "cicd-gitops",
				file: "cicd-gitops.md",
				category: "DevOps",
				es: {
					title: "CI/CD para Ingenieros Senior: De lo Básico a GitOps y Canary",
				},
				en: {
					title: "CI/CD for Senior Engineers: From Basics to GitOps and Canary",
				},
				pt: {
					title: "CI/CD para Engenheiros Sênior: Do Básico a GitOps e Canary",
				},
			},
			{
				slug: "advanced-testing-strategies",
				file: "advanced-testing-strategies.md",
				category: "Quality",
				es: {
					title:
						"Estrategias de Testing Avanzadas: Contrato, Mutación y E2E Pro",
				},
				en: {
					title: "Advanced Testing Strategies: Contract, Mutation, and E2E Pro",
				},
				pt: {
					title: "Estratégias de Teste Avançadas: Contrato, Mutação e E2E Pro",
				},
			},
			{
				slug: "bff-pattern",
				file: "bff-pattern.md",
				category: "Backend",
				es: {
					title:
						"Patrón BFF (Backend for Frontend): Optimizando la UX Multi-Cliente",
				},
				en: {
					title:
						"BFF (Backend for Frontend) Pattern: Optimizing Multi-Client UX",
				},
				pt: {
					title:
						"Padrão BFF (Backend for Frontend): Otimizando a UX Multi-Cliente",
				},
			},
			{
				slug: "nodejs-performance-tuning",
				file: "nodejs-performance-tuning.md",
				category: "Backend",
				es: {
					title:
						"Node.js Performance Tuning: Perfilado, GC y Optimización Extrema",
				},
				en: {
					title:
						"Node.js Performance Tuning: Profiling, GC, and Extreme Optimization",
				},
				pt: {
					title:
						"Node.js Performance Tuning: Profiling, GC e Otimização Extrema",
				},
			},
			{
				slug: "nestjs-multitenancy",
				file: "nestjs-multitenancy.md",
				category: "Backend",
				es: { title: "Multi-tenancy a Escala con NestJS y Drizzle" },
				en: { title: "Multi-tenancy at Scale with NestJS and Drizzle" },
				pt: { title: "Multi-tenancy em Escala com NestJS e Drizzle" },
			},
			{
				slug: "express-drizzle-high-load",
				file: "express-drizzle-high-load.md",
				category: "Backend",
				es: { title: "Rendimiento Extremo con ExpressJS y Drizzle" },
				en: { title: "Extreme Performance with ExpressJS and Drizzle" },
				pt: { title: "Desempenho Extremo com ExpressJS e Drizzle" },
			},
			{
				slug: "senior-docker-kubernetes-security",
				file: "senior-docker-kubernetes-security.md",
				category: "DevOps",
				es: {
					title:
						"Seguridad de Contenedores Senior (Hardening Docker & Kubernetes)",
				},
				en: {
					title: "Senior Container Security (Hardening Docker & Kubernetes)",
				},
				pt: {
					title:
						"Segurança de Contêineres Sênior (Hardening Docker & Kubernetes)",
				},
			},
			{
				slug: "langchain-multi-agent-systems",
				file: "langchain-multi-agent-systems.md",
				category: "AI",
				es: { title: "Sistemas Multi-Agente con LangChain y LangGraph" },
				en: { title: "Multi-Agent Systems with LangChain and LangGraph" },
				pt: { title: "Sistemas Multi-Agente com LangChain e LangGraph" },
			},
			{
				slug: "aws-cloud-native-resilience",
				file: "aws-cloud-native-resilience.md",
				category: "Cloud",
				es: { title: "Resiliencia Cloud Native en AWS: Multi-Region y Chaos" },
				en: { title: "Cloud Native Resilience on AWS: Multi-Region and Chaos" },
				pt: { title: "Resiliência Cloud Native na AWS: Multi-Region e Chaos" },
			},
			{
				slug: "micro-frontends-astro",
				file: "micro-frontends-astro.md",
				category: "Frontend",
				es: {
					title:
						"Micro-Frontends Senior con Astro: Arquitectura de Ilhas y Rendimiento Extremo",
				},
				en: {
					title:
						"Senior Micro-Frontends with Astro: Island Architecture and Extreme Performance",
				},
				pt: {
					title:
						"Micro-Frontends Sênior com Astro: Arquitetura de Ilhas e Desempenho Extremo",
				},
			},
			{
				slug: "advanced-sharding-drizzle",
				file: "advanced-sharding-drizzle.md",
				category: "Database",
				es: {
					title:
						"Sharding y Particionamiento Avanzado con PostgreSQL y DrizzleORM",
				},
				en: {
					title:
						"Advanced Sharding and Partitioning with PostgreSQL and DrizzleORM",
				},
				pt: {
					title:
						"Sharding e Particionamento Avançado com PostgreSQL e DrizzleORM",
				},
			},
			{
				slug: "cloud-native-disaster-recovery",
				file: "cloud-native-disaster-recovery.md",
				category: "Cloud",
				es: {
					title:
						"Disaster Recovery Cloud-Native: Estrategias Multi-Región y Resiliencia",
				},
				en: {
					title:
						"Cloud-Native Disaster Recovery: Multi-Region Strategies and Resilience",
				},
				pt: {
					title:
						"Disaster Recovery Cloud-Native: Estratégias Multi-Região e Resiliência",
				},
			},
			{
				slug: "custom-llm-framework",
				file: "custom-llm-framework.md",
				category: "AI",
				es: {
					title:
						"Construyendo tu propio Framework de LLM con LangChain y LangGraph",
				},
				en: {
					title: "Building Your Own LLM Framework with LangChain and LangGraph",
				},
				pt: {
					title:
						"Construindo seu próprio Framework de LLM com LangChain e LangGraph",
				},
			},
			{
				slug: "high-load-nodejs-engineering",
				file: "high-load-nodejs-engineering.md",
				category: "Backend",
				es: {
					title:
						"Ingeniería de Alto Rendimiento en Node.js: Worker Threads y Memoria Compartida",
				},
				en: {
					title:
						"High-Performance Engineering in Node.js: Worker Threads and Shared Memory",
				},
				pt: {
					title:
						"Engenharia de Alto Desempenho no Node.js: Worker Threads e Memória Compartilhada",
				},
			},
			{
				slug: "advanced-nestjs-patterns",
				file: "advanced-nestjs-patterns.md",
				category: "Backend",
				es: {
					title: "Patrones Senior en NestJS: CQRS, DDD y Arquitecturas Limpias",
				},
				en: {
					title:
						"Senior Patterns in NestJS: CQRS, DDD, and Clean Architectures",
				},
				pt: {
					title: "Padrões Sênior no NestJS: CQRS, DDD e Arquiteturas Limpas",
				},
			},
			{
				slug: "drizzle-orm-advanced",
				file: "drizzle-orm-advanced.md",
				category: "Database",
				es: {
					title:
						"Drizzle ORM Avanzado: Relaciones Complejas y Optimización de Consultas",
				},
				en: {
					title:
						"Advanced Drizzle ORM: Complex Relations and Query Optimization",
				},
				pt: {
					title:
						"Drizzle ORM Avançado: Relações Complexas e Otimização de Consultas",
				},
			},
			{
				slug: "expressjs-performance-tuning",
				file: "expressjs-performance-tuning.md",
				category: "Backend",
				es: {
					title:
						"Optimización Extrema de ExpressJS: Guía Senior para Alto Rendimiento",
				},
				en: {
					title:
						"Extreme ExpressJS Optimization: Senior Guide for High Performance",
				},
				pt: {
					title:
						"Otimização Extrema do ExpressJS: Guia Sênior para Alto Desempenho",
				},
			},
			{
				slug: "aws-event-driven-serverless",
				file: "aws-event-driven-serverless.md",
				category: "Cloud",
				es: {
					title:
						"Arquitecturas Serverless en AWS: EventBridge, Step Functions y Drizzle",
				},
				en: {
					title:
						"Serverless Architectures on AWS: EventBridge, Step Functions, and Drizzle",
				},
				pt: {
					title:
						"Arquiteturas Serverless na AWS: EventBridge, Step Functions e Drizzle",
				},
			},
			{
				slug: "langchain-production-rag",
				file: "langchain-production-rag.md",
				category: "AI",
				es: { title: "Sistemas RAG en Producción con LangChain y PGVector" },
				en: { title: "Production RAG Systems with LangChain and PGVector" },
				pt: { title: "Sistemas RAG em Produção com LangChain e PGVector" },
			},
			{
				slug: "high-scale-redis-nestjs",
				file: "high-scale-redis-nestjs.md",
				category: "Backend",
				es: { title: "Estrategias de Escalado con Redis y NestJS" },
				en: { title: "Redis Scaling Strategies with NestJS" },
				pt: { title: "Estratégias de Escalonamento com Redis e NestJS" },
			},
			{
				slug: "api-gateway-enterprise",
				file: "api-gateway-enterprise.md",
				category: "Backend",
				es: { title: "API Gateway Enterprise con Express y Drizzle" },
				en: { title: "Enterprise API Gateway with Express and Drizzle" },
				pt: { title: "API Gateway Enterprise com Express e Drizzle" },
			},
			{
				slug: "aws-vpc-lattice-microservices",
				file: "aws-vpc-lattice-microservices.md",
				category: "Cloud",
				es: { title: "Microservicios Modernos con AWS VPC Lattice" },
				en: { title: "Modern Microservices with AWS VPC Lattice" },
				pt: { title: "Microsserviços Modernos com AWS VPC Lattice" },
			},
			{
				slug: "langchain-agent-scalability",
				file: "langchain-agent-scalability.md",
				category: "AI",
				es: { title: "Escalando Agentes de IA con LangGraph" },
				en: { title: "Scaling AI Agents with LangGraph" },
				pt: { title: "Escalonando Agentes de IA com LangGraph" },
			},
			{
				slug: "postgresql-read-replicas-drizzle",
				file: "postgresql-read-replicas-drizzle.md",
				category: "Database",
				es: { title: "Réplicas de Lectura en PostgreSQL con Drizzle" },
				en: { title: "PostgreSQL Read Replicas with Drizzle" },
				pt: { title: "Réplicas de Leitura no PostgreSQL com Drizzle" },
			},
		];

		const createdPosts: any[] = [];

		// Create a lookup map for existing metadata
		const metadataMap = new Map(posts.map((p) => [p.file, p]));

		// Get all markdown files from the directory
		const files = fs
			.readdirSync(contentDir)
			.filter((file) => file.endsWith(".md"));

		for (const file of files) {
			const filePath = path.join(contentDir, file);
			// biome-ignore lint/suspicious/noConsole: Seeder debug
			console.log(`Processing file: ${file}`);

			const slug = file.replace(".md", "");
			const defaultTitle = slug
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");

			// Use metadata if available, otherwise generate defaults
			const metadata = metadataMap.get(file) || {
				slug,
				file,
				category: "Backend", // Not used currently but kept for consistency
				es: { title: defaultTitle },
				en: { title: defaultTitle },
				pt: { title: defaultTitle },
			};

			const fullContent = fs.readFileSync(filePath, "utf-8");
			// biome-ignore lint/suspicious/noConsole: Seeder debug
			console.log(`Found content for ${file}, length: ${fullContent.length}`);

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

			// Seed ES (Main)
			const [esPost] = await this.db
				.insert(schema.blogPostEntity)
				.values({
					tenant_id,
					title: metadata.es.title,
					slug: metadata.slug,
					content: contentMap.es || "Contenido en desarrollo...",
					extract:
						contentMap.es?.substring(0, 160).replace(/[#*`]/g, "") + "...",
					is_published: true,
					reading_time_minutes: 15,
					cover: null,
					seo: null,
					published_at: faker.date.past(),
					category_id: category_id || null,
					author_id,
					language: "es" as const,
					created_at: now().toDate(),
					updated_at: now().toDate(),
				})
				.returning();

			// Seed EN
			if (contentMap.en) {
				await this.db.insert(schema.blogPostEntity).values({
					tenant_id,
					title: metadata.en.title,
					slug: `${metadata.slug}-en`,
					content: contentMap.en,
					extract:
						contentMap.en?.substring(0, 160).replace(/[#*`]/g, "") + "...",
					is_published: true,
					reading_time_minutes: 15,
					cover: null,
					seo: null,
					published_at: esPost.published_at,
					category_id: category_id || null,
					author_id,
					language: "en" as const,
					parent_id: esPost.id,
					created_at: now().toDate(),
					updated_at: now().toDate(),
				});
			}

			// Seed PT
			if (contentMap.pt) {
				await this.db.insert(schema.blogPostEntity).values({
					tenant_id,
					title: metadata.pt.title,
					slug: `${metadata.slug}-pt`,
					content: contentMap.pt,
					extract:
						contentMap.pt?.substring(0, 160).replace(/[#*`]/g, "") + "...",
					is_published: true,
					reading_time_minutes: 15,
					cover: null,
					seo: null,
					published_at: esPost.published_at,
					category_id: category_id || null,
					author_id,
					language: "pt" as const,
					parent_id: esPost.id,
					created_at: now().toDate(),
					updated_at: now().toDate(),
				});
			}

			// biome-ignore lint/suspicious/noConsole: Seeder debug
			console.log(`Created post ${metadata.slug} with ID ${esPost.id}`);
			createdPosts.push(esPost);
		}

		// Final check in seeder
		const count = await this.db
			.select({ count: sql`count(*)` })
			.from(schema.blogPostEntity);
		// biome-ignore lint/suspicious/noConsole: Seeder verify
		console.log(`📊 Total blog posts in DB: ${count[0].count}`);

		return createdPosts;
	}
}
