import { astroRender } from "@infrastructure/utils/server";
import { WebService } from "@modules/web/services/web.service";
import { Test, type TestingModule } from "@nestjs/testing";
import type { Request, Response } from "express";
import { WebController } from "../web.controller";

// Mock dependencies
vi.mock("@infrastructure/utils/server", () => ({
	astroRender: vi.fn(() => vi.fn()),
}));

describe("WebController", () => {
	let controller: WebController;
	let webService: WebService;

	const mockWebService = {
		index: vi.fn(),
		blog: vi.fn(),
		blogSlug: vi.fn(),
		projectSlug: vi.fn(),
		contact: vi.fn(),
	};

	const mockReq = {
		originalUrl: "/test",
		locals: { language: "es" },
	} as unknown as Request;
	const mockRes = {} as unknown as Response;
	const mockNext = vi.fn();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [WebController],
			providers: [
				{
					provide: WebService,
					useValue: mockWebService,
				},
			],
		}).compile();

		controller = module.get<WebController>(WebController);
		webService = module.get<WebService>(WebService);
		vi.clearAllMocks();
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	describe("index", () => {
		it("should call webService.index and astroRender", async () => {
			const props = { title: "Home" };
			mockWebService.index.mockResolvedValue(props);

			await controller.index(mockReq, mockRes, mockNext);

			expect(webService.index).toHaveBeenCalledWith("es");
			expect(astroRender).toHaveBeenCalledWith(props);
		});
	});

	describe("auth", () => {
		it("should call astroRender", async () => {
			await controller.auth(mockReq, mockRes, mockNext);
			expect(astroRender).toHaveBeenCalled();
		});
	});

	describe("dashboard", () => {
		it("should call astroRender", async () => {
			await controller.dashboard(mockReq, mockRes, mockNext);
			expect(astroRender).toHaveBeenCalled();
		});
	});

	describe("notFound", () => {
		it("should call astroRender", async () => {
			await controller.notFound(mockReq, mockRes, mockNext);
			expect(astroRender).toHaveBeenCalled();
		});
	});

	describe("catchAll", () => {
		it("should call next() if url starts with /api", async () => {
			const apiReq = { originalUrl: "/api/v1/test" } as unknown as Request;
			await controller.catchAll(apiReq, mockRes, mockNext);
			expect(mockNext).toHaveBeenCalled();
		});

		it("should call astroRender for non-api routes", async () => {
			const pageReq = { originalUrl: "/some-page" } as unknown as Request;
			await controller.catchAll(pageReq, mockRes, mockNext);
			expect(astroRender).toHaveBeenCalled();
		});
	});
});
