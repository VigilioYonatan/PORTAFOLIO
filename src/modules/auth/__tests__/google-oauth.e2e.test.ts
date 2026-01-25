import {
	seedLocalhostTenant,
	setupTestDb,
} from "@infrastructure/config/server/setup-test-db";
import { SessionConfigService } from "@modules/auth/config/session.config";
import { AuthService } from "@modules/auth/services/auth.service";
import { UserRepository } from "@modules/user/repositories/user.repository";
import { WebPath } from "@modules/web/routers/web.routers";
import {
	type ExecutionContext,
	type INestApplication,
	RequestMethod,
	VersioningType,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Test, type TestingModule } from "@nestjs/testing";
import { AppModule } from "@src/app.module";
import type { Profile } from "passport-google-oauth20";
import request from "supertest";
import { GoogleAuthGuard } from "../guards/google-auth.guard";

describe("Google OAuth (E2E)", () => {
	let app: INestApplication;
	let userRepository: UserRepository;

	// Stateful Mock Profile
	let mockProfile: Profile = {
		id: "google_id_123",
		emails: [{ value: "google_user@example.com", verified: true }],
		displayName: "Google User",
		photos: [{ value: "http://photo.com/google.jpg" }],
		provider: "google",
		profileUrl: "http://profile.com",
		_raw: "",
		_json: {
			iss: "https://accounts.google.com",
			aud: "client_id",
			sub: "google_id_123",
			iat: 0,
			exp: 0,
		},
	};

	const mockGoogleGuard = {
		canActivate: async (context: ExecutionContext) => {
			const req = context.switchToHttp().getRequest();
			const authService = app.get(AuthService);
			const tenant_id = req.locals?.tenant?.id || 1;

			// Simulate Strategy.validate calling authService.validateGoogleUser
			const user = await authService.validateGoogleUser(mockProfile, tenant_id);
			req.user = user;
			// Middleware runs BEFORE guard, so we must manually sync to req.locals for mock
			if (req.locals) {
				req.locals.user = user;
			}
			return true;
		},
	};

	beforeAll(async () => {
		const db = await setupTestDb();
		await seedLocalhostTenant(db);

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		})
			.overrideGuard(GoogleAuthGuard)
			.useValue(mockGoogleGuard)
			.compile();

		app = moduleFixture.createNestApplication();

		// Configure prefixes and versioning to match main.ts
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

		userRepository = moduleFixture.get(UserRepository);
		await app.init();
	});

	afterAll(async () => {
		if (app) {
			await app.close();
		}
	});

	it("should register a new user via Google", async () => {
		mockProfile = {
			id: "google_new_id",
			emails: [{ value: "new_google_user@example.com", verified: true }],
			displayName: "New Google User",
			photos: [{ value: "http://photo.com/new.jpg" }],
			provider: "google",
			profileUrl: "http://profile.com",
			_raw: "",
			_json: {},
		};

		const response = await request(app.getHttpServer())
			.get("/api/v1/auth/google/callback")
			.set("Host", "localhost")
			.expect(302);

		expect(response.header.location).toContain("/auth/callback");

		// Verify DB state
		const user = await userRepository.showByEmail(
			1,
			"new_google_user@example.com",
		);
		expect(user).toBeDefined();
		expect(user!.google_id).toBe("google_new_id");
		expect(user!.avatar![0].key).toBe("http://photo.com/new.jpg");
	});

	it("should link to existing user by email", async () => {
		const email = "existing@example.com";
		// 1. Create user with same email manually
		await userRepository.store(1, {
			email,
			username: "existing",
			password: "HashedPassword!",
			role_id: 2,
			status: "ACTIVE",
			avatar: null,
			phone_number: null,
			google_id: null,
			security_stamp: "00000000-0000-0000-0000-000000000000",
			failed_login_attempts: 0,
			is_mfa_enabled: false,
			is_superuser: false,
			email_verified_at: null,
			lockout_end_at: null,
			last_login_at: null,
			deleted_at: null,
			tenant_id: 1,
			qr_code_token: null,
			mfa_secret: null,
			last_ip_address: null,
		});

		// 2. Mock Google login with same email
		mockProfile = {
			id: "google_linked_id",
			emails: [{ value: email, verified: true }],
			displayName: "Existing User",
			photos: [],
			provider: "google",
			profileUrl: "http://profile.com",
			_raw: "",
			_json: {},
		};

		await request(app.getHttpServer())
			.get("/api/v1/auth/google/callback")
			.set("Host", "localhost")
			.expect(302);

		// 3. Verify user is updated with google_id
		const user = await userRepository.showByEmail(1, email);
		expect(user!.google_id).toBe("google_linked_id");
	});
});
