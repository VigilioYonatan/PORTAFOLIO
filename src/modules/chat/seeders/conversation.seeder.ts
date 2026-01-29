import { faker } from "@faker-js/faker";
import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { now } from "@infrastructure/utils/hybrid";
import { Inject, Injectable } from "@nestjs/common";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { conversationEntity } from "../entities/conversation.entity";
import type { ConversationSchema } from "../schemas/conversation.schema";

@Injectable()
export class ConversationSeeder {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async run(tenant_id: number): Promise<ConversationSchema[]> {
		// Crear conversaciones de ejemplo
		const conversationsSeed: Omit<ConversationSchema, "id">[] = Array.from({
			length: 20,
		}).map(() => ({
			tenant_id,
			ip_address: faker.internet.ipv4(),
			title: faker.lorem.sentence({ min: 3, max: 8 }),
			mode: faker.helpers.arrayElement([
				"AI",
				"LIVE",
			]) as ConversationSchema["mode"],
			is_active: faker.datatype.boolean(),
			visitor_id: faker.string.uuid(),
			user_id: null, // Sin admin asignado
			created_at: now()
				.subtract(faker.number.int({ min: 1, max: 30 }), "day")
				.toDate(),
			updated_at: now().toDate(),
		}));

		return await this.db
			.insert(conversationEntity)
			.values(conversationsSeed)
			.returning();
	}
}
