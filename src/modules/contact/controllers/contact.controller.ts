import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
import { Roles } from "@modules/auth/decorators/roles.decorator";
import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import { ContactQueryClassDto } from "@modules/contact/dtos/contact.query.class.dto";
import {
	ContactDestroyResponseClassDto,
	ContactIndexResponseClassDto,
	ContactResponseClassDto,
	ContactUpdateResponseClassDto,
} from "@modules/contact/dtos/contact.response.class.dto";
import {
	type ContactDestroyResponseDto,
	type ContactIndexResponseDto,
	type ContactUpdateResponseDto,
} from "@modules/contact/dtos/contact.response.dto";
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
	Param,
	ParseIntPipe,
	Patch,
	Query,
	Req,
	UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

@ApiTags("Contacto (Admin)")
@UseGuards(AuthenticatedGuard)
@Controller("messages")
export class ContactController {
	constructor(private readonly contactService: ContactService) {}

	@Roles(1)
	@Get("/")
	@ApiOperation({ summary: "Listar mensajes de contacto" })
	@ApiResponse({
		status: 200,
		type: ContactIndexResponseClassDto,
		description: "Lista de mensajes de contacto recuperada con éxito",
	})
	index(
		@Req() req: Request,
		@Query() query: ContactQueryClassDto,
	): Promise<ContactIndexResponseDto> {
		const tenant_id = req.locals.tenant.id;
		return this.contactService.index(tenant_id, query);
	}

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

	@Roles(1)
	@Delete("/:id")
	@ApiOperation({ summary: "Eliminar mensaje de contacto" })
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
