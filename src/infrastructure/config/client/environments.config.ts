import { z } from "@infrastructure/config/zod-i18n.config";

/**
 * Schema de validación para variables de entorno del CLIENTE (Astro).
 * Solo variables públicas que se exponen al navegador.
 */
export const clientEnvironmentsSchema = z.object({
	NAME_APP: z.string().min(1),
	PUBLIC_URL: z.string().min(1),
	NODE_ENV: z.enum(["PRODUCTION", "STAGING", "DEVELOPMENT"]),
	VAPID_PUBLIC_KEY: z.string().min(1),
	STORAGE_URL: z.string().min(1),
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
	if(typeof window !== "undefined"){
		console.log({b:window.env});
		
		const result = clientEnvironmentsSchema.safeParse(window.env);
		if (!result.success) {
			// En cliente, retornamos defaults en vez de crashear
			// throw new Error("Invalid client environments");
			throw new Error(`Invalid client environments ${result.error}`);
		}
		return result.data;
	}
	return {
		NAME_APP: "Vigilio",
		PUBLIC_URL: "http://localhost:3000",
		NODE_ENV: "DEVELOPMENT",
		VAPID_PUBLIC_KEY: "",
		STORAGE_URL: "http://localhost:3000",
	};
}

const environments = getClientEnvironments();
export default environments;
