import {
	type ExecutionContext,
	Injectable,
	Logger,
	UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class LocalAuthGuard extends AuthGuard("local") {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const result = (await super.canActivate(context)) as boolean;
		const request = context.switchToHttp().getRequest();
		await super.logIn(request); // Establish session

		const logger = new Logger(LocalAuthGuard.name);
		logger.debug("LocalAuthGuard canActivate");
		// Synchronize req.user with req.locals.user for consistency (Rule 1.8)
		if (!request.locals) request.locals = {};
		request.locals.user = request.user;

		return result;
	}

	// Override handleRequest para manejar errores con mensaje genérico por seguridad
	handleRequest<TUser>(
		err: Error | null,
		user: TUser | false,
		_info: unknown,
	): TUser {
		// Si hay error o no hay usuario, retornar mensaje genérico
		// No revelar si el email existe o si es la contraseña incorrecta
		if (err || !user) {
			throw new UnauthorizedException(
				"Correo o contraseña incorrecta", // Mensaje genérico por seguridad
			);
		}
		return user;
	}
}
