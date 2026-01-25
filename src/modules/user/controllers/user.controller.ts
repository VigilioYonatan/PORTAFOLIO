import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
import { ZodQueryPipe } from "@infrastructure/pipes/zod-query.pipe";
import type { PaginatorResult } from "@infrastructure/utils/server/helpers";
import { Public } from "@modules/auth/decorators/public.decorator";
import { Roles } from "@modules/auth/decorators/roles.decorator";
import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	ForbiddenException,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Put,
	Query,
	Req,
	UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { UserProfileUpdateClassDto } from "../dtos/user.profile.update.class.dto";
import {
	type UserProfileUpdateDto,
	userProfileUpdateDto,
} from "../dtos/user.profile.update.dto";
import { UserQueryClassDto } from "../dtos/user.query.class.dto";
import { userQueryDto } from "../dtos/user.query.dto";
import {
	UserDestroyResponseClassDto,
	UserIndexResponseClassDto,
	UserMeResponseClassDto,
	UserShowResponseClassDto,
	UserStoreResponseClassDto,
	UserUpdateResponseClassDto,
} from "../dtos/user.response.class.dto";
import { UserStoreClassDto } from "../dtos/user.store.class.dto";
import { type UserStoreDto, userStoreDto } from "../dtos/user.store.dto";
import { UserUpdateClassDto } from "../dtos/user.update.class.dto";
import { type UserUpdateDto, userUpdateDto } from "../dtos/user.update.dto";
import {
	type UserAuth,
	type UserIndexSchema,
	type UserShowSchema,
} from "../schemas/user.schema";
import { UserService } from "../services/user.service";

@ApiTags("Usuarios")
@UseGuards(AuthenticatedGuard)
@Controller("users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	/**
	 * GET /me
	 * Recupera el perfil detallado del administrador autenticado
	 *
	 * Referencia: rules-endpoints.md #2.1
	 * Rol: ADMIN (role_id = 1)
	 * Cache: NO
	 */
	@Roles(1) // ADMIN only
	@Get("/me")
	@ApiOperation({
		summary: "Obtener perfil de administrador",
		description:
			"Recupera el perfil detallado del administrador autenticado (Solo Admin).",
	})
	@ApiResponse({
		status: 200,
		type: UserMeResponseClassDto,
		description: "Perfil del administrador",
	})
	me(@Req() req: Request): Promise<UserMeResponseClassDto> {
		const user = req.locals.user;
		const tenant_id = req.locals.tenant.id;
		return this.userService.me(tenant_id, user.id);
	}

	// @Public()
	@Roles(1, 3) // Admin, Owner
	@Get("/")
	@ApiOperation({ summary: "Listar usuarios paginados" })
	@ApiResponse({
		status: 200,
		type: UserIndexResponseClassDto,
		description: "Lista de usuarios paginada",
	})
	async index(
		@Req() req: Request,
		@Query(new ZodQueryPipe(userQueryDto)) query: UserQueryClassDto,
	): Promise<UserIndexResponseClassDto> {
		const tenant_id = req.locals.tenant.id;
		return this.userService.index(tenant_id, query);
	}

	// @Public()
	@Get("/:id")
	@ApiOperation({ summary: "Obtener usuario por ID (Admin/Owner)" })
	@ApiResponse({
		status: 200,
		type: UserShowResponseClassDto,
		description: "Detalle del usuario",
	})
	async show(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<UserShowResponseClassDto> {
		const user = req.locals.user;
		// Check: Is Admin (1) OR Is Owner (3) OR Is Self
		if (user.role_id !== 1 && user.role_id !== 3 && user.id !== id) {
			throw new ForbiddenException("No tienes permisos para ver este usuario");
		}

		const tenant_id = req.locals.tenant.id;
		return this.userService.show(tenant_id, id);
	}

	@Get("/profile")
	@ApiOperation({ summary: "Obtener perfil propio" })
	@ApiResponse({
		status: 200,
		type: UserShowResponseClassDto,
		description: "Perfil del usuario logueado",
	})
	showProfile(@Req() req: Request): Promise<UserShowResponseClassDto> {
		const user = req.locals.user;
		const tenant_id = req.locals.tenant.id;
		return this.userService.show(tenant_id, user.id);
	}

	/**
	 * PATCH /me
	 * Permite al administrador actualizar sus credenciales básicas o su imagen de perfil
	 *
	 * Referencia: rules-endpoints.md #2.2
	 * Rol: ADMIN (role_id = 1)
	 * Cache: Invalidar /me
	 */
	@Roles(1) // ADMIN only
	@HttpCode(200)
	@Patch("/me")
	@ApiOperation({
		summary: "Actualizar perfil de administrador",
		description:
			"Permite al administrador actualizar su username o avatar (Solo Admin).",
	})
	@ApiBody({ type: UserProfileUpdateClassDto })
	@ApiResponse({
		status: 200,
		type: UserMeResponseClassDto,
		description: "Perfil actualizado",
	})
	updateProfile(
		@Req() req: Request,
		@Body(new ZodPipe(userProfileUpdateDto)) body: UserProfileUpdateDto,
	): Promise<UserMeResponseClassDto> {
		const tenant_id = req.locals.tenant.id;
		const user = req.locals.user;
		return this.userService.updateProfile(tenant_id, user.id, body);
	}

	// @Public() - Removed to require authentication
	@Roles(1) // Admin only
	@HttpCode(201)
	@Post("/")
	@ApiOperation({ summary: "Crear nuevo usuario" })
	@ApiBody({ type: UserStoreClassDto })
	@ApiResponse({
		status: 201,
		type: UserStoreResponseClassDto,
		description: "Usuario creado exitosamente",
	})
	store(
		@Req() req: Request,
		@Body(new ZodPipe(userStoreDto)) body: UserStoreDto,
	): Promise<UserStoreResponseClassDto> {
		const tenant_id = req.locals.tenant.id;
		return this.userService.store(tenant_id, body);
	}

	// @Public()
	@Roles(1, 3) // Admin, Owner
	@HttpCode(200)
	@Patch("/:id")
	@ApiOperation({ summary: "Actualizar usuario (Admin)" })
	@ApiBody({ type: UserUpdateClassDto })
	@ApiResponse({
		status: 200,
		type: UserUpdateResponseClassDto,
		description: "Usuario actualizado",
	})
	update(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
		@Body(new ZodPipe(userUpdateDto)) body: UserUpdateDto,
	): Promise<UserUpdateResponseClassDto> {
		const tenant_id = req.locals.tenant.id;
		return this.userService.update(tenant_id, id, body);
	}

	@Roles(1, 3) // Admin, Owner
	@HttpCode(200)
	@Put("/:id/reset-attempts")
	@ApiOperation({ summary: "Resetear intentos de login" })
	@ApiResponse({
		status: 200,
		type: UserUpdateResponseClassDto,
		description: "Intentos de login reseteados",
	})
	resetAttempts(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<UserUpdateResponseClassDto> {
		const tenant_id = req.locals.tenant.id;
		return this.userService.resetAttempts(tenant_id, id);
	}

	@Roles(1, 3) // Admin, Owner
	@Delete("/:id")
	@ApiOperation({ summary: "Eliminar usuario" })
	@ApiResponse({
		status: 200,
		type: UserDestroyResponseClassDto,
		description: "Usuario eliminado",
	})
	async destroy(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<UserDestroyResponseClassDto> {
		return this.userService.destroy(req.locals.tenant.id, id);
	}
}
