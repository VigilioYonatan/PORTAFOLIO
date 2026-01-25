import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
	async canActivate(context: any): Promise<boolean> {
		const result = (await super.canActivate(context)) as boolean;
		if (result) {
			const request = context.switchToHttp().getRequest();
			if (!request.locals) request.locals = {};
			request.locals.user = request.user;
		}
		return result;
	}
}
