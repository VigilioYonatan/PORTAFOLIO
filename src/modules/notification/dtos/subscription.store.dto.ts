import { z } from "@infrastructure/config/zod-i18n.config";
import { createZodDto } from "nestjs-zod";
import { subscriptionSchema } from "../schemas/subscription.schema";

export const subscriptionStoreDto = subscriptionSchema.pick({
	endpoint: true,
	keys: true,
	user_agent: true,
});

export class SubscriptionStoreDto extends createZodDto(subscriptionStoreDto) {}

export const sendNotificationDto = z.object({
	title: z.string(),
	body: z.string(),
	url: z.string().optional(),
	icon: z.string().optional(),
});

export class SendNotificationDto extends createZodDto(sendNotificationDto) {}
