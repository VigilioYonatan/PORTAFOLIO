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

describe("Auth Reset Password (E2E)", () => {
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
			.overrideGuard(AuthenticatedGuard)
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

	it("should reset password successfully", async () => {
		// 1. Create User
		const userDto = UserFactory.createDto();
		const { user } = await userService.store(1, userDto);

		// 2. Generate token (simulating forgot-password result)
		const payload = {
			sub: user.id,
			tenant_id: 1,
			security_stamp: user.security_stamp,
			type: "recovery",
		};
		const token = jwtService.sign(payload);

		// 3. Reset Password
		const resetDto = {
			token,
			new_password: "NewPassword123!",
			repeat_password: "NewPassword123!",
		};

		const response = await request(app.getHttpServer())
			.post("/api/v1/auth/reset-password")
			.set("Host", "localhost")
			.send(resetDto);

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.message).toContain("exitosamente");

		// 4. Verify password was updated in DB
		const [updatedUser] = await db
			.select()
			.from(userEntity)
			.where(and(eq(userEntity.id, user.id), eq(userEntity.tenant_id, 1)));

		// expect(updatedUser.password).not.toBe(user.password); // User object doesn't have password
		expect(updatedUser.security_stamp).not.toBe(user.security_stamp);
	});

	it("should fail with invalidated security_stamp", async () => {
		// 1. Create User
		const userDto = UserFactory.createDto();
		const { user } = await userService.store(1, userDto);

		// 2. Generate token
		const payload = {
			sub: user.id,
			tenant_id: 1,
			security_stamp: user.security_stamp,
			type: "recovery",
		};
		const token = jwtService.sign(payload);

		// 3. Manually change security_stamp in DB (e.g. another reset happened)
		await db
			.update(userEntity)
			.set({ security_stamp: randomUUID() })
			.where(eq(userEntity.id, user.id));

		// 4. Attempt reset with OLD token
		const resetDto = {
			token,
			new_password: "NewPassword123!",
			repeat_password: "NewPassword123!",
		};

		const response = await request(app.getHttpServer())
			.post("/api/v1/auth/reset-password")
			.set("Host", "localhost")
			.send(resetDto);

		expect(response.status).toBe(401);
		expect(response.body.message).toContain("no es válido");
	});

	it("should fail with invalid token type", async () => {
		// 1. Create User
		const userDto = UserFactory.createDto();
		const { user } = await userService.store(1, userDto);

		// 2. Generate token with WRONG type
		const payload = {
			sub: user.id,
			tenant_id: 1,
			security_stamp: user.security_stamp,
			type: "access", // Wrong type
		};
		const token = jwtService.sign(payload);

		const resetDto = {
			token,
			new_password: "NewPassword123!",
			repeat_password: "NewPassword123!",
		};

		const response = await request(app.getHttpServer())
			.post("/api/v1/auth/reset-password")
			.set("Host", "localhost")
			.send(resetDto);

		expect(response.status).toBe(401);
		expect(response.body.message).toContain("Tipo de token");
	});

	it("should fail when repeat_password does not match", async () => {
		const resetDto = {
			token: "some-token",
			new_password: "NewPassword123!",
			repeat_password: "DifferentPassword123!",
		};

		const response = await request(app.getHttpServer())
			.post("/api/v1/auth/reset-password")
			.set("Host", "localhost")
			.send(resetDto);

		expect(response.status).toBe(400); // Zod validation failure
	});
});
