import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("react", () => import("preact/compat"));
vi.mock("react-dom", () => import("preact/compat"));

// RAF Polyfill
if (typeof window !== "undefined" && !window.requestAnimationFrame) {
	window.requestAnimationFrame = (callback) => setTimeout(callback, 0);
	window.cancelAnimationFrame = (id) => clearTimeout(id);
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type GlobalWithRAF = typeof global & {
	requestAnimationFrame: (callback: FrameRequestCallback) => number;
	cancelAnimationFrame: (handle: number) => void;
};

if (typeof global !== "undefined" && !global.requestAnimationFrame) {
	(global as unknown as GlobalWithRAF).requestAnimationFrame = (
		callback: FrameRequestCallback,
	) => setTimeout(callback, 0) as unknown as number;
	(global as unknown as GlobalWithRAF).cancelAnimationFrame = (id: number) =>
		clearTimeout(id);
}

// Canvas Ellipse Polyfill (for tech.orbit)
if (typeof window !== "undefined") {
	if (
		typeof HTMLCanvasElement !== "undefined" &&
		typeof CanvasRenderingContext2D !== "undefined" &&
		!CanvasRenderingContext2D.prototype.ellipse
	) {
		CanvasRenderingContext2D.prototype.ellipse = (
			_x: number,
			_y: number,
			_radiusX: number,
			_radiusY: number,
			_rotation: number,
			_startAngle: number,
			_endAngle: number,
			_anticlockwise?: boolean,
		) => {
			// No-op for testing
		};
	}
	if (
		typeof CanvasRenderingContext2D !== "undefined" &&
		!CanvasRenderingContext2D.prototype.setLineDash
	) {
		CanvasRenderingContext2D.prototype.setLineDash = () => {
			// No-op for testing
		};
	}
	if (
		typeof CanvasRenderingContext2D !== "undefined" &&
		!CanvasRenderingContext2D.prototype.createRadialGradient
	) {
		CanvasRenderingContext2D.prototype.createRadialGradient = () => ({
			addColorStop: vi.fn(),
		});
	}
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

// Global i18n mock for components
vi.mock("@src/i18n", () => ({
	useTranslations: vi.fn(() => (key: string) => key),
	getTranslatedPath: vi.fn((path: string) => path),
	languages: {
		en: "English",
		es: "Español",
		pt: "Português",
	},
	defaultLang: "es",
}));

// Mock global fetch
global.fetch = vi.fn((input: RequestInfo | URL, _init?: RequestInit) => {
	const url = typeof input === "string" ? input : input.toString();

	if (url.includes("/api/v1/upload/provider")) {
		return Promise.resolve({
			ok: true,
			json: () => Promise.resolve({ provider: "LOCAL" }),
		} as Response);
	}

	return Promise.resolve({
		ok: true,
		json: () => Promise.resolve({}),
	} as Response);
});
