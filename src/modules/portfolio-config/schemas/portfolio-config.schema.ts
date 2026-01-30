import { z } from "@infrastructure/config/zod-i18n.config";
import { timeStampSchema } from "@infrastructure/schemas/time_stamp.schema";
import { UPLOAD_CONFIG } from "@modules/uploads/const/upload.const";
import { filesSchema } from "@modules/uploads/schemas/upload.schema";

/**
 * Portfolio Config Schema
 * Define la identidad del propietario del portfolio y la configuración del sitio.
 * Referencia: rules-class.md/portfolio_config
 */
export const portfolioConfigSchema = z.object({
	id: z.number().int().positive(), // PK
	tenant_id: z.number().int().positive(), // ID del tenant
	name: z.string().min(1).max(100), // Nombre del propietario, requerido
	profile_title: z.string().min(1).max(200), // Ej: Senior Full-stack Engineer
	biography: z.string().min(1), // About Me content, Markdown
	email: z.email().max(100), // Email de contacto, requerido
	phone: z.string().max(20).nullable(), // Teléfono, nullable
	address: z.string().nullable(), // Dirección física, nullable
	social_links: z
		.object({
			linkedin: z.url().nullable(), // URL de LinkedIn
			github: z.url().nullable(), // URL de GitHub
			twitter: z.url().nullable(), // URL de Twitter/X
			youtube: z.url().nullable(), // URL de YouTube
			whatsapp: z.string().nullable(), // URL o número de WhatsApp
		})
		.nullable(), // JSONB: SocialLinks
	logo: z
		.array(filesSchema(UPLOAD_CONFIG.portfolio_config.logo!.dimensions))
		.nullable(), // FileUpload[], logo del portfolio
	color_primary: z.string().max(50), // Color primario, hex format
	color_secondary: z.string().max(50), // Color secundario, hex format
	default_language: z.enum(["ES", "EN", "PT"]), // Idioma por defecto
	time_zone: z.enum(["UTC", "America/Lima", "America/Bogota"]).nullable(), // Zona horaria
	...timeStampSchema.shape, // created_at, updated_at
});

export type PortfolioConfigSchema = z.infer<typeof portfolioConfigSchema>;

/**
 * Schema para respuesta de GET /config
 */
export type PortfolioConfigShowSchema = PortfolioConfigSchema;
