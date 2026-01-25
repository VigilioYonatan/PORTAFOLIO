import type { ReadStream } from "node:fs";
import type { FilesSchema } from "@modules/uploads/schemas/upload.schema";

// =============================================================================
// TYPES
// =============================================================================

export interface UploadResult {
	key: string;
	url: string;
}

export interface MultipartInitResult {
	uploadId: string;
	key: string;
}

export interface SignedPartResult {
	url: string;
}

// =============================================================================
// STORAGE PROVIDER INTERFACE
// =============================================================================

/**
 * Common interface for all storage providers.
 * Follows the Strategy pattern for swappable storage backends.
 */
export interface StorageProvider {
	/**
	 * Upload a file to storage.
	 */
	uploadFile(
		key: string,
		file: Buffer | ReadStream,
		mimetype: string,
	): Promise<UploadResult>;

	/**
	 * Delete one or more files from storage.
	 */
	removeFile(
		files: FilesSchema[] | string | string[],
	): Promise<{ success: boolean }>;

	/**
	 * Get the public URL for a file.
	 */
	getPublicUrl(key: string): string;

	/**
	 * Check if a file exists in storage.
	 */
	fileExists(key: string): Promise<boolean>;

	/**
	 * Clean up temporary local files.
	 */
	cleanupFiles(...filePaths: (string | null)[]): Promise<void>;

	/**
	 * Get file content as Buffer.
	 */
	getFile(key: string): Promise<Buffer>;
}

// =============================================================================
// STORAGE PROVIDER TOKEN
// =============================================================================

export const STORAGE_PROVIDER = Symbol("STORAGE_PROVIDER");
