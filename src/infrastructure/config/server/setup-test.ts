import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("react", () => import("preact/compat"));
vi.mock("react-dom", () => import("preact/compat"));

import { Window } from "happy-dom";

if (typeof window === "undefined") {
	const happyWindow = new Window();
	global.window = happyWindow as any;
	global.document = happyWindow.document as any;
}

// Mock window.locals for tests
if (typeof window !== "undefined") {
	Object.defineProperty(window, "locals", {
		writable: true,
		value: {
			empresa: {
				settings: {
					timezone: "America/Lima",
				},
			},
		},
	});

	// Mock matchMedia
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: vi.fn().mockImplementation((query) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: vi.fn(), // deprecated
			removeListener: vi.fn(), // deprecated
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
	});
}

// Mock ResizeObserver
if (typeof global.ResizeObserver === "undefined") {
	global.ResizeObserver = vi.fn().mockImplementation(() => ({
		observe: vi.fn(),
		unobserve: vi.fn(),
		disconnect: vi.fn(),
	}));
}

// Mock Environment Variables
process.env.PUBLIC_URL = "http://localhost:3000";
process.env.PUBLIC_PORT = "3000";
process.env.DB_HOST = "localhost";
process.env.DB_NAME = "test_db";
process.env.DB_USER = "test_user";
process.env.DB_PASS = "test_pass";
process.env.DATABASE_URL =
	"postgres://test_user:test_pass@localhost:5432/test_db";
process.env.JWT_KEY = "test_jwt_key_must_be_long_enough_32_chars";
process.env.PUBLIC_HMAC_KEY = "test_hmac_key_16";
process.env.RUSTFS_ENDPOINT = "http://localhost:9000";
process.env.RUSTFS_ROOT_USER = "minio";
process.env.RUSTFS_ROOT_PASSWORD = "minio_password";
process.env.RUSTFS_BUCKET_NAME = "test-bucket";
process.env.MAIL_HOST = "smtp.test.com";
process.env.MAIL_USER = "mail_user";
process.env.MAIL_PASS = "mail_pass";
process.env.NODE_ENV = "TEST";
process.env.LOG_LEVEL = "ERROR";
