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

describe("Auth MFA Setup & Verify (E2E)", () => {
	let app: INestApplication;
	const totp = new TOTP({
		base32: new ScureBase32Plugin(),
		crypto: new NobleCryptoPlugin(),
	});

	beforeAll(async () => {
		const db = await setupTestDb();
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

	it("should setup and then verify MFA successfully", async () => {
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
		expect(accessToken).toBeDefined();

		// 2. Setup MFA - Get secret
		const setupRes = await request(app.getHttpServer())
			.post("/api/v1/auth/mfa/setup")
			.set("Host", "localhost")
			.set("Authorization", `Bearer ${accessToken}`)
			.expect(200);

		const secret = setupRes.body.secret;
		expect(secret).toBeDefined();

		// 3. Generate OTP token using the secret
		const token = await totp.generate({ secret });

		// 4. Verify MFA
		const verifyRes = await request(app.getHttpServer())
			.post("/api/v1/auth/mfa/verify")
			.set("Host", "localhost")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ token })
			.expect(200);

		expect(verifyRes.body.success).toBe(true);
	});

	it("should fail MFA verification with wrong token", async () => {
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

		// 2. Verify MFA with fake token
		await request(app.getHttpServer())
			.post("/api/v1/auth/mfa/verify")
			.set("Host", "localhost")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ token: "000000" })
			.expect(400); // Fails because MFA not initiated
	});
});
