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
				title: "Vigilio Portfolio - Manifiesto Digital 2026",
				description:
					"Sitio web de portafolio profesional de alto rendimiento utilizando la arquitectura de islas de Astro y NestJS.",
				content:
					"He desarrollado mi sitio web de portafolio profesional como un manifiesto digital de ingeniería de software. Utilicé **Astro** con su innovadora **Arquitectura de Islas** para lograr una carga instantánea y SEO óptimo, integrando componentes dinámicos con **React y TypeScript**. El backend está potenciado por **NestJS** con una arquitectura limpia y modular, utilizando **Docker** para la contenedorización y **Redis** para el almacenamiento en caché. El sistema incluye un asistente de IA integrado con **Ollama** y búsqueda semántica con **pgvector**, demostrando la convergencia entre el desarrollo web moderno y la Inteligencia Artificial.",
				impact_summary:
					"Portafolio ultra-rápido con IA integrada y arquitectura de vanguardia.",
				start_date: new Date("2026-01-01"),
				status: "live",
			},
			{
				title: "Sistema de Traducción de Voz en Tiempo Real con RAG y Python",
				description:
					"Innovador sistema de traducción de voz en tiempo real para videos de YouTube utilizando agentes RAG y Python.",
				content:
					"Desarrollé un sistema avanzado de traducción de voz en tiempo real aplicado a videos de YouTube. Utilicé **Python** como lenguaje principal, integrando **entrenamiento RAG (Retrieval-Augmented Generation)** para contextualizar las traducciones y un algoritmo especializado para procesar audio en tiempo real. El sistema logra una latencia mínima y una precisión excepcional, permitiendo romper las barreras lingüísticas en contenido multimedia de forma fluida. Este proyecto representa la vanguardia en el procesamiento de lenguaje natural y la IA aplicada al video.",
				impact_summary:
					"Traducción instantánea de contenido multimedia con alta precisión contextual.",
				start_date: new Date("2025-02-01"),
				status: "live",
			},
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
				title: "ERP y CRM de Alto Impacto - Gestión Empresarial 360",
				description:
					"Sistema ERP (Enterprise Resource Planning) completo y complejo diseñado para la gestión integral de áreas críticas empresariales.",
				content:
					"Desarrollé un sistema ERP completo y personalizable que abarca todas las áreas funcionales clave de una empresa, desde la gestión de recursos humanos hasta la contabilidad, finanzas y la gestión de inventario en tiempo real. Fue un proyecto de alta complejidad técnica que requería una consistencia de datos absoluta y una interfaz intuitiva para procesos administrativos densos. El stack tecnológico se basó en **Node.js y Express.js** para un backend escalable y **React.js** en el frontend para una experiencia de usuario fluida y reactiva. Implementé módulos de facturación, control de asistencia, y reportes analíticos avanzados, consolidando una herramienta esencial para la transformación digital de negocios.",
				impact_summary:
					"Gestión integral y automatización de procesos complejos con arquitectura escalable.",
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
