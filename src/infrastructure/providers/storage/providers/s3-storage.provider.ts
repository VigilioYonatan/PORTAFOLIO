import type { ReadStream } from "node:fs";
import type { FilesSchema } from "@modules/uploads/schemas/upload.schema";
import { Injectable } from "@nestjs/common";
import type {
	StorageProvider,
	UploadResult,
} from "../interfaces/storage-provider.interface";
import { RustFSService } from "../rustfs.service";

// =============================================================================
// S3 STORAGE PROVIDER
// =============================================================================

/**
 * S3/MinIO storage provider.
 * Wraps the existing RustFSService to implement the StorageProvider interface.
 */
@Injectable()
export class S3StorageProvider implements StorageProvider {
	constructor(private readonly rustFSService: RustFSService) {}

	async uploadFile(
		key: string,
		file: Buffer | ReadStream,
		mimetype: string,
	): Promise<UploadResult> {
		return this.rustFSService.uploadFile(key, file, mimetype);
	}

	async removeFile(
		files: FilesSchema[] | string | string[],
	): Promise<{ success: boolean }> {
		return this.rustFSService.removeFile(files);
	}

	getPublicUrl(key: string): string {
		return this.rustFSService.getPublicUrl(key);
	}

	async fileExists(key: string): Promise<boolean> {
		return this.rustFSService.fileExists(key);
	}

	async cleanupFiles(...filePaths: (string | null)[]): Promise<void> {
		return this.rustFSService.cleanupFiles(...filePaths);
	}

	/**
	 * Get file content as Buffer.
	 */
	async getFile(key: string): Promise<Buffer> {
		return this.rustFSService.getFile(key);
	}

	// =========================================================================
	// S3-SPECIFIC (delegate to RustFSService)
	// =========================================================================

	get rustFS(): RustFSService {
		return this.rustFSService;
	}
}
