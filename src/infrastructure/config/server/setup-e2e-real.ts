/**
 * Minimal setup for E2E tests with real database.
 *
 * This setup:
 * - Sets NODE_ENV to TEST (required for validation)
 * - Does NOT override DATABASE_URL (uses real .env value)
 * - Sets minimal required environment variables for tests
 */

// Set NODE_ENV for validation
process.env.NODE_ENV = "TEST";

// Set minimal required variables that don't come from .env
// or might not be set in some environments
if (!process.env.LOG_LEVEL) {
	process.env.LOG_LEVEL = "DEBUG";
}

// Mock browser-only APIs if needed
if (typeof global.ResizeObserver === "undefined") {
	global.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof ResizeObserver;
}
