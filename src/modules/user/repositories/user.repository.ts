import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { toNull } from "@infrastructure/utils/server";
import { Inject, Injectable } from "@nestjs/common";
import {
	and,
	asc,
	desc,
	eq,
	getTableColumns,
	ilike,
	lt,
	type SQL,
	sql,
} from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { UserQueryDto } from "../dtos/user.query.dto";
import { userEntity } from "../entities/user.entity";
import type {
	UserIndexSchema,
	UserSchema,
	UserShowByEmailToLoginSchema,
	UserShowSchema,
} from "../schemas/user.schema";

@Injectable()
export class UserRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	// Method for AuthService (Login)
	async showByEmailToLogin(
		tenant_id: number,
		email: string,
	): Promise<UserShowByEmailToLoginSchema | null> {
		const result = await this.db.query.userEntity.findFirst({
			where: and(
				eq(userEntity.email, email),
				eq(userEntity.tenant_id, tenant_id),
			),
			columns: {
				id: true,
				email: true,
				username: true,
				role_id: true,
				is_superuser: true,
				status: true,
				password: true,
				tenant_id: true,
				is_mfa_enabled: true,
				failed_login_attempts: true,
				lockout_end_at: true,
				security_stamp: true,
				mfa_secret: true,
				google_id: true,
				phone_number: true,
				avatar: true,
				last_ip_address: true,
				last_login_at: true,
				deleted_at: true,
				updated_at: true,
				email_verified_at: true,
				created_at: true,
				qr_code_token: true,
			},
		});
		return toNull(result);
	}

	async showByEmail(
		tenant_id: number,
		email: string,
	): Promise<UserSchema | null> {
		const result = await this.db.query.userEntity.findFirst({
			where: and(
				eq(userEntity.email, email),
				eq(userEntity.tenant_id, tenant_id),
			),
		});
		return toNull(result);
	}

	// Public method (No password)
	async showById(
		tenant_id: number,
		id: number,
	): Promise<UserShowSchema | null> {
		const result = await this.db.query.userEntity.findFirst({
			where: and(eq(userEntity.id, id), eq(userEntity.tenant_id, tenant_id)),
			columns: { password: false },
		});
		return toNull(result);
	}

	// Internal method (With password)
	async showByIdWithPassword(
		tenant_id: number,
		id: number,
	): Promise<UserSchema | null> {
		const result = await this.db.query.userEntity.findFirst({
			where: and(eq(userEntity.id, id), eq(userEntity.tenant_id, tenant_id)),
		});
		return toNull(result);
	}

	async index(
		tenant_id: number,
		query: UserQueryDto,
	): Promise<[UserIndexSchema[], number]> {
		// Base filters (applied to both Data and Count)
		const baseWhere: SQL[] = [eq(userEntity.tenant_id, tenant_id)];
		if (query.search) {
			baseWhere.push(ilike(userEntity.username, `%${query.search}%`));
		}
		if (query.role_id) {
			baseWhere.push(eq(userEntity.role_id, query.role_id));
		}
		if (query.status) {
			baseWhere.push(eq(userEntity.status, query.status));
		}
		const baseWhereClause = and(...baseWhere);

		// Cursor filter (applied ONLY to Data)
		const cursorWhere: SQL[] = [...baseWhere];
		if (query.cursor) {
			cursorWhere.push(lt(userEntity.id, Number(query.cursor)));
		}
		const cursorWhereClause = and(...cursorWhere);

		// Dynamic Sorting
		let orderBy: SQL<unknown>[] = [desc(userEntity.id)];
		if (query.sortBy && query.sortDir) {
			const columns = getTableColumns(userEntity);
			const column = columns[query.sortBy as keyof typeof columns];
			if (column) {
				orderBy = [query.sortDir === "ASC" ? asc(column) : desc(column)];
			}
		}

		// Check if sorting is compatible with cursor pagination (must be by ID or default)
		const isCursorCompatible =
			!query.sortBy || query.sortBy === "id" || query.sortBy === "created_at";
		const useCursor = query.cursor && isCursorCompatible;

		const result = await Promise.all([
			this.db.query.userEntity.findMany({
				limit: useCursor ? query.limit! + 1 : query.limit!, // Fetch one more to check if there is a next page
				offset: useCursor ? undefined : query.offset, // Ensure offset is used when not in cursor mode
				where: useCursor ? cursorWhereClause : baseWhereClause,
				orderBy: orderBy, // Use dynamic orderBy
				columns: { password: false },
			}),
			this.db
				.select({ count: sql<number>`count(*)` })
				.from(userEntity)
				.where(baseWhereClause)
				.then((result) => Number(result[0].count)),
		]);
		return result;
	}

	async store(
		tenant_id: number,
		body: Omit<UserSchema, "id" | "tenant_id" | "created_at" | "updated_at">,
	): Promise<UserShowSchema> {
		const [result] = await this.db
			.insert(userEntity)
			.values({
				...body,
				tenant_id,
			})
			.returning();
		return result;
	}

	async update(
		tenant_id: number,
		id: number,
		body: Partial<UserSchema>,
	): Promise<UserShowSchema> {
		const [result] = await this.db
			.update(userEntity)
			.set({ ...body })
			.where(and(eq(userEntity.id, id), eq(userEntity.tenant_id, tenant_id)))
			.returning();
		return result;
	}

	async resetAttempts(tenant_id: number, id: number): Promise<UserShowSchema> {
		const [result] = await this.db
			.update(userEntity)
			.set({
				failed_login_attempts: 0,
				lockout_end_at: null,
			})
			.where(and(eq(userEntity.id, id), eq(userEntity.tenant_id, tenant_id)))
			.returning();
		return result;
	}

	async destroy(tenant_id: number, id: number): Promise<UserShowSchema> {
		const [result] = await this.db
			.update(userEntity)
			.set({
				status: "BANNED",
				deleted_at: new Date(),
			})
			.where(and(eq(userEntity.id, id), eq(userEntity.tenant_id, tenant_id)))
			.returning();
		return result;
	}

	async countByTenant(tenant_id: number): Promise<number> {
		const result = await this.db
			.select({ count: sql<number>`count(*)` })
			.from(userEntity)
			.where(eq(userEntity.tenant_id, tenant_id));
		return Number(result[0].count);
	}
}
