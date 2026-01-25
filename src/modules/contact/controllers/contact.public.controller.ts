import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
import { Public } from "@modules/auth/decorators/public.decorator";
import { ContactStoreResponseClassDto } from "@modules/contact/dtos/contact.response.class.dto";
import type { ContactStoreResponseDto } from "@modules/contact/dtos/contact.response.dto";
import { ContactStoreClassDto } from "@modules/contact/dtos/contact.store.class.dto";
import {
	type ContactStoreDto,
	contactStoreDto,
} from "@modules/contact/dtos/contact.store.dto";
import { ContactService } from "@modules/contact/services/contact.service";
import { Body, Controller, HttpCode, Post, Req } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

@ApiTags("Contacto Público")
@Controller("contact")
export class ContactPublicController {
	constructor(private readonly contactService: ContactService) {}

	@Public()
	@Post("/")
	@HttpCode(201)
	@ApiOperation({ summary: "Enviar mensaje de contacto" })
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
		// Capture IP address
		const ip_address =
			(req.headers["x-forwarded-for"] as string) ||
			req.socket.remoteAddress ||
			null;

		const { message } = await this.contactService.store(tenant_id, {
			...body,
			phone_number: body.phone_number ?? null, // Explicitly map or default to null
			ip_address: ip_address
				? ip_address.split(",")[0].trim().substring(0, 45)
				: null,
		});

		return { success: true, message };
	}
}
