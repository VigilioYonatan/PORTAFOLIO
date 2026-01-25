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

		const usersSeed: InferInsertModel<typeof userEntity>[] = Array.from(
			{ length: 10 },
			(_, i) => ({
				username: `admin_${i}`,
				email: `admin${i}@gmail.com`,
				password: defaultPassword,
				status: "ACTIVE",
				is_superuser: true,
				is_mfa_enabled: false,
				phone_number: faker.phone.number(),
				failed_login_attempts: 0,
				security_stamp: faker.string.uuid(),
				avatar: null,
				google_id: null,
				qr_code_token: null,
				email_verified_at: new Date(),
				lockout_end_at: null,
				role_id: 1,
				tenant_id: 1,
				mfa_secret: null,
				last_ip_address: null,
				last_login_at: null,
				created_at: new Date(),
				updated_at: new Date(),
				deleted_at: null,
			}),
		);

		return await this.db.insert(userEntity).values(usersSeed).returning();
	}
}
