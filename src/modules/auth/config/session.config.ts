import type { Environments } from "@infrastructure/config/server";
import { PG_POOL } from "@infrastructure/providers/database/database.const";
import {
	type INestApplication,
	Inject,
	Injectable,
	Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import connectPgSimple from "connect-pg-simple";
import session from "express-session";
import passport from "passport";
import { Pool } from "pg";

@Injectable()
export class SessionConfigService {
	private readonly logger = new Logger(SessionConfigService.name);

	constructor(
		private readonly configService: ConfigService<Environments>,
		@Inject(PG_POOL) private readonly pool: Pool,
	) {}

	setup(app: INestApplication) {
		app.getHttpAdapter().getInstance().set("trust proxy", 1);
		const isProd = this.configService.getOrThrow("NODE_ENV") === "PRODUCTION";

		// if (isProd) {
		// 	// Producción: Redis
		// 	const redisInstance = getRedisClient(this.configService);
		// 	store = new RedisStore({
		// 		client: redisInstance,
		// 		prefix: "sess:",
		// 	});
		// 	this.logger.log("\x1b[32m✓ Sesiones guardadas en Redis\x1b[0m");
		// } else {
		// Desarrollo: PostgreSQL (Persistente y sin bloqueos de archivo)
		const PgSession = connectPgSimple(session);
		const store = new PgSession({
			pool: this.pool,
			tableName: "sessions", // Nombre de la tabla
			createTableIfMissing: true, // Crea la tabla automáticamente si no existe :)
			pruneSessionInterval: 60 * 60, // Limpieza cada 1h
		});
		this.logger.log(
			"\x1b[33m⚡ Sesiones guardadas en PostgreSQL (Dev Persistent)\x1b[0m",
		);
		// }

		app.use(
			session({
				store,
				secret: this.configService.getOrThrow("JWT_KEY"),
				resave: false,
				saveUninitialized: false,
				rolling: true,
				proxy: isProd,
				cookie: {
					secure: false,
					httpOnly: isProd, // Siempre true por seguridad
					maxAge: 1000 * 60 * 60 * 24 * 3, // 3 días en ms
					// sameSite: isProd ? "none" : "lax",
				},
			}),
		);

		app.use(passport.initialize());
		app.use(passport.session());
	}
}
