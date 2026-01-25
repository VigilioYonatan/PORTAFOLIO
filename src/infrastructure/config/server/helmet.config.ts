import type { ConfigService } from "@nestjs/config";
import type { HelmetOptions } from "helmet";
import { type Environments, getEnvironments } from "./environments.config";

export function helmetConfig(
	configService: ConfigService<Environments>,
): HelmetOptions {
	return {
		contentSecurityPolicy: {
			// Configura aunque sea una política básica
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: [
					"'self'",
					`http://localhost:${configService.getOrThrow("PUBLIC_PORT")}`, // Permite scripts desde Vite (dev)
					"'unsafe-inline'", // Necesario para Vite en desarrollo
					"'unsafe-eval'", // Necesario para HMR (Hot Module Replacement)
					"https://www.google.com", // Allow Google domains
					"https://www.gstatic.com",
					"https://cearlatinoamericano.pe", // Permitir TinyMCE
					"https://064b67e3357a.ngrok-free.app",
					"wss://campus.cearlatinoamericano.pe",
					"ws://campus.cearlatinoamericano.pe",
					"https://cdn.jsdelivr.net",
					// `ws://${environments().PUBLIC_URL}`,
				],
				connectSrc: [
					"'self'",
					`http://localhost:${configService.getOrThrow("PUBLIC_PORT")}`, // Permite conexiones a Vite (websockets)
					`ws://${configService.getOrThrow("PUBLIC_URL")}`, // WebSockets para HMR
					"https://cearlatinoamericano.pe",
					"wss://cearlatinoamericano.pe",
					"ws://campus.cearlatinoamericano.pe",
					"wss://campus.cearlatinoamericano.pe",
					"https://064b67e3357a.ngrok-free.app",
					"https://cdn.jsdelivr.net",
					getEnvironments().PUBLIC_URL,
				],
				frameSrc: [
					"'self'",
					"https://www.google.com", // Required for reCAPTCHA
					"https://www.recaptcha.net", // Alternative domain
					"https://www.youtube.com",
				],
				imgSrc: [
					"'self'",
					"data:",
					"blob:",
					"https://akamai.sscdn.co",
					"https://picsum.photos",
					"https://cdn.jsdelivr.net",
					"https://avatars.githubusercontent.com",
					"https://cearlatinoamericano.edu.pe",
					"https://cearlatinoamericano.pe",
				],
				styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
				mediaSrc: ["'self'", "data:", "blob:"],

				// Añade más según necesites
			},
		},
		dnsPrefetchControl: true,
		frameguard: { action: "deny" },
		hidePoweredBy: true,
		hsts: { maxAge: 31536000, includeSubDomains: true }, // Solo si usas HTTPS
		ieNoOpen: true,
		noSniff: true,
		xssFilter: false, // Opcional: Mejor depender de CSP
		// Considera añadir:
		referrerPolicy: { policy: "strict-origin-when-cross-origin" },
	};
}
