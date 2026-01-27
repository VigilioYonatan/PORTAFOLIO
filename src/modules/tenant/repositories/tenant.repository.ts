import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { toNull } from "@infrastructure/utils/server";
import { Inject, Injectable, Logger } from "@nestjs/common";
import {
	and,
	asc,
	desc,
	eq,
	getTableColumns,
	ilike,
	lt,
	or,
	SQL,
	sql,
} from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { TenantQueryDto } from "../dtos/tenant.query.dto";
import { tenantEntity } from "../entities/tenant.entity";
import { tenantSettingEntity } from "../entities/tenant-setting.entity";
import type { TenantSchema, TenantShowSchema } from "../schemas/tenant.schema";
import type { TenantSettingSchema } from "../schemas/tenant-setting.schema";
// import { categoryEntity } from "@modules/category/entities/category.entity";
// import { productEntity } from "@modules/product/entities/product.entity";

@Injectable()
export class TenantRepository {
	private readonly logger = new Logger(TenantRepository.name);
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async showByHost(host: string): Promise<TenantShowSchema | null> {
		const cleanHost = host.split(":")[0];
		this.logger.log(`Resolving tenant for host: ${cleanHost}`);
		const result = await this.db.query.tenantEntity.findFirst({
			where: or(
				eq(tenantEntity.domain, cleanHost),
				eq(tenantEntity.slug, cleanHost.split(".")[0]),
			),
			with: {
				setting: true,
			},
		});
		return toNull(result);
	}

	async showById(id: number): Promise<TenantShowSchema | null> {
		const result = await this.db.query.tenantEntity.findFirst({
			where: eq(tenantEntity.id, id),
			with: {
				setting: true,
			},
		});
		return toNull(result);
	}

	async index(query: TenantQueryDto): Promise<[TenantSchema[], number]> {
		// Base filters (applied to both Data and Count)
		const baseWhere: SQL[] = [];
		if (query.search) {
			baseWhere.push(ilike(tenantEntity.name, `%${query.search}%`));
		}
		const baseWhereClause = and(...baseWhere);

		// Cursor filter (applied ONLY to Data)
		const cursorWhere: SQL[] = [...baseWhere];
		if (query.cursor) {
			cursorWhere.push(lt(tenantEntity.id, Number(query.cursor)));
		}
		const cursorWhereClause = and(...cursorWhere);

		// Dynamic Sorting
		let orderBy: SQL<unknown>[] = [desc(tenantEntity.id)];
		if (query.sortBy && query.sortDir) {
			const columns = getTableColumns(tenantEntity);
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
			this.db.query.tenantEntity.findMany({
				limit: useCursor ? query.limit! + 1 : query.limit!, // Fetch one more to check if there is a next page
				offset: useCursor ? undefined : query.offset, // Ensure offset is used when not in cursor mode
				where: useCursor ? cursorWhereClause : baseWhereClause,
				orderBy: orderBy, // Use dynamic orderBy
				with: { setting: true },
				columns: {
					address: false,
				},
				extras: {
					address: sql<string>`substring(${tenantEntity.address} from 1 for 3000)`.as(
						"address",
					),
				},
			}),
			this.db
				.select({ count: sql<number>`count(*)` })
				.from(tenantEntity)
				.where(baseWhereClause)
				.then((result) => Number(result[0].count)),
		]);
		return result;
	}

	store(
		body: Omit<TenantSchema, "id" | "tenant_id" | "created_at" | "updated_at">,
	): Promise<TenantShowSchema> {
		return this.db.transaction(async (tx) => {
			const [tenant] = await tx
				.insert(tenantEntity)
				.values({ ...body })
				.returning();
			const [setting] = await tx
				.insert(tenantSettingEntity)
				.values({ tenant_id: tenant.id })
				.returning();
			return { ...tenant, setting };
		});
	}


	async update(id: number, body: Partial<TenantSchema>): Promise<TenantSchema> {
		const [result] = await this.db
			.update(tenantEntity)
			.set(body)
			.where(eq(tenantEntity.id, id))
			.returning();
		return result;
	}

	async destroy(id: number): Promise<TenantSchema> {
		return this.db.transaction(async (tx) => {
			// First delete tenant_setting (FK constraint)
			await tx
				.delete(tenantSettingEntity)
				.where(eq(tenantSettingEntity.tenant_id, id));
			// Then delete tenant
			const [result] = await tx
				.delete(tenantEntity)
				.where(eq(tenantEntity.id, id))
				.returning();
			return result;
		});
	}

	async showSetting(tenant_id: number): Promise<TenantSettingSchema | null> {
		const result = await this.db.query.tenantSettingEntity.findFirst({
			where: eq(tenantSettingEntity.tenant_id, tenant_id),
		});
		return toNull(result);
	}

	async updateSetting(
		tenant_id: number,
		body: Partial<TenantSettingSchema>,
	): Promise<TenantSettingSchema> {
		const [result] = await this.db
			.update(tenantSettingEntity)
			.set(body)
			.where(eq(tenantSettingEntity.tenant_id, tenant_id))
			.returning();
		return result;
	}
}
