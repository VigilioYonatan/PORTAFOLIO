import path from "node:path";
import { getEnvironments } from "@infrastructure/config/server";
import type { NextFunction, Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

export const astroProxy = createProxyMiddleware({
	target: `http://localhost:${getEnvironments().PUBLIC_PORT || 4321}`, // Tu Astro dev server
	changeOrigin: true,
	ws: true, // Importante: WebSockets activados
	selfHandleResponse: false,
});

export function astroRender(props: Record<string, unknown> = {}) {
	return async (req: Request, res: Response, next: NextFunction) => {
		if (req.originalUrl.startsWith("/api")) return next();
		try {
			req.headers["x-astro-locals"] = Buffer.from(
				JSON.stringify({
					...req.locals,
					props,
				}),
			).toString("base64");
			return astroProxy(req, res, next);
		} catch (_error) {
			const entryPath = path.join(process.cwd(), "dist/server/entry.mjs");
			const { handler: astroHandler } = await import(entryPath);
			req.locals.props = props;
			await astroHandler(req, res, next);
		}
	};
}
