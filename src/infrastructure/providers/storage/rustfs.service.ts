import crypto from "node:crypto";
import { type ReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import {
	AbortMultipartUploadCommand,
	type CompletedPart,
	CompleteMultipartUploadCommand,
	CopyObjectCommand,
	CreateBucketCommand,
	CreateMultipartUploadCommand,
	DeleteObjectCommand,
	GetObjectCommand,
	HeadBucketCommand,
	HeadObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client,
	type S3ServiceException,
	UploadPartCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Environments } from "@infrastructure/config/server";
import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { getExtensionFromMime } from "@infrastructure/utils/hybrid";
import type { FilesSchema } from "@modules/uploads/schemas/upload.schema";
import {
	Injectable,
	InternalServerErrorException,
	Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
	MAX_RETRIES,
	MULTIPART_PART_EXPIRY,
	PRESIGNED_URL_EXPIRY,
	RETRY_BASE_DELAY_MS,
	SIGNED_URL_CACHE_TTL,
} from "./rustfs.const";

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
// SERVICE
// =============================================================================

@Injectable()
export class RustFSService {
	private readonly bucket: string;
	private readonly logger = new Logger(RustFSService.name);

	/**
	 * Primary S3 client for all operations.
	 * Uses internal endpoint for Docker networking, or public endpoint if they match.
	 */
	/**
	 * Primary S3 client for all operations.
	 * Uses internal endpoint for Docker networking, or public endpoint if they match.
	 */
	private readonly s3Client: S3Client | undefined;

	/**
	 * Optional signer client for presigned URLs.
	 * Only created if public endpoint differs from internal endpoint.
	 * This handles the Docker networking case where internal DNS != public URL.
	 */
	private readonly signerClient: S3Client | null | undefined;

	constructor(
		private readonly configService: ConfigService<Environments>,
		private readonly cacheService: CacheService,
	) {
		this.bucket = this.configService.getOrThrow("STORAGE_BUCKET_PUBLIC");
		const provider = this.configService.get("STORAGE_PROVIDER");

		if (provider === "LOCAL") {
			this.logger.log("Storage Provider is LOCAL. Skipping S3 initialization.");
			return;
		}

		const credentials = {
			accessKeyId: this.configService.getOrThrow("STORAGE_ACCESS_KEY"),
			secretAccessKey: this.configService.getOrThrow("STORAGE_SECRET_KEY"),
		};

		const region = this.configService.getOrThrow("STORAGE_REGION");
		const internalEndpoint = this.configService.getOrThrow(
			"STORAGE_INTERNAL_ENDPOINT",
		);
		const publicEndpoint = this.configService.getOrThrow("STORAGE_URL");

		// Primary client (always uses internal endpoint for Docker networking)
		this.s3Client = new S3Client({
			region,
			endpoint: internalEndpoint,
			credentials,
			forcePathStyle: true,
		});

		// Signer client: Only needed if endpoints differ (Docker internal vs public URL)
		if (internalEndpoint !== publicEndpoint) {
			this.signerClient = new S3Client({
				region,
				endpoint: publicEndpoint,
				credentials,
				forcePathStyle: true,
			});
			this.logger.log(
				"Dual-client mode: Using separate signer for presigned URLs",
			);
		} else {
			this.signerClient = null;
			this.logger.log(
				"Single-client mode: Same endpoint for internal and public access",
			);
		}

		this.ensureBucket();
	}

	// =========================================================================
	// BUCKET MANAGEMENT
	// =========================================================================

	private async ensureBucket(): Promise<void> {
		if (!this.s3Client) return;
		try {
			await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
			this.logger.log(`Bucket "${this.bucket}" verified`);
		} catch (_error) {
			this.logger.warn(`Bucket "${this.bucket}" not found, creating...`);
			try {
				await this.s3Client.send(
					new CreateBucketCommand({ Bucket: this.bucket }),
				);
				this.logger.log(`Bucket "${this.bucket}" created successfully`);
			} catch (createError) {
				this.logger.error(
					`Failed to create bucket "${this.bucket}"`,
					createError,
				);
			}
		}

		// Enforce Public Bucket Policy (Crucial for accessing files via public URL explicitly)
		await this.setPublicBucketPolicy();
		// Enforce CORS for Multiparts uploads
		await this.setPublicBucketCors();
	}

	private async setPublicBucketPolicy(): Promise<void> {
		if (!this.s3Client) return;
		const policy = {
			Version: "2012-10-17",
			Statement: [
				{
					Effect: "Allow",
					Principal: { AWS: ["*"] },
					Action: ["s3:GetObject"],
					Resource: [`arn:aws:s3:::${this.bucket}/*`],
				},
			],
		};

		try {
			// Import dynamically or ensure it is imported
			const { PutBucketPolicyCommand } = await import("@aws-sdk/client-s3");
			await this.s3Client.send(
				new PutBucketPolicyCommand({
					Bucket: this.bucket,
					Policy: JSON.stringify(policy),
				}),
			);
			this.logger.log(`Bucket policy for "${this.bucket}" set to public-read`);
		} catch (error) {
			this.logger.warn(
				`Failed to set public bucket policy for "${this.bucket}"`,
				error,
			);
		}
	}

	private async setPublicBucketCors(): Promise<void> {
		if (!this.s3Client) return;
		
		const corsOrigins = this.configService.get("CORS_ORIGINS") || "*";
		
		try {
			const { PutBucketCorsCommand } = await import("@aws-sdk/client-s3");
			await this.s3Client.send(
				new PutBucketCorsCommand({
					Bucket: this.bucket,
					CORSConfiguration: {
						CORSRules: [
							{
								AllowedHeaders: ["*"],
								AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
								AllowedOrigins: corsOrigins === "*" ? ["*"] : corsOrigins.split(","),
								ExposeHeaders: ["ETag"],
								MaxAgeSeconds: 3000,
							},
						],
					},
				}),
			);
			this.logger.log(`Bucket CORS for "${this.bucket}" configured successfully`);
		} catch (error) {
			this.logger.warn(
				`Failed to set bucket CORS for "${this.bucket}"`,
				error,
			);
		}
	}

	// =========================================================================
	// CORE S3 OPERATIONS
	// =========================================================================

	/**
	 * Upload a file to S3 with automatic retry logic.
	 */
	async uploadFile(
		key: string,
		file: Buffer | ReadStream,
		mimetype: string,
	): Promise<UploadResult> {
		return this.withRetry(async () => {
			if (!this.s3Client) {
				throw new InternalServerErrorException("S3 client is not initialized");
			}

			const upload = new Upload({
				client: this.s3Client,
				params: {
					Bucket: this.bucket,
					Key: key,
					Body: file,
					ContentType: mimetype,
				},
			});

			await upload.done();

			const publicEndpoint = this.configService.get("STORAGE_URL");
			return {
				key,
				url: `${publicEndpoint}/${this.bucket}/${key}`,
			};
		}, `uploadFile(${key})`);
	}

	/**
	 * Delete one or more files from S3.
	 */
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
			keysToDelete.map((key) =>
				this.withRetry(() => {
					if (!this.s3Client) {
						throw new InternalServerErrorException(
							"S3 client is not initialized",
						);
					}
					return this.s3Client.send(
						new DeleteObjectCommand({
							Bucket: this.bucket,
							Key: key,
						}),
					);
				}, `removeFile(${key})`),
			),
		);

		return { success: true };
	}

	/**
	 * Check if a file exists in S3.
	 */
	async fileExists(key: string): Promise<boolean> {
		if (!this.s3Client) return false;
		try {
			await this.s3Client.send(
				new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
			);
			return true;
		} catch (error) {
			const s3Error = error as S3ServiceException;
			if (
				s3Error.name === "NotFound" ||
				s3Error.$metadata?.httpStatusCode === 404
			) {
				return false;
			}
			this.logger.error(`Error checking file existence for "${key}"`, error);
			throw error;
		}
	}

	/**
	 * Get a presigned URL for downloading a file.
	 */
	async getSecureFileUrl(
		key: string,
		expirySeconds: number = MULTIPART_PART_EXPIRY,
	): Promise<string> {
		const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
		return getSignedUrl(this.getSignerClient(), command, {
			expiresIn: expirySeconds,
		});
	}

	/**
	 * Get a cached presigned URL for private files.
	 * Uses Redis for caching across load-balanced instances.
	 * Best for: private files with high access frequency.
	 */
	async getSmartUrl(key: string): Promise<string> {
		const cacheKey = `signed-url:${this.bucket}:${key}`;

		// 1. Try to get from cache (Redis in production, memory in dev)
		const cachedUrl = await this.cacheService.get<string>(cacheKey);
		if (cachedUrl) {
			this.logger.debug(`Cache HIT for key: ${key}`);
			return cachedUrl;
		}

		// 2. Generate new signed URL
		this.logger.debug(`Cache MISS for key: ${key}, generating new URL`);
		const signedUrl = await this.getSecureFileUrl(key, MULTIPART_PART_EXPIRY);

		// 3. Cache with TTL (50 min, 10 min safety margin before URL expires)
		await this.cacheService.set(
			cacheKey,
			signedUrl,
			SIGNED_URL_CACHE_TTL * 1000,
		);

		return signedUrl;
	}

	/**
	 * Get a direct public URL for files (no signing, no caching needed).
	 * Best for: public assets accessible via CDN.
	 */
	getPublicUrl(key: string): string {
		const publicEndpoint = this.configService.get("STORAGE_URL");
		return `${publicEndpoint}/${this.bucket}/${key}`;
	}

	// =========================================================================
	// TEMP FILES MANAGEMENT
	// =========================================================================

	/**
	 * Copy a file within the same bucket.
	 * Used to move files from temp/ to final destination.
	 */
	async copyFile(sourceKey: string, destKey: string): Promise<void> {
		if (!this.s3Client) {
			throw new InternalServerErrorException("S3 client is not initialized");
		}
		return this.withRetry(async () => {
			const command = new CopyObjectCommand({
				Bucket: this.bucket,
				CopySource: `${this.bucket}/${sourceKey}`,
				Key: destKey,
			});

			await this.s3Client!.send(command);
			this.logger.debug(`File copied: ${sourceKey} → ${destKey}`);
		}, `copyFile(${sourceKey})`);
	}

	/**
	 * List all files with a given prefix.
	 * Used for cleanup operations.
	 */
	async listFiles(
		prefix: string,
	): Promise<Array<{ key: string; lastModified: Date }>> {
		try {
			const command = new ListObjectsV2Command({
				Bucket: this.bucket,
				Prefix: prefix,
			});

			if (!this.s3Client) return [];

			const response = await this.s3Client.send(command);

			return (response.Contents || []).map((obj) => ({
				key: obj.Key!,
				lastModified: obj.LastModified!,
			}));
		} catch (error) {
			this.logger.error(`Error listing files with prefix "${prefix}"`, error);
			return [];
		}
	}

	/**
	 * Get file metadata (size, content type, last modified).
	 */
	async getFileMetadata(key: string): Promise<{
		size: number;
		contentType: string;
		lastModified: Date;
	}> {
		const command = new HeadObjectCommand({
			Bucket: this.bucket,
			Key: key,
		});

		if (!this.s3Client) {
			throw new InternalServerErrorException("S3 client is not initialized");
		}

		const response = await this.s3Client.send(command);

		return {
			size: response.ContentLength || 0,
			contentType: response.ContentType || "application/octet-stream",
			lastModified: response.LastModified || new Date(),
		};
	}

	/**
	 * Cleanup all temp files for a specific session.
	 * Returns the number of files deleted.
	 */
	async cleanupTempSession(sessionId: string): Promise<number> {
		const prefix = `temp/${sessionId}/`;
		const files = await this.listFiles(prefix);

		if (files.length === 0) return 0;

		await Promise.all(files.map((file) => this.removeFile(file.key)));

		this.logger.log(
			`Cleaned up ${files.length} temp files for session ${sessionId}`,
		);
		return files.length;
	}

	/**
	 * Cleanup all temp files older than the specified hours.
	 * Used by the cron job.
	 */
	async cleanupOldTempFiles(olderThanHours = 24): Promise<number> {
		const files = await this.listFiles("temp/");
		const cutoffDate = new Date();
		cutoffDate.setHours(cutoffDate.getHours() - olderThanHours);

		const filesToDelete = files.filter(
			(file) => file.lastModified < cutoffDate,
		);

		if (filesToDelete.length === 0) return 0;

		await Promise.all(filesToDelete.map((file) => this.removeFile(file.key)));

		this.logger.log(`Deleted ${filesToDelete.length} old temp files`);
		return filesToDelete.length;
	}

	// =========================================================================
	// PRESIGNED URL - SIMPLE UPLOAD STRATEGY
	// =========================================================================

	/**
	 * Verify the signature of a local upload request.
	 */
	verifyLocalSignature(key: string, signature: string): boolean {
		const secret = this.configService.getOrThrow("STORAGE_SECRET_KEY");
		const expected = crypto
			.createHmac("sha256", secret)
			.update(key)
			.digest("hex");
		return signature === expected;
	}

	/**
	 * Generate a presigned URL for direct browser upload.
	 * Best for files < 100MB.
	 */
	async getPresignedUrlSimple(
		fileName: string,
		fileType?: string,
		folder = "uploads",
	): Promise<{ uploadUrl: string; key: string }> {
		let finalFileName = fileName;

		// Ensure extension
		const ext = path.extname(fileName);
		if (!ext && fileType) {
			const fallbackExt = getExtensionFromMime(fileType);
			if (fallbackExt) {
				finalFileName = `${fileName}.${fallbackExt}`;
			}
		}

		const key = `${folder}/${crypto.randomUUID()}-${finalFileName}`;
		const provider = this.configService.get("STORAGE_PROVIDER");

		// local simulation
		if (provider === "LOCAL") {
			const publicUrl = this.configService.get("PUBLIC_URL");
			const secret = this.configService.getOrThrow("STORAGE_SECRET_KEY");
			const signature = crypto
				.createHmac("sha256", secret)
				.update(key)
				.digest("hex");
			const uploadUrl = `${publicUrl}/api/v1/upload/local/put?key=${encodeURIComponent(key)}&signature=${signature}`;
			this.logger.debug(`Local simulation upload URL generated for "${key}"`);
			return { uploadUrl, key };
		}

		try {
			const command = new PutObjectCommand({
				Bucket: this.bucket,
				Key: key,
				ContentType: fileType || "application/octet-stream",
			});
			const uploadUrl = await getSignedUrl(this.getSignerClient(), command, {
				expiresIn: PRESIGNED_URL_EXPIRY,
			});

			this.logger.debug(`Presigned URL generated for "${key}"`);
			return { uploadUrl, key };
		} catch (error) {
			this.logger.error(
				`Failed to generate presigned URL for "${fileName}"`,
				error,
			);
			throw new InternalServerErrorException("Failed to generate upload URL");
		}
	}

	// =========================================================================
	// MULTIPART UPLOAD STRATEGY
	// =========================================================================

	/**
	 * Initialize a multipart upload session.
	 * Best for files > 100MB.
	 */
	async createMultipartUpload(
		fileName: string,
		fileType: string,
		folder = "uploads",
	): Promise<MultipartInitResult> {
		let finalFileName = fileName;

		// Ensure extension
		const ext = path.extname(fileName);
		if (!ext) {
			const fallbackExt = getExtensionFromMime(fileType);
			if (fallbackExt) {
				finalFileName = `${fileName}.${fallbackExt}`;
			}
		}

		const key = `${folder}/${crypto.randomUUID()}-${finalFileName}`;

		try {
			if (!this.s3Client) {
				throw new InternalServerErrorException("S3 client is not initialized");
			}

			const { UploadId: uploadId } = await this.s3Client.send(
				new CreateMultipartUploadCommand({
					Bucket: this.bucket,
					Key: key,
					ContentType: fileType,
				}),
			);

			if (!uploadId) {
				throw new Error("S3 did not return an upload ID");
			}

			this.logger.debug(`Multipart upload initiated: ${uploadId}`);
			return { uploadId, key };
		} catch (error) {
			this.logger.error(
				`Failed to init multipart upload for "${fileName}"`,
				error,
			);
			throw new InternalServerErrorException(
				"Failed to initialize multipart upload",
			);
		}
	}

	/**
	 * Generate a presigned URL for uploading a specific part.
	 */
	async signMultipartUploadPart(
		key: string,
		uploadId: string,
		partNumber: number,
	): Promise<SignedPartResult> {
		try {
			const command = new UploadPartCommand({
				Bucket: this.bucket,
				Key: key,
				UploadId: uploadId,
				PartNumber: partNumber,
			});

			const url = await getSignedUrl(this.getSignerClient(), command, {
				expiresIn: MULTIPART_PART_EXPIRY,
			});

			return { url };
		} catch (error) {
			this.logger.error(
				`Failed to sign part ${partNumber} for "${key}"`,
				error,
			);
			throw new InternalServerErrorException(
				`Failed to sign upload part ${partNumber}`,
			);
		}
	}

	/**
	 * Complete a multipart upload by merging all parts.
	 */
	async completeMultipartUpload(
		key: string,
		uploadId: string,
		parts: CompletedPart[],
	): Promise<{ location: string }> {
		try {
			if (!this.s3Client) {
				throw new InternalServerErrorException("S3 client is not initialized");
			}

			await this.s3Client.send(
				new CompleteMultipartUploadCommand({
					Bucket: this.bucket,
					Key: key,
					UploadId: uploadId,
					MultipartUpload: { Parts: parts },
				}),
			);

			this.logger.debug(`Multipart upload completed: ${key}`);
			return { location: key };
		} catch (error) {
			this.logger.error(
				`Failed to complete multipart upload for "${key}"`,
				error,
			);
			throw new InternalServerErrorException(
				"Failed to complete multipart upload",
			);
		}
	}

	/**
	 * Abort/cancel a multipart upload.
	 */
	async abortMultipartUpload(
		uploadId: string,
		key: string,
	): Promise<{ success: boolean }> {
		try {
			if (!this.s3Client) {
				throw new InternalServerErrorException("S3 client is not initialized");
			}

			await this.s3Client.send(
				new AbortMultipartUploadCommand({
					Bucket: this.bucket,
					Key: key,
					UploadId: uploadId,
				}),
			);

			this.logger.debug(`Multipart upload aborted: ${uploadId}`);
			return { success: true };
		} catch (error) {
			this.logger.error(
				`Failed to abort multipart upload "${uploadId}"`,
				error,
			);
			throw new InternalServerErrorException(
				"Failed to abort multipart upload",
			);
		}
	}

	// =========================================================================
	// HEALTH CHECK
	// =========================================================================

	/**
	 * Check if S3 storage is healthy and accessible.
	 */
	async checkHealth(): Promise<boolean> {
		if (!this.s3Client) return true; // Local storage is always considered healthy if skipped
		try {
			await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
			return true;
		} catch (error) {
			this.logger.error("S3 health check failed", error);
			return false;
		}
	}

	// =========================================================================
	// PRIVATE UTILITIES
	// =========================================================================

	/**
	 * Get the appropriate client for signing presigned URLs.
	 * Returns signerClient if available (different public endpoint), otherwise primary client.
	 */
	private getSignerClient(): S3Client {
		const client = this.signerClient ?? this.s3Client;
		if (!client) {
			throw new InternalServerErrorException("S3 client is not initialized");
		}
		return client;
	}

	/**
	 * Execute an operation with exponential backoff retry.
	 */
	private async withRetry<T>(
		operation: () => Promise<T>,
		operationName: string,
	): Promise<T> {
		let lastError: Error | undefined;

		for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
			try {
				return await operation();
			} catch (error) {
				lastError = error as Error;
				const isRetryable = this.isRetryableError(error);

				if (!isRetryable || attempt === MAX_RETRIES) {
					this.logger.error(
						`${operationName} failed after ${attempt} attempt(s)`,
						error,
					);
					throw new InternalServerErrorException(
						`S3 operation failed: ${operationName}`,
					);
				}

				const delay = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
				this.logger.warn(
					`${operationName} failed (attempt ${attempt}/${MAX_RETRIES}), retrying in ${delay}ms...`,
				);
				await this.sleep(delay);
			}
		}

		throw lastError;
	}

	/**
	 * Determine if an error is retryable.
	 */
	private isRetryableError(error: unknown): boolean {
		const s3Error = error as S3ServiceException;
		const retryableCodes = [
			"NetworkingError",
			"TimeoutError",
			"ThrottlingException",
			"ServiceUnavailable",
		];
		return (
			retryableCodes.includes(s3Error.name) ||
			s3Error.$metadata?.httpStatusCode === 503
		);
	}

	/**
	 * Sleep for a specified duration.
	 */
	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Clean up temporary files.
	 */
	/**
	 * Clean up temporary files.
	 */
	/**
	 * Clean up temporary files.
	 */
	public async cleanupFiles(...filePaths: (string | null)[]): Promise<void> {
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
	 * Get file content as Buffer from S3.
	 */
	async getFile(key: string): Promise<Buffer> {
		if (!this.s3Client) {
			throw new InternalServerErrorException("S3 client is not initialized");
		}

		try {
			const command = new GetObjectCommand({
				Bucket: this.bucket,
				Key: key,
			});

			const response = await this.s3Client.send(command);

			if (!response.Body) {
				throw new Error("Empty response body from S3");
			}

			// Convert stream to buffer
			const byteArray = await response.Body.transformToByteArray();
			return Buffer.from(byteArray);
		} catch (error) {
			this.logger.error(`Failed to get file "${key}"`, error);
			throw new InternalServerErrorException(`Failed to get file: ${key}`);
		}
	}
}
