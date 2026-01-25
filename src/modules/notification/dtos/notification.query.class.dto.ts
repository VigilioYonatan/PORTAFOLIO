import { createZodDto } from "nestjs-zod";
import { notificationQueryDto } from "./notification.query.dto";

export class NotificationQueryClassDto extends createZodDto(
	notificationQueryDto,
) {}
