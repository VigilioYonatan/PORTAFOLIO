import { configureApp } from "@infrastructure/config/server/app.config";
import {
	setupTestDb,
	type TestDb,
	teardownTestDb,
} from "@infrastructure/config/server/setup-test-db";
import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { SessionConfigService } from "@modules/auth/config/session.config";
import type { INestApplication } from "@nestjs/common";
import {
	Test,
	type TestingModule,
	type TestingModuleBuilder,
} from "@nestjs/testing";
import { AppModule } from "@src/app.module";
import type { Request } from "express";

// Utility interface for mocked request
interface MockRequest extends Request {
	user?: {
		id: number;
		role_id: number;
		tenant_id: number;
		email: string;
	};
	// biome-ignore lint/suspicious/noExplicitAny: Mocking internal properties
	locals: any;
}

/**
 * Shared utility for E2E testing to encapsulate boilerplate setup.
 */
export class E2EApp {
	public app!: INestApplication;
	public db!: TestDb;
	public moduleRef!: TestingModule;
	public tenantId!: number;

	private mockCacheService = {
		get: async () => null,
		set: async () => {},
		del: async () => {},
		deleteByPattern: async () => {},
		remember: async (_key: string, _ttl: number, cb: () => Promise<unknown>) =>
			cb(),
		invalidateLists: async () => {},
		CACHE_TIMES: { HOUR: 3600, MINUTE: 60, DAYS_1: 86400, DAYS_7: 604800 },
	};

	/**
	 * Initializes the application and database for testing.
	 * @param options Configuration for overriding providers or context.
	 */
	async init(options?: {
		overrides?: (builder: TestingModuleBuilder) => TestingModuleBuilder;
		mockAuth?: {
			user?: {
				id: number;
				role_id: number;
				tenant_id: number;
				email: string;
			};
			locals?: { tenant: { id: number } };
		};
	}): Promise<void> {
		// 1. Setup Database
		this.db = await setupTestDb();
		this.tenantId = 1; // Default from seedLocalhostTenant

		// 2. Base Testing Module
		let builder = Test.createTestingModule({
			imports: [AppModule],
		})
			.overrideProvider(CacheService)
			.useValue(this.mockCacheService);

		// 3. Apply Overrides
		if (options?.overrides) {
			builder = options.overrides(builder);
		}

		this.moduleRef = await builder.compile();

		// 4. Create App
		this.app = this.moduleRef.createNestApplication();
		configureApp(this.app);

		// Apply Session configuration
		const sessionConfig = this.app.get(SessionConfigService);
		sessionConfig.setup(this.app);

		// 5. Shared Mock Auth Middleware (Optional)
		this.app.use((req: Request, _res: unknown, next: () => void) => {
			const mockRole = req.headers["x-mock-role"];
			const hasMockOptions = !!options?.mockAuth;

			if (!mockRole && !hasMockOptions) {
				return next();
			}

			const mockReq = req as MockRequest;

			// Identity can be provided per-test or use default admin/user from seed
			// biome-ignore lint/suspicious/noExplicitAny: Mocking internal Express property
			mockReq.isAuthenticated = (() => true) as any;

			const roleMock = mockRole || "user";

			if (options?.mockAuth?.user) {
				mockReq.user = options.mockAuth.user;
			} else if (roleMock === "admin") {
				mockReq.user = {
					id: 1,
					role_id: 1,
					tenant_id: this.tenantId,
					email: "admin@test.com",
				};
			} else {
				mockReq.user = {
					id: 2,
					role_id: 2,
					tenant_id: this.tenantId,
					email: "user@test.com",
				};
			}

			if (options?.mockAuth?.locals) {
				mockReq.locals = options.mockAuth.locals;
			} else {
				mockReq.locals = { tenant: { id: this.tenantId } };
			}

			next();
		});

		await this.app.init();
	}

	/**
	 * Teardown application and database.
	 */
	async close(): Promise<void> {
		await this.app?.close();
		await teardownTestDb();
	}

	/**
	 * Type-safe access to application providers.
	 */
	get<TInput = unknown, TResult = TInput>(
		typeOrToken: TInput | string | symbol,
	): TResult {
		// biome-ignore lint/suspicious/noExplicitAny: NestJS get requires any or specific type
		return this.app.get(typeOrToken as any);
	}

	/**
	 * Get the database instance.
	 */
	getDb(): TestDb {
		return this.moduleRef.get(DRIZZLE);
	}
}
