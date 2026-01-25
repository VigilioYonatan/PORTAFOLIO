import { describe, expect, it, vi } from "vitest";
import { decrypt, encrypt } from "../encryption.utils";

// Mock environments
vi.mock("@infrastructure/config/server/environments.config", () => ({
	getEnvironments: () => ({
		JWT_KEY: "my-super-secret-key-that-is-32-bytes-long",
	}),
}));

describe("Encryption Utils", () => {
	it("should encrypt and decrypt a string correctly", async () => {
		const original = "JBSWY3DPEHPK3PXP"; // Standard Base32 secret
		const encrypted = await encrypt(original);

		expect(encrypted).not.toBe(original);
		expect(encrypted).toContain(":"); // Checks IV separation

		const decrypted = await decrypt(encrypted);
		expect(decrypted).toBe(original);
	});

	it("should generate different ciphertexts for same input (random IV)", async () => {
		const text = "same-text";
		const enc1 = await encrypt(text);
		const enc2 = await encrypt(text);

		expect(enc1).not.toBe(enc2);

		const dec1 = await decrypt(enc1);
		const dec2 = await decrypt(enc2);

		expect(dec1).toBe(text);
		expect(dec2).toBe(text);
	});
});
