import { z } from "@infrastructure/config/zod-i18n.config";
import { notificationSchema } from "../schemas/notification.schema";

export const notificationUpdateDto = notificationSchema.pick({
	is_read: true,
});

export type NotificationUpdateDto = z.infer<typeof notificationUpdateDto>;
