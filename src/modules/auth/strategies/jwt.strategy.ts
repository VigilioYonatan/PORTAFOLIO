import type { UserAuth } from "@modules/user/schemas/user.schema";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../services/auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		@Inject(AuthService) private readonly authService: AuthService,
		@Inject(ConfigService) readonly configService: ConfigService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.getOrThrow<string>("JWT_KEY"),
		});
	}

	async validate(payload: {
		sub: number;
		email: string;
		tenant_id: number;
		security_stamp: string;
	}): Promise<UserAuth> {
		const user = await this.authService.validateUserByEmail(
			payload.tenant_id,
			payload.email,
		);

		if (!user) {
			throw new UnauthorizedException();
		}

		if (user.security_stamp !== payload.security_stamp) {
			throw new UnauthorizedException("Token revoked");
		}
		return user;
	}
}
