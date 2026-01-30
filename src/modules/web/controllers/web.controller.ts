import * as os from "node:os";
import { astroRender } from "@infrastructure/utils/server";
import { Public } from "@modules/auth/decorators/public.decorator";
import {
	All,
	Controller,
	Get,
	Next,
	Req,
	Res,
	VERSION_NEUTRAL,
} from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import { WebPath } from "../routers/web.routers";
import { WebService } from "../services/web.service";

@Controller({ path: "/", version: VERSION_NEUTRAL })
export class WebController {
	constructor(private readonly webService: WebService) {}

	@Public()
	@Get([WebPath.INDEX, WebPath.INDEX_ES, WebPath.INDEX_EN, WebPath.INDEX_PT])
	async index(
		@Req() req: Request,
		@Res() res: Response,
		@Next() next: NextFunction,
	): Promise<void> {
		const props = await this.webService.index(req.locals.language);
		return await astroRender(props)(req, res, next);
	}

	@Public()
	@Get("/stats")
	getStats() {
		const cpus = os.cpus();
		const freeMem = os.freemem();
		const totalMem = os.totalmem();
		const uptime = os.uptime();
		const loadAvg = os.loadavg(); // Returns [1, 5, 15] min averages

		return {
			cpuModel: cpus[0]?.model || "Unknown",
			cpuCount: cpus.length,
			// Calculate rough CPU usage from load avg relative to core count (very rough estimate for Node)
			cpuLoad: (loadAvg[0] / cpus.length) * 100,
			freeMem,
			totalMem,
			memUsagePercent: ((totalMem - freeMem) / totalMem) * 100,
			uptime,
			platform: os.platform(),
			arch: os.arch(),
		};
	}

	@Public()
	@Get([
		WebPath.CONTACT,
		WebPath.CONTACT_ES,
		WebPath.CONTACT_EN,
		WebPath.CONTACT_PT,
	])
	async contact(
		@Req() req: Request,
		@Res() res: Response,
		@Next() next: NextFunction,
	) {
		const props = await this.webService.contact(req.locals.language);
		return await astroRender(props)(req, res, next);
	}

	@Public()
	@Get([WebPath.ABOUT, WebPath.ABOUT_ES, WebPath.ABOUT_EN, WebPath.ABOUT_PT])
	async about(
		@Req() req: Request,
		@Res() res: Response,
		@Next() next: NextFunction,
	) {
		const props = await this.webService.about(req.locals.language);
		return await astroRender(props)(req, res, next);
	}

	@Public()
	@Get([
		WebPath.EXPERIENCE,
		WebPath.EXPERIENCE_ES,
		WebPath.EXPERIENCE_EN,
		WebPath.EXPERIENCE_PT,
	])
	async experience(
		@Req() req: Request,
		@Res() res: Response,
		@Next() next: NextFunction,
	) {
		const props = await this.webService.experience(req.locals.language);
		return await astroRender(props)(req, res, next);
	}

	@Public()
	@Get([
		WebPath.PROJECTS,
		WebPath.PROJECTS_ES,
		WebPath.PROJECTS_EN,
		WebPath.PROJECTS_PT,
	])
	async projects(
		@Req() req: Request,
		@Res() res: Response,
		@Next() next: NextFunction,
	) {
		const page = req.query.page ? Number(req.query.page) : 1;
		const props = await this.webService.projects(req.locals.language, page);
		return await astroRender(props)(req, res, next);
	}

	@Public()
	@Get([
		WebPath.OPEN_SOURCE,
		WebPath.OPEN_SOURCE_ES,
		WebPath.OPEN_SOURCE_EN,
		WebPath.OPEN_SOURCE_PT,
	])
	async openSource(
		@Req() req: Request,
		@Res() res: Response,
		@Next() next: NextFunction,
	) {
		const page = req.query.page ? Number(req.query.page) : 1;
		const props = await this.webService.openSource(req.locals.language, page);
		return await astroRender(props)(req, res, next);
	}

	@Public()
	@Get([
		WebPath.OPEN_SOURCE_SLUG,
		WebPath.OPEN_SOURCE_SLUG_ES,
		WebPath.OPEN_SOURCE_SLUG_EN,
		WebPath.OPEN_SOURCE_SLUG_PT,
	])
	async openSourceSlug(
		@Req() req: Request,
		@Res() res: Response,
		@Next() next: NextFunction,
	) {
		const { slug } = req.params;
		const props = await this.webService.openSourceSlug(
			req.locals.language,
			slug as string,
		);
		return await astroRender(props)(req, res, next);
	}

	@Public()
	@Get([
		WebPath.PROJECT_SLUG,
		WebPath.PROJECT_SLUG_ES,
		WebPath.PROJECT_SLUG_EN,
		WebPath.PROJECT_SLUG_PT,
	])
	async projectSlug(
		@Req() req: Request,
		@Res() res: Response,
		@Next() next: NextFunction,
	) {
		const { slug } = req.params;
		const props = await this.webService.projectSlug(
			req.locals.language,
			slug as string,
		);
		return await astroRender(props)(req, res, next);
	}

	@Public()
	@Get([WebPath.BLOG, WebPath.BLOG_ES, WebPath.BLOG_EN, WebPath.BLOG_PT])
	async blog(
		@Req() req: Request,
		@Res() res: Response,
		@Next() next: NextFunction,
	) {
		const page = req.query.page ? Number(req.query.page) : 1;
		const props = await this.webService.blog(req.locals.language, page);
		return await astroRender(props)(req, res, next);
	}

	@Public()
	@Get([
		WebPath.BLOG_SLUG,
		WebPath.BLOG_SLUG_ES,
		WebPath.BLOG_SLUG_EN,
		WebPath.BLOG_SLUG_PT,
	])
	async blogSlug(
		@Req() req: Request,
		@Res() res: Response,
		@Next() next: NextFunction,
	) {
		const { slug } = req.params;
		const props = await this.webService.blogSlug(
			req.locals.language,
			slug as string,
		);
		return await astroRender(props)(req, res, next);
	}

	@Public()
	@Get([WebPath.LOGIN, WebPath.REGISTER])
	async auth(
		@Req() req: Request,
		@Res() res: Response,
		@Next() next: NextFunction,
	) {
		return await astroRender()(req, res, next);
	}

	@Public()
	@Get(WebPath.NOT_FOUND)
	async notFound(
		@Req() req: Request,
		@Res() res: Response,
		@Next() next: NextFunction,
	) {
		const language = req.locals.language;
		const props = {
			title: language === "es" ? "Página no encontrada" : "Page Not Found",
			description:
				language === "es"
					? "La página que buscas no existe."
					: "The page you are looking for does not exist.",
		};
		return await astroRender(props)(req, res, next);
	}

	@Public()
	@All("*")
	async catchAll(
		@Req() req: Request,
		@Res() res: Response,
		@Next() next: NextFunction,
	) {
		if (req.originalUrl.startsWith("/api")) {
			return next();
		}
		// Para assets (/_astro/..., /favicon.ico), solo dejamos pasar
		return await astroRender()(req, res, next);
	}

	@Get(WebPath.DASHBOARD)
	async dashboard(
		@Req() req: Request,
		@Res() res: Response,
		@Next() next: NextFunction,
	) {
		return await astroRender()(req, res, next);
	}
}
