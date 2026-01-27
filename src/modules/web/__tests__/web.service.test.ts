import { BlogPostService } from "@modules/blog-post/services/blog-post.service";
import { MusicService } from "@modules/music/services/music.service";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WebService } from "../services/web.service";

import { ProjectService } from "@modules/project/services/project.service";
import { WorkExperienceService } from "@modules/work-experience/services/work-experience.service";

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
		showBySlug: vi.fn(),
	};

	const mockWorkExperienceService = {
		index: vi.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				WebService,
				{ provide: MusicService, useValue: mockMusicService },
				{ provide: BlogPostService, useValue: mockBlogPostService },
				{ provide: ProjectService, useValue: mockProjectService },
				{ provide: WorkExperienceService, useValue: mockWorkExperienceService },
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
			(musicService.index as any).mockReturnValue(Promise.resolve({
				success: true,
				count: 1,
				next: null,
				previous: null,
				results: mockTracks,
			}));

			(mockWorkExperienceService.index as any).mockReturnValue(Promise.resolve({
				success: true,
				count: 0,
				results: [],
			}));

			const result = await service.index();

			expect(result).toEqual({
				title: "Portfolio",
				description: "Portfolio",
				musicTracks: mockTracks,
				experiences: [],
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
			(blogPostService.index as any).mockReturnValue(Promise.resolve({
				success: true,
				results: mockPosts,
				count: 1,
				next: null,
				previous: null,
			}));

			const result = await service.blog(1, 9);

			expect(result).toEqual({
				title: "Blog | Pylot ",
				description: "Read our latest news and articles.",
				posts: mockPosts,
				total: 1,
			});
			expect(blogPostService.index).toHaveBeenCalledWith(1, {
				limit: 9,
				offset: 0,
			});
		});
	});

	describe("blogSlug", () => {
		it("should return blog post props by slug", async () => {
			const mockPost = { id: 1, title: "Post 1", extract: "Summary" };
			(blogPostService.showBySlug as any).mockReturnValue(Promise.resolve({
				success: true,
				post: mockPost,
			}));

			const result = await service.blogSlug("post-1");

			expect(result).toEqual({
				title: "Post 1",
				description: "Summary",
				post: mockPost,
			});
			expect(blogPostService.showBySlug).toHaveBeenCalledWith(1, "post-1");
		});
	});
});
