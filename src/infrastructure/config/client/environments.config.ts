import { z } from "@infrastructure/config/zod-i18n.config";

/**
 * Schema de validación para variables de entorno del CLIENTE (Astro).
 * Solo variables públicas que se exponen al navegador.
 */
export const clientEnvironmentsSchema = z.object({
	PUBLIC_NAME_APP: z.string().min(1),
	PUBLIC_ENV: z.enum(["PRODUCTION", "STAGING", "DEVELOPMENT"]),
	PUBLIC_URL: z.url(),
	PUBLIC_PORT: z.coerce.number().int().positive(),
	// Push notifications
	PUBLIC_VAPID_KEY: z.string().min(1).optional(),
	PRIVATE_VAPID_KEY: z.string().min(1).optional(),
});

/** Tipo inferido del schema de cliente */
export type ClientEnvironments = z.infer<typeof clientEnvironmentsSchema>;

/** @deprecated Usa ClientEnvironments en su lugar */
export type Environments = ClientEnvironments;

/**
 * Obtiene las variables de entorno del cliente.
 * En Astro, usa import.meta.env
 */
function getClientEnvironments(): ClientEnvironments {
	// En el cliente usamos import.meta.env (Astro/Vite)
	// const env =
	// 	typeof import.meta !== "undefined" && import.meta.env
	// 		? import.meta.env
	// 		: process.env;

	const result = clientEnvironmentsSchema.safeParse(import.meta.env);

	if (!result.success) {
		// biome-ignore lint/suspicious/noConsole: Necesario para debugging de environments
		console.warn(
			"⚠️ Client environment validation failed:",
			result.error.issues,
		);
		// En cliente, retornamos defaults en vez de crashear
		return clientEnvironmentsSchema.parse({});
	}

	return result.data;
}

const environments = getClientEnvironments();
export default environments;
