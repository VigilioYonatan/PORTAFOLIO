import { z } from "@infrastructure/config/zod-i18n.config";
import dotenv from "dotenv";

const isTest = process.env.NODE_ENV === "TEST";
const originalDatabaseUrl = process.env.DATABASE_URL;

dotenv.config({
	debug: false,
	path: isTest ? ".env.test" : ".env",
	override: true,
});

// Restore pglite URL if it was set before dotenv.config
if (originalDatabaseUrl?.startsWith("pglite://")) {
	process.env.DATABASE_URL = originalDatabaseUrl;
}

// ============================================================================
// SCHEMA DE VALIDACIÓN CON ZOD
// ============================================================================

/**
 * Schema de validación para variables de entorno.
 * Usa z.coerce para conversión automática de tipos.
 */
const environmentsSchema = z
	.object({
		// App
		PUBLIC_NAME_APP: z.string().min(1),
		NODE_ENV: z.enum(["PRODUCTION", "DEVELOPMENT", "STAGING", "TEST"]),
		PUBLIC_URL: z.url(),
		PUBLIC_PORT: z.coerce.number().int().positive(),
		PORT: z.coerce.number().int().positive(),

		// Database
		DB_HOST: z.string().min(1),
		DB_PORT: z.coerce.number().int().min(1).max(65535),
		DB_NAME: z.string().min(1),
		DB_USER: z.string().min(1),
		DB_PASS: z.string().min(1),
		DATABASE_URL: z
			.string()
			.min(1)
			.refine(
				(url) => url.startsWith("postgres") || url.startsWith("pglite"),
				"DATABASE_URL debe ser una URL de PostgreSQL o PGlite",
			),

		// Cache (Redis/Dragonfly)
		REDIS_HOST: z.string().min(1),
		REDIS_PORT: z.coerce.number().int().positive(),
		REDIS_PASSWORD: z.string().optional(),

		// JWT - SEGURIDAD CRÍTICA
		JWT_KEY: z.string().min(32, "JWT_KEY debe tener al menos 32 caracteres"),
		JWT_EXPIRES_IN: z.string(),
		JWT_REFRESH_KEY: z.string().min(32).optional(),
		JWT_REFRESH_EXPIRES_IN: z.string(),

		// HMAC
		PUBLIC_HMAC_KEY: z
			.string()
			.min(16, "HMAC_KEY debe tener al menos 16 caracteres"),

		// Storage (MinIO/RustFS)
		STORAGE_PROVIDER: z.enum(["LOCAL", "S3", "CLOUDINARY"]),
		RUSTFS_ENDPOINT: z.string().min(1),
		RUSTFS_PORT: z.coerce.number().int().positive(),
		RUSTFS_ROOT_USER: z.string().min(1),
		RUSTFS_ROOT_PASSWORD: z.string().min(8),
		RUSTFS_BUCKET_NAME: z.string().min(1),
		RUSTFS_REGION: z.string(),
		RUSTFS_INTERNAL_ENDPOINT: z.url().optional(),
		RUSTFS_PUBLIC_ENDPOINT: z.url().optional(),

		// Mail
		MAIL_HOST: z.string().min(1),
		MAIL_PORT: z.coerce.number().int().positive(),
		MAIL_USER: z.string().min(1),
		MAIL_PASS: z.string().min(1),
		MAIL_FROM: z.email().optional(),
		MAIL_FROM_NAME: z.string().optional(),

		// Security extras
		CORS_ORIGINS: z.string(),
		THROTTLE_TTL: z.coerce.number().int().positive(),
		THROTTLE_LIMIT: z.coerce.number().int().positive(),
		LOG_LEVEL: z.enum(["DEBUG", "INFO", "WARN", "ERROR"]),

		// AI API Keys
		OPENROUTER_API_KEY: z.string().min(1),
		OPENAI_API_KEY: z.string().optional(), // Optional - only needed if using OpenAI embeddings
	})
	.refine(
		(data) => {
			// En producción, passwords de Redis y refresh key son obligatorios
			if (data.NODE_ENV === "PRODUCTION") {
				return !!data.REDIS_PASSWORD && !!data.JWT_REFRESH_KEY;
			}
			return true;
		},
		{
			message:
				"REDIS_PASSWORD y JWT_REFRESH_KEY son obligatorios en producción",
		},
	);

// ============================================================================
// TIPOS INFERIDOS DEL SCHEMA
// ============================================================================

/** Tipo inferido automáticamente del schema Zod */
export type Environments = z.infer<typeof environmentsSchema>;

// ============================================================================
// CACHE DE ENVIRONMENTS VALIDADOS
// ============================================================================

let cachedEnvironments: Environments | null = null;

/**
 * Obtiene las variables de entorno validadas.
 * Usa cache para evitar re-validación en cada llamada.
 *
 * @throws {Error} Si las variables de entorno son inválidas
 * @returns {Environments} Variables de entorno tipadas y validadas
 */
export function getEnvironments(): Environments {
	if (cachedEnvironments) {
		return cachedEnvironments;
	}

	const result = environmentsSchema.safeParse(process.env);

	if (!result.success) {
		// NO loggear valores para evitar exponer secrets
		const missingVars = result.error.issues.map((issue) => {
			const path = issue.path.join(".");
			return `  - ${path}: ${issue.message}`;
		});

		// biome-ignore lint/suspicious/noConsole: Necesario para errores críticos
		console.error(
			`\n❌ Variables de entorno inválidas:\n${missingVars.join("\n")}\n`,
		);
		process.exit(1);
	}

	cachedEnvironments = result.data;
	return cachedEnvironments;
}

/**
 * Valida las variables de entorno al iniciar la aplicación.
 * Debe llamarse antes de inicializar NestJS.
 */
export function validateEnvironments(): void {
	const env = getEnvironments();
	const mode = env.NODE_ENV;

	// biome-ignore lint/suspicious/noConsole: Log informativo de inicio
	console.log(`✅ [ENVIRONMENTS] Validado correctamente (${mode})`);
}
