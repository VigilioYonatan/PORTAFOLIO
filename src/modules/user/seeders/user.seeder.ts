import { faker } from "@faker-js/faker";
import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { Inject, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { type InferInsertModel } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { userEntity } from "../entities/user.entity";

@Injectable()
export class UserSeeder {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async run() {
		const saltRounds = 10;
		const defaultPassword = await bcrypt.hash("Dokixd123@", saltRounds);

		const usersSeed: InferInsertModel<typeof userEntity>[] = [
			{
				username: "yonatan",
				email: "yonatanvigiliolavado09@gmail.com",
				password: await bcrypt.hash("Dokixd123@", saltRounds),
				status: "ACTIVE",
				is_superuser: true,
				is_mfa_enabled: false,
				phone_number: "+51959884398",
				failed_login_attempts: 0,
				security_stamp: faker.string.uuid(),
				role_id: 1,
				tenant_id: 1,
				created_at: new Date(),
				updated_at: new Date(),
				// Add bio if entity supports it, otherwise might need profile relation
			},
			// Dev users
			...Array.from({ length: 9 }, (_, i) => ({
				username: `user_${i}`,
				email: `user${i}@example.com`,
				password: defaultPassword,
				status: "ACTIVE" as const,
				is_superuser: false,
				is_mfa_enabled: false,
				phone_number: faker.phone.number(),
				failed_login_attempts: 0,
				security_stamp: faker.string.uuid(),
				role_id: 2,
				tenant_id: 1,
				created_at: new Date(),
				updated_at: new Date(),
			})),
		];

		return await this.db.insert(userEntity).values(usersSeed).returning();
	}
}
