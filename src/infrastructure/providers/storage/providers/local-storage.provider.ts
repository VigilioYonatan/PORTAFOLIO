import crypto from "node:crypto";
import { createWriteStream, type ReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import type { Environments } from "@infrastructure/config/server";
import type { FilesSchema } from "@modules/uploads/schemas/upload.schema";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
	StorageProvider,
	UploadResult,
} from "../interfaces/storage-provider.interface";

// =============================================================================
// LOCAL STORAGE PROVIDER
// =============================================================================

/**
 * Local filesystem storage provider.
 * Saves files to the /public directory for direct serving via Express static.
 */
@Injectable()
export class LocalStorageProvider implements StorageProvider {
	private readonly logger = new Logger(LocalStorageProvider.name);
	private readonly publicDir: string;
	private readonly publicUrl: string;

	constructor(private readonly configService: ConfigService<Environments>) {
		// Resolve public directory relative to project root
		this.publicDir = path.join(__dirname, "..", "public");
		this.publicUrl = this.configService.getOrThrow("PUBLIC_URL");
		this.ensurePublicDir();
	}

	private async ensurePublicDir(): Promise<void> {
		try {
			await fs.mkdir(this.publicDir, { recursive: true });
			this.logger.log(`Public directory verified: ${this.publicDir}`);
		} catch (error) {
			this.logger.error(`Failed to create public directory`, error);
		}
	}

	async uploadFile(
		key: string,
		file: Buffer | ReadStream,
		_mimetype: string,
	): Promise<UploadResult> {
		const filePath = path.join(this.publicDir, key);
		if (!filePath.startsWith(this.publicDir)) {
			throw new Error("Invalid file path (Path Traversal detected)");
		}
		const fileDir = path.dirname(filePath);

		// Ensure directory exists
		await fs.mkdir(fileDir, { recursive: true });

		// Write file
		if (Buffer.isBuffer(file)) {
			await fs.writeFile(filePath, file);
		} else {
			const writeStream = createWriteStream(filePath);
			await pipeline(file, writeStream);
		}

		this.logger.debug(`File uploaded locally: ${key}`);

		return {
			key,
			url: this.getPublicUrl(key),
		};
	}

	async removeFile(
		files: FilesSchema[] | string | string[],
	): Promise<{ success: boolean }> {
		let keysToDelete: string[];

		if (typeof files === "string") {
			keysToDelete = [files];
		} else if (
			Array.isArray(files) &&
			files.length > 0 &&
			typeof files[0] === "string"
		) {
			keysToDelete = files as string[];
		} else {
			keysToDelete = (files as FilesSchema[]).map((f) => f.key);
		}

		await Promise.all(
			keysToDelete.map(async (key) => {
				const filePath = path.join(this.publicDir, key);
				try {
					await fs.unlink(filePath);
					this.logger.debug(`File deleted: ${key}`);
				} catch (error) {
					const err = error as NodeJS.ErrnoException;
					if (err.code !== "ENOENT") {
						this.logger.warn(`Failed to delete file: ${key}`, err);
					}
				}
			}),
		);

		return { success: true };
	}

	getPublicUrl(key: string): string {
		return `${this.publicUrl}/public/${key}`;
	}

	async fileExists(key: string): Promise<boolean> {
		const filePath = path.join(this.publicDir, key);
		try {
			await fs.access(filePath);
			return true;
		} catch {
			return false;
		}
	}

	async cleanupFiles(...filePaths: (string | null)[]): Promise<void> {
		await Promise.all(
			filePaths.filter(Boolean).map(async (filePath) => {
				try {
					await fs.unlink(filePath as string);
				} catch (error) {
					const err = error as NodeJS.ErrnoException;
					if (err.code !== "ENOENT") {
						this.logger.warn(`Failed to cleanup file: ${filePath}`, err);
					}
				}
			}),
		);
	}

	/**
	 * Get file content as Buffer.
	 */
	async getFile(key: string): Promise<Buffer> {
		const filePath = path.join(this.publicDir, key);
		try {
			return await fs.readFile(filePath);
		} catch (error) {
			this.logger.error(`Failed to read file: ${key}`, error);
			throw error;
		}
	}

	// =========================================================================
	// LOCAL-SPECIFIC UTILITIES
	// =========================================================================

	/**
	 * Generate a unique file key for local storage.
	 */
	generateKey(folder: string, filename: string): string {
		return `${folder}/${crypto.randomUUID()}-${filename}`;
	}

	/**
	 * Get full filesystem path for a key.
	 */
	getFilePath(key: string): string {
		return path.join(this.publicDir, key);
	}
}
