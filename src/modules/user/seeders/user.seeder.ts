import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { Inject, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { userEntity } from "../entities/user.entity";

@Injectable()
export class UserSeeder {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async run(tenant_id: number) {
		const password = await bcrypt.hash("Dokixd123@", 10);

		const user = {
			username: "admin",
			email: "admin@gmail.com",
			password,
			role_id: 1,
			tenant_id,
			status: "ACTIVE" as const,
			is_verified: true,
			is_superuser: true,
			created_at: new Date(),
			updated_at: new Date(),
		};

		return await this.db.insert(userEntity).values(user).returning();
	}
}
