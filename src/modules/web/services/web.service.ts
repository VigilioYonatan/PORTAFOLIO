import type { BlogPostSchema } from "@modules/blog-post/schemas/blog-post.schema";
import { BlogPostService } from "@modules/blog-post/services/blog-post.service";
import { ContactService } from "@modules/contact/services/contact.service";
import type { MusicTrackSchema } from "@modules/music/schemas/music.schema";
import { MusicTrackService } from "@modules/music/services/music.service";
import type { ProjectSchema } from "@modules/project/schemas/project.schema";
import { ProjectService } from "@modules/project/services/project.service";
import type { WorkExperienceSchema } from "@modules/work-experience/schemas/work-experience.schema";
import { WorkExperienceService } from "@modules/work-experience/services/work-experience.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class WebService {
	constructor(
		private readonly musicService: MusicTrackService,
		private readonly contactService: ContactService,
		private readonly blogPostService: BlogPostService,
		private readonly projectService: ProjectService,
		private readonly workExperienceService: WorkExperienceService,
	) {}

	/**
	 * Fetch props for the index (home) page.
	 * Returns portfolio data with related entities.
	 */
	async index(): Promise<{
		title: string;
		description: string;
		musicTracks: MusicTrackSchema[];
		experiences: WorkExperienceSchema[];
	}> {
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

	async pricing(): Promise<{ title: string; description: string }> {
		return {
			title: "Pricing | Pylot ",
			description: "Simple, transparent pricing for every stage of growth.",
		};
	}

	async about(): Promise<{ title: string; description: string }> {
		return {
			title: "About Us | Pylot ",
			description: "Learn more about our mission and team.",
		};
	}

	async contact(): Promise<{
		title: string;
		description: string;
		email: string;
		phone: string;
	}> {
		// Mock data or fetch from ContactService configuration if available
		// For now using static data as per typical contact page requirements or could fetch from a settings service
		return {
			title: "Contact Us | Pylot ",
			description: "Get in touch with our team.",
			email: "contact@example.com",
			phone: "+1234567890",
		};
	}

	async features(): Promise<{ title: string; description: string }> {
		return {
			title: "Features | Pylot ",
			description: "Explore the powerful features of Pylot .",
		};
	}

	async blog(
		page = 1,
		limit = 9,
	): Promise<{
		title: string;
		description: string;
		posts: BlogPostSchema[];
		total: number;
	}> {
		console.log(JSON.stringify({ page, limit }));
		const { results: posts, count: total } = await this.blogPostService.index(
			1,
			{
				limit,
				offset: (page - 1) * limit,
			},
		);
		console.log({ posts });

		return {
			title: "Blog | Pylot ",
			description: "Read our latest news and articles.",
			posts,
			total,
		};
	}

	async blogSlug(
		slug: string,
	): Promise<{ title: string; description: string; post: BlogPostSchema }> {
		// Use specific method to find by slug confirmed in BlogPostService
		const { post } = await this.blogPostService.showBySlug(1, slug);

		return {
			title: post.title,
			description: post.extract || post.title,
			post: post,
		};
	}

	async projectSlug(slug: string): Promise<{
		title: string;
		description: string;
		project: ProjectSchema;
	}> {
		const { project } = await this.projectService.showBySlug(1, slug);

		return {
			title: project.title,
			description: project.description,
			project,
		};
	}
}
