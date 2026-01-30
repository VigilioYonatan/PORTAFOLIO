import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { now } from "@infrastructure/utils/hybrid";
import { Inject, Injectable } from "@nestjs/common";
import { type InferInsertModel } from "drizzle-orm";
import { type NodePgDatabase } from "drizzle-orm/node-postgres";
import { workExperienceEntity } from "../entities/work-experience.entity";

@Injectable()
export class WorkExperienceSeeder {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async run(tenantId: number) {
		const experiencesSeed: InferInsertModel<typeof workExperienceEntity>[] = [
			{
				tenant_id: tenantId,
				company: "Portfolio & Personal Innovation",
				position: "Lead Software Architect",
				description:
					"Arquitecto de Software enfocado en el lanzamiento de mi portafolio con arquitectura de islas y NestJS. Explorando OpenCode para potenciar la soberanía del desarrollador.",
				content: this.getEsContent(1),
				start_date: new Date("2026-01-01"),
				is_current: true,
				location: "Remote / Global",
				sort_order: 1,
				is_visible: true,
				created_at: now().toDate(),
				updated_at: now().toDate(),
			},
			{
				tenant_id: tenantId,
				company: "Cear Latinoamericano",
				position: "Senior Lead Engineer & AI Architect",
				description:
					"Liderazgo técnico en transformación digital y creación de productos SaaS inteligentes. Implementación de MCP, automatización con n8n y optimización de flujo con Cursor, Antigravity y Claude Code.",
				content: this.getEsContent(2),
				start_date: new Date("2025-01-01"),
				end_date: new Date("2025-12-31"),
				is_current: false,
				location: "Remote / Lima",
				sort_order: 2,
				is_visible: true,
				created_at: now().toDate(),
				updated_at: now().toDate(),
			},
			{
				tenant_id: tenantId,
				company: "Vigilio Services",
				position: "CTO & Lead AI Architect",
				description:
					"Liderazgo técnico en startup de IA. Agentes RAG con NestJS, escalabilidad de WhatsApp y alto rendimiento con Laravel Octane y Swoole.",
				content: this.getEsContent(3),
				start_date: new Date("2024-01-01"),
				end_date: new Date("2024-12-31"),
				is_current: false,
				location: "Remote / Global",
				sort_order: 3,
				is_visible: true,
				created_at: now().toDate(),
				updated_at: now().toDate(),
			},
			{
				tenant_id: tenantId,
				company: "Open Source Community",
				position: "Open Source Architect & Library Author",
				description:
					"Autor del ecosistema @vigilio. Dominio de Preact, Wouter y Microfrontends. Excelencia en diseño UX/UI con Figma para sistemas modulares.",
				content: this.getEsContent(4),
				start_date: new Date("2023-03-01"),
				end_date: new Date("2023-12-31"),
				is_current: false,
				location: "Global / Open Source",
				sort_order: 4,
				is_visible: true,
				created_at: now().toDate(),
				updated_at: now().toDate(),
			},
			{
				tenant_id: tenantId,
				company: "Freelance & Senati Thesis",
				position: "Full Stack Engineer & Thesis Lead",
				description:
					"E-commerce multi-idioma con SEO avanzado, Next.js y MongoDB. Experto en Socket.io para tiempo real y optimización de performance con Lazy Loading.",
				content: this.getEsContent(5),
				start_date: new Date("2022-02-01"),
				end_date: new Date("2023-02-28"),
				is_current: false,
				location: "Remote / Lima",
				sort_order: 5,
				is_visible: true,
				created_at: now().toDate(),
				updated_at: now().toDate(),
			},
			{
				tenant_id: tenantId,
				company: "Freelance & Mobile Developer",
				position: "Advanced Full Stack Engineer",
				description:
					"Ingeniería industrial con TypeScript, Vue y Node.js. Especialista en React Avanzado, Hook Form, Zod y desarrollo móvil con React Native.",
				content: this.getEsContent(6),
				start_date: new Date("2021-01-01"),
				end_date: new Date("2021-12-31"),
				is_current: false,
				location: "Remote / Lima",
				sort_order: 6,
				is_visible: true,
				created_at: now().toDate(),
				updated_at: now().toDate(),
			},
			{
				tenant_id: tenantId,
				company: "Freelance",
				position: "Creative Web Developer",
				description:
					"Aprendizaje intensivo de React (Intermedio) y bases de JavaScript (V8). Fundamentos de arquitectura MVC con PHP/MySQL y diseño con Sass/BEM.",
				content: this.getEsContent(7),
				start_date: new Date("2020-03-01"),
				end_date: new Date("2020-12-31"),
				is_current: false,
				location: "Lima, Perú / Remote",
				sort_order: 7,
				is_visible: true,
				created_at: now().toDate(),
				updated_at: now().toDate(),
			},
		];

		const inserted = await this.db
			.insert(workExperienceEntity)
			.values(experiencesSeed)
			.returning();

		const phases = [1, 2, 3, 4, 5, 6, 7];

		for (const sort of phases) {
			const parent = inserted.find((e) => e.sort_order === sort);
			if (!parent) continue;

			await this.db.insert(workExperienceEntity).values([
				{
					...parent,
					id: undefined,
					language: "en",
					parent_id: parent.id,
					company: this.getEnCompany(sort),
					position: this.getEnPosition(sort),
					description: this.getEnDescription(sort),
					content: this.getEnContent(sort),
					location: this.getEnLocation(sort),
					created_at: now().toDate(),
					updated_at: now().toDate(),
				},
				{
					...parent,
					id: undefined,
					language: "pt",
					parent_id: parent.id,
					company: this.getPtCompany(sort),
					position: this.getPtPosition(sort),
					description: this.getPtDescription(sort),
					content: this.getPtContent(sort),
					location: this.getPtLocation(sort),
					created_at: now().toDate(),
					updated_at: now().toDate(),
				},
			]);
		}

		return inserted;
	}

	private getEnCompany(sort: number) {
		const companies: Record<number, string> = {
			1: "Portfolio & Personal Innovation",
			2: "Cear Latinoamericano",
			3: "Vigilio Services",
			4: "Open Source Community",
			5: "Freelance & Senati Thesis",
			6: "Freelance & Mobile Developer",
			7: "Freelance",
		};
		return companies[sort];
	}

	private getPtCompany(sort: number) {
		const companies: Record<number, string> = {
			1: "Portfólio & Inovação Pessoal",
			2: "Cear Latinoamericano",
			3: "Vigilio Services",
			4: "Comunidade Open Source",
			5: "Freelance & Tese Senati",
			6: "Freelance & Desenvolvedor Mobile",
			7: "Freelance",
		};
		return companies[sort];
	}

	private getEnPosition(sort: number) {
		const positions: Record<number, string> = {
			1: "Lead Software Architect",
			2: "Senior Lead Engineer & AI Architect",
			3: "CTO & Lead AI Architect",
			4: "Open Source Architect & Library Author",
			5: "Full Stack Engineer & Thesis Lead",
			6: "Advanced Full Stack Engineer",
			7: "Creative Web Developer",
		};
		return positions[sort];
	}

	private getPtPosition(sort: number) {
		const positions: Record<number, string> = {
			1: "Arquiteto de Software Líder",
			2: "Engenheiro Líder Sênior & Arquiteto de IA",
			3: "CTO & Arquiteto Líder de IA",
			4: "Arquiteto Open Source & Autor de Biblioteca",
			5: "Engenheiro Full Stack & Líder de Tese",
			6: "Engenheiro Full Stack Avançado",
			7: "Desenvolvedor Web Criativo",
		};
		return positions[sort];
	}

	private getEnDescription(sort: number) {
		const descriptions: Record<number, string> = {
			1: "Software Architect focused on the launch of my portfolio with islands architecture and NestJS. Exploring OpenCode to enhance developer sovereignty.",
			2: "Technical leadership at Cear Latinoamericano. Implementation of MCP, automation with n8n, and workflow optimization with Cursor, Antigravity, and Claude Code.",
			3: "CTO at Vigilio Services. Specialist in RAG Agents with NestJS, WhatsApp scalability, and high performance with Laravel Octane and Swoole.",
			4: "Author of the @vigilio ecosystem. Mastery of Preact, Wouter, and Microfrontends. Excellence in UX/UI design with Figma for modular systems.",
			5: "Development of Vigilio Shop with Next.js and MongoDB. Expert in Socket.io for real-time and performance optimization with Lazy Loading.",
			6: "Industrial engineering with TypeScript, Vue, and Node.js. Specialist in Advanced React, Hook Form, Zod, and mobile development with React Native.",
			7: "Intensive learning of React (Intermediate) and JavaScript foundations (V8). Fundamentals of MVC architecture with PHP/MySQL and design with Sass/BEM.",
		};
		return descriptions[sort];
	}

	private getPtDescription(sort: number) {
		const descriptions: Record<number, string> = {
			1: "Arquiteto de Software focado no lançamento do meu portfólio com arquitetura de ilhas e NestJS. Explorando OpenCode para potencializar a soberania do desenvolvedor.",
			2: "Liderança técnica na Cear Latinoamericano. Implementação de MCP, automação com n8n e otimização de fluxo com Cursor, Antigravity e Claude Code.",
			3: "CTO na Vigilio Services. Especialista em Agentes RAG com NestJS, escalabilidade de WhatsApp e alto desempenho com Laravel Octane e Swoole.",
			4: "Autor do ecossistema @vigilio. Domínio de Preact, Wouter e Microfrontends. Excelência em design UX/UI com Figma para sistemas modulares.",
			5: "Desenvolvimento da Vigilio Shop com Next.js e MongoDB. Especialista em Socket.io para tempo real e otimização de performance com Lazy Loading.",
			6: "Engenharia industrial com TypeScript, Vue e Node.js. Especialista em React Avançado, Hook Form, Zod e desenvolvimento mobile com React Native.",
			7: "Aprendizado intensivo de React (Intermediário) e bases de JavaScript (V8). Fundamentos de arquitetura MVC com PHP/MySQL e design com Sass/BEM.",
		};
		return descriptions[sort];
	}

	private getEnLocation(sort: number) {
		return sort > 4 ? "Remote / Lima" : "Remote / Global";
	}

	private getPtLocation(sort: number) {
		return sort > 4 ? "Remoto / Lima" : "Remoto / Global";
	}

	private getEsContent(sort: number) {
		const contents: Record<number, string> = {
			1: `# 🌌 Enero 2026: El Nacimiento de un Manifiesto Digital

Este inicio de 2026 marca el lanzamiento de mi **portafolio web profesional**, un proyecto que he diseñado para ser el cierre de un ciclo y el comienzo de una nueva era. Estamos en Enero, y mi enfoque principal ha sido la arquitectura base de este sitio: he implementado la **Arquitectura de Islas de Astro** para garantizar una velocidad de carga instantánea, permitiéndome hidratar componentes de IA de forma selectiva.

### 🏛️ Backbone Técnico y Buenas Prácticas
La infraestructura de este portafolio es un testimonio de **Buenas Prácticas** industriales. He utilizado **NestJS** como el núcleo del backend debido a su robustez y soporte de primer nivel para **Inyección de Dependencias**. Todo el ecosistema está contenerizado con **Docker**, lo que me permite replicar entornos de producción idénticos en cualquier hardware. El frontend se apoya en la sinergia de **React y TypeScript**, garantizando interfaces dinámicas, reactivas y, sobre todo, seguras gracias al tipado estricto. He aplicado principios **SOLID** y **Clean Architecture** para que cada módulo del sistema sea independiente, testable y fácilmente extensible.

Este portafolio no es solo una muestra de mi trabajo anterior; es un experimento vivo donde integro **Ollama** para ejecutar modelos de lenguaje locales y **pgvector** para búsquedas semánticas sobre mi propia data. He configurado una capa de **Caching con Redis** para optimizar la entrega de contenido frecuente. Es el primer gran paso de este año, consolidando todo lo aprendido en una plataforma que prioriza la **Soberanía de Datos** y el rendimiento extremo. ¡Esto es solo el comienzo de lo que vendrá este 2026!`,

			2: `# 🏗️ 2025: Liderazgo de Élite, Cloud Native y Pedagogía Técnica en Cear Latinoamericano

El 2025 ha sido el escenario de mi consagración como **Senior Lead Engineer**, asumiendo el mando técnico en una era de **hiper-escalabilidad**. Mi misión: transformar un ecosistema legacy en una potencia global utilizando el stack más avanzado de **AWS** y **Sistemas Distribuidos**.

### ☁️ El Salto a Cloud Native: AWS Lambda, RDS y S3
Lideré la transición hacia arquitecturas **Serverless** y gestionadas. Implementé microservicios altamente desacoplados utilizando **AWS Lambda** para tareas de procesamiento intensivo de documentos judiciales, optimizando costos y escalabilidad infinita. Centralizamos la data crítica en **AWS RDS (PostgreSQL)**, configurando **Read Replicas** con **Drizzle ORM** para manejar picos de lectura de miles de usuarios concurrentes. Para el almacenamiento masivo de expedientes digitales, de más de 5TB, orquesté un ecosistema basado en **AWS S3** con políticas de ciclo de vida avanzadas y **CloudFront** para una entrega global de baja latencia.

### 💾 Almacenamiento e Infraestructura Crítica: MinIO y RustFS
Frente a la necesidad de soberanía de datos y rendimiento extremo en on-premise, desplegué **MinIO S3** como capa de almacenamiento compatible con S3, garantizando que el sistema fuera agnóstico al proveedor de cloud. Investigué e implementé optimizaciones de bajo nivel en el sistema de archivos utilizando conceptos de **RustFS** para garantizar una consistencia de datos inquebrantable y velocidades de I/O superiores en nuestros clusters de **VPS (AWS EC2 / DigitalOcean)**. Todo este ecosistema está protegido por una capa de red robusta utilizando **Cloudflare DNS**, donde configuré reglas de **WAF (Web Application Firewall)** y **Workers** para mitigar ataques DDoS y optimizar el ruteo a nivel de borde.

### 🐋 La Revolución Dokploy y el Hardening de Infraestructura
Orquesté un ecosistema de contenedores **Docker Swarm** gestionado con **Dokploy**, permitiendo despliegues **Zero-Downtime** mediante pipelines de **CI/CD** con **GitHub Actions**. Implementamos un sistema de **Hardening de Linux** extremo, utilizando políticas de seguridad estrictas en cada nodo del cluster. La arquitectura de red fue segmentada en **VLANs aisladas**, protegiendo el tráfico entre microservicios siguiendo los estándares de **Zero Trust Architecture**.

### 🔐 Seguridad, Pedagogía y Blog Integration
En el marco de las certificaciones **ISO 27001, 9001 y 37001**, diseñé una arquitectura basada en **Logs Inmutables**. Pero 2025 también fue el año de compartir el conocimiento. Todo lo documentado en mi blog se convirtió en la base técnica de nuestro equipo: desde **Arquitecturas Orientadas a Eventos con NestJS** hasta **Estrategias de Indexación Avanzada en PostgreSQL**. Enseñé a mi equipo a dominar el **Node.js Performance Tuning** (perfilado, GC y optimización extrema) y a implementar **Observabilidad a Escala** con **OpenTelemetry, Prometheus y Grafana**.

Construimos el **AI Campus** utilizando **React y TypeScript**, integrando **Stripe, Niubiz e Izipay** bajo un motor de colas con **Redis y BullMQ**. Aplicamos **Búsqueda Semántica con LangChain** y **PGVector**, fundamentado en mis investigaciones sobre **Arquitecturas RAG avanzadas**. 2025 no fue solo sobre construir software; fue sobre crear una cultura de ingeniería de élite, donde cada línea de código sigue los estándares de **Clean Architecture y DDD**.

### 🐍 Innovación con Python: Traducción de Voz en Tiempo Real
Desarrollé un sistema avanzado con **Python** utilizando **entrenamiento RAG** y un algoritmo de **YouTube** para traducir voz en tiempo real en videos. Este proyecto logró una precisión excepcional, permitiendo una experiencia de usuario fluida y rompiendo las barreras del idioma en contenido multimedia de alto impacto.

### 📊 Gestión de Proyectos: MS Project y Jira
Como **Project Manager**, he liderado la planificación y el seguimiento de hitos críticos utilizando **MS Project** para el control de cronogramas y **Jira** para la gestión ágil de tareas y sprints. Implementé tableros Kanban y Scrum que mejoraron la visibilidad del progreso y la coordinación entre los equipos de desarrollo y stakeholders.`,

			3: `# 🤖 2024: CTO en las Trincheras: IA Productiva y Escalabilidad Masiva en Vigilio Services

Como CTO de **Vigilio Services** en 2024, me enfoque en la **Ingeniería Hardcore**. No buscábamos prototipos de IA; construimos sistemas que procesan millones de transacciones bajo arquitecturas multi-tenant masivas y seguras.

### 💬 Agentes RAG y Omnicanalidad Inteligente
Lideré el desarrollo de agentes autónomos de IA que van más allá del simple chat. Utilizando **whatsapp-web.js** y **Twilio**, construí un cerebro en el backend con **NestJS** capaz de realizar **RAG (Retrieval-Augmented Generation)** sobre documentos corporativos. Estos agentes, orquestados con **LangGraph** y **LangChain**, no solo responden dudas; ejecutan **Tool Calling** para realizar reservas en tiempo real. Implementé **BullMQ** para gestionar las colas de mensajes de miles de agentes de WhatsApp, garantizando que el sistema no sufriera bloqueos por rate limiting y manteniendo una alta disponibilidad.

Para lograr latencias de respuesta imperceptibles, desarrollé un **Sistema de Pre-procesamiento de Embeddings** asíncrono. Cuando un cliente subía un nuevo catálogo de productos, nuestra infraestructura de NestJS, totalmente orquestada con **Docker**, delegaba la vectorización a una granja de **Workers de Node.js** optimizados, persistiendo los resultados en **pgvector**. Este flujo eliminó los cuellos de botella en la inferencia, permitiendo que miles de usuarios conversaran simultáneamente sin degradar el rendimiento del servidor. La inteligencia no era solo el modelo; era el **Pipeline de Datos** que lo alimentaba.

### ⚡ El Motor de Facturación y el Triunfo de Laravel 11
Frente al reto de la facturación electrónica masiva (SUNAT), lideré la refactorización a **Laravel 11** y **PHP 8.3**. Optimizamos el motor de firma digital de XML, logrando procesar **thousands of vouchers per second**. Para no comprometer la UX, delegamos las tareas pesadas de validación y envío a colas distribuidas con **Redis**, utilizando arquitecturas de **Event-Sourcing** para mantener una trazabilidad fiscal absoluta. 

Introduje el uso de **Octane con Swoole** para llevar las capacidades de Laravel a niveles de rendimiento similares a Go. Esto nos permitió manejar picos de tráfico extremo durante festivales comerciales peruanos sin necesidad de escalar excesivamente la infraestructura física, reduciendo costos operativos en un 30%. Implementé un sistema de **Circuit Breaker** para las APIs gubernamentales externas; si el servidor de SUNAT fallaba, nuestro sistema almacenaba las facturas en una **Cola de Persistencia Infinita** y las reintentaba automáticamente ante la recuperación del servicio, garantizando que el negocio nunca se detuviera. 2024 fue el testimonio de que la IA y la ingeniería robusta pueden automatizar industrias enteras con una precisión quirúrgica basada en **Docker** y **NestJS**.`,

			4: `# 📦 2023: La Revolución @vigilio: El Año del Open Source y el Rendimiento Extremo

2023 fue mi año de "rebelión contra el bloatware". Decidí dejar de usar herramientas mediocres y construir mi propio ecosistema profesional bajo la marca **@vigilio**. Mi enfoque: **Zero Dependencies, Ultra-Performance**.

### ⚡ Ingeniería de Librerías: El corazón de @vigilio
Mi contribución más significativa fue **@vigilio/preact-fetching**. Logré crear una alternativa completa a React Query en solo **2.8kb**, dominando lógicas internas de **SWR**, caché en memoria y sincronización entre pestañas mediante **BroadcastChannel**. Publiqué **@vigilio/sweet** (156 estrellas, 12.5k descargas), una librería de UI que utiliza **Portals de Preact** para una gestión de modales inigualable. También lanzó **@vigilio/preact-table** y **@vigilio/preact-paginator**, hooks headless que gestionan estados complejos de datos masivos sin penalizar el ciclo de renderizado. 

No me detuve en el frontend; creé **@vigilio/valibot** (un fork optimizado para enterprise) que redujo drásticamente el tamaño de los bundles de validación. La obsesión por el **Tree-shaking** fue extrema: cada función de nuestras librerías fue escrita para ser eliminada si no se usaba, garantizando que el usuario final solo descargara los bytes estrictamente necesarios. Esta filosofía de "mínimo necesario para máximo rendimiento" se convirtió en el standard de oro para cada proyecto subsiguiente.

### 🧩 Desglose Exhaustivo del Ecosistema @vigilio

Esta sección detalla el propósito y la arquitectura de las herramientas que diseñé para revolucionar la experiencia del desarrollador:

1.  **🚀 @vigilio/preact-fetching**: Es la joya de la corona. Diseñada para arquitecturas de alto rendimiento, proporciona una gestión de fetching de datos de última generación para Preact. Implementa un sistema de caché potente con sincronización automática e invalidación inteligente, permitiendo una gestión optimista de la interfaz (Optimistic UI) sin el peso de las librerías tradicionales.
2.  **🌌 @vigilio/sweet**: Mi biblioteca de componentes de interfaz de usuario. No es solo un conjunto de botones; es un sistema de diseño moderno, potente y extremadamente ligero centrado en sistemas de modales y alertas interactivas. Utiliza técnicas de renderizado avanzado para asegurar que los elementos de UI no bloqueen el hilo principal.
3.  **📊 @vigilio/preact-table**: El hook de tabla headless definitivo. Gestiona de forma quirúrgica los estados complejos de ordenación, paginación, filtrado y selección múltiple. Está optimizado para renderizar miles de filas con un impacto mínimo en la memoria, permitiendo construir tablas corporativas con una experiencia de usuario fluida.
4.  **🔢 @vigilio/preact-paginator**: Lógica de paginación ligera y totalmente agnóstica al framework. Resuelve de forma elegante la generación dinámica de páginas, el manejo de brechas (gaps) y la sincronización de estados, eliminando la necesidad de lógica repetitiva en cada proyecto.
5.  **✅ @vigilio/valibot**: Un fork especializado de la popular librería de validación, optimizado específicamente para aplicaciones empresariales. Mejora la velocidad de transformación de esquemas y la validación de estructuras de datos complejas, garantizando la integridad de la data con un bundle size microscópico.
6.  **🛡️ @vigilio/next-api**: El framework definitivo para rutas de API en Next.js. Trae la potencia de los **decoradores tipo NestJS** y la **Injeción de Dependencias** al mundo de las Serverless APIs, permitiendo una organización de código limpia, centralizada y altamente testable.
7.  **🚉 @vigilio/express**: Mi framework basado en decoradores para Express.js. Simplifica radicalmente la definición de rutas, la gestión de middlewares y la inyección de servicios, permitiendo construir backends robustos con una API declarativa y elegante que reduce el boilerplate en un 70%.

### 🧩 Microfrontends, Turborepos y Module Federation
Dominé la arquitectura de **Microfrontends** utilizando **Module Federation**, permitiendo que aplicaciones gigantes se dividan en fragmentos independientes cargados bajo demanda. Para orquestar este ecosistema de más de 10 paquetes en NPM, implementé un monorepo con **Turborepo** y **Changesets**. Configuramos **Remote Caching** que redujo nuestros tiempos de CI/CD de 12 minutos a solo 45 segundos. 

Implementamos una estrategia de **Aislamiento de Dependencias** mediante **pnpm workspaces**, eliminando el "infierno de los node_modules" y garantizando versiones deterministas en todo el monorepo. La calidad del código fue blindada con **Vitest** en modo concurrente, permitiendo que miles de tests unitarios se ejecutaran en paralelo, detectando regresiones antes de que llegaran siquiera a staging. Mi filosofía cambió este año: la verdadera calidad no es añadir más código, sino refinar el que ya tienes hasta que brille con una eficiencia brutal. 2023 fue el año en que mis herramientas empezaron a ser el cimiento de aplicaciones corporativas en todo el mundo.`,

			5: `# 🎓 2022: El Despertar Full Stack: Vigilio Shop y la Ingeniería del Mundo Real

Mi tesis en SENATI no fue un documento; fue **Vigilio Shop**, un ecosistema de E-commerce de alto rendimiento que se convirtió en mi campo de batalla para dominar las arquitecturas escalables.

### 🛒 Next.js, MongoDB y el Dominio del SEO Industrial
Implementé **Next.js** para aprovechar el **SSR (Server Side Rendering)**, logrando que miles de productos indexaran en Google en tiempo récord. En el backend, exploté el **Aggregation Framework de MongoDB** para generar reportes analíticos masivos y sistemas de recomendación en milisegundos.  

Para manejar la consistencia de inventario en alta concurrencia, implementé **Transacciones Multi-documento** en MongoDB con un sistema de **Bloqueo Optimista**. Esto evitaba que dos usuarios compraran el último producto simultáneamente, garantizando la integridad de la data sin sacrificar la velocidad de lectura. Diseñé un **Motor de Búsqueda Predictivo** propio, utilizando índices de texto completo y pesos de relevancia, lo que incrementó la tasa de conversión de la tienda en un 25% comparado con soluciones de búsqueda estándar.

### 🏛️ Arquitectura Limpia y Escalabilidad
Fue el año donde la **Clean Architecture** hizo click en mi cabeza. Aprendí a separar la lógica de negocio de los detalles de la infraestructura, permitiendo que mi tienda fuera agnóstica a cambios de DB o de UI. Implementé el patrón **Repository y Use Cases**, lo que facilitó el testing de la lógica de negocio sin necesidad de levantar bases de datos pesadas. 

La integración nativa del **PayPal SDK** fue un ejercicio de resiliencia avanzada: manejamos estados de pago fallidos, disputas automatizadas y conciliación de facturas en tiempo real mediante webhooks securizados con **HMAC**. Vigilio Shop demostró que el software comercial puede ser una obra de arte técnica si se cuida cada capa del sistema. Este proyecto fue la semilla de todos los SaaS que construiría después, enseñándome que el código bien estructurado es el único camino para escalar un negocio desde cero hasta el éxito internacional.`,

			6: `# 🐘 2021: La Era de la Estructura: TypeScript Industrial y Despegue Mobile

En 2021, mi código dejó de ser artesanal para ser industrial. La palabra clave fue **Rigor**. Entendí que la tipocracia es la salvación de cualquier equipo de ingeniería serio.

### 🏛️ TypeScript Strict y Patrones SOLID en Laravel
Adopté **TypeScript** en modo estricto, eliminando el 90% de los bugs en tiempo de compilación. En el backend, me especialicé en **Laravel con Repository Pattern**, logrando APIs desacopladas de la base de datos **PostgreSQL**. Aprendí a usar **JSONB** para metadatos flexibles y a redactar **CTEs (Common Table Expressions)** para reportes jerárquicos corporativos. 

Me sumergí en el **Hardening de PostgreSQL**, configurando planes de ejecución de queries manuales para optimizar consultas de millones de filas. Implementé un sistema de **Autenticación Multi-Factor (MFA)** desde cero para aplicaciones gubernamentales, integrando envío de códigos vía SMS y correo con sistemas de expiración segura. El backend se convirtió en una fortaleza donde la seguridad y la performance eran innegociables, estableciendo las bases de lo que hoy considero una API de grado corporativo.

### 📱 Módulos Nativos y Reanimated en React Native
Conquisté el mundo móvil con **React Native**. Lo que me obsesionó fue la fluidez; aprendí a crear **Módulos Nativos** en Java/Objective-C para tareas de hardware como escaneo de documentos y biometría dactilar. Usé **Reanimated 2** para lograr animaciones de 60fps constantes, evitando los cuellos de botella del bridge de JS y llevando el rendimiento móvil a niveles nativos.

Aprendí a gestionar el **Ciclo de Vida de Aplicaciones** en condiciones de red extremas, implementando sincronización de datos en segundo plano y persistencia offline con **SQLite**. Publiqué apps críticas en **App Store y Google Play**, dominando la firma de ejecutables, gestión de certificados de aprovisionamiento y los rigurosos procesos de revisión de Apple. Fue un año de aprendizaje intensivo sobre cómo el software debe comportarse en el dispositivo físico, donde el CPU y la RAM son recursos preciosos que deben ser optimizados con maestría.`,

			7: `# 🐣 2020: El Génesis: Forjando las Bases de un Arquitecto Autodidacta

Todo comenzó aquí. Mientras el mundo se detenía por la pandemia, yo decidí que mi carrera debía acelerar a una velocidad sobrenatural. Me impuse una disciplina de **14 horas de estudio diario**, impulsado por una curiosidad visceral por entender qué ocurre debajo del capó de la computadora.

### 🔩 Ingeniería de Base: Vanilla JS y el Motor V8
Antes de tocar cualquier framework, decidí entender el motor que lo mueve todo. Estudié en profundidad el **Event Loop**, el **Call Stack** y el sistema de **Garbage Collection de V8**. Esta base teórica fue mi ventaja injusta; entender cómo JavaScript gestiona la memoria y la compilación JIT (Just-In-Time) me permitió escribir código eficiente desde mi primer "Hola Mundo". Construí mi propio **Framework MVC** desde cero con **PHP y MySQL**, implementando un **Query Builder** propio para entender cómo se mapean los objetos a tablas relacionales.

Mi proyecto insignia fue un **Clon de Spotify** ultra-complejo, donde no solo renderizaba audio, sino que usé la **Web Audio API** para crear un ecualizador dinámico. Implementé el streaming de audio mediante **HLS (HTTP Live Streaming)** para optimizar el consumo de ancho de banda, algo impensable para un principiante promedio. Aprendí a manipular el DOM directamente con una precisión quirúrgica, evitando la necesidad de librerías externas para entender el peso de cada operación en el renderizado del navegador.

### ☕ Disciplina y Estética BEM
Aprendí a escribir CSS profesional con **Sass y metodología BEM**, entendiendo que el diseño a escala requiere una nomenclatura estricta y modular. Cada bug que encontré no fue un obstáculo, sino un tutorial gratuito sobre la naturaleza de la computación. Desplegué mis primeros sitios en servidores **VPS de Linux**, aprendiendo a configurar Nginx, certificados SSL con Certbot y reglas de Firewall básicas. 2020 fue el año del hambre insaciable, donde forjé el carácter técnico y la resiliencia mental necesaria para liderar proyectos internacionales hoy. Comprendí que la ingeniería de software no es saber sintaxis; es la capacidad de **Pensar en Sistemas Complexos** y descomponerlos en sus átomos fundamentales.`,
		};
		return contents[sort];
	}

	private getEnContent(sort: number) {
		const contents: Record<number, string> = {
			1: `# 🌌 January 2026: The Birth of a Digital Manifesto

This beginning of 2026 marks the launch of my **professional portfolio website**, a project I designed to be the closing of a cycle and the beginning of a new era. It's January, and my main focus has been the core architecture of this site: I implemented **Astro's Islands Architecture** to guarantee instant loading speed, allowing me to hydrate AI components selectively.

### 🏛️ Technical Backbone and Best Practices
The infrastructure of this portfolio is a testament to industrial **Best Practices**. I have used **NestJS** as the backend core due to its robustness and top-tier support for **Dependency Injection**. The entire ecosystem is containerized with **Docker**, allowing me to replicate identical production environments on any hardware. The frontend relies on the synergy of **React and TypeScript**, guaranteeing dynamic, reactive, and, above all, safe interfaces thanks to strict typing. I have applied **SOLID** and **Clean Architecture** principles so that each module of the system is independent, testable, and easily extensible.

This portfolio is not just a showcase of my previous work; it's a living experiment where I integrate **Ollama** to run local language models and **pgvector** for semantic searches over my own data. I have configured a **Caching layer with Redis** to optimize the delivery of frequent content. It's the first big step of this year, consolidating everything learned into a platform that prioritizes **Data Sovereignty** and extreme performance. This is just the beginning of what will come this 2026!`,

			2: `# 🏗️ 2025: Elite Leadership, Cloud Native, and Technical Pedagogy at Cear Latinoamericano

2025 has been the stage for my consolidation as **Senior Lead Engineer**, taking technical command in an era of **hyper-scalability**. My mission: transform a legacy ecosystem into a global powerhouse using the most advanced **AWS** and **Distributed Systems** stack.

### ☁️ The Leap to Cloud Native: AWS Lambda, RDS, and S3
I led the transition to **Serverless** and managed architectures. I implemented highly decoupled microservices using **AWS Lambda** for intensive judicial document processing tasks, optimizing costs and infinite scalability. We centralized critical data in **AWS RDS (PostgreSQL)**, configuring **Read Replicas** with **Drizzle ORM** to handle read peaks of thousands of concurrent users. For the massive storage of digital records, over 5TB, I orchestrated an ecosystem based on **AWS S3** with advanced lifecycle policies and **CloudFront** for low-latency global delivery.

### 💾 Storage and Critical Infrastructure: MinIO and RustFS
Faced with the need for data sovereignty and extreme on-premise performance, I deployed **MinIO S3** as an S3-compatible storage layer, ensuring the system was cloud provider agnostic. I researched and implemented low-level file system optimizations using **RustFS** concepts to guarantee unshakable data consistency and superior I/O speeds in our **VPS (AWS EC2 / DigitalOcean)** clusters. This entire ecosystem is protected by a robust network layer using **Cloudflare DNS**, where I configured **WAF (Web Application Firewall)** rules and **Workers** to mitigate DDoS attacks and optimize edge routing.

### 🐋 The Dokploy Revolution and Infrastructure Hardening
I orchestrated a **Docker Swarm** container ecosystem managed with **Dokploy**, allowing **Zero-Downtime** deployments through **CI/CD** pipelines with **GitHub Actions**. We implemented an extreme **Linux Hardening** system, using strict security policies on every cluster node. The network architecture was segmented into **isolated VLANs**, protecting microservice traffic following **Zero Trust Architecture** standards.

### 🔐 Security, Pedagogy, and Blog Integration
Within the framework of **ISO 27001, 9001, and 37001** certifications, I designed an architecture based on **Immutable Logs**. But 2025 was also the year of knowledge sharing. Everything documented in my blog became our team's technical foundation: from **Event-Driven Architectures with NestJS** to **Advanced Indexing Strategies in PostgreSQL**. I taught my team to master **Node.js Performance Tuning** (profiling, GC, and extreme optimization) and to implement **Observability at Scale** with **OpenTelemetry, Prometheus, and Grafana**.

We built the **AI Campus** using **React and TypeScript**, integrating **Stripe, Niubiz, and Izipay** under a queue engine with **Redis and BullMQ**. We applied **Semantic Search with LangChain** and **PGVector**, based on my research on **advanced RAG architectures**. 2025 was not just about building software; it was about creating an elite engineering culture where every line of code follows **Clean Architecture and DDD** standards.

### 🐍 Python Innovation: Real-Time Voice Translation
I developed an advanced system using **Python**, **RAG training**, and a **YouTube algorithm** to translate voice in real-time in videos. This project achieved exceptional accuracy, providing a seamless user experience and breaking language barriers in high-impact multimedia content.

### 📊 Project Management: MS Project and Jira
As a **Project Manager**, I have led the planning and tracking of critical milestones using **MS Project** for schedule control and **Jira** for agile task and sprint management. I implemented Kanban and Scrum boards that improved progress visibility and coordination between development teams and stakeholders.`,

			3: `# 🤖 2024: CTO in the Trenches: Productive AI and Massive Scalability at Vigilio Services

As CTO of **Vigilio Services** in 2024, I focused on **Hardcore Engineering**. We weren't looking for AI prototypes; we built systems that process millions of transactions under massive and secure multi-tenant architectures.

### 💬 RAG Agents and Intelligent Omnichannel
I led the development of autonomous AI agents that go beyond simple chat. Using **whatsapp-web.js** and **Twilio**, I built a backend brain with **NestJS** capable of performing **RAG (Retrieval-Augmented Generation)** on corporate documents. These agents, orchestrated with **LangGraph** and **LangChain**, don't just answer questions; they execute **Tool Calling** for real-time reservations. I implemented **BullMQ** to manage message queues for thousands of WhatsApp agents, ensuring the system did not suffer rate-limiting blockages and maintaining high availability.

To achieve imperceptible response latencies, I developed an asynchronous **Embedding Pre-processing System**. When a client uploaded a new product catalog, our NestJS infrastructure, fully orchestrated with **Docker**, delegated vectorization to an optimized **Node.js Worker farm**, persisting results in **pgvector**. This flow eliminated inference bottlenecks, allowing thousands of users to chat simultaneously without degrading server performance. Intelligence wasn't just the model; it was the **Data Pipeline** feeding it.

### ⚡ The Invoicing Engine and the Laravel 11 Triumph
Faced with the challenge of massive electronic invoicing (SUNAT), I led the refactoring to **Laravel 11** and **PHP 8.3**. We optimized the XML digital signature engine, managing to process **thousands of vouchers per second**. To avoid compromising UX, we delegated heavy validation and shipping tasks to distributed queues with **Redis**, using **Event-Sourcing** architectures to maintain absolute fiscal traceability.

I introduced the use of **Octane with Swoole** to bring Laravel's capabilities to performance levels similar to Go. This allowed us to handle extreme traffic peaks during Peruvian commercial festivals without over-scaling physical infrastructure, reducing operating costs by 30%. I implemented a **Circuit Breaker** system for external government APIs; if the SUNAT server failed, our system stored invoices in an **Infinite Persistence Queue** and automatically retried them upon service recovery, guaranteeing business never stopped. 2024 was the testimony that AI and robust engineering can automate entire industries with surgical precision based on **Docker** and **NestJS**.`,

			4: `# 📦 2023: The @vigilio Revolution: The Year of Open Source and Extreme Performance

2023 was my year of "rebellion against bloatware." I decided to stop using mediocre tools and build my own professional ecosystem under the **@vigilio** brand. My focus: **Zero Dependencies, Ultra-Performance**.

### ⚡ Library Engineering: The heart of @vigilio
My most significant contribution was **@vigilio/preact-fetching**. I managed to create a full React Query alternative in just **2.8kb**, mastering internal **SWR** logic, memory caching, and cross-tab synchronization via **BroadcastChannel**. I published **@vigilio/sweet** (156 stars, 12.5k downloads), a UI library using **Preact Portals** for unmatched modal management. I also launched **@vigilio/preact-table** and **@vigilio/preact-paginator**, headless hooks that manage complex massive data states without penalizing the render cycle.

I didn't stop at the frontend; I created **@vigilio/valibot** (an enterprise-optimized fork) which drastically reduced validation bundle sizes. The obsession with **Tree-shaking** was extreme: every function in our libraries was written to be eliminated if not used, ensuring users only downloaded strictly necessary bytes. This philosophy of "minimum necessary for maximum performance" became the gold standard for every subsequent project.

### 🧩 Comprehensive Breakdown of the @vigilio Ecosystem

This section details the purpose and architecture of the tools I designed to revolutionize the developer experience:

1.  **🚀 @vigilio/preact-fetching**: The crown jewel. Designed for high-performance architectures, it provides next-generation data fetching for Preact. It implements a powerful caching system with automatic synchronization and intelligent invalidation, allowing for Optimistic UI management without the overhead of traditional libraries.
2.  **🌌 @vigilio/sweet**: My UI component library. It's not just a collection of buttons; it's a modern, powerful, and extremely lightweight design system focused on modal systems and interactive alerts. It uses advanced rendering techniques to ensure UI elements do not block the main thread.
3.  **📊 @vigilio/preact-table**: The ultimate headless table hook. It surgically manages complex states for sorting, pagination, filtering, and multiple selection. It is optimized to render thousands of rows with minimal memory impact, enabling the creation of enterprise tables with a fluid user experience.
4.  **🔢 @vigilio/preact-paginator**: Lightweight and fully framework-agnostic pagination logic. It elegantly solves dynamic page generation, gap handling, and state synchronization, eliminating the need for repetitive logic in every project.
5.  **✅ @vigilio/valibot**: A specialized fork of the popular validation library, specifically optimized for enterprise applications. It improves the speed of schema transformations and the validation of complex data structures, guaranteeing data integrity with a microscopic bundle size.
6.  **🛡️ @vigilio/next-api**: The ultimate framework for API routes in Next.js. It brings the power of **NestJS-like decorators** and **Dependency Injection** to the world of Serverless APIs, allowing for a clean, centralized, and highly testable code organization.
7.  **Station @vigilio/express**: My decorator-based framework for Express.js. It radically simplifies route definition, middleware management, and service injection, allowing the construction of robust backends with a clean, declarative API that reduces boilerplate by 70%.

### 🧩 Microfrontends, Turborepos, and Module Federation
I mastered **Microfrontend** architecture using **Module Federation**, allowing giant applications to be split into independent fragments loaded on demand. To orchestrate this ecosystem of over 10 NPM packages, I implemented a monorepo with **Turborepo** and **Changesets**. We configured **Remote Caching** that reduced our CI/CD times from 12 minutes to just 45 seconds.

We implemented a **Dependency Isolation** strategy using **pnpm workspaces**, eliminating "node_modules hell" and guaranteeing deterministic versions across the monorepo. Code quality was shielded with **Vitest** in concurrent mode, allowing thousands of unit tests to run in parallel, detecting regressions before they even reached staging. My philosophy changed this year: true quality isn't adding more code, but refining the one you have until it shines with brutal efficiency. 2023 was the year my tools started being the foundation of corporate applications worldwide.`,

			5: `# 🎓 2022: Full Stack Awakening: Vigilio Shop and Real-World Engineering

My thesis at SENATI wasn't a document; it was **Vigilio Shop**, a high-performance E-commerce ecosystem that became my battleground for mastering scalable architectures.

### 🛒 Next.js, MongoDB, and Industrial SEO Mastery
I implemented **Next.js** to leverage **SSR (Server Side Rendering)**, achieving automatic Google indexing of thousands of products in record time. In the backend, I exploited **MongoDB's Aggregation Framework** to generate massive analytical reports and recommendation systems in milliseconds.

To handle inventory consistency under high concurrency, I implemented **Multi-document Transactions** in MongoDB with an **Optimistic Locking** system. This prevented two users from buying the last product simultaneously, guaranteeing data integrity without sacrificing read speed. I designed my own **Predictive Search Engine**, using full-text indexing and relevance weights, which increased the store's conversion rate by 25% compared to standard search solutions.

### 🏛️ Clean Architecture and Scalability
It was the year where **Clean Architecture** clicked. I learned to separate business logic from infrastructure details, allowing my store to be agnostic to DB or UI changes. I implemented the **Repository and Use Cases patterns**, facilitating business logic testing without needing to spin up heavy databases.

The native integration of the **PayPal SDK** was an exercise in advanced resilience: we handled failed payment states, automated disputes, and real-time invoice reconciliation via webhooks secured with **HMAC**. Vigilio Shop proved that commercial software can be a technical work of art if every system layer is cared for. This project was the seed of all the SaaS I would build later, teaching me that well-structured code is the only way to scale a business from zero to international success.`,

			6: `# 🐘 2021: The Era of Structure: Industrial TypeScript and Mobile Takeoff

In 2021, my code went from handcrafted to industrial. The keyword was **Rigor**. I understood that typing is the salvation of any serious engineering team.

### 🏛️ Strict TypeScript and SOLID Patterns in Laravel
I adopted **TypeScript** in strict mode, eliminating 90% of compile-time bugs. On the backend, I specialized in **Laravel with the Repository Pattern**, achieving APIs decoupled from the **PostgreSQL** database. I learned to use **JSONB** for flexible metadata and write **CTEs (Common Table Expressions)** for corporate hierarchical reports.

I dive into **PostgreSQL Hardening**, configuring manual query execution plans to optimize million-row queries. I implemented a **Multi-Factor Authentication (MFA)** system from scratch for government applications, integrating code delivery via SMS and email with secure expiration systems. The backend became a fortress where security and performance were non-negotiable, setting the foundations of what I today consider a corporate-grade API.

### 📱 Native Modules and Reanimated in React Native
I conquered the mobile world with **React Native**. What obsessed me was fluidity; I learned to create **Native Modules** in Java/Objective-C for hardware tasks like document scanning and fingerprint biometrics. I used **Reanimated 2** for constant 60fps animations, avoiding JS bridge bottlenecks and bringing mobile performance to native levels.

I learned to manage the **App Lifecycle** under extreme network conditions, implementing background data synchronization and offline persistence with **SQLite**. I published critical apps on the **App Store and Google Play**, mastering executable signing, provisioning certificate management, and Apple's rigorous review processes. It was a year of intensive learning about how software must behave on a physical device, where CPU and RAM are precious resources that must be masterfully optimized.`,

			7: `# 🐣 2020: The Genesis: Forging the Foundations of a Self-Taught Architect

Everything started here. While the world stopped due to the pandemic, I decided my career had to accelerate at a supernatural speed. I imposed a discipline of **14 hours of daily study**, driven by a visceral curiosity to understand what happens under the computer's hood.

### 🔩 Core Engineering: Vanilla JS and the V8 Engine
Before touching any framework, I decided to understand the engine that drives them all. I deeply studied the **Event Loop**, **Call Stack**, and **V8's Garbage Collection** system. This theoretical basis was my unfair advantage; understanding how JavaScript manages memory and JIT (Just-In-Time) compilation allowed me to write efficient code from my first "Hello World". I built my own **MVC Framework** from scratch with **PHP and MySQL**, implementing my own **Query Builder** to understand how objects map to relational tables.

My flagship project was an ultra-complex **Spotify Clone**, where I didn't just render audio but used the **Web Audio API** to create a dynamic equalizer. I implemented audio streaming via **HLS (HTTP Live Streaming)** to optimize bandwidth consumption, something unthinkable for an average beginner. I learned to manipulate the DOM directly with surgical precision, avoiding the need for external libraries to understand the weight of each operation in browser rendering.

### ☕ Discipline and BEM Aesthetics
I learned to write professional CSS with **Sass and the BEM methodology**, understanding that design at scale requires strict and modular naming. Every bug I found wasn't an obstacle, but a free tutorial on the nature of computing. I deployed my first sites on **Linux VPS servers**, learning to configure Nginx, SSL certificates with Certbot, and basic Firewall rules. 2020 was the year of insatiable hunger, where I forged the technical character and mental resilience needed to lead international projects today. I realized that software engineering isn't knowing syntax; it's the ability to **Think in Complex Systems** and decompose them into their fundamental atoms.`,
		};
		return contents[sort];
	}

	private getPtContent(sort: number) {
		const contents: Record<number, string> = {
			1: `# 🌌 Janeiro 2026: O Nascimento de um Manifesto Digital

Este início de 2026 marca o lançamento do meu **site de portfólio profissional**, um projeto que desenhei para ser o encerramento de um ciclo e o início de uma nova era. Estamos em Janeiro, e meu foco principal tem sido a arquitetura base deste site: implementei a **Arquitetura de Ilhas do Astro** para garantir velocidade de carregamento instantânea, permitindo hidratar componentes de IA de forma seletiva.

### 🏛️ Backbone Técnico e Boas Práticas
A infraestrutura deste portfólio é um testemunho de **Boas Práticas** industriais. Usei o **NestJS** como o núcleo do backend devido à sua robustez e suporte de alto nível para **Injeção de Dependências**. Todo o ecossistema está conteinerizado com **Docker**, o que me permite replicar ambientes de produção idênticos em qualquer hardware. O frontend se apoia na sinergia de **React e TypeScript**, garantindo interfaces dinâmicas, reativas e, acima de tudo, seguras graças à tipagem estrita. Apliquei princípios **SOLID** e **Clean Architecture** para que cada módulo do sistema seja independente, testável e facilmente extensível.

Este portfólio não é apenas uma mostra do meu trabalho anterior; é um experimento vivo onde integro o **Ollama** para executar modelos de linguagem locais e o **pgvector** para buscas semânticas sobre meus próprios dados. Configurei uma camada de **Cache com Redis** para otimizar a entrega de conteúdo frequente. É o primeiro grande passo deste ano, consolidando tudo o que aprendi em uma plataforma que prioriza a **Soberania de Dados** e o desempenho extremo. Este é apenas o começo do que virá neste 2026!`,

			2: `# 🏗️ 2025: Liderança de Elite, Cloud Native e Pedagogia Técnica na Cear Latinoamericano

2025 foi o cenário da minha consagração como **Senior Lead Engineer**, assumindo o comando técnico em uma era de **hiper-escalabilidade**. Minha missão: transformar um ecossistema legacy em uma potência global usando a stack mais avançada de **AWS** e **Sistemas Distribuídos**.

### ☁️ O Salto para Cloud Native: AWS Lambda, RDS e S3
Liderei a transição para arquiteturas **Serverless** e gerenciadas. Implementei microsserviços altamente desacoplados usando **AWS Lambda** para processamento intensivo de documentos judiciais, otimizando custos e escalabilidade infinita. Centralizamos dados críticos no **AWS RDS (PostgreSQL)**, configurando **Read Replicas** com **Drizzle ORM** para lidar com picos de leitura. Para armazenamento massivo de mais de 5TB, orquestrei um ecossistema baseado em **AWS S3** com políticas de ciclo de vida e **CloudFront**.

### 💾 Armazenamento e Infraestrutura Crítica: MinIO e RustFS
Frente à necessidade de soberania de dados e desempenho extremo on-premise, implantei o **MinIO S3** como camada de armazenamento compatível com S3, garantindo independência de provedor. Investiguei e implementei otimizações de baixo nível usando conceitos de **RustFS** para garantir consistência inabalável e velocidades de I/O superiores em nossos clusters de **VPS (AWS EC2 / DigitalOcean)**. Todo este ecossistema é protegido por uma camada de rede robusta com **Cloudflare DNS**, onde configurei **WAF** e **Workers** para mitigar ataques DDoS.

### 🐋 A Revolução Dokploy e Hardening de Infraestrutura
Liderei a migração total para o **Dokploy**, orquestrando um ecossistema de containers **Docker Swarm** com redundância de 100%. Implementamos pipelines de **CI/CD** personalizados e um sistema de **Hardening de Linux** extremo. A arquitetura de rede foi segmentada em **VLANs isoladas**, seguindo os padrões de **Zero Trust Architecture**.

### 🔐 Segurança, Pedagogia e Integração com o Blog
No âmbito das certificações **ISO**, desenhei arquiteturas baseadas em **Logs Imutáveis**. Mas 2025 também foi o ano de compartilhar conhecimento. Tudo o que documentei no meu blog tornou-se a base da nossa equipe: desde **Arquiteturas Orientadas a Eventos com NestJS** até **Estratégias de Indexação Avançada**. Ensinei minha equipe a dominar o **Node.js Performance Tuning** (profiling, GC e otimização extrema) e a implementar **Observabilidade em Escala**.

Construímos o **AI Campus** com **React e TypeScript**, integrando **Stripe, Niubiz e Izipay** sob um motor de filas com **Redis e BullMQ**. Aplicamos **Busca Semântica com LangChain** e **PGVector**, fundamentado em minhas pesquisas sobre **arquiteturas RAG avançadas**. 2025 não foi apenas sobre software; foi sobre criar uma cultura de engenharia de elite seguindo **Clean Architecture e DDD**.

### 🐍 Inovação com Python: Tradução de Voz em Tempo Real
Desenvolvi um sistema avançado com **Python** usando **treinamento RAG** e um algoritmo do **YouTube** para traduzir voz em tempo real em vídeos. Este projeto alcançou uma precisão excepcional, permitindo uma experiência de usuário fluida e quebrando as barreiras linguísticas em conteúdos multimídia de alto impacto.

### 📊 Gestão de Projetos: MS Project e Jira
Como **Project Manager**, liderei o planejamento e o acompanhamento de marcos críticos utilizando o **MS Project** para o controle de cronogramas e o **Jira** para a gestão ágil de tarefas e sprints. Implementei quadros Kanban e Scrum que melhoraram a visibilidade do progresso e a coordenação entre as equipes de desenvolvimento e stakeholders.`,

			3: `# 🤖 2024: CTO nas Trincheiras: IA Productiva e Escalabilidade Masiva na Vigilio Services

Como CTO da **Vigilio Services** em 2024, foquei na **Engenharia Hardcore**. Construímos sistemas que processam milhões de transações sob arquiteturas multi-tenant massivas e seguras.

### 💬 Agentes RAG e Omnicanalidade Inteligente
Liderei o desenvolvimento de agentes autônomos de IA que realizam **RAG (Retrieval-Augmented Generation)** sobre documentos corporativos. Esses agentes, construídos com **NestJS**, orquestrados com **LangGraph**, executam **Tool Calling** para reservas e automação de vendas. Implementei o **BullMQ** para gerenciar as filas de mensagens de milhares de agentes de WhatsApp, garantindo que o sistema não sofresse bloqueios por rate limiting e mantendo uma alta disponibilidade.

Para latências imperceptíveis, desenvolvi um **Sistema de Pré-processamento de Embeddings** asíncrono. Nossa infraestrutura NestJS, totalmente orquestrada com **Docker**, delegava a vetorización para uma fazenda de **Workers de Node.js** otimizados. A inteligência não era apenas o modelo; era o **Pipeline de Dados** que o alimentava, permitindo que milhares de usuários conversassem simultaneamente sem perda de performance.

### ⚡ O Motor de Faturamento e o Triunfo do Laravel 11
Frente ao desafio da faturação eletrônica massiva, liderei a refatoração para o **Laravel 11** e **PHP 8.3**. Otimizamos o motor de assinatura digital de XML e introduzimos **Octane com Swoole** para performance nível Go. Implementei um sistema de **Circuit Breaker** para APIs governamentais; se o servidor falhasse, nosso sistema armazenava as faturas em uma **Fila de Persistência Infinita**. 2024 foi o testemunho de que IA e engenharia robusta podem automatizar indústrias inteiras com precisão cirúrgica baseada em **Docker e NestJS**.`,

			4: `# 📦 2023: A Revolução @vigilio: O Ano do Open Source e Performance Extrema

2023 fue mi año de "rebeldia contra o bloatware". Decidí construir meu próprio ecossistema profissional sob a marca **@vigilio**. Foco: **Zero Dependências, Ultra-Performance**.

### ⚡ Engenharia de Bibliotecas: O coração da @vigilio
Desenvolvi a **@vigilio/preact-fetching** (2.8kb) como alternativa ao React Query, dominando lógicas de **SWR** e sincronização via **BroadcastChannel**. Focamos em **Tree-shaking** extremo: cada função foi escrita para ser eliminada si não usada, garantindo bundles mínimos. Essa filosofia de "mínimo necessário para máximo desempenho" tornou-se o padrão para cada projeto seguinte.

### 🧩 Detalhamento Abrangente do Ecossistema @vigilio

Esta seção detalha o propósito e a arquitetura das ferramentas que projetei para revolucionar a experiência do desenvolvedor:

1.  **🚀 @vigilio/preact-fetching**: A joia da coroa. Projetada para arquiteturas de alto desempenho, fornece gerenciamento de busca de dados de última geração para Preact. Implementa um sistema de cache potente com sincronização automática e invalidação inteligente, permitindo o gerenciamento de uma Optimistic UI sem o peso das bibliotecas tradicionais.
2.  **🌌 @vigilio/sweet**: Minha biblioteca de componentes de interface de usuário. Não é apenas uma coleção de botões; é um sistema de design moderno, poderoso e extremamente leve centrado em sistemas de modais e alertas interativos. Utiliza técnicas de renderização avançada para garantir que os elementos de UI não bloqueiem a thread principal.
3.  **📊 @vigilio/preact-table**: O hook de tabela headless definitivo. Gerencia de forma cirúrgica os estados complexos de ordenação, paginação, filtragem e seleção múltipla. Está otimizado para renderizar milhares de linhas com impacto mínimo na memória, permitindo construir tabelas corporativas com uma experiência de usuário fluida.
4.  **🔢 @vigilio/preact-paginator**: Lógica de paginação leve e totalmente agnóstica ao framework. Resolve de forma elegante a geração dinâmica de páginas, o manejo de lacunas (gaps) e a sincronização de estados, eliminando a necessidade de lógica repetitiva em cada projeto.
5.  **✅ @vigilio/valibot**: Um fork especializado da popular biblioteca de validação, otimizado especificamente para aplicações empresariais. Melhora a velocidade de transformação de esquemas e a validação de estruturas de dados complexas, garantindo a integridade dos dados com um bundle size microscópico.
6.  **🛡️ @vigilio/next-api**: O framework definitivo para rotas de API no Next.js. Traz a potência dos **decoradores estilo NestJS** e a **Injeção de Dependências** para o mundo das Serverless APIs, permitindo uma organização de código limpa, centralizada e altamente testável.
7.  **🚉 @vigilio/express**: Meu framework baseado em decoradores para Express.js. Simplifica radicalmente a definição de rotas, o gerenciamento de middlewares e a injeção de serviços, permitindo construir backends robustos com uma API declarativa e elegante que reduz o boilerplate em 70%.

### 🧩 Microfrontends e Module Federation
Dominei a arquitetura de **Microfrontends** usando **Module Federation**. Implementamos estratégias de **Isolamento de Dependências** com **pnpm workspaces**, eliminando o "node_modules hell". A qualidade foi garantida com **Vitest** en modo concorrente, detectando regressões antes de chegarem à produção. A verdadeira qualidade é refinar o que você tem até que brilhe com eficiência brutal. 2023 foi o ano em que minhas ferramentas começaram a ser o alicerce de aplicações corporativas em todo o mundo.`,

			5: `# 🎓 2022: O Despertar Full Stack: Vigilio Shop e Engenharia do Mundo Real

Minha tese no SENATI foi a **Vigilio Shop**, um ecossistema de E-commerce de alto desempenho para dominar arquiteturas escaláveis.

### 🛒 Next.js, MongoDB e SEO Industrial
Implementei **Next.js** com **SSR**, logrando indexação automática no Google para milhares de produtos. No backend, usei o **MongoDB Aggregation Framework** para relatórios em milissegundos. Para consistência de inventário, implementei **Transacciones Multi-documento** com **Bloqueio Otimista**, garantindo integridade em alta concorrência. Desenhei um **Motor de Busca Preditivo** próprio, aumentando a conversão em 25%.

### 🏛️ Arquitetura Limpa e Escalabilidade
Foi o ano onde a **Clean Architecture** fez sentido. Implementei os padrões **Repository e Use Cases**, separando a lógica de negócio da infraestructura. A integração do **PayPal SDK** manejou estados falhos y webhooks de segurança com **HMAC**. Vigilio Shop provou que software comercial é uma obra de arte técnica si cada camada for cuidada, sendo a semente de todos os meus SaaS futuros.`,

			6: `# 🐘 2021: O Salto para a Profissionalização: TypeScript, Laravel e Mobile

Em 2021, a palavra-chave foi **Rigor**. A tipagem estrita tornou-se a salvação da equipe.

### 🏛️ TypeScript Strict e SOLID no Laravel
Adotei o **TypeScript** estrito, eliminando 90% dos bugs. No backend, me especializei em **Laravel con Repository Pattern** e **PostgreSQL Hardening**, otimizando consultas de milhões de linhas. Implementei **MFA** do zero para sistemas governamentais, estabelecendo as bases de APIs de grau corporativo onde segurança e performance são inegociáveis.

### 📱 Módulos Nativos e Reanimated no React Native
No mundo mobile, criei **Módulos Nativos** em Java/Objective-C para hardware e usei o **Reanimated 2** para 60fps constantes. Gerenciei o ciclo de vida sob condiciones extremas com **SQLite** offline. Publiquei apps críticos na **App Store**, dominando certificados y revisões rigorosas. Foi um ano de aprendizado sobre como o software deve otimizar CPU e RAM em dispositivos físicos.`,

			7: `# 🐣 2020: O Gênesis: Forjando as Bases de um Arquiteto Autodidacta

Tudo começou aqui. Impus 14 horas de estudo diário para entender o que ocorre debaixo do capô.

### 🔩 Engenharia de Base: Vanilla JS e Motor V8
Antes de frameworks, estudei o **Event Loop** e o **Garbage Collection** do V8. Entender a compilação JIT me permitiu escrever código eficiente desde o início. Construí meu propio **Framework MVC** com **PHP e MySQL**, integrando um **Query Builder** próprio. 

Meu proyecto de destaque fue um **Spotify Clon** usando a **Web Audio API** e streaming via **HLS**. Aprendi a manipular o DOM com precisão cirúrgica, entendendo o peso de cada operação no renderizado. 2020 foi o año onde forjei a resiliência para liderar proyectos internacionais, aprendendo que engenharia é a capacidade de **Pensar em Sistemas Complexos**.`,
		};
		return contents[sort];
	}
}
