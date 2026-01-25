import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
import type { PaginatorResult } from "@infrastructure/utils/server";
import { Public } from "@modules/auth/decorators/public.decorator";
import { Roles } from "@modules/auth/decorators/roles.decorator";
import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import { RolesGuard } from "@modules/auth/guards/roles.guard";
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
import {
	SocialCommentDestroyResponseClassDto,
	SocialCommentIndexResponseClassDto,
	SocialCommentReplyResponseClassDto,
	SocialCommentStoreResponseClassDto,
	SocialCommentUpdateResponseClassDto,
} from "./dtos/social.response.class.dto";
import type { SocialCommentIndexResponseDto } from "./dtos/social.response.dto";
import { SocialCommentQueryClassDto } from "./dtos/social-comment.query.class.dto";
import { SocialCommentReplyClassDto } from "./dtos/social-comment.reply.class.dto";
import type { SocialCommentReplyDto } from "./dtos/social-comment.reply.dto";
import { socialCommentReplyDto } from "./dtos/social-comment.reply.dto";
import { SocialCommentStoreClassDto } from "./dtos/social-comment.store.class.dto";
import type { SocialCommentStoreDto } from "./dtos/social-comment.store.dto";
import { socialCommentStoreDto } from "./dtos/social-comment.store.dto";
import { SocialCommentUpdateClassDto } from "./dtos/social-comment.update.class.dto";
import type { SocialCommentUpdateDto } from "./dtos/social-comment.update.dto";
import { socialCommentUpdateDto } from "./dtos/social-comment.update.dto";
import type { SocialCommentSchema } from "./schemas/social-comment.schema";
import { SocialService } from "./services/social.service";

@ApiTags("Social Comments")
@Controller("comments")
export class SocialCommentController {
	constructor(private readonly socialService: SocialService) {}

	@Public()
	@Get("/")
	@ApiOperation({ summary: "Listar comentarios (paginado)" })
	@ApiResponse({
		status: 200,
		type: SocialCommentIndexResponseClassDto,
	})
	index(
		@Req() req: Request,
		@Query() query: SocialCommentQueryClassDto,
	): Promise<SocialCommentIndexResponseDto> {
		const tenant_id = req.locals.tenant.id;
		return this.socialService.indexComments(tenant_id, query);
	}

	@Public()
	@HttpCode(201)
	@Post("/")
	@ApiOperation({ summary: "Crear nuevo comentario" })
	@ApiBody({ type: SocialCommentStoreClassDto })
	@ApiResponse({
		status: 201,
		type: SocialCommentStoreResponseClassDto,
	})
	store(
		@Req() req: Request,
		@Body(new ZodPipe(socialCommentStoreDto)) body: SocialCommentStoreDto,
	): Promise<SocialCommentStoreResponseClassDto> {
		const tenant_id = req.locals.tenant.id;
		return this.socialService.storeComment(tenant_id, body);
	}

	@Patch("/:id")
	@UseGuards(AuthenticatedGuard, RolesGuard)
	@Roles(1) // Admin
	@ApiOperation({ summary: "Actualizar comentario (Aprobar/Ocultar)" })
	@ApiBody({ type: SocialCommentUpdateClassDto })
	@ApiResponse({
		status: 200,
		type: SocialCommentUpdateResponseClassDto,
	})
	update(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
		@Body(new ZodPipe(socialCommentUpdateDto)) body: SocialCommentUpdateDto,
	): Promise<SocialCommentUpdateResponseClassDto> {
		const tenant_id = req.locals.tenant.id;
		return this.socialService.updateComment(tenant_id, id, body);
	}

	@HttpCode(200)
	@Post("/:id/reply")
	@UseGuards(AuthenticatedGuard, RolesGuard)
	@Roles(1) // Admin
	@ApiOperation({ summary: "Responder comentario (Admin)" })
	@ApiBody({ type: SocialCommentReplyClassDto })
	@ApiResponse({
		status: 200,
		type: SocialCommentReplyResponseClassDto,
	})
	reply(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
		@Body(new ZodPipe(socialCommentReplyDto)) body: SocialCommentReplyDto,
	): Promise<SocialCommentReplyResponseClassDto> {
		const tenant_id = req.locals.tenant.id;
		return this.socialService.replyComment(tenant_id, id, body);
	}

	@HttpCode(200)
	@Delete("/:id")
	@UseGuards(AuthenticatedGuard, RolesGuard)
	@Roles(1)
	@ApiOperation({ summary: "Eliminar comentario (Solo Admin)" })
	@ApiResponse({
		status: 200,
		type: SocialCommentDestroyResponseClassDto,
		description: "Comentario eliminado exitosamente",
	})
	destroy(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<SocialCommentDestroyResponseClassDto> {
		const tenant_id = req.locals.tenant.id;
		return this.socialService.destroyComment(tenant_id, id);
	}
}
