import { ZodQueryPipe } from "@infrastructure/pipes/zod-query.pipe";
import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
import { socialReactionQueryDto } from "./dtos/social-reaction.query.dto";
import { Public } from "@modules/auth/decorators/public.decorator";
import {
	Body,
	Controller,
	Get,
	HttpCode,
	Post,
	Query,
	Req,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import {
	SocialReactionCountResponseClassDto,
	SocialReactionToggleResponseClassDto,
} from "./dtos/social.response.class.dto";
import type { SocialReactionToggleResponseDto } from "./dtos/social.response.dto";
import { SocialReactionStoreClassDto } from "./dtos/social-reaction.class.dto";
import { SocialReactionQueryClassDto } from "./dtos/social-reaction.query.class.dto";
import {
	type SocialReactionStoreDto,
	socialReactionStoreDto,
} from "./dtos/social-reaction.store.dto";
import { SocialService } from "./services/social.service";

@ApiTags("Social & Interactions")
@Controller("social")
export class SocialController {
	constructor(private readonly socialService: SocialService) {}

	@Public()
	@HttpCode(200)
	@Post("/reactions")
	@ApiOperation({ summary: "Crear o eliminar reacción (Toggle)" })
	@ApiBody({ type: SocialReactionStoreClassDto })
	@ApiResponse({
		status: 200,
		type: SocialReactionToggleResponseClassDto,
	})
	toggleReaction(
		@Req() req: Request,
		@Body(new ZodPipe(socialReactionStoreDto)) body: SocialReactionStoreDto,
	): Promise<SocialReactionToggleResponseDto> {
		const tenant_id = req.locals.tenant.id;
		// Use user ID if authenticated, otherwise IP address as a fallback visitor ID
		const visitor_id = req.locals.user?.id
			? String(req.locals.user.id)
			: req.ip || "unknown-visitor";
		return this.socialService.toggleReaction(tenant_id, visitor_id, body);
	}

	@Public()
	@Get("/reactions")
	@ApiOperation({ summary: "Obtener conteo de reacciones" })
	getReactionCounts(
		@Query(new ZodQueryPipe(socialReactionQueryDto))
		query: SocialReactionQueryClassDto,
	): Promise<SocialReactionCountResponseClassDto> {
		return this.socialService.getReactionCounts(
			query.reactable_id,
			query.reactable_type,
		);
	}
}
