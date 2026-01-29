import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { now } from "@infrastructure/utils/hybrid";
import { slugify } from "@infrastructure/utils/hybrid/slug.utils";
import { Inject, Injectable } from "@nestjs/common";
import { type NodePgDatabase } from "drizzle-orm/node-postgres";
import { projectEntity } from "../entities/project.entity";

@Injectable()
export class ProjectSeeder {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async run(tenant_id: number) {
		const projects = [
			{
				title:
					"Plataforma Educativa con Inteligencia Artificial - CEAR LATINOAMERICANO",
				description:
					"Plataforma educativa integral tipo Campus Virtual diseñada para optimizar la experiencia de aprendizaje.",
				content:
					"He desarrollado para la empresa de servicios arbitral CEAR LATINOAMERICANO una plataforma educativa integral tipo Campus Virtual diseñada para optimizar la experiencia de aprendizaje de los estudiantes mediante el uso de Inteligencia Artificial (GROQ). El sistema incluye funcionalidades avanzadas como revisión automática de notas, generación inteligente de tareas, y notificaciones personalizadas impulsadas por IA. La arquitectura está construida con NestJS, Docker SWARM, y React con Typescript.",
				impact_summary:
					"Optimización del aprendizaje mediante IA y alta escalabilidad con Docker SWARM.",
				start_date: new Date("2025-01-01"),
				status: "live",
			},
			{
				title: "Ecommerce con Whatsapp CRM y Inteligencia Artificial SAAS",
				description:
					"Solución de ecommerce potenciada con IA y CRM de WhatsApp.",
				content:
					"He desarrollado un ecommerce con un CRM de WhatsApp y potenciada con IA (OpenAI, Claude, Mistral). La solución usa microservicios con NestJS, TypeORM y React/Preact sobre Bun.js. Implementé AWS (Lambda, S3, ECS), Docker, Kubernetes y CI/CD con GitHub Actions, además de Redis y NATS para cache y mensajería en tiempo real.",
				impact_summary:
					"Plataforma escalable y modular con integración avanzada de IA y mensajería.",
				start_date: new Date("2024-01-01"),
				end_date: new Date("2025-01-01"),
				status: "live",
			},
			{
				title: "Sistema de Facturación Sunat",
				description: "Sistema de facturación electrónica integrado con SUNAT.",
				content:
					"Desarrollé un sistema de facturación electrónica integrado con SUNAT para automatizar la emisión de comprobantes en Perú, usando Laravel y Vue. Incluye autenticación con Sanctum, colas asíncronas con Redis, y firma digital de XML. Genera PDFs dinámicos y cuenta con soporte PWA.",
				impact_summary:
					"Automatización fiscal y optimización de rendimiento con colas asíncronas.",
				start_date: new Date("2023-01-01"),
				end_date: new Date("2024-01-01"),
				status: "live",
			},
			{
				title: "OPEN SOURCE TYPESCRIPT",
				description:
					"Contribuciones a librerías Open Source y desarrollo de herramientas.",
				content:
					"Aporte al Open Source a las empresa Vite JS como en VERCEL con NEXT JS 13, haciendo pull-request para aportar en la librería mas usada en el frontend, como también desarrollé 7 bibliotecas para React y 1 framework similar a Nest JS Monorepositorio en NPM.",
				impact_summary:
					"Contribuciones significativas a ecosistemas de frontend modernos.",
				start_date: new Date("2023-01-01"),
				end_date: new Date("2024-01-01"),
				status: "live",
			},
			{
				title: "ERP y CRM",
				description: "Sistema ERP completo y personalizable.",
				content:
					"Desarrollé un sistema ERP (Enterprise Resource Planning) completo y personalizable que abarca todas las áreas funcionales clave de una empresa, desde la gestión de recursos humanos hasta la contabilidad y la gestión de inventario. El stack usado fue Nodejs - Express.JS en el servidor y React.JS en el cliente.",
				impact_summary: "Gestión integral de recursos empresariales.",
				start_date: new Date("2023-01-01"),
				status: "live",
			},
			{
				title: "Proyectos - Freelancer",
				description: "Desarrollo de tiendas virtuales y aplicaciones web.",
				content:
					"He completado un proyecto de tienda virtual usando PHP y React, aplicando arquitectura limpia, buenas prácticas y gestión con Git. También he desarrollado proyectos pequeños con PHP, TypeScript y JavaScript usando React, Vue.js, Laravel y NestJS.",
				impact_summary:
					"Soluciones prácticas y efectivas para distintos negocios peruanos.",
				start_date: new Date("2021-01-01"),
				end_date: new Date("2022-01-01"),
				status: "live",
			},
			{
				title: "ECCOMERCE CRM PHP y TS",
				description:
					"Desarrollo de tienda virtual con panel de administración.",
				content:
					"He completado un emocionante proyecto de desarrollo de una tienda virtual, donde utilicé PHP y React para crear una experiencia de compra en línea intuitiva y atractiva. Apliqué buenas prácticas de arquitectura limpia, separando responsabilidades y asegurando un código mantenible y escalable.",
				impact_summary: "Plataforma sólida, segura y lista para crecer.",
				start_date: new Date("2020-01-01"),
				status: "live",
			},
		];

		const projectsSeed = projects.map((p, index) => ({
			tenant_id,
			title: p.title,
			slug: slugify(p.title),
			description: p.description,
			content: p.content,
			impact_summary: p.impact_summary,
			start_date: p.start_date,
			end_date: p.end_date || null,
			status: (p.status as "live" | "in_dev" | "archived") || "in_dev",
			sort_order: index + 1,
			created_at: now().toDate(),
			updated_at: now().toDate(),
			language: "es" as const, // Default to ES based on content
		}));

		return await this.db.insert(projectEntity).values(projectsSeed).returning();
	}
}
