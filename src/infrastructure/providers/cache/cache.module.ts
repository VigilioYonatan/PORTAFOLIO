import type { Environments } from "@infrastructure/config/server";
import KeyvRedis from "@keyv/redis";
import { CacheInterceptor, CacheModule } from "@nestjs/cache-manager";
import { Global, Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import Keyv from "keyv";
import { getRedisUrl } from "./cache.connection";
import { CacheService } from "./cache.service";

const logger = new Logger("CacheModule");

@Global()
@Module({
	imports: [
		CacheModule.registerAsync({
			isGlobal: true,
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService<Environments>) => {
				const isProduction = configService.get("NODE_ENV") === "PRODUCTION";
				// En producción, usar Redis; en desarrollo, memoria
				if (isProduction) {
					const storage = new KeyvRedis(getRedisUrl(configService));
					logger.log("\x1b[32m✓ Cache conectado a Redis\x1b[0m");

					const keyv = new Keyv({
						store: storage,
						ttl: 5000,
					});

					return {
						store: keyv,
						ttl: 5000,
					};
				}

				// Desarrollo: usar memoria (sin store = memoria por defecto)
				logger.log("\x1b[33m⚡ Cache en memoria (desarrollo)\x1b[0m");

				return {
					ttl: 5000,
					// No pasar store = usa memoria interna de cache-manager
				};
			},
		}),
	],
	exports: [CacheService],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: CacheInterceptor,
		},
		CacheService,
	],
})
export class AppCacheModule {}
