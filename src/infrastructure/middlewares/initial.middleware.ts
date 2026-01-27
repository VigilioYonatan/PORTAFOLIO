import { TenantRepository } from "@modules/tenant/repositories/tenant.repository";
import type { TenantShowSchema } from "@modules/tenant/schemas/tenant.schema";
import type { UserAuth } from "@modules/user/schemas/user.schema";
import { WebPath } from "@modules/web/routers/web.routers";
import { Injectable, Logger, type NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";

@Injectable()
export class InitialCacheMiddleware implements NestMiddleware {
	private readonly logger = new Logger(InitialCacheMiddleware.name);

	constructor(private readonly tenantRepository: TenantRepository) {}

	async use(req: Request, _res: Response, next: NextFunction) {
		// SAAS BEST PRACTICE: Resolve tenant by host/domain
		const host = (req.headers.host || "").split(":")[0];
		let tenant: TenantShowSchema | null = null;

		this.logger.debug(`req.user: ${JSON.stringify(req.originalUrl, null, 3)}`);
		// Only resolve for functional paths to avoid unnecessary DB load
		const isFunctionalPath =
			req.originalUrl.startsWith("/api") ||
			req.originalUrl.startsWith("/v1") ||
			req.originalUrl.startsWith("/dashboard") ||
			req.originalUrl.startsWith("/auth") ||
			Object.values(WebPath).some((path) =>
				new RegExp(`^${path.replace(/\*/g, ".*")}$`).test(req.originalUrl),
			);

		if (isFunctionalPath) {
			tenant = await this.tenantRepository.showByHost(host);
			this.logger.debug(
				`User resolved: ${JSON.stringify(tenant, null, 3) || "NOT FOUND"}`,
			);

			// Ensure req.locals exists and match requested format
			req.locals = {
				tenant: tenant!,
				user: (req.user || null) as UserAuth,
			};
		}

		return next();
	}
}
