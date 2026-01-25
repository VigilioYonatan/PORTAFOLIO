import { z } from "@infrastructure/config/zod-i18n.config";
import { querySchema } from "@infrastructure/schemas/query.schema";
import { notificationSchema } from "../schemas/notification.schema";

export const notificationQueryDto = notificationSchema
	.pick({
		is_read: true,
	})
	.partial()
	.extend(querySchema.shape);

export type NotificationQueryDto = z.infer<typeof notificationQueryDto>;
