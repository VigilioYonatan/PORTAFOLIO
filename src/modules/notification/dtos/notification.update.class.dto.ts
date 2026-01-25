import { createZodDto } from "nestjs-zod";
import { notificationUpdateDto } from "./notification.update.dto";

export class NotificationUpdateClassDto extends createZodDto(
	notificationUpdateDto,
) {}
