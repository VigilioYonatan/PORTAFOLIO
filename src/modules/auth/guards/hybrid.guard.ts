import type { UserAuth } from "@modules/user/schemas/user.schema";
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

		if (isPublic) {
			return true;
		}

		const request = context.switchToHttp().getRequest<Request>();
		const response = context.switchToHttp().getResponse<Response>();

		// Ensure req.locals exists
		// if (!request.locals) {
		//   request.locals = {} as any;
		// }

		// 1. Check Session (Passport Session)
		if (request.isAuthenticated?.()) {
			return true;
		}

		// 2. Try JWT via AuthGuard('jwt')
		try {
			const result = (await super.canActivate(context)) as boolean;
			if (result) {
				// const request = context.switchToHttp().getRequest<Request>();
				// if (!request.locals) request.locals = {} ;
				// request.locals.user = request.user as UserAuth;
			}
			return result;
		} catch (_e) {
			// If JWT fails or throws Unauthorized, we handle strict response protocol
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
		// If request path starts with /api (excluding web routes maybe?)
		// The user snippet uses a boolean flag "isApi". We can infer it.
		const isApi =
			request.path.startsWith("/api") ||
			request.headers.accept?.includes("application/json") ||
			request.headers["content-type"]?.includes("application/json");

		if (isApi) {
			// NestJS convention: Throw exception, let Global Filter handle JSON response
			// But user specifically asked for JSON response structure similar to snippet
			// We can throw UnauthorizedException and let standard NestJS exception filter handle 401
			throw new UnauthorizedException({
				success: false,
				message: "Unauthorized",
			});
		}

		// For Web: Redirect
		response.redirect("/auth/login");
		// We return false to stop the guard chain, but since we redirected, execution technically ends/responses
		// returning false in canActivate usually throws 403 Forbidden default if not handled.
		// But since we manipulated response, we should return false?
		// Actually, preventing further execution is key.
		return false;
	}
}
