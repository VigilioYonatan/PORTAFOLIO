import { randomUUID } from "node:crypto";
import {
	seedLocalhostTenant,
	setupTestDb,
	type TestDb,
} from "@infrastructure/config/server/setup-test-db";
import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { SessionConfigService } from "@modules/auth/config/session.config";
import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import { UserFactory } from "@modules/user/__tests__/user.factory";
import { userEntity } from "@modules/user/entities/user.entity";
import { UserService } from "@modules/user/services/user.service";
import { WebPath } from "@modules/web/routers/web.routers";
import type { INestApplication } from "@nestjs/common";
import { RequestMethod, VersioningType } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "@src/app.module";
import { and, eq } from "drizzle-orm";

import request from "supertest";

describe("Auth Verify Email (E2E)", () => {
	let app: INestApplication;
	let userService: UserService;
	let db: TestDb;
	let jwtService: JwtService;

	beforeAll(async () => {
		db = await setupTestDb();
		await seedLocalhostTenant(db);

		const moduleRef: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		})
			.overrideProvider(APP_GUARD)
			.useValue({ canActivate: () => true })
			.overrideProvider(AuthenticatedGuard)
			.useValue({ canActivate: () => true })
			.compile();

		app = moduleRef.createNestApplication();

		app.setGlobalPrefix("api", {
			exclude: Object.values(WebPath).map((path) => ({
				path,
				method: RequestMethod.GET,
			})),
		});
		app.enableVersioning({
			type: VersioningType.URI,
			defaultVersion: "1",
			prefix: "v",
		});

		userService = moduleRef.get<UserService>(UserService);
		jwtService = moduleRef.get<JwtService>(JwtService);
		db = moduleRef.get(DRIZZLE);

		const sessionConfig =
			moduleRef.get<SessionConfigService>(SessionConfigService);
		sessionConfig.setup(app);

		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it("should verify email successfully", async () => {
		// 1. Create User (PENDING status by default)
		const userDto = UserFactory.createDto();
		const { user } = await userService.store(1, userDto);

		// 2. Generate token
		const payload = {
			sub: user.id,
			tenant_id: 1,
			security_stamp: user.security_stamp,
			type: "verification",
		};
		const token = jwtService.sign(payload);

		// 3. Verify Email
		const response = await request(app.getHttpServer())
			.post("/api/v1/auth/verify-email")
			.set("Host", "localhost")
			.send({ token });

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.message).toContain("exitosamente");

		// 4. Verify DB changes
		const [updatedUser] = await db
			.select()
			.from(userEntity)
			.where(and(eq(userEntity.id, user.id), eq(userEntity.tenant_id, 1)));

		expect(updatedUser.email_verified_at).not.toBeNull();
		expect(updatedUser.status).toBe("ACTIVE");
		expect(updatedUser.security_stamp).not.toBe(user.security_stamp);
	});

	it("should fail with invalid security_stamp", async () => {
		// 1. Create User
		const userDto = UserFactory.createDto();
		const { user } = await userService.store(1, userDto);

		// 2. Generate token
		const payload = {
			sub: user.id,
			tenant_id: 1,
			security_stamp: user.security_stamp,
			type: "verification",
		};
		const token = jwtService.sign(payload);

		// 3. Change stamp in DB
		await db
			.update(userEntity)
			.set({ security_stamp: randomUUID() })
			.where(eq(userEntity.id, user.id));

		// 4. Attempt verify with OLD token
		const response = await request(app.getHttpServer())
			.post("/api/v1/auth/verify-email")
			.set("Host", "localhost")
			.send({ token });

		expect(response.status).toBe(401);
		expect(response.body.message).toContain("ya no es válido");
	});

	it("should fail with invalid token type", async () => {
		const payload = {
			sub: 1,
			tenant_id: 1,
			security_stamp: randomUUID(),
			type: "access",
		};
		const token = jwtService.sign(payload);

		const response = await request(app.getHttpServer())
			.post("/api/v1/auth/verify-email")
			.set("Host", "localhost")
			.send({ token });

		expect(response.status).toBe(401);
		expect(response.body.message).toContain("Tipo de token");
	});
});
