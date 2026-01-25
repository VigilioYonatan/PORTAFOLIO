import {
	seedLocalhostTenant,
	setupTestDb,
	type TestDb,
	teardownTestDb,
} from "@infrastructure/config/server/setup-test-db";
import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import { RolesGuard } from "@modules/auth/guards/roles.guard";
import { WebPath } from "@modules/web/routers/web.routers";
import type { INestApplication } from "@nestjs/common";
import { RequestMethod, VersioningType } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "@src/app.module";
import { ZodValidationPipe } from "nestjs-zod";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { TenantFactory } from "./tenant.factory";

/**
 * E2E Tests for TenantController using REAL PostgreSQL database
 *
 * These tests interact with the actual database, testing the full
 * request lifecycle from HTTP to database and back.
 *
 * NOTE: Run these tests against a test database to avoid data corruption.
 */
describe("TenantController (E2E Real DB)", () => {
	let app: INestApplication;
	let db: TestDb;

	beforeAll(async () => {
		// Setup real database connection
		db = await setupTestDb();

		// Mock CacheService to avoid Redis connection requirement
		const mockCacheService = {
			get: async () => null,
			set: async () => {},
			del: async () => {},
			deleteByPattern: async () => {},
			remember: async (
				_key: string,
				_ttl: number,
				cb: () => Promise<unknown>,
			) => cb(),
			CACHE_TIMES: { HOUR: 3600, MINUTE: 60, DAYS_7: 604800 },
		};

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		})
			// Mock cache service to avoid Redis connection
			.overrideProvider(CacheService)
			.useValue(mockCacheService)
			// Only override guards, use real services/repositories
			.overrideGuard(AuthenticatedGuard)
			.useValue({ canActivate: () => true })
			.overrideGuard(RolesGuard)
			.useValue({ canActivate: () => true })
			.compile();

		app = moduleFixture.createNestApplication();

		// Mock Auth Middleware
		app.use((req: any, res: any, next: any) => {
			req.isAuthenticated = () => true;
			req.user = { id: 1, role_id: 1, tenant_id: 1 };
			next();
		});

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
		app.useGlobalPipes(new ZodValidationPipe());

		// Seed a localhost tenant BEFORE initializing the app (middleware needs it)
		await seedLocalhostTenant(db);

		await app.init();
	});

	afterAll(async () => {
		await app?.close();
		await teardownTestDb();
	});

	// NOTE: With dedicated test DB using TRUNCATE, we don't need afterEach cleanup
	// The setupTestDb() handles cleanup at the start of the test suite
	// and teardownTestDb() cleans up at the end

	describe("POST /tenants", () => {
		it("should create a new tenant in the database", async () => {
			// Use factory for unique test data (parallel-safe)
			const dto = TenantFactory.createDto({
				phone: "+1234567890",
			});

			const response = await request(app.getHttpServer())
				.post("/api/v1/tenants")
				.set("Host", "localhost")
				.send(dto);

			console.log(
				"POST /tenants response:",
				response.status,
				JSON.stringify(response.body, null, 2),
			);

			// If error, show the full error for debugging
			if (response.status >= 400) {
				console.error("POST /tenants ERROR:", response.body);
			}

			expect(response.status).toBe(201);
			expect(response.body.success).toBe(true);
			expect(response.body.tenant).toBeDefined();
			expect(response.body.tenant.name).toBe(dto.name);
			expect(response.body.tenant.email).toBe(dto.email);
			expect(response.body.tenant.slug).toContain("test-tenant");
		});

		it("should fail validation for invalid data", async () => {
			const invalidDto = {
				name: "", // Invalid: empty
				email: "not-an-email", // Invalid: bad format
			};

			const response = await request(app.getHttpServer())
				.post("/api/v1/tenants")
				.set("Host", "localhost")
				.send(invalidDto);

			expect(response.status).toBe(400);
			expect(response.body.success).toBe(false);
		});
	});

	describe("GET /tenants", () => {
		it("should return paginated tenants from database", async () => {
			// Use factory for unique test data
			const dto = TenantFactory.createDto({ plan: "BASIC" });

			await request(app.getHttpServer())
				.post("/api/v1/tenants")
				.set("Host", "localhost")
				.send(dto);

			// Now list tenants
			const response = await request(app.getHttpServer())
				.get("/api/v1/tenants?limit=10&offset=0")
				.set("Host", "localhost");

			console.log("GET /tenants response:", response.status, response.body);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.results).toBeDefined();
			expect(Array.isArray(response.body.results)).toBe(true);
			expect(response.body.count).toBeGreaterThanOrEqual(1);
		});
	});

	describe("GET /tenants/me", () => {
		it("should return the logged-in user's tenant", async () => {
			// The middleware has set req.locals.tenant to the localhost tenant
			// This endpoint should return that tenant
			const response = await request(app.getHttpServer())
				.get("/api/v1/tenants/me")
				.set("Host", "localhost");

			console.log(
				"GET /tenants/me response:",
				response.status,
				JSON.stringify(response.body, null, 2),
			);

			// If error, show the full error for debugging
			if (response.status >= 400) {
				console.error("GET /tenants/me ERROR:", response.body);
			}

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.tenant).toBeDefined();
			expect(response.body.tenant.id).toBeDefined();
			expect(response.body.tenant.name).toBeDefined();
			expect(response.body.tenant.slug).toBeDefined();
			expect(response.body.tenant.email).toBeDefined();
		});

		it("should include tenant settings in the response", async () => {
			const response = await request(app.getHttpServer())
				.get("/api/v1/tenants/me")
				.set("Host", "localhost");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.tenant.setting).toBeDefined();
			expect(response.body.tenant.setting.tenant_id).toBeDefined();
		});
	});

	describe("GET /tenants/:id", () => {
		it("should return a tenant by ID", async () => {
			// Use factory for unique test data
			const dto = TenantFactory.createDto({ plan: "PRO" });

			const createResponse = await request(app.getHttpServer())
				.post("/api/v1/tenants")
				.set("Host", "localhost")
				.send(dto);

			const tenantId = createResponse.body.tenant.id;

			// Now fetch it
			const response = await request(app.getHttpServer())
				.get(`/api/v1/tenants/${tenantId}`)
				.set("Host", "localhost");

			console.log("GET /tenants/:id response:", response.status, response.body);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.tenant).toBeDefined();
			expect(response.body.tenant.id).toBe(tenantId);
			expect(response.body.tenant.name).toBe(dto.name);
		});

		it("should return 404 for non-existent tenant", async () => {
			const response = await request(app.getHttpServer())
				.get("/api/v1/tenants/999999")
				.set("Host", "localhost");

			expect(response.status).toBe(404);
		});
	});

	describe("PUT /tenants/:id", () => {
		it("should update an existing tenant", async () => {
			// Use factory for unique test data
			const createDto = TenantFactory.createDto();

			const createResponse = await request(app.getHttpServer())
				.post("/api/v1/tenants")
				.set("Host", "localhost")
				.send(createDto);

			const tenantId = createResponse.body.tenant.id;

			// Update it
			const updateDto = {
				name: "Updated Tenant Name",
				// plan: "ENTERPRISE", // Not allowed in DTO
				// domain: createDto.domain, // Not allowed in DTO
				logo: createDto.logo,
				email: createDto.email,
				phone: createDto.phone,
				address: createDto.address,
				// is_active: true, // Not allowed in DTO
				trial_ends_at: null,
			};

			const response = await request(app.getHttpServer())
				.put(`/api/v1/tenants/${tenantId}`)
				.set("Host", "localhost")
				.send(updateDto);

			console.log("PUT /tenants/:id response:", response.status, response.body);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.tenant.name).toBe(updateDto.name);
			// expect(response.body.tenant.plan).toBe(updateDto.plan);
		});
	});

	describe("PUT /tenants/me", () => {
		it("should update the logged-in user's own tenant", async () => {
			// The middleware has already set req.locals.tenant to the localhost tenant
			// This endpoint should update that tenant
			const updateMeDto = {
				name: "My Updated Tenant Name",
				email: "updated@example.com",
				phone: "+9876543210",
				address: "456 Updated Street",
				logo: null,
				trial_ends_at: null,
			};

			const response = await request(app.getHttpServer())
				.put("/api/v1/tenants/me")
				.set("Host", "localhost")
				.send(updateMeDto);

			console.log(
				"PUT /tenants/me response:",
				response.status,
				JSON.stringify(response.body, null, 2),
			);

			// If error, show the full error for debugging
			if (response.status >= 400) {
				console.error("PUT /tenants/me ERROR:", response.body);
			}

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.tenant).toBeDefined();
			expect(response.body.tenant.name).toBe(updateMeDto.name);
			expect(response.body.tenant.email).toBe(updateMeDto.email);
			expect(response.body.tenant.phone).toBe(updateMeDto.phone);
			expect(response.body.tenant.address).toBe(updateMeDto.address);
		});

		it("should fail validation for invalid email", async () => {
			const invalidDto = {
				name: "Valid Name",
				email: "not-a-valid-email", // Invalid email format
				phone: null,
				address: null,
				logo: null,
				trial_ends_at: null,
			};

			const response = await request(app.getHttpServer())
				.put("/api/v1/tenants/me")
				.set("Host", "localhost")
				.send(invalidDto);

			expect(response.status).toBe(400);
			expect(response.body.success).toBe(false);
		});
	});

	describe("DELETE /tenants/:id", () => {
		it("should delete a tenant", async () => {
			// Use factory for unique test data
			const createDto = TenantFactory.createDto();

			const createResponse = await request(app.getHttpServer())
				.post("/api/v1/tenants")
				.set("Host", "localhost")
				.send(createDto);

			const tenantId = createResponse.body.tenant.id;

			// Delete it
			const response = await request(app.getHttpServer())
				.delete(`/api/v1/tenants/${tenantId}`)
				.set("Host", "localhost");

			console.log(
				"DELETE /tenants/:id response:",
				response.status,
				JSON.stringify(response.body, null, 2),
			);

			// If error, show the full error for debugging
			if (response.status >= 400) {
				console.error("DELETE /tenants/:id ERROR:", response.body);
			}

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);

			// Verify it's gone
			const getResponse = await request(app.getHttpServer())
				.get(`/api/v1/tenants/${tenantId}`)
				.set("Host", "localhost");

			expect(getResponse.status).toBe(404);
		});
	});

	describe("GET /tenants/settings/me", () => {
		it("should return the logged-in user's tenant settings", async () => {
			// The middleware sets req.locals.tenant to the localhost tenant
			// This endpoint should return that tenant's settings
			const response = await request(app.getHttpServer())
				.get("/api/v1/tenants/settings/me")
				.set("Host", "localhost");

			console.log(
				"GET /tenants/settings/me response:",
				response.status,
				JSON.stringify(response.body, null, 2),
			);

			// If error, show the full error for debugging
			if (response.status >= 400) {
				console.error("GET /tenants/settings/me ERROR:", response.body);
			}

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.setting).toBeDefined();
			expect(response.body.setting.tenant_id).toBeDefined();
		});
	});

	describe("PUT /tenants/settings/me", () => {
		it("should update the logged-in user's tenant settings with allowed fields", async () => {
			// Update settings for the current tenant (localhost)
			const updateSettingsMeDto = {
				color_primary: "#FF5733",
				color_secondary: "#33FF57",
				default_language: "EN" as const,
				time_zone: "America/Lima" as const,
			};

			const response = await request(app.getHttpServer())
				.put("/api/v1/tenants/settings/me")
				.set("Host", "localhost")
				.send(updateSettingsMeDto);

			console.log(
				"PUT /tenants/settings/me response:",
				response.status,
				JSON.stringify(response.body, null, 2),
			);

			// If error, show the full error for debugging
			if (response.status >= 400) {
				console.error("PUT /tenants/settings/me ERROR:", response.body);
			}

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.setting).toBeDefined();
			expect(response.body.setting.color_primary).toBe(
				updateSettingsMeDto.color_primary,
			);
			expect(response.body.setting.color_secondary).toBe(
				updateSettingsMeDto.color_secondary,
			);
			expect(response.body.setting.default_language).toBe(
				updateSettingsMeDto.default_language,
			);
		});

		it("should fail validation for invalid color_primary", async () => {
			const invalidDto = {
				// color_primary missing (required)
				color_secondary: "#FFFFFF",
				default_language: "ES" as const,
				time_zone: "UTC" as const,
				is_verified: false,
			};

			const response = await request(app.getHttpServer())
				.put("/api/v1/tenants/settings/me")
				.set("Host", "localhost")
				.send(invalidDto);

			expect(response.status).toBe(400);
			expect(response.body.success).toBe(false);
		});
	});

	describe("GET /tenants/:id/settings", () => {
		it("should return tenant settings", async () => {
			// Use factory for unique test data
			const createDto = TenantFactory.createDto();

			const createResponse = await request(app.getHttpServer())
				.post("/api/v1/tenants")
				.set("Host", "localhost")
				.send(createDto);

			const tenantId = createResponse.body.tenant.id;

			// Get settings
			const response = await request(app.getHttpServer())
				.get(`/api/v1/tenants/${tenantId}/settings`)
				.set("Host", "localhost");

			console.log(
				"GET /tenants/:id/settings response:",
				response.status,
				response.body,
			);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.setting).toBeDefined();
			expect(response.body.setting.tenant_id).toBe(tenantId);
		});
	});

	describe("PUT /tenants/:id/settings", () => {
		it("should update tenant settings", async () => {
			// Use factory for unique test data
			const createDto = TenantFactory.createDto();

			const createResponse = await request(app.getHttpServer())
				.post("/api/v1/tenants")
				.set("Host", "localhost")
				.send(createDto);

			const tenantId = createResponse.body.tenant.id;

			// Update settings
			const settingsDto = {
				color_primary: "#FF5733",
				color_secondary: "#33FF57",
				default_language: "EN",
				time_zone: "UTC",
			};

			const response = await request(app.getHttpServer())
				.put(`/api/v1/tenants/${tenantId}/settings`)
				.set("Host", "localhost")
				.send(settingsDto);

			console.log(
				"PUT /tenants/:id/settings response:",
				response.status,
				response.body,
			);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.setting.color_primary).toBe(
				settingsDto.color_primary,
			);
			expect(response.body.setting.color_secondary).toBe(
				settingsDto.color_secondary,
			);
		});
	});
});
