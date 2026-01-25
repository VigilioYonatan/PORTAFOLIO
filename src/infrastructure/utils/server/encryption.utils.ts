import {
	createCipheriv,
	createDecipheriv,
	randomBytes,
	scrypt,
} from "node:crypto";
import { promisify } from "node:util";
import { getEnvironments } from "@infrastructure/config/server/environments.config";

const scryptAsync = promisify(scrypt);

// Using AES-256-CBC
const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

export async function encrypt(text: string): Promise<string> {
	const { JWT_KEY } = getEnvironments();

	// Derived key from JWT_KEY (ensure it's 32 bytes)
	const key = (await scryptAsync(JWT_KEY, "salt", 32)) as Buffer;
	const iv = randomBytes(IV_LENGTH);

	const cipher = createCipheriv(ALGORITHM, key, iv);
	let encrypted = cipher.update(text, "utf8", "hex");
	encrypted += cipher.final("hex");

	// Return IV:EncryptedText
	return `${iv.toString("hex")}:${encrypted}`;
}

export async function decrypt(text: string): Promise<string> {
	const { JWT_KEY } = getEnvironments();

	const [ivHex, encryptedHex] = text.split(":");
	if (!ivHex || !encryptedHex) {
		throw new Error("Invalid encrypted text format");
	}

	const key = (await scryptAsync(JWT_KEY, "salt", 32)) as Buffer;
	const iv = Buffer.from(ivHex, "hex");

	const decipher = createDecipheriv(ALGORITHM, key, iv);
	let decrypted = decipher.update(encryptedHex, "hex", "utf8");
	decrypted += decipher.final("utf8");

	return decrypted;
}
