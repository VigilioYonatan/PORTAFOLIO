import fs from "node:fs/promises";
import path from "node:path";
import { RustFSService } from "@infrastructure/providers/storage/rustfs.service";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

/**
 * Service that handles cleanup of temporary uploaded files.
 * Runs a cron job every hour to delete temp files older than 24 hours.
 */
@Injectable()
export class UploadCleanupService {
	private readonly logger = new Logger(UploadCleanupService.name);

	constructor(private readonly rustFSService: RustFSService) {}

	/**
	 * Cron job that runs every hour.
	 * Deletes temp files older than 24 hours.
	 */
	@Cron(CronExpression.EVERY_HOUR)
	async handleCleanup(): Promise<void> {
		this.logger.log("Starting temp files cleanup...");

		try {
			// Clean S3 temp files (legacy/orphaned)
			const deletedS3 = await this.rustFSService.cleanupOldTempFiles(24);

			// Clean local temp files (media processing)
			const deletedLocal = await this.cleanLocalTempFiles(24);

			if (deletedS3 > 0 || deletedLocal > 0) {
				this.logger.log(
					`Cleanup completed: S3=${deletedS3}, Local=${deletedLocal} files`,
				);
			} else {
				this.logger.debug("Cleanup completed: No old temp files to delete");
			}
		} catch (error) {
			this.logger.error("Error during temp files cleanup:", error);
		}
	}

	/**
	 * Clean local temp files used for media processing.
	 */
	private async cleanLocalTempFiles(olderThanHours: number): Promise<number> {
		// Assuming TEMP_DIR is available or we reconstruct it.
		// Best to get it from a shared constant or config.
		// For now I'll use the same path as MediaProcessor: src/assets/temp
		const tempDir = path.join(process.cwd(), "src", "assets", "temp"); // Hardcoded 'temp' based on previous context

		try {
			const files = await fs.readdir(tempDir);
			const cutoffTime = Date.now() - olderThanHours * 60 * 60 * 1000;
			let deletedCount = 0;

			for (const file of files) {
				const filePath = path.join(tempDir, file);
				try {
					const stats = await fs.stat(filePath);
					if (stats.isFile() && stats.mtimeMs < cutoffTime) {
						await fs.unlink(filePath);
						deletedCount++;
					}
				} catch (_err) {
					// Ignore errors for individual files (e.g. permission or disappeared)
				}
			}
			return deletedCount;
		} catch (_error) {
			// If dir doesn't exist, just return 0
			return 0;
		}
	}

	/**
	 * Manual cleanup for testing or on-demand cleanup.
	 */
	async triggerCleanup(olderThanHours = 24): Promise<number> {
		this.logger.log(
			`Manual cleanup triggered (files older than ${olderThanHours} hours)`,
		);
		const local = await this.cleanLocalTempFiles(olderThanHours);
		const s3 = await this.rustFSService.cleanupOldTempFiles(olderThanHours);
		return local + s3;
	}
}
