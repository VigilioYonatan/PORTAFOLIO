import { z } from "@infrastructure/config/zod-i18n.config";

export const newsletterSignupSchema = z.object({
	email: z.string().email("Email inválido").min(1, "El email es requerido"),
});

export type NewsletterSignupSchema = z.infer<typeof newsletterSignupSchema>;
