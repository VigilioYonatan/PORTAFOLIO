import crypto from "node:crypto";
import { createWriteStream, type ReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import type { Environments } from "@infrastructure/config/server";
import type { FilesSchema } from "@modules/uploads/schemas/upload.schema";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
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
 * Public files: /public directory for direct serving via Express static.
 * Private files: /private-storage directory served via authenticated endpoint.
 */
@Injectable()
export class LocalStorageProvider implements StorageProvider {
	private readonly logger = new Logger(LocalStorageProvider.name);
	private readonly publicDir: string;
	private readonly privateDir: string;
	private readonly publicUrl: string;

	constructor(private readonly configService: ConfigService<Environments>) {
		// Resolve directories relative to project root
		this.publicDir = path.join(process.cwd(), "public");
		this.privateDir = path.join(process.cwd(), "private-storage");
		this.publicUrl = this.configService.getOrThrow("PUBLIC_URL");
		this.ensureDirectories();
	}

	private async ensureDirectories(): Promise<void> {
		try {
			await fs.mkdir(this.publicDir, { recursive: true });
			await fs.mkdir(this.privateDir, { recursive: true });
			this.logger.log(`Public directory verified: ${this.publicDir}`);
			this.logger.log(`Private directory verified: ${this.privateDir}`);
		} catch (error) {
			this.logger.error(`Failed to create storage directories`, error);
		}
	}

	async uploadFile(
		key: string,
		file: Buffer | ReadStream,
		_mimetype: string,
		isPublic = true,
	): Promise<UploadResult> {
		const baseDir = isPublic ? this.publicDir : this.privateDir;
		const filePath = path.join(baseDir, key);

		if (!filePath.startsWith(baseDir)) {
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

		this.logger.debug(
			`File uploaded locally (${isPublic ? "public" : "private"}): ${key}`,
		);

		return {
			key,
			url: isPublic ? this.getPublicUrl(key) : this.getPrivateUrl(key),
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
		return `${this.publicUrl}/${key}`;
	}

	getPrivateUrl(key: string): string {
		return `${this.publicUrl}/api/v1/upload/files/${encodeURIComponent(key)}`;
	}

	async fileExists(key: string, isPublic = true): Promise<boolean> {
		const baseDir = isPublic ? this.publicDir : this.privateDir;
		const filePath = path.join(baseDir, key);
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
	async getFile(key: string, isPublic = true): Promise<Buffer> {
		const baseDir = isPublic ? this.publicDir : this.privateDir;
		const filePath = path.join(baseDir, key);

		// Security: prevent path traversal
		if (!filePath.startsWith(baseDir)) {
			throw new NotFoundException("File not found");
		}

		try {
			return await fs.readFile(filePath);
		} catch (error) {
			this.logger.error(`Failed to read file: ${key}`, error);
			throw new NotFoundException("File not found");
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
