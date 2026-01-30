import { BlogPostService } from "@modules/blog-post/services/blog-post.service";
import { MusicService } from "@modules/music/services/music.service";
import { OpenSourceService } from "@modules/open-source/services/open-source.service";
import { PortfolioConfigService } from "@modules/portfolio-config/services/portfolio-config.service";
import { ProjectService } from "@modules/project/services/project.service";
import { TechnologyService } from "@modules/technology/services/technology.service";
import { WorkExperienceService } from "@modules/work-experience/services/work-experience.service";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { WebService } from "../services/web.service";

describe("WebService", () => {
	let service: WebService;
	let musicService: MusicService;
	let blogPostService: BlogPostService;

	const mockMusicService = {
		index: vi.fn(),
	};

	const mockBlogPostService = {
		index: vi.fn(),
		showBySlug: vi.fn(),
	};

	const mockProjectService = {
		index: vi.fn(),
		showBySlug: vi.fn(),
	};

	const mockWorkExperienceService = {
		index: vi.fn(),
	};

	const mockTechnologyService = {
		index: vi.fn(),
	};

	const mockOpenSourceService = {
		index: vi.fn(),
		showBySlug: vi.fn(),
	};

	const mockPortfolioConfigService = {
		show: vi.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				WebService,
				{ provide: MusicService, useValue: mockMusicService },
				{ provide: BlogPostService, useValue: mockBlogPostService },
				{ provide: ProjectService, useValue: mockProjectService },
				{ provide: TechnologyService, useValue: mockTechnologyService },
				{ provide: WorkExperienceService, useValue: mockWorkExperienceService },
				{ provide: OpenSourceService, useValue: mockOpenSourceService },
				{
					provide: PortfolioConfigService,
					useValue: mockPortfolioConfigService,
				},
			],
		}).compile();

		service = module.get<WebService>(WebService);
		musicService = module.get<MusicService>(MusicService);
		blogPostService = module.get<BlogPostService>(BlogPostService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("index", () => {
		it("should return home props with music tracks", async () => {
			const mockTracks = [{ id: 1, title: "Track 1" }];
			(musicService.index as unknown as Mock).mockReturnValue(
				Promise.resolve({
					success: true,
					count: 1,
					next: null,
					previous: null,
					results: mockTracks,
				}),
			);

			(mockWorkExperienceService.index as unknown as Mock).mockReturnValue(
				Promise.resolve({
					success: true,
					count: 0,
					results: [],
				}),
			);

			(mockProjectService.index as unknown as Mock).mockReturnValue(
				Promise.resolve({
					success: true,
					count: 0,
					results: [],
				}),
			);

			(mockBlogPostService.index as unknown as Mock).mockReturnValue(
				Promise.resolve({
					success: true,
					count: 0,
					results: [],
				}),
			);

			(mockOpenSourceService.index as unknown as Mock).mockReturnValue(
				Promise.resolve({
					success: true,
					count: 0,
					results: [],
				}),
			);

			(mockPortfolioConfigService.show as unknown as Mock).mockReturnValue(
				Promise.resolve({
					success: true,
					config: { social_links: { github: "test" } },
				}),
			);

			const result = await service.index("es");

			expect(result).toEqual({
				title: "Vigilio Yonatan | Ingeniero de Software con IA",
				description:
					"Soy Yonatan Vigilio Lavado, ingeniero de software con más de 6 años de experiencia desarrollando soluciones escalables e inteligencia artificial desde 2020. Apasionado por la arquitectura limpia, el open source y la producción de Drum and Bass.",
				musicTracks: mockTracks,
				experiences: [],
				latestProjects: [],
				latestOpenSources: [],
				socials: { github: "test" },
				latestPosts: [],
				liveVisitors: expect.any(Number),
			});
			expect(musicService.index).toHaveBeenCalledWith(1, {
				limit: 10,
				offset: 0,
			});
		});
	});

	describe("blog", () => {
		it("should return blog props with paginated posts", async () => {
			const mockPosts = [{ id: 1, title: "Post 1" }];
			(blogPostService.index as unknown as Mock).mockReturnValue(
				Promise.resolve({
					success: true,
					results: mockPosts,
					count: 1,
					next: null,
					previous: null,
				}),
			);

			const result = await service.blog("es", 1, 9);

			expect(result).toEqual({
				title: "Blog | Vigilio Yonatan",
				description: "Lee nuestras últimas noticias y artículos.",
				posts: mockPosts,
				total: 1,
				page: 1,
				limit: 9,
			});
			expect(blogPostService.index).toHaveBeenCalledWith(1, {
				limit: 9,
				offset: 0,
				language: "es",
			});
		});
	});

	describe("blogSlug", () => {
		it("should return blog post props by slug", async () => {
			const mockPost = { id: 1, title: "Post 1", extract: "Summary" };
			(blogPostService.showBySlug as unknown as Mock).mockReturnValue(
				Promise.resolve({
					success: true,
					post: mockPost,
				}),
			);

			const result = await service.blogSlug("es", "post-1");

			expect(result).toEqual({
				title: "Post 1",
				description: "Summary",
				post: mockPost,
				translations: {},
			});
			expect(blogPostService.showBySlug).toHaveBeenCalledWith(
				1,
				"post-1",
				"es",
			);
		});
	});

	describe("projects", () => {
		it("should return projects props with paginated projects", async () => {
			const mockProjects = [{ id: 1, title: "Project 1" }];
			(mockProjectService.index as unknown as Mock).mockReturnValue(
				Promise.resolve({
					success: true,
					results: mockProjects,
					count: 1,
				}),
			);

			const result = await service.projects("es", 1, 9);

			expect(result).toEqual({
				title: "Proyectos | Vigilio Yonatan",
				description: "Explora mi trabajo y proyectos.",
				projects: mockProjects,
				total: 1,
				page: 1,
				limit: 9,
			});
			expect(mockProjectService.index).toHaveBeenCalledWith(1, {
				limit: 9,
				offset: 0,
				language: "es",
			});
		});
	});
});
