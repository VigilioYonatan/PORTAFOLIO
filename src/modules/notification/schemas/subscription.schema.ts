import { z } from "@infrastructure/config/zod-i18n.config";
import { timeStampSchema } from "@infrastructure/schemas/time_stamp.schema";

export const subscriptionSchema = z.object({
	id: z.number().int().positive(),
	tenant_id: z.number().int().positive(),
	user_id: z.number().int().positive().nullable(), // Nullable for potential future visitor subscriptions
	endpoint: z.string().url(),
	keys: z.object({
		p256dh: z.string(),
		auth: z.string(),
	}),
	user_agent: z.string().nullable(),
	...timeStampSchema.shape,
});

export type SubscriptionSchema = z.infer<typeof subscriptionSchema>;
