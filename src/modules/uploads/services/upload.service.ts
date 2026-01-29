import crypto from "node:crypto";
import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { MediaProcessorService } from "@infrastructure/providers/storage/services/media-processor.service";
import { StorageFactory } from "@infrastructure/providers/storage/storage.factory";
import { getExtensionFromMime, now } from "@infrastructure/utils/hybrid";
import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import type { Request } from "express";
import { type Fields, type File, formidable } from "formidable";
import {
	type EntityFile,
	type EntityFileProperty,
	UPLOAD_CONFIG,
	type UploadConfig,
} from "../const/upload.const";
import type {
	UploadDeleteResponseDto,
	UploadFormidableResponseDto,
	UploadMultipartCompleteResponseDto,
	UploadMultipartInitResponseDto,
	UploadPresignedUrlResponseDto,
	UploadSignedPartResponseDto,
} from "../dtos/upload.response.dto";
import type { FilesSchema } from "../schemas/upload.schema";

/** Error code when file size exceeds formidable limit */
const FORMIDABLE_MAX_SIZE_ERROR = 1009;

@Injectable()
export class UploadService {
	private readonly logger = new Logger(UploadService.name);
	constructor(
		private readonly storageFactory: StorageFactory,
		private readonly mediaProcessor: MediaProcessorService,
	) {}

	/**
	 * Get the current storage provider.
	 */
	private get storage() {
		return this.storageFactory.getProvider();
	}

	/**
	 * Get the current storage provider type.
	 */
	public get providerType() {
		return this.storageFactory.getProviderType();
	}

	public getProvider(): { success: true; data: { provider: string } } {
		return {
			success: true,
			data: { provider: this.providerType },
		};
	}

	/**
	 * Get upload rule for entity/property combination.
	 * Throws NotFoundException if not configured.
	 */
	private getUploadConfig(
		entity: EntityFile,
		property: EntityFileProperty,
	): UploadConfig {
		const entityConfig = UPLOAD_CONFIG[entity];
		if (!entityConfig) {
			throw new NotFoundException(
				`Entity '${entity}' not configured for uploads`,
			);
		}

		const rule = entityConfig[property];
		if (!rule) {
			throw new NotFoundException(
				`Property '${property}' not configured for uploads`,
			);
		}

		return rule;
	}

	/**
	 * Validate mime type against allowed types.
	 * Throws BadRequestException if invalid.
	 */
	private validateMimeType(fileType: string, rule: UploadConfig): void {
		if (rule.mime_types.length > 0 && !rule.mime_types.includes(fileType)) {
			throw new BadRequestException(
				`Invalid file type: ${fileType}. Allowed: ${rule.mime_types.join(", ")}`,
			);
		}
	}

	/**
	 * Upload files directly to final storage using formidable and MediaProcessor.
	 * Uses the configured storage provider (LOCAL or S3).
	 */
	async uploadFormidable(
		req: Request,
		entity: EntityFile,
		property: EntityFileProperty,
		_sessionId?: string, // SessionID is no longer used for temp folders
	): Promise<UploadFormidableResponseDto> {
		const rule = this.getUploadConfig(entity, property);

		const form = formidable({
			keepExtensions: true,
			multiples: rule.max_files > 1,
			maxFileSize: rule.max_size,
			filter: ({ mimetype }) => {
				if (rule.mime_types.length === 0) return true;
				return rule.mime_types.includes(mimetype!);
			},
		});

		const { files, filename, fields } = await this.parseFormData(
			form,
			req,
			rule,
		);

		// DIRECT UPLOAD: No temp folder logic.
		const targetFolder = rule.folder || "uploads";

		// Process and upload files
		const results: FilesSchema[] = [];

		await Promise.all(
			files.map(async (file) => {
				let tempFilePathToDelete: string | null = null;
				try {
					const finalFilename = filename || crypto.randomUUID();
					let originalExt = path
						.extname(file.originalFilename || "")
						.replace(".", "");

					if (!originalExt && file.mimetype) {
						originalExt = getExtensionFromMime(file.mimetype) || "bin";
					}
					if (!originalExt) originalExt = "bin";
					const keyBase = `${targetFolder}/${finalFilename}`;
					// --- IMAGES ---
					if (file.mimetype?.startsWith("image/")) {
						const imageResults = await this.mediaProcessor.processImage(
							file,
							rule.dimensions,
						);

						for (const item of imageResults) {
							const upload = await this.storage.uploadFile(
								`${keyBase}.${item.dimension}.webp`,
								item.buffer,
								"image/webp",
							);
							results.push({
								key: upload.key,
								mimetype: "image/webp",
								size: item.size,
								name: finalFilename,
								original_name: file.originalFilename || finalFilename,
								dimension: item.dimension,
								created_at: now().toDate(),
							});
						}
						return;
					}

					// --- VIDEOS ---
					if (file.mimetype?.startsWith("video/")) {
						const videoResult = await this.mediaProcessor.processVideo(
							file,
							finalFilename,
						);
						tempFilePathToDelete = videoResult.path;

						const stats = await fs.stat(videoResult.path);
						const fileStream = createReadStream(videoResult.path);
						const uploadResult = await this.storage.uploadFile(
							`${keyBase}.mp4`,
							fileStream,
							"video/mp4",
						);

						results.push({
							key: uploadResult.key,
							mimetype: "video/mp4",
							size: stats.size,
							name: finalFilename,
							original_name: file.originalFilename || finalFilename,
							created_at: now().toDate(),
						});
						return;
					}

					// --- GENERIC FILES ---
					const fileStream = createReadStream(file.filepath);
					const uploadResult = await this.storage.uploadFile(
						`${keyBase}.${originalExt}`,
						fileStream,
						file.mimetype || "application/octet-stream",
					);

					results.push({
						key: uploadResult.key,
						mimetype: file.mimetype || "application/octet-stream",
						size: file.size,
						name: finalFilename,
						original_name: file.originalFilename || finalFilename,
						created_at: now().toDate(),
					});
				} catch (error) {
					this.logger.error(
						`Failed to process/upload "${file.originalFilename}"`,
						error,
					);
				} finally {
					// Cleanup local temp file from formidable and media processor
					await this.storage.cleanupFiles(file.filepath, tempFilePathToDelete);
				}
			}),
		);

		return { success: true, data: results, fields };
	}

	/**
	 * Parse form data with formidable.
	 */
	public parseFormData(
		form: ReturnType<typeof formidable>,
		req: Request,
		rule: UploadConfig,
	): Promise<{ files: File[]; filename?: string; fields: Fields }> {
		return new Promise((resolve, reject) => {
			form.parse(req, (err, fields, files) => {
				if (err) {
					if (err.code === FORMIDABLE_MAX_SIZE_ERROR) {
						return reject(
							new BadRequestException(
								`File size exceeds limit of ${rule.max_size / 1024 / 1024}MB`,
							),
						);
					}
					return reject(
						new BadRequestException(`Error parsing file: ${err.message}`),
					);
				}

				const fileInput = files.file;
				if (!fileInput) {
					return reject(
						new BadRequestException("No file uploaded or invalid type"),
					);
				}

				const filesArray = Array.isArray(fileInput) ? fileInput : [fileInput];
				const filename = Array.isArray(fields.filename)
					? fields.filename[0]
					: fields.filename;

				resolve({ files: filesArray, filename, fields });
			});
		});
	}

	async getPresignedUrl(
		entity: EntityFile,
		property: EntityFileProperty,
		fileName: string,
		fileType?: string,
	): Promise<UploadPresignedUrlResponseDto> {
		const rule = this.getUploadConfig(entity, property);

		if (fileType) {
			this.validateMimeType(fileType, rule);
		}

		// Presigned URLs only work with S3
		const s3Provider = this.storageFactory.getS3Provider();
		const result = await s3Provider.rustFS.getPresignedUrlSimple(
			fileName,
			fileType,
			rule.folder,
		);
		return { success: true, data: result };
	}

	async getSignedDownloadUrl(key: string): Promise<string> {
		// Use RustFSService directly for now, assuming S3 provider.
		// If LOCAL, we might need a different strategy (e.g. serving from static folder)
		// But for now assuming S3/RustFS logic.
		const s3Provider = this.storageFactory.getS3Provider();
		return s3Provider.rustFS.getSecureFileUrl(key);
	}

	async removeFiles(files: FilesSchema[] | null | undefined): Promise<void> {
		if (!files || files.length === 0) return;
		await Promise.all(files.map((file) => this.storage.removeFile(file.key)));
	}

	async deleteByKey(key: string | string[]): Promise<UploadDeleteResponseDto> {
		if (!key) {
			throw new InternalServerErrorException("Missing file key(s).");
		}
		try {
			const keys = Array.isArray(key) ? key : [key];
			await Promise.all(keys.map((k) => this.storage.removeFile(k)));

			return {
				success: true,
				data: { message: "File(s) deleted successfully", key },
			};
		} catch (error) {
			throw new InternalServerErrorException(
				`Error deleting file from storage. ${(error as Error).message}`,
			);
		}
	}

	async createMultipart(
		entity: EntityFile,
		property: EntityFileProperty,
		fileName: string,
		fileType: string,
	): Promise<UploadMultipartInitResponseDto> {
		const rule = this.getUploadConfig(entity, property);
		this.validateMimeType(fileType, rule);

		// Multipart only works with S3
		const s3Provider = this.storageFactory.getS3Provider();
		const result = await s3Provider.rustFS.createMultipartUpload(
			fileName,
			fileType,
			rule.folder,
		);
		return { success: true, data: result };
	}

	async signPart(
		key: string,
		uploadId: string,
		partNumber: number,
	): Promise<UploadSignedPartResponseDto> {
		const s3Provider = this.storageFactory.getS3Provider();
		const result = await s3Provider.rustFS.signMultipartUploadPart(
			key,
			uploadId,
			partNumber,
		);
		return { success: true, data: result };
	}

	async completeMultipart(
		key: string,
		uploadId: string,
		parts: { ETag: string; PartNumber: number }[],
	): Promise<UploadMultipartCompleteResponseDto> {
		const s3Provider = this.storageFactory.getS3Provider();
		const result = await s3Provider.rustFS.completeMultipartUpload(
			key,
			uploadId,
			parts,
		);
		return { success: true, data: result };
	}

	async getFileBuffer(key: string): Promise<Buffer> {
		return this.storage.getFile(key);
	}

	/**
	 * Internal helper for S3 simple simulation in LOCAL mode.
	 */
	async handleLocalPut(req: Request, key: string): Promise<void> {
		// Use storage provider directly (should be LocalStorageProvider)
		await this.storage.uploadFile(key, req as any, "application/octet-stream");
	}
}
