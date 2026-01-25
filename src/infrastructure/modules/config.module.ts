import { getEnvironments } from "@infrastructure/config/server";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

/**
 * Módulo de configuración global de la aplicación.
 *
 * @description
 * - `isGlobal: true` - Disponible en toda la app sin importar
 * - `cache: true` - Lee process.env una sola vez (performance)
 * - `expandVariables: true` - Permite ${VAR} en .env
 * - Validación Zod se ejecuta al cargar environments()
 *
 * @example
 * // Inyectar en cualquier servicio
 * constructor(private configService: ConfigService<Environments>) {
 *   const port = this.configService.get('PORT');
 * }
 */
@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath:
				process.env.NODE_ENV === "TEST" || process.env.NODE_ENV === "test"
					? [".env.test"]
					: [".env"],
			expandVariables: true,
		}),
	],
	exports: [ConfigModule],
})
export class AppConfigModule {}
