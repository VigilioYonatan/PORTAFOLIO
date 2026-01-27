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

	describe("index", () => {
		it("should render index with props", async () => {
			const mockProps = { title: "Home" };
			vi.spyOn(service, "index").mockResolvedValue(mockProps as any);

			const req = {} as Request;
			const res = { locals: {} } as Response;
			const next = vi.fn() as NextFunction;

			const result = await controller.index(req, res, next);

			expect(service.index).toHaveBeenCalled();
			expect(res.locals).toEqual({ props: mockProps });
			expect(result).toBe("rendered");
		});
	});

	describe("blog", () => {
		it("should render blog page with pagination", async () => {
			const mockProps = { posts: [] };
			vi.spyOn(service, "blog").mockResolvedValue(mockProps as any);

			const req = { query: { page: "2" } } as unknown as Request;
			const res = { locals: {} } as Response;
			const next = vi.fn() as NextFunction;

			const result = await controller.blog(req, res, next);

			expect(service.blog).toHaveBeenCalledWith(2);
			expect(res.locals).toEqual({ props: mockProps });
			expect(result).toBe("rendered");
		});
	});
});
