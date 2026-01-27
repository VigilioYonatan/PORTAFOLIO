import { z } from "@infrastructure/config/zod-i18n.config";

export const customDateSchema = z.coerce.date()

export const timeStampSchema = z.object({
	created_at: customDateSchema,
	updated_at: customDateSchema,
});
export type TimeStampSchema = z.infer<typeof timeStampSchema>;
