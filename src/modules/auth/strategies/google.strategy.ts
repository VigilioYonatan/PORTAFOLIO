import type { UserAuth } from "@modules/user/schemas/user.schema";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";
import {
	type Profile,
	Strategy,
	type StrategyOptionsWithRequest,
} from "passport-google-oauth20";
import { AuthService } from "../services/auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
	constructor(
		configService: ConfigService,
		private readonly authService: AuthService,
	) {
		super({
			clientID: configService.get("GOOGLE_CLIENT_ID") || "mock_id",
			clientSecret: configService.get("GOOGLE_CLIENT_SECRET") || "mock_secret",
			callbackURL: configService.get("GOOGLE_CALLBACK_URL") || "mock_callback",
			scope: ["email", "profile"],
			passReqToCallback: true,
		} as StrategyOptionsWithRequest);
	}

	async validate(
		req: Request,
		_accessToken: string,
		_refreshToken: string,
		profile: Profile,
	): Promise<UserAuth> {
		// Get tenant_id from locals (populated by InitialCacheMiddleware)
		const tenant_id = req.locals.tenant.id;
		// Validate or register user based on profile
		const user = await this.authService.validateGoogleUser(profile, tenant_id);
		return user;
	}
}
