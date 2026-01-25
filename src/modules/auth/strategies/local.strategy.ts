import type { UserAuth } from "@modules/user/schemas/user.schema";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";
import { Strategy } from "passport-local";
import { AuthService } from "../services/auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly authService: AuthService) {
		super({
			usernameField: "email", // We use email as username
			passReqToCallback: true,
		});
	}

	async validate(req: Request, email: string, pass: string): Promise<UserAuth> {
		const tenant_id = req.locals.tenant.id;
		const user = await this.authService.validateUser(email, pass, tenant_id);
		if (!user) {
			throw new UnauthorizedException("Correo o contraseña incorrecta");
		}
		return user;
	}
}
