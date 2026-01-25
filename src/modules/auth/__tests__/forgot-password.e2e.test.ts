import {
	seedLocalhostTenant,
	setupTestDb,
	type TestDb,
} from "@infrastructure/config/server/setup-test-db";
import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { MailService } from "@infrastructure/providers/mail/mail.service";
import { SessionConfigService } from "@modules/auth/config/session.config";
import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import { UserFactory } from "@modules/user/__tests__/user.factory";
import { UserService } from "@modules/user/services/user.service";
import { WebPath } from "@modules/web/routers/web.routers";
import type { INestApplication } from "@nestjs/common";
import { RequestMethod, VersioningType } from "@nestjs/common";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "@src/app.module";

import request from "supertest";
import { vi } from "vitest";

describe("Auth Forgot Password (E2E)", () => {
	let app: INestApplication;
	let userService: UserService;
	let db: TestDb;
	let mailService: MailService;
	const mockMailService = {
		sendMail: vi.fn().mockResolvedValue(true),
	};

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
			.overrideProvider(MailService)
			.useValue(mockMailService)
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
		mailService = moduleRef.get<MailService>(MailService);
		db = moduleRef.get(DRIZZLE);

		const sessionConfig =
			moduleRef.get<SessionConfigService>(SessionConfigService);
		sessionConfig.setup(app);

		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it("should send recovery email for existing user", async () => {
		// 1. Create User
		const userDto = UserFactory.createDto();
		await userService.store(1, userDto); // Assuming tenant 1 is localhost

		// 2. Request Forgot Password
		const forgotDto = {
			email: userDto.email,
		};

		const response = await request(app.getHttpServer())
			.post("/api/v1/auth/forgot-password")
			.set("Host", "localhost")
			.send(forgotDto);

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.message).toContain("Se ha enviado un correo");

		// Verify mailService was called
		expect(mockMailService.sendMail).toHaveBeenCalledWith(
			expect.objectContaining({
				to: userDto.email,
				subject: "Recuperación de contraseña",
			}),
		);
	});

	it("should fail when user does not exist", async () => {
		const forgotDto = {
			email: "nonexistent@example.com",
		};

		const response = await request(app.getHttpServer())
			.post("/api/v1/auth/forgot-password")
			.set("Host", "localhost")
			.send(forgotDto);

		expect(response.status).toBe(400);
		expect(response.body.message).toContain("no existe");
	});

	it("should fail when user exists but in different tenant", async () => {
		// 1. Create User in Tenant 1 (localhost)
		const userDto = UserFactory.createDto();
		await userService.store(1, userDto);

		// 2. Request Forgot Password using Host associated with a DIFFERENT tenant (if we had one)
		// For this test, we'll try something that doesn't resolve to tenant 1 or use a fake host.
		// BUT the middleware will throw InternalServerErrorException ("Tenant not found") if the host is not mapped.
		// So we can check that it doesn't find the user if the host is technically valid but for a different tenant.
		// Let's seed ANOTHER tenant.
		const { sql } = await import("drizzle-orm");
		const tenant2 = await db
			.insert(schema.tenantEntity)
			.values({
				name: "Other Tenant",
				slug: "other",
				email: "other@test.com",
				plan: "FREE",
			})
			.returning();
		const tenantId2 = tenant2[0].id;

		// Requesting with Host 'localhost' (Tenant 1) but trying to find a user that ONLY exists in some other context?
		// Actually, showByEmailToLogin filters by tenant_id.
		// So if I request with Host 'localhost' (tenant 1), it only looks in tenant 1.
		// If I create a user in tenant 2, it should NOT find it.

		const userDto2 = UserFactory.createDto();
		await userService.store(tenantId2, userDto2);

		const response = await request(app.getHttpServer())
			.post("/api/v1/auth/forgot-password")
			.set("Host", "localhost") // Tenant 1
			.send({ email: userDto2.email });

		expect(response.status).toBe(400); // Should not find userDto2 in Tenant 1
	});
});
