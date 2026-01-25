import { z } from "@infrastructure/config/zod-i18n.config";
import {
	customDateSchema,
	timeStampSchema,
} from "@infrastructure/schemas/time_stamp.schema";
import { UPLOAD_CONFIG } from "@modules/uploads/const/upload.const";
import { filesSchema } from "@modules/uploads/schemas/upload.schema";
import type { TenantSettingSchema } from "./tenant-setting.schema";

export const tenantSchema = z.object({
	id: z.number().int().positive(), // identificador único
	name: z.string().min(1).max(100), // nombre comercial de la empresa
	slug: z.string().min(1).max(100), // identificador amigable para URL
	domain: z.string().max(100).nullable(), // dominio personalizado opcional
	logo: z.array(filesSchema(UPLOAD_CONFIG.tenant.logo!.dimensions)).nullable(), // logotipo de la empresa
	email: z.email().max(100), // correo electrónico principal
	phone: z.string().max(20).nullable(), // teléfono de contacto opcional
	address: z.string().nullable(), // dirección física
	plan: z.enum(["FREE", "BASIC", "PRO", "ENTERPRISE"]), // plan de suscripción actual
	is_active: z.boolean(), // estado de la cuenta: true = habilitado
	trial_ends_at: customDateSchema.nullable(), // fin del periodo de prueba
	...timeStampSchema.shape, // marcas de tiempo de creación y actualización
});

export type TenantSchema = z.infer<typeof tenantSchema>;

export type TenantShowSchema = TenantSchema & {
	setting: TenantSettingSchema;
};
