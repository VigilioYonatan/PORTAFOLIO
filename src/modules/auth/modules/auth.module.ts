import { MailModule } from "@infrastructure/providers/mail/mail.module";
import { UserModule } from "@modules/user/user.module";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "../controllers/auth.controller";
import { HybridAuthGuard } from "../guards/hybrid.guard";
import { AuthMailListener } from "../listeners/auth.mail.listener";
import { AuthService } from "../services/auth.service";
import { GoogleStrategy } from "../strategies/google.strategy";
import { JwtStrategy } from "../strategies/jwt.strategy";
import { LocalStrategy } from "../strategies/local.strategy";
import { SessionSerializer } from "../strategies/session.serializer";

@Module({
	imports: [
		UserModule,
		MailModule,
		PassportModule.register({ session: true }),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.getOrThrow<string>("JWT_KEY"),
				signOptions: { expiresIn: "15m" },
			}),
		}),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		LocalStrategy,
		GoogleStrategy,
		JwtStrategy,
		SessionSerializer,
		HybridAuthGuard,
		AuthMailListener,
	],
	exports: [AuthService, JwtModule],
})
export class AuthModule {}
