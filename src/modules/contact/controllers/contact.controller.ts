import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
import { ZodQueryPipe } from "@infrastructure/pipes/zod-query.pipe";
import { Public } from "@modules/auth/decorators/public.decorator";
import { Roles } from "@modules/auth/decorators/roles.decorator";
import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import { ContactQueryClassDto } from "@modules/contact/dtos/contact.query.class.dto";
import { contactQueryDto } from "@modules/contact/dtos/contact.query.dto";
import {
	ContactDestroyResponseClassDto,
	ContactIndexResponseClassDto,
	ContactStoreResponseClassDto,
	ContactUpdateResponseClassDto,
} from "@modules/contact/dtos/contact.response.class.dto";
import type {
	ContactDestroyResponseDto,
	ContactIndexResponseDto,
	ContactStoreResponseDto,
	ContactUpdateResponseDto,
} from "@modules/contact/dtos/contact.response.dto";
import { ContactStoreClassDto } from "@modules/contact/dtos/contact.store.class.dto";
import {
	type ContactStoreDto,
	contactStoreDto,
} from "@modules/contact/dtos/contact.store.dto";
import { ContactUpdateClassDto } from "@modules/contact/dtos/contact.update.class.dto";
import {
	type ContactUpdateDto,
	contactUpdateDto,
} from "@modules/contact/dtos/contact.update.dto";
import { ContactService } from "@modules/contact/services/contact.service";
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

@ApiTags("Contacto")
@Controller("contact-message")
export class ContactController {
	constructor(private readonly contactService: ContactService) {}

	@Public()
	@Post("/")
	@HttpCode(201)
	@ApiOperation({ summary: "Enviar mensaje de contacto (Público)" })
	@ApiBody({ type: ContactStoreClassDto })
	@ApiResponse({
		status: 201,
		type: ContactStoreResponseClassDto,
		description: "Mensaje enviado exitosamente",
	})
	async send(
		@Req() req: Request,
		@Body(new ZodPipe(contactStoreDto)) body: ContactStoreDto,
	): Promise<ContactStoreResponseDto> {
		const tenant_id = req.locals.tenant?.id ?? null;
		const ip_address =
			(req.headers["x-forwarded-for"] as string) ||
			req.socket.remoteAddress ||
			null;

		const { message } = await this.contactService.store(tenant_id, {
			...body,
			phone_number: body.phone_number ?? null,
			ip_address: ip_address
				? ip_address.split(",")[0].trim().substring(0, 45)
				: null,
		});

		return { success: true, message };
	}

	@UseGuards(AuthenticatedGuard)
	@Roles(1)
	@Get("/")
	@ApiOperation({ summary: "Listar mensajes de contacto (Admin)" })
	@ApiResponse({
		status: 200,
		type: ContactIndexResponseClassDto,
		description: "Lista de mensajes de contacto recuperada con éxito",
	})
	index(
		@Req() req: Request,
		@Query(new ZodQueryPipe(contactQueryDto)) query: ContactQueryClassDto,
	): Promise<ContactIndexResponseDto> {
		const tenant_id = req.locals.tenant.id;
		return this.contactService.index(tenant_id, query);
	}

	@UseGuards(AuthenticatedGuard)
	@Roles(1)
	@Patch("/:id")
	@ApiOperation({ summary: "Marcar mensaje de contacto como leído/no leído" })
	@ApiBody({ type: ContactUpdateClassDto })
	@ApiResponse({
		status: 200,
		type: ContactUpdateResponseClassDto,
		description: "Estado de lectura del mensaje actualizado",
	})
	markAsRead(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
		@Body(new ZodPipe(contactUpdateDto)) body: ContactUpdateDto,
	): Promise<ContactUpdateResponseDto> {
		const tenant_id = req.locals.tenant.id;
		return this.contactService.markAsRead(tenant_id, id, body);
	}

	@UseGuards(AuthenticatedGuard)
	@Roles(1)
	@Delete("/:id")
	@ApiOperation({ summary: "Eliminar mensaje de contacto (Admin)" })
	@ApiResponse({
		status: 200,
		type: ContactDestroyResponseClassDto,
		description: "Mensaje eliminado exitosamente",
	})
	async destroy(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<ContactDestroyResponseDto> {
		const tenant_id = req.locals.tenant.id;
		return this.contactService.destroy(tenant_id, id);
	}
}
