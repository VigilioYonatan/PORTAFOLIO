import { z } from "@infrastructure/config/zod-i18n.config";
import { createPaginatorSchema } from "@infrastructure/schemas/paginator.schema";
import { notificationSchema } from "../schemas/notification.schema";

export const notificationIndexResponseDto =
	createPaginatorSchema(notificationSchema);
export type NotificationIndexResponseDto = z.infer<
	typeof notificationIndexResponseDto
>;

export const notificationUpdateResponseDto = z.object({
	success: z.literal(true),
	notification: notificationSchema,
});
export type NotificationUpdateResponseDto = z.infer<
	typeof notificationUpdateResponseDto
>;

export const notificationDestroyAllResponseDto = z.object({
	success: z.literal(true),
	count: z.number().int().nonnegative(),
});
export type NotificationDestroyAllResponseDto = z.infer<
	typeof notificationDestroyAllResponseDto
>;
