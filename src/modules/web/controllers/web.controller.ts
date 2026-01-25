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
	) {
		const props = await this.webService.index();
		return await astroRender(props)(req, res, next);
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
		const props = await this.webService.contact();
		return await astroRender(props)(req, res, next);
	}

	@Public()
	@Get(WebPath.PROJECTS)
	async projects(
		@Req() req: Request,
		@Res() res: Response,
		@Next() next: NextFunction,
	) {
		return await astroRender({})(req, res, next);
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
		const props = await this.webService.projectSlug(slug);
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
		const props = await this.webService.blog(page);
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
		const props = await this.webService.blogSlug(slug);
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

	@Get(WebPath.NOT_FOUND)
	async notFound(
		@Req() req: Request,
		@Res() res: Response,
		@Next() next: NextFunction,
	) {
		return await astroRender()(req, res, next);
	}

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
