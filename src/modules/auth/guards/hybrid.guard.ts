import {
	type ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import type { Request, Response } from "express";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class HybridAuthGuard extends AuthGuard("jwt") {
	constructor(private readonly reflector: Reflector) {
		super();
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		const request = context.switchToHttp().getRequest<Request>();
		const response = context.switchToHttp().getResponse<Response>();

		if (isPublic) {
			return true;
		}

		// 1. Check Session (Passport Session)
		if (request.isAuthenticated?.()) {
			return true;
		}

		// 2. Try JWT via AuthGuard('jwt')
		try {
			const result = (await super.canActivate(context)) as boolean;
			if (result) {
				const req = context.switchToHttp().getRequest<Request>();
				// Ensure req.locals exists (Express definition handles this, but runtime check is safe)
				// req.locals is defined in global types, no need to cast to any
				if (!req.locals) {
					// @ts-expect-error - Initialize if strictly necessary, but Express usually has it
					req.locals = {};
				}

				// Typescript should know req.user exists after successful guard execution if types are correct.
				// However, req.user from passport might not align perfectly with our UserAuth type.
				// We assume req.user matches UserAuth structure or strict subset required.
				if (req.user) {
					// @ts-expect-error - Assigning passport user to our typed local user
					req.locals.user = req.user;
				}
			}
			return result;
		} catch (_e) {
			return this.handleCustomResponse(request, response);
		}
	}

	// Override handleRequest from AuthGuard to prevent default throwing if we want custom protocol
	handleRequest<TUser = unknown>(
		err: Error | null,
		user: TUser | false,
		_info: unknown,
		_context: ExecutionContext,
		_status?: unknown,
	): TUser {
		if (err || !user) {
			throw err || new UnauthorizedException();
		}
		return user;
	}

	private handleCustomResponse(request: Request, response: Response): boolean {
		// Determine context: API vs Web
		const isApi =
			request.path.startsWith("/api") ||
			request.headers.accept?.includes("application/json") ||
			request.headers["content-type"]?.includes("application/json");

		if (isApi) {
			// NestJS convention: Throw exception, let Global Filter handle JSON response
			throw new UnauthorizedException({
				success: false,
				message: "Unauthorized",
			});
		}

		// For Web: Redirect
		response.redirect("/auth/login");
		// Stop execution chain
		return false;
	}
}
