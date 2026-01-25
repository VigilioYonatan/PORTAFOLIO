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
	}): Promise<any> {
		console.log("🔑 JWT Payload:", payload);
		const user = await this.authService.validateUserByEmail(
			payload.tenant_id,
			payload.email,
		);
		console.log(
			"👤 User found in Auth Guard:",
			user ? user.email : "NOT FOUND",
		);
		if (!user) {
			throw new UnauthorizedException();
		}
		// Validate security stamp to ensure token hasn't been revoked
		console.log("🛡️ Comparing stamps:", {
			db: user.security_stamp,
			payload: payload.security_stamp,
		});
		if (user.security_stamp !== payload.security_stamp) {
			throw new UnauthorizedException("Token revoked");
		}
		return user;
	}
}
