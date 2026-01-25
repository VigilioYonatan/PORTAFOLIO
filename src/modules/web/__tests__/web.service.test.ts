import { BlogPostService } from "@modules/blog-post/services/blog-post.service";
import { ContactService } from "@modules/contact/services/contact.service";
import { MusicTrackService } from "@modules/music/services/music.service";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WebService } from "../services/web.service";

describe("WebService", () => {
	let service: WebService;
	let musicService: MusicTrackService;
	let contactService: ContactService;
	let blogPostService: BlogPostService;

	const mockMusicService = {
		index: vi.fn(),
	};

	const mockContactService = {
		// Add methods if ContactService is actually called
	};

	const mockBlogPostService = {
		index: vi.fn(),
		showBySlug: vi.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				WebService,
				{ provide: MusicTrackService, useValue: mockMusicService },
				{ provide: ContactService, useValue: mockContactService },
				{ provide: BlogPostService, useValue: mockBlogPostService },
			],
		}).compile();

		service = module.get<WebService>(WebService);
		musicService = module.get<MusicTrackService>(MusicTrackService);
		contactService = module.get<ContactService>(ContactService);
		blogPostService = module.get<BlogPostService>(BlogPostService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("index", () => {
		it("should return home props with music tracks", async () => {
			const mockTracks = [{ id: 1, title: "Track 1" }];
			vi.spyOn(musicService, "index").mockResolvedValue({
				success: true,
				count: 1,
				next: null,
				previous: null,
				results: mockTracks as any,
			});

			const result = await service.index();

			expect(result).toEqual({
				title: "Portfolio",
				description: "Portfolio",
				musicTracks: mockTracks,
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
			vi.spyOn(blogPostService, "index").mockResolvedValue({
				success: true,
				results: mockPosts as any,
				count: 1,
				next: null,
				previous: null,
			} as any);

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
			const mockPost = { id: 1, title: "Post 1", summary: "Summary" };
			vi.spyOn(blogPostService, "showBySlug").mockResolvedValue({
				success: true,
				post: mockPost as any,
			});

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
