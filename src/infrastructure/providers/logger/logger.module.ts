import { randomUUID } from "node:crypto";
import type { Environments } from "@infrastructure/config/server";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";

@Module({
	imports: [
		LoggerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService<Environments>) => {
				const isProduction = config.get("NODE_ENV") === "PRODUCTION";
				return {
					pinoHttp: {
						// 1. Nivel de log dinámico
						level: isProduction ? "info" : "debug",
						// 2. Trazabilidad: Asigna un ID único a cada request si no trae uno
						genReqId: (req, res) => {
							const existingID = req.id ?? req.headers["x-request-id"];
							if (existingID) return existingID;
							const id = randomUUID();
							res.setHeader("X-Request-Id", id);
							return id;
						},
						// 3. Seguridad: Oculta datos sensibles automáticamente (GDPR/Compliance)
						redact: {
							paths: [
								"req.headers.authorization",
								"req.headers.cookie",
								"req.body.password",
								"req.body.confirmPassword",
								"req.body.creditCard",
							],
							remove: true,
						},
						// 4. Transporte: Pretty para Humanos (Dev), JSON para Máquinas (Prod)
						transport: isProduction
							? undefined
							: {
									target: "pino-pretty",
									options: {
										singleLine: false,
										colorize: true,
										translateTime: "SYS:standard",
										ignore: "pid,hostname", // Limpia ruido visual en consola
										messageFormat:
											"{req.method} {req.url} \x1b[33m- {msg}\x1b[0m",
									},
								},

						// 5. Auto Logging Inteligente: Define el nivel según el Status Code
						autoLogging: {
							ignore(_req) {
								return false;
							},
						}, // Reactivamos esto para tener métricas de entrada/salida
						customLogLevel: (_, res, err) => {
							if (res.statusCode >= 500 || err) return "error";
							if (res.statusCode >= 400) return "warn";
							// if (res.statusCode >= 300) return "silent"; // Redirecciones suelen ser ruido
							return "info";
						},
						// 6. Mensajes de éxito/error personalizados
						customSuccessMessage: (_req, _res, responseTime) => {
							return `Request completed in ${responseTime}ms`;
						},
						customErrorMessage: (_req, _res, err) => {
							return `Request failed: ${err.message}`;
						},
						// 7. Serializers: Limpia qué tanta info guardamos del objeto gigante de Request/Response
						serializers: {
							req: (req) => ({
								id: req.id,
								method: req.method,
								url: req.url,
								// En producción, a veces quieres la IP o el User Agent para auditoría
								ip: req.raw.socket?.remoteAddress,
								userAgent: isProduction ? req.headers["user-agent"] : undefined,
							}),
							res: (res) => ({
								statusCode: res.statusCode,
							}),
							err: (err) => ({
								type: err.type,
								message: err.message,
								stack: isProduction ? undefined : err.stack, // Stacktrace solo en dev usualmente
							}),
						},
					},
				};
			},
		}),
	],
})
export class AppLoggerModule {}
