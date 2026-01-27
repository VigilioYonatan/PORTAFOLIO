import { BlogPostService } from "@modules/blog-post/services/blog-post.service";
import { ContactService } from "@modules/contact/services/contact.service";
import { MusicService } from "@modules/music/services/music.service";
import { ProjectService } from "@modules/project/services/project.service";
import { WorkExperienceService } from "@modules/work-experience/services/work-experience.service";
import { Injectable } from "@nestjs/common";
import type { WebBlogResponseDto, WebBlogSlugResponseDto, WebContactResponseDto, WebIndexResponseDto, WebPageResponseDto, WebProjectSlugResponseDto } from "../dtos/web.response.dto";

@Injectable()
export class WebService {
	constructor(
		private readonly musicService: MusicService,
		private readonly contactService: ContactService,
		private readonly blogPostService: BlogPostService,
		private readonly projectService: ProjectService,
		private readonly workExperienceService: WorkExperienceService,
	) {}

	/**
	 * Fetch props for the index (home) page.
	 * Returns portfolio data with related entities.
	 */
	async index(): Promise<WebIndexResponseDto> {
		const { results: musicTracks } = await this.musicService.index(1, {
			limit: 10,
			offset: 0,
		});

		const { results: experiences } = await this.workExperienceService.index(1, {
			limit: 4,
		});

		return {
			title: "Portfolio",
			description: "Portfolio",
			musicTracks,
			experiences,
		};
	}

	async pricing(): Promise<WebPageResponseDto> {
		return {
			title: "Pricing | Pylot ",
			description: "Simple, transparent pricing for every stage of growth.",
		};
	}

	async about(): Promise<WebPageResponseDto> {
		return {
			title: "About Us | Pylot ",
			description: "Learn more about our mission and team.",
		};
	}

	async contact(): Promise<WebContactResponseDto> {
		// Mock data or fetch from ContactService configuration if available
		// For now using static data as per typical contact page requirements or could fetch from a settings service
		return {
			title: "Contact Us | Pylot ",
			description: "Get in touch with our team.",
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
		page = 1,
		limit = 9,
	): Promise<WebBlogResponseDto> {
		const { results: posts, count: total } = await this.blogPostService.index(
			1,
			{
				limit,
				offset: (page - 1) * limit,
			},
		);

		return {
			title: "Blog | Pylot ",
			description: "Read our latest news and articles.",
			posts,
			total,
		};
	}

	async blogSlug(
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

	async projectSlug(slug: string): Promise<WebProjectSlugResponseDto> {
		const { project } = await this.projectService.showBySlug(1, slug);

		return {
			title: project.title,
			description: project.description,
			project,
		};
	}
}
