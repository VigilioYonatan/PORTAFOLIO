import { type Language } from "@infrastructure/types/i18n";
import { BlogPostService } from "@modules/blog-post/services/blog-post.service";
import { MusicService } from "@modules/music/services/music.service";
import { ProjectService } from "@modules/project/services/project.service";
import { TechnologyService } from "@modules/technology/services/technology.service";
import { WorkExperienceService } from "@modules/work-experience/services/work-experience.service";
import { Injectable } from "@nestjs/common";
import type { WebAboutResponseDto, WebBlogResponseDto, WebBlogSlugResponseDto, WebContactResponseDto, WebIndexResponseDto, WebPageResponseDto, WebProjectsResponseDto, WebProjectSlugResponseDto } from "../dtos/web.response.dto";

@Injectable()
export class WebService {
	constructor(
		private readonly musicService: MusicService,
		private readonly blogPostService: BlogPostService,
		private readonly projectService: ProjectService,
		private readonly technologyService: TechnologyService,
		private readonly workExperienceService: WorkExperienceService,
	) {}

	/**
	 * Fetch props for the index (home) page.
	 * Returns portfolio data with related entities.
	 */
	async index(language: Language = "es"): Promise<WebIndexResponseDto> {
		const { results: musicTracks } = await this.musicService.index(1, {
			limit: 10,
			offset: 0,
		});

		const { results: experiences } = await this.workExperienceService.index(1, {
			limit: 4,
		});

		const { results: latestProjects } = await this.projectService.index(1, {
			limit: 3,
			language,
		});

		const { results: latestPosts } = await this.blogPostService.index(1, {
			limit: 3,
			language,
		});

		return {
			title: language === "es" ? "Portafolio" : "Portfolio",
			description: language === "es" ? "Mi Portafolio Profesional" : "My Professional Portfolio",
			musicTracks,
			experiences,
			latestProjects,
			latestPosts,
		};
	}

	async pricing(): Promise<WebPageResponseDto> {
		return {
			title: "Pricing | Pylot ",
			description: "Simple, transparent pricing for every stage of growth.",
		};
	}

	async about(language: Language = "es"): Promise<WebAboutResponseDto> {
		const { results: technologies } = await this.technologyService.index(1, {
			limit: 20,
			offset: 0,
		});

		return {
			title: language === "es" ? "Sobre Mí | Portafolio" : "About Me | Portfolio",
			description:
				language === "es"
					? "Conoce más sobre mi experiencia y habilidades."
					: "Learn more about my experience and skills.",
			technologies,
		};
	}

	async contact(language: Language = "es"): Promise<WebContactResponseDto> {
		// Mock data or fetch from ContactService configuration if available
		// For now using static data as per typical contact page requirements or could fetch from a settings service
		return {
			title: language === "es" ? "Contacto | Pylot" : "Contact Us | Pylot",
			description: language === "es" ? "Ponte en contacto con nuestro equipo." : "Get in touch with our team.",
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

	async blog(
		language: Language,
		page = 1,
		limit = 9,
	): Promise<WebBlogResponseDto> {
		const { results: posts, count: total } = await this.blogPostService.index(
			1,
			{
				limit,
				offset: (page - 1) * limit,
				language,
			},
		);

	

		return {
			title: language === "es" ? "Blog | Pylot" : "Blog | Pylot",
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
		language: Language,
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
			title: language === "es" ? "Proyectos | Pylot" : "Projects | Pylot",
			description: language === "es" ? "Explora mi trabajo y proyectos." : "Explore my work and projects.",
			projects,
			total,
			page,
			limit,
		};
	}

	async blogSlug(
		language: Language,
		slug: string,
	): Promise<WebBlogSlugResponseDto> {
		// Use specific method to find by slug confirmed in BlogPostService
		const { post } = await this.blogPostService.showBySlug(1, slug);

		return {
			title: post.title,
			description: post.extract || post.title,
			post: post,
		};
	}

	async projectSlug(
		language: Language,
		slug: string,
	): Promise<WebProjectSlugResponseDto> {
		const { project } = await this.projectService.showBySlug(1, slug);

		return {
			title: project.title,
			description: project.description,
			project,
		};
	}
}
