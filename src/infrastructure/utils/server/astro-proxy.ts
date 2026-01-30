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
		const isProduction = getEnvironments().NODE_ENV === "PRODUCTION";

		// Standardize locals transmission
		req.headers["x-astro-locals"] = Buffer.from(
			JSON.stringify({
				...req.locals,
				props,
			}),
		).toString("base64");

		if (isProduction) {
			// const entryPath = path.join(process.cwd(), "dist/server/entry.mjs");
			// const { handler: astroHandler } = await import(entryPath);
			const entryPath = path.resolve(process.cwd(), "dist", "server", "entry.mjs");
			// IMPORTANTE: En Vercel, a veces el import dinámico necesita el prefijo file:// 
			// para rutas absolutas en entornos ESM/CJS híbridos
			const { handler: astroHandler } = await import(`file://${entryPath}`);
			return astroHandler(req, res, next);
		}

		return astroProxy(req, res, next);
	};
}
