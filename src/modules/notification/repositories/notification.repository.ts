import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq, SQL, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { NotificationQueryDto } from "../dtos/notification.query.dto";
import { notificationEntity } from "../entities/notification.entity";
import type { NotificationSchema } from "../schemas/notification.schema";

@Injectable()
export class NotificationRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async index(
		tenant_id: number,
		query: NotificationQueryDto,
	): Promise<[NotificationSchema[], number]> {
		const { limit, offset, is_read } = query;

		const baseWhere: SQL[] = [eq(notificationEntity.tenant_id, tenant_id)];

		if (is_read !== undefined) {
			baseWhere.push(eq(notificationEntity.is_read, is_read));
		}

		const baseWhereClause = and(...baseWhere);

		const result = await Promise.all([
			this.db.query.notificationEntity.findMany({
				limit,
				offset,
				where: baseWhereClause,
				orderBy: [desc(notificationEntity.created_at)],
				columns: {
					content: false,
				},
				extras: {
					content:
						sql<string>`substring(${notificationEntity.content} from 1 for 3000)`.as(
							"content",
						),
				},
			}),
			this.db
				.select({ count: sql<number>`count(*)` })
				.from(notificationEntity)
				.where(baseWhereClause)
				.then((result) => Number(result[0].count)),
		]);

		return result;
	}

	async store(
		tenant_id: number,
		body: Omit<
			NotificationSchema,
			"id" | "tenant_id" | "created_at" | "updated_at"
		>,
	): Promise<NotificationSchema> {
		const [result] = await this.db
			.insert(notificationEntity)
			.values({ ...body, tenant_id })
			.returning();
		return result;
	}

	async update(
		tenant_id: number,
		id: number,
		body: Partial<NotificationSchema>,
	): Promise<NotificationSchema> {
		const [result] = await this.db
			.update(notificationEntity)
			.set({ ...body })
			.where(
				and(
					eq(notificationEntity.id, id),
					eq(notificationEntity.tenant_id, tenant_id),
				),
			)
			.returning();
		return result;
	}

	async destroyAll(tenant_id: number): Promise<{ count: number }> {
		const result = await this.db
			.delete(notificationEntity)
			.where(eq(notificationEntity.tenant_id, tenant_id))
			.returning({ id: notificationEntity.id });
		return { count: result.length };
	}
}
