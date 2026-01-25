import {
	seedLocalhostTenant,
	setupTestDb,
} from "@infrastructure/config/server/setup-test-db";
import { SessionConfigService } from "@modules/auth/config/session.config";
import { UserFactory } from "@modules/user/__tests__/user.factory";
import { UserService } from "@modules/user/services/user.service";
import { WebPath } from "@modules/web/routers/web.routers";
import type { INestApplication } from "@nestjs/common";
import { RequestMethod, VersioningType } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "@src/app.module";
import { NobleCryptoPlugin, ScureBase32Plugin, TOTP } from "otplib";
import request from "supertest";

describe("Auth MFA Disable (E2E)", () => {
	let app: INestApplication;
	const totp = new TOTP({
		base32: new ScureBase32Plugin(),
		crypto: new NobleCryptoPlugin(),
	});
	let db: any;

	beforeAll(async () => {
		db = await setupTestDb();
		await seedLocalhostTenant(db);

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
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

		const sessionConfig = app.get(SessionConfigService);
		sessionConfig.setup(app);

		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it("should disable MFA successfully", async () => {
		const userService = app.get(UserService);
		const userDto = UserFactory.createDto();
		await userService.store(1, userDto);

		// 1. Login
		// Pre-set security stamp to ensure stability or just capture it if possible
		// But login generates token with current stamp.
		const loginRes = await request(app.getHttpServer())
			.post("/api/v1/auth/login")
			.set("Host", "localhost")
			.send({
				email: userDto.email,
				password: userDto.password,
			});

		const accessToken = loginRes.body.access_token;
		expect(accessToken).toBeDefined();

		// 2. Setup MFA
		const setupRes = await request(app.getHttpServer())
			.post("/api/v1/auth/mfa/setup")
			.set("Host", "localhost")
			.set("Authorization", `Bearer ${accessToken}`)
			.expect(200);

		const secret = setupRes.body.secret;
		const token = await totp.generate({ secret });

		// 3. Verify MFA (to enable it)
		// Capture stamp before verify (verify rotates it)
		const userBefore = await userService.getByEmailForAuth(1, userDto.email);
		const oldStamp = userBefore?.security_stamp;

		await request(app.getHttpServer())
			.post("/api/v1/auth/mfa/verify")
			.set("Host", "localhost")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ token })
			.expect(200);

		// Restore security_stamp so accessToken remains valid
		// We need to import userEntity and DRIZZLE to update directly, OR use a raw query if needed
		// But we have 'userService'. Does it have raw update? No.
		// We can use the 'db' connection from setupTestDb?
		// Wait, 'db' variable is in 'beforeAll' scope! Not accessible here.
		// We must resolve DRIZZLE from app.
		// Use userService directly (since we have it resolved and it works)
		await userService.updateForAuth(1, userBefore!.id, {
			security_stamp: oldStamp!,
		});
		// Step 221 showed: db = moduleRef.get(DRIZZLE); DRIZZLE is symbol?
		// Step 337 showed: import { DRIZZLE } from ...provider...
		// I need to import DRIZZLE symbol in this file.
		// Or just fetch user again and update via userService if possible?
		// UserService.updateForAuth updates stamp.
		// But we want to set it to SPECIFIC value 'oldStamp'.
		// UserService.updateForAuth takes partial user.
		await userService.updateForAuth(1, userBefore!.id, {
			security_stamp: oldStamp!,
		});

		// 4. Disable MFA
		const newToken = await totp.generate({ secret });
		const disableRes = await request(app.getHttpServer())
			.post("/api/v1/auth/mfa/disable")
			.set("Host", "localhost")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				password: userDto.password,
				token: newToken,
			})
			.expect(200);

		expect(disableRes.body.success).toBe(true);
		expect(disableRes.body.message).toContain("desactivado");

		// 5. Verify it's disabled in DB
		const user = await userService.getByEmailForAuth(1, userDto.email);
		expect(user?.is_mfa_enabled).toBe(false);
		expect(user?.mfa_secret).toBeNull();
	});

	it("should fail to disable MFA with wrong password", async () => {
		const userService = app.get(UserService);
		const userDto = UserFactory.createDto();
		await userService.store(1, userDto);

		// 1. Login
		const loginRes = await request(app.getHttpServer())
			.post("/api/v1/auth/login")
			.set("Host", "localhost")
			.send({
				email: userDto.email,
				password: userDto.password,
			});

		const accessToken = loginRes.body.access_token;

		// 2. Disable MFA with wrong pass
		await request(app.getHttpServer())
			.post("/api/v1/auth/mfa/disable")
			.set("Host", "localhost")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				password: "Password@12345!", // Different but valid format
				token: "000000",
			})
			.expect(400);
	});
});
