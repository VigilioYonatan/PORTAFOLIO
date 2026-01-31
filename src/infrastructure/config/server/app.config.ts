import { WebPath } from "@modules/web/routers/web.routers";
import {
	type INestApplication,
	RequestMethod,
	VersioningType,
} from "@nestjs/common";
import { json, urlencoded } from "express";

export function configureApp(app: INestApplication): void {
	// Global Prefix with exclusions
	app.setGlobalPrefix("api", {
		exclude: Object.values(WebPath).map((path) => ({
			path,
			method: RequestMethod.GET, // Only exclude GET requests (pages), keep POSTs for API
		})),
	});

	app.use(json({ limit: "100mb" }));
	app.use(urlencoded({ extended: true, limit: "100mb" }));

	// API Versioning
	app.enableVersioning({
		type: VersioningType.URI,
		defaultVersion: "1",
		prefix: "v",
	});
}
