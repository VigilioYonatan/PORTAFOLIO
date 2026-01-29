import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
import { ZodQueryPipe } from "@infrastructure/pipes/zod-query.pipe";
import { Roles } from "@modules/auth/decorators/roles.decorator";
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	Req,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { type Request } from "express";
import { NotificationQueryClassDto } from "../dtos/notification.query.class.dto";
import { notificationQueryDto } from "../dtos/notification.query.dto";
import {
	NotificationDestroyAllResponseClassDto,
	NotificationIndexResponseClassDto,
	NotificationUpdateResponseClassDto,
} from "../dtos/notification.response.class.dto";
import type {
	NotificationDestroyAllResponseDto,
	NotificationIndexResponseDto,
	NotificationUpdateResponseDto,
} from "../dtos/notification.response.dto";
import { NotificationUpdateClassDto } from "../dtos/notification.update.class.dto";
import {
	type NotificationUpdateDto,
	notificationUpdateDto,
} from "../dtos/notification.update.dto";
import { SubscriptionStoreDto } from "../dtos/subscription.store.dto";
import { NotificationService } from "../services/notification.service";

@ApiTags("Notifications")
@Controller("notification")
@Roles(1) // ADMIN
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

	@Get("/")
	@ApiOperation({ summary: "Recuperar alertas del sistema (Admin)" })
	@ApiResponse({
		status: 200,
		type: NotificationIndexResponseClassDto,
	})
	index(
		@Req() req: Request,
		@Query(new ZodQueryPipe(notificationQueryDto))
		query: NotificationQueryClassDto,
	): Promise<NotificationIndexResponseDto> {
		const tenant_id = req.locals.tenant.id;
		return this.notificationService.index(tenant_id, query);
	}

	@Patch("/:id")
	@ApiOperation({ summary: "Cambia el estado de una notificación a leída" })
	@ApiBody({ type: NotificationUpdateClassDto })
	@ApiResponse({
		status: 200,
		type: NotificationUpdateResponseClassDto,
	})
	update(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
		@Body(new ZodPipe(notificationUpdateDto)) body: NotificationUpdateDto,
	): Promise<NotificationUpdateResponseDto> {
		return this.notificationService.update(req.locals.tenant.id, id, body);
	}

	@Delete("/all")
	@ApiOperation({
		summary: "Elimina todas las notificaciones del historial administrativo",
	})
	@ApiResponse({
		status: 200,
		type: NotificationDestroyAllResponseClassDto,
	})
	destroyAll(@Req() req: Request): Promise<NotificationDestroyAllResponseDto> {
		return this.notificationService.destroyAll(req.locals.tenant.id);
	}

	@Post("/subscribe")
	@ApiOperation({ summary: "Subscribe to Web Push notifications" })
	async subscribe(@Req() req: Request, @Body() body: SubscriptionStoreDto) {
		return this.notificationService.subscribe(
			req.locals.tenant.id,
			req.locals.user.id,
			body,
		);
	}

	@Post("/test-push")
	@ApiOperation({ summary: "Send test push notification" })
	async testPush(@Req() req: Request) {
		return this.notificationService.sendPushNotification(
			req.locals.tenant.id,
			req.locals.user.id,
			{
				title: "Test Notification",
				body: "This is a test from Portfolio!",
				url: "/admin/dashboard",
				icon: "/favicon.ico",
			},
		);
	}
}
