import { createZodDto } from "nestjs-zod";
import {
	notificationDestroyAllResponseDto,
	notificationIndexResponseDto,
	notificationUpdateResponseDto,
} from "./notification.response.dto";

export class NotificationIndexResponseClassDto extends createZodDto(
	notificationIndexResponseDto,
) {}

export class NotificationUpdateResponseClassDto extends createZodDto(
	notificationUpdateResponseDto,
) {}

export class NotificationDestroyAllResponseClassDto extends createZodDto(
	notificationDestroyAllResponseDto,
) {}
