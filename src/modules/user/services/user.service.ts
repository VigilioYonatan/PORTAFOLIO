import { randomUUID } from "node:crypto";
import { paginator } from "@infrastructure/utils/server/helpers";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UserCache } from "../cache/user.cache";
import type { UserProfileUpdateDto } from "../dtos/user.profile.update.dto";
import type { UserQueryDto } from "../dtos/user.query.dto";
import type {
	UserDestroyResponseDto,
	UserIndexResponseDto,
	UserMeResponseDto,
	UserShowResponseDto,
	UserStoreResponseDto,
	UserUpdateResponseDto,
} from "../dtos/user.response.dto";
import type { UserStoreDto } from "../dtos/user.store.dto";
import type { UserUpdateDto } from "../dtos/user.update.dto";
import { UserRepository } from "../repositories/user.repository";
import type {
	UserIndexSchema,
	UserSchema,
	UserShowByEmailToLoginSchema,
	UserShowSchema,
} from "../schemas/user.schema";

@Injectable()
export class UserService {
	private readonly logger = new Logger(UserService.name);

	constructor(
		private readonly userRepository: UserRepository,
		private readonly userCache: UserCache,
	) {}

	async index(
		tenant_id: number,
		query: UserQueryDto,
	): Promise<UserIndexResponseDto> {
		this.logger.log({ tenant_id }, "Listing users");
		return await paginator<UserQueryDto, UserIndexSchema>("/users", {
			filters: query,
			cb: async (filters, isClean) => {
				// If clean query, try cache first
				if (isClean) {
					// 1. Try Cache
					const cached = await this.userCache.getList(tenant_id, filters);
					if (cached) {
						return cached;
					}
				}

				// 2. Try DB
				const result = await this.userRepository.index(tenant_id, filters);

				if (isClean) {
					// 3. Set Cache (Only for clean queries)
					await this.userCache.setList(tenant_id, filters, result);
				}

				return result;
			},
		});
	}

	async show(tenant_id: number, id: number): Promise<UserShowResponseDto> {
		this.logger.log({ tenant_id, id }, "Fetching user by ID");

		// 1. Try Cache
		let user = await this.userCache.get(tenant_id, id);

		if (!user) {
			// 2. Try DB
			// Returns safe user (no password)
			user = await this.userRepository.showById(tenant_id, id);

			if (!user) {
				this.logger.warn({ tenant_id, id }, "User not found");
				throw new NotFoundException(`User #${id} not found`);
			}

			// 3. Set Cache
			await this.userCache.set(tenant_id, user);
		}

		return { success: true, user };
	}

	/**
	 * Recupera el perfil detallado del administrador autenticado
	 * NO usa cache según rules-endpoints.md #2.1
	 */
	async me(tenant_id: number, user_id: number): Promise<UserMeResponseDto> {
		this.logger.log(
			{ tenant_id, user_id },
			"Fetching authenticated admin profile",
		);

		// Siempre obtener de DB (no cache según rules-endpoints.md)
		const user = await this.userRepository.showById(tenant_id, user_id);

		if (!user) {
			this.logger.warn({ tenant_id, user_id }, "Admin user not found");
			throw new NotFoundException(`User #${user_id} not found`);
		}

		return {
			success: true,
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				role_id: user.role_id,
				status: user.status,
				avatar: user.avatar,
				created_at: user.created_at,
				updated_at: user.updated_at,
			},
		};
	}

	async store(
		tenant_id: number,
		body: UserStoreDto,
	): Promise<UserStoreResponseDto> {
		this.logger.log({ tenant_id, email: body.email }, "Creating new user");
		const { password, repeat_password, ...rest } = body;

		// Hash password
		const password_hash = await bcrypt.hash(password, 10);

		const user = await this.userRepository.store(tenant_id, {
			...rest,
			password: password_hash,
			qr_code_token: null,
			security_stamp: randomUUID(),
			failed_login_attempts: 0,
			is_mfa_enabled: false,
			is_superuser: false,
			email_verified_at: null,
			lockout_end_at: null,
			google_id: null,
			phone_number: null,
			mfa_secret: null,
			avatar: null,
			last_ip_address: null,
			last_login_at: null,
			deleted_at: null,
		});

		// Cache Write-Through + Invalidate lists
		await this.userCache.invalidateLists(tenant_id);

		return { success: true, user };
	}

	async update(
		tenant_id: number,
		id: number,
		body: UserUpdateDto,
	): Promise<UserUpdateResponseDto> {
		this.logger.log({ tenant_id, id }, "Updating user");

		// Optimistic approach: Invalidate ID. For Email, we can't easily know the OLD email without fetching.
		// We will invalidate the NEW email key to ensure consistency if it didn't change,
		// or set it if it did. Stale old email keys will expire by TTL.
		const user = await this.userRepository.update(tenant_id, id, body);

		// Invalidate single + lists
		await this.userCache.invalidate(tenant_id, id);
		await this.userCache.invalidateByEmail(tenant_id, user.email);
		await this.userCache.invalidateLists(tenant_id);

		return { success: true, user };
	}

	async updateProfile(
		tenant_id: number,
		id: number,
		body: UserProfileUpdateDto,
	): Promise<UserMeResponseDto> {
		this.logger.log({ tenant_id, id }, "Updating user profile");

		const { password, ...rest } = body;
		const dataToUpdate: Partial<UserSchema> = { ...rest };

		if (password) {
			dataToUpdate.password = await bcrypt.hash(password, 10);
		}

		// Reuse repository update mechanism
		const user = await this.userRepository.update(tenant_id, id, dataToUpdate);

		// Invalidate single + lists
		await this.userCache.invalidate(tenant_id, id);
		await this.userCache.invalidateByEmail(tenant_id, user.email);
		await this.userCache.invalidateLists(tenant_id);

		return {
			success: true,
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				role_id: user.role_id,
				status: user.status as UserSchema["status"],
				avatar: user.avatar,
				created_at: user.created_at,
				updated_at: user.updated_at,
			},
		};
	}

	async resetAttempts(
		tenant_id: number,
		id: number,
	): Promise<UserUpdateResponseDto> {
		this.logger.log({ tenant_id, id }, "Resetting user attempts");
		const user = await this.userRepository.resetAttempts(tenant_id, id);

		// Invalidate single + lists
		await this.userCache.invalidate(tenant_id, id);
		await this.userCache.invalidateByEmail(tenant_id, user.email);
		await this.userCache.invalidateLists(tenant_id);

		return { success: true, user };
	}
	async destroy(
		tenant_id: number,
		id: number,
	): Promise<UserDestroyResponseDto> {
		this.logger.log({ tenant_id, id }, "Deleting user");
		const user = await this.userRepository.destroy(tenant_id, id);

		// Invalidate single + lists
		await this.userCache.invalidate(tenant_id, id);
		if (user) {
			await this.userCache.invalidateByEmail(tenant_id, user.email);
		}
		await this.userCache.invalidateLists(tenant_id);

		return { success: true, message: "User deleted successfully" };
	}

	/**
	 * Get user by email with cache (for auth validation)
	 * Used by AuthService.validateUser()
	 */
	async getByEmailForAuth(
		tenant_id: number,
		email: string,
	): Promise<UserShowByEmailToLoginSchema | null> {
		this.logger.log(
			{ tenant_id, email },
			"Fetching user authentication data by email",
		);
		// 1. Try Cache
		let user = await this.userCache.getByEmail(tenant_id, email);

		if (!user) {
			// 2. Try DB
			// showByEmailToLogin returns password hash for auth checks
			user = await this.userRepository.showByEmailToLogin(tenant_id, email);
			// 3. Set Cache (if found)
			if (user) {
				await this.userCache.setByEmail(tenant_id, email, user);
			}
		}

		return user;
	}

	/**
	 * Invalidate user cache by ID and email
	 * Used by AuthService when user data changes
	 */
	async invalidateCache(
		tenant_id: number,
		user_id: number,
		email?: string,
	): Promise<void> {
		await this.userCache.invalidate(tenant_id, user_id);
		if (email) {
			await this.userCache.invalidateByEmail(tenant_id, email);
		}
	}

	/**
	 * Update user and invalidate cache
	 * Used by AuthService for operations like resetPassword, verifyEmail, etc.
	 */
	async updateForAuth(
		tenant_id: number,
		user_id: number,
		data: Partial<UserSchema>,
	): Promise<UserShowSchema> {
		this.logger.log(
			{ tenant_id, user_id },
			"Internal auth-related user update",
		);
		// update returns safe user
		const user = await this.userRepository.update(tenant_id, user_id, data);

		// Invalidate cache
		await this.userCache.invalidate(tenant_id, user_id);
		await this.userCache.invalidateByEmail(tenant_id, user.email);

		return user;
	}

	/**
	 * Get user by ID (raw, for auth internal use)
	 */
	async showByIdForAuth(
		tenant_id: number,
		user_id: number,
	): Promise<UserSchema | null> {
		this.logger.log(
			{ tenant_id, user_id },
			"Internal auth-related user fetch by ID",
		);
		return this.userRepository.showByIdWithPassword(tenant_id, user_id);
	}

	/**
	 * Store user for auth registration (Google OAuth, etc.)
	 * Returns user and handles cache
	 */
	async storeForAuth(
		tenant_id: number,
		data: Omit<UserSchema, "id" | "tenant_id" | "created_at" | "updated_at">,
	): Promise<UserShowSchema> {
		this.logger.log(
			{ tenant_id, email: data.email },
			"Internal auth-related user storage",
		);
		const user = await this.userRepository.store(tenant_id, data);

		// Cache Write-Through + Invalidate lists
		await this.userCache.invalidateLists(tenant_id);

		return user;
	}
}
