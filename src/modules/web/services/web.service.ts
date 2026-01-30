import { BlogPostService } from "@modules/blog-post/services/blog-post.service";
import { MusicService } from "@modules/music/services/music.service";
import { OpenSourceService } from "@modules/open-source/services/open-source.service";
import { PortfolioConfigService } from "@modules/portfolio-config/services/portfolio-config.service";
import { ProjectService } from "@modules/project/services/project.service";
import { TechnologyService } from "@modules/technology/services/technology.service";
import { WorkExperienceService } from "@modules/work-experience/services/work-experience.service";
import { Injectable } from "@nestjs/common";
import type { Lang } from "@src/i18n";
import { ui } from "@src/i18n/ui";
import type {
	WebAboutResponseDto,
	WebBlogResponseDto,
	WebBlogSlugResponseDto,
	WebContactResponseDto,
	WebExperienceResponseDto,
	WebIndexResponseDto,
	WebOpenSourceResponseDto,
	WebOpenSourceSlugResponseDto,
	WebPageResponseDto,
	WebProjectSlugResponseDto,
	WebProjectsResponseDto,
} from "../dtos/web.response.dto";

type TranslatableEntity = {
	slug: string;
	language: string;
	parent?: {
		slug: string;
		language: string;
		translations?: { slug: string; language: string }[];
	} | null;
	translations?: { slug: string; language: string }[];
};

@Injectable()
export class WebService {
	constructor(
		private readonly musicService: MusicService,
		private readonly blogPostService: BlogPostService,
		private readonly projectService: ProjectService,
		private readonly technologyService: TechnologyService,
		private readonly workExperienceService: WorkExperienceService,
		private readonly openSourceService: OpenSourceService,
		private readonly portfolioConfigService: PortfolioConfigService,
	) {}

	/**
	 * Fetch props for the index (home) page.
	 * Returns portfolio data with related entities.
	 */
	async index(language: Lang = "es"): Promise<WebIndexResponseDto> {
		const [
			{ results: musicTracks },
			{ results: experiences },
			{ results: latestProjects },
			{ results: latestPosts },
			{ results: latestOpenSources },
			{ config },
		] = await Promise.all([
			this.musicService.index(1, { limit: 10, offset: 0 }),
			this.workExperienceService.index(1, { limit: 4, language }),
			this.projectService.index(1, { limit: 3, language }),
			this.blogPostService.index(1, { limit: 3, language }),
			this.openSourceService.index(1, { limit: 3, language }),
			this.portfolioConfigService.show(1),
		]);

		// Mock: Cambia cada minuto
		const minuteSeed = Math.floor(Date.now() / 60000);
		const liveVisitors = (minuteSeed % 61) + 120; // Rango 120-180

		return {
			title: ui[language].metadata.home.title,
			description: ui[language].metadata.home.description,
			musicTracks,
			experiences,
			latestProjects,
			latestOpenSources,
			socials: config.social_links,
			latestPosts,
			liveVisitors,
		};
	}

	async pricing(): Promise<WebPageResponseDto> {
		return {
			title: "Pricing | Pylot ",
			description: "Simple, transparent pricing for every stage of growth.",
		};
	}

	async about(language: Lang = "es"): Promise<WebAboutResponseDto> {
		const { results: technologies } = await this.technologyService.index(1, {
			limit: 100,
			offset: 0,
			sortBy: "id",
			sortDir: "ASC",
		});

		return {
			title:
				language === "es" ? "Sobre Mí | Portafolio" : "About Me | Portfolio",
			description:
				language === "es"
					? "Conoce más sobre mi experiencia y habilidades."
					: "Learn more about my experience and skills.",
			technologies,
		};
	}

	async experience(language: Lang = "es"): Promise<WebExperienceResponseDto> {
		const { results: experiences } = await this.workExperienceService.index(1, {
			limit: 100,
			language,
		});

		return {
			title: ui[language].metadata.experience.title,
			description: ui[language].metadata.experience.description,
			experiences,
		};
	}

	async contact(language: Lang = "es"): Promise<WebContactResponseDto> {
		// Mock data or fetch from ContactService configuration if available
		// For now using static data as per typical contact page requirements or could fetch from a settings service
		return {
			title: language === "es" ? "Contacto | Pylot" : "Contact Us | Pylot",
			description:
				language === "es"
					? "Ponte en contacto con nuestro equipo."
					: "Get in touch with our team.",
			email: "contact@example.com",
			phone: "+1234567890",
		};
	}

	async features(): Promise<WebPageResponseDto> {
		return {
			title: "Features | Pylot ",
			description: "Explore the powerful features of Pylot .",
		};
	}

	async blog(language: Lang, page = 1, limit = 9): Promise<WebBlogResponseDto> {
		const { results: posts, count: total } = await this.blogPostService.index(
			1,
			{
				limit,
				offset: (page - 1) * limit,
				language,
			},
		);

		return {
			title: ui[language].metadata.blog.title,
			description:
				language === "es"
					? "Lee nuestras últimas noticias y artículos."
					: "Read our latest news and articles.",
			posts,
			total,
			page,
			limit,
		};
	}

	async projects(
		language: Lang,
		page = 1,
		limit = 9,
	): Promise<WebProjectsResponseDto> {
		const { results: projects, count: total } = await this.projectService.index(
			1,
			{
				limit,
				offset: (page - 1) * limit,
				language,
			},
		);

		return {
			title: ui[language].metadata.projects.title,
			description:
				language === "es"
					? "Explora mi trabajo y proyectos."
					: "Explore my work and projects.",
			projects,
			total,
			page,
			limit,
		};
	}

	async blogSlug(
		language: Lang,
		slug: string,
	): Promise<WebBlogSlugResponseDto> {
		// Use specific method to find by slug confirmed in BlogPostService
		const { post } = await this.blogPostService.showBySlug(1, slug, language);

		return {
			title: post.title,
			description: post.extract || post.title,
			post: post,
			translations: this.getSlugTranslations(
				post as unknown as TranslatableEntity,
			),
		};
	}

	async projectSlug(
		language: Lang,
		slug: string,
	): Promise<WebProjectSlugResponseDto> {
		const { project } = await this.projectService.showBySlug(1, slug, language);

		return {
			title: project.title,
			description: project.description,
			project,
			translations: this.getSlugTranslations(
				project as unknown as TranslatableEntity,
			),
		};
	}

	async openSource(
		language: Lang,
		page = 1,
		limit = 9,
	): Promise<WebOpenSourceResponseDto> {
		const { results: open_sources, count: total } =
			await this.openSourceService.index(1, {
				limit,
				offset: (page - 1) * limit,
				language,
			});

		return {
			title: ui[language].metadata.opensource.title,
			description: ui[language].metadata.opensource.description,
			open_sources,
			total,
			page,
			limit,
		};
	}

	async openSourceSlug(
		language: Lang,
		slug: string,
	): Promise<WebOpenSourceSlugResponseDto> {
		const { open_source } = await this.openSourceService.showBySlug(
			1,
			slug,
			language,
		);

		return {
			title: open_source.name,
			description: open_source.description,
			open_source,
			translations: this.getSlugTranslations(
				open_source as unknown as TranslatableEntity,
			),
		};
	}

	private getSlugTranslations(
		entity: TranslatableEntity,
	): Record<string, string> {
		const translations: Record<string, string> = {};
		const root = entity.parent || entity;

		// Add root (original language)
		if (root.language && root.slug) {
			translations[root.language] = root.slug;
		}

		// Add translations (children)
		if (root.translations && Array.isArray(root.translations)) {
			for (const t of root.translations) {
				if (t.language && t.slug) {
					translations[t.language] = t.slug;
				}
			}
		}

		return translations;
	}
}
