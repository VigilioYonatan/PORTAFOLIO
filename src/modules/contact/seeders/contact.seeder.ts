import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { now } from "@infrastructure/utils/hybrid";
import { Inject, Injectable } from "@nestjs/common";
import { type NodePgDatabase } from "drizzle-orm/node-postgres";
import { contactMessageEntity } from "../entities/contact-message.entity";
import { type ContactMessageSchema } from "../schemas/contact-message.schema";

@Injectable()
export class ContactSeeder {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async run(tenant_id: number) {
		const { faker } = await import("@faker-js/faker");

		const contactMessagesSeed: Omit<ContactMessageSchema, "id">[] = Array.from({
			length: 50,
		}).map(() => ({
			tenant_id,
			name: faker.person.fullName(),
			email: faker.internet.email(),
			phone_number: faker.phone.number(),
			subject: faker.lorem.sentence(),
			message: faker.lorem.paragraph(),
			ip_address: faker.internet.ipv4(),
			is_read: faker.datatype.boolean(),
			created_at: now().toDate(),
			updated_at: now().toDate(),
			deleted_at: null,
		}));

		return await this.db
			.insert(contactMessageEntity)
			.values(contactMessagesSeed)
			.returning();
	}
}
