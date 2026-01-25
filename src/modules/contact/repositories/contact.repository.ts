import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { toNull } from "@infrastructure/utils/server";
import type { ContactQueryDto } from "@modules/contact/dtos/contact.query.dto";
import { contactMessageEntity } from "@modules/contact/entities/contact-message.entity";
import type { ContactMessageSchema } from "@modules/contact/schemas/contact-message.schema";
import { Inject, Injectable } from "@nestjs/common";
import {
	and,
	asc,
	desc,
	eq,
	getTableColumns,
	ilike,
	isNull,
	lt,
	SQL,
	sql,
} from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

@Injectable()
export class ContactRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async index(
		tenant_id: number,
		query: ContactQueryDto,
	): Promise<[ContactMessageSchema[], number]> {
		const { limit, offset, search, cursor, sortBy, sortDir, is_read } = query;

		const baseWhere: SQL[] = [
			eq(contactMessageEntity.tenant_id, tenant_id),
			isNull(contactMessageEntity.deleted_at),
		];

		if (search) {
			baseWhere.push(ilike(contactMessageEntity.name, `%${search}%`));
		}

		if (is_read !== undefined) {
			baseWhere.push(eq(contactMessageEntity.is_read, is_read));
		}

		const baseWhereClause = and(...baseWhere);

		const cursorWhere: SQL[] = [...baseWhere];
		if (cursor) {
			cursorWhere.push(lt(contactMessageEntity.id, Number(cursor)));
		}
		const cursorWhereClause = and(...cursorWhere);

		let orderBy: SQL<unknown>[] = [desc(contactMessageEntity.id)];
		if (sortBy && sortDir) {
			const columns = getTableColumns(contactMessageEntity);
			const column = columns[sortBy as keyof typeof columns];
			if (column) {
				orderBy = [sortDir === "ASC" ? asc(column) : desc(column)];
			}
		}

		const isCursorCompatible =
			!sortBy || sortBy === "id" || sortBy === "created_at";
		const useCursor = cursor && isCursorCompatible;

		const result = await Promise.all([
			this.db.query.contactMessageEntity.findMany({
				limit: useCursor ? limit! + 1 : limit!,
				offset: useCursor ? undefined : offset,
				where: useCursor ? cursorWhereClause : baseWhereClause,
				orderBy: orderBy,
			}),
			this.db
				.select({ count: sql<number>`count(*)` })
				.from(contactMessageEntity)
				.where(baseWhereClause)
				.then((result) => Number(result[0].count)),
		]);

		return result;
	}
	async store(
		tenant_id: number | null,
		body: Omit<
			ContactMessageSchema,
			"id" | "created_at" | "updated_at" | "tenant_id"
		>,
	): Promise<ContactMessageSchema> {
		const [result] = await this.db
			.insert(contactMessageEntity)
			.values({ ...body, tenant_id })
			.returning();
		return result;
	}
	async showById(
		tenant_id: number,
		id: number,
	): Promise<ContactMessageSchema | null> {
		const result = await this.db.query.contactMessageEntity.findFirst({
			where: and(
				eq(contactMessageEntity.tenant_id, tenant_id),
				eq(contactMessageEntity.id, id),
			),
		});
		return toNull(result);
	}

	async update(
		tenant_id: number,
		id: number,
		body: Partial<ContactMessageSchema>,
	): Promise<ContactMessageSchema> {
		const [result] = await this.db
			.update(contactMessageEntity)
			.set(body)
			.where(
				and(
					eq(contactMessageEntity.tenant_id, tenant_id),
					eq(contactMessageEntity.id, id),
				),
			)
			.returning();
		return result;
	}

	async destroy(tenant_id: number, id: number): Promise<ContactMessageSchema> {
		const [result] = await this.db
			.update(contactMessageEntity)
			.set({ deleted_at: new Date() })
			.where(
				and(
					eq(contactMessageEntity.tenant_id, tenant_id),
					eq(contactMessageEntity.id, id),
				),
			)
			.returning();
		return result;
	}
}
