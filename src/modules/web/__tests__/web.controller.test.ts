import { IS_PUBLIC_KEY } from "@modules/auth/decorators/public.decorator";
import { Reflector } from "@nestjs/core";
import { Test, type TestingModule } from "@nestjs/testing";
import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WebController } from "../controllers/web.controller";
import { WebService } from "../services/web.service";

// Mock astroRender
vi.mock("@infrastructure/utils/server", () => ({
	astroRender: (props: any) => (_req: any, res: any, _next: any) => {
		res.locals = { ...res.locals, props };
		return "rendered";
	},
}));

describe("WebController", () => {
	let controller: WebController;
	let service: WebService;

	const mockWebService = {
		index: vi.fn(),
		contact: vi.fn(),
		blog: vi.fn(),
		blogSlug: vi.fn(),
		projects: vi.fn(),
		projectSlug: vi.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [WebController],
			providers: [{ provide: WebService, useValue: mockWebService }],
		}).compile();

		controller = module.get<WebController>(WebController);
		service = module.get<WebService>(WebService);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	describe("@Public Decorator", () => {
		const reflector = new Reflector();

		it("should mark blogSlug as public", () => {
			const isPublic = reflector.get(IS_PUBLIC_KEY, controller.blogSlug);
			expect(isPublic).toBe(true);
		});

		it("should mark projectSlug as public", () => {
			const isPublic = reflector.get(IS_PUBLIC_KEY, controller.projectSlug);
			expect(isPublic).toBe(true);
		});

		it("should mark blog as public", () => {
			const isPublic = reflector.get(IS_PUBLIC_KEY, controller.blog);
			expect(isPublic).toBe(true);
		});
	});

	describe("index", () => {
		it("should render index with props", async () => {
			const mockProps = { title: "Home" };
			vi.spyOn(service, "index").mockResolvedValue(mockProps as any);

			const req = { locals: { language: "es" } } as Request;
			const res = { locals: {} } as Response;
			const next = vi.fn() as NextFunction;

			const result = await controller.index(req, res, next);

			expect(service.index).toHaveBeenCalledWith("es");
			expect(res.locals).toEqual({ props: mockProps });
			expect(result).toBe("rendered");
		});
	});

	describe("blog", () => {
		it("should render blog page with pagination", async () => {
			const mockProps = { posts: [] };
			vi.spyOn(service, "blog").mockResolvedValue(mockProps as any);

			const req = {
				query: { page: "2" },
				locals: { language: "es" },
			} as unknown as Request;
			const res = { locals: {} } as Response;
			const next = vi.fn() as NextFunction;

			const result = await controller.blog(req, res, next);

			expect(service.blog).toHaveBeenCalledWith("es", 2);
			expect(res.locals).toEqual({ props: mockProps });
			expect(result).toBe("rendered");
		});
	});
});
