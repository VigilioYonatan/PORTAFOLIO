import { JwtAuthGuard } from "@infrastructure/guards/jwt-auth.guard";
import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
import { RustFSService } from "@infrastructure/providers/storage/rustfs.service";
import { Public } from "@modules/auth/decorators/public.decorator";
import { RolesGuard } from "@modules/auth/guards/roles.guard";
import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Req,
	UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import type { EntityFile, EntityFileProperty } from "../const/upload.const";
import {
	UploadDeleteClassDto,
	UploadMultipartCompleteClassDto,
	UploadMultipartCreateClassDto,
	UploadMultipartSignPartClassDto,
	UploadPresignedUrlClassDto,
} from "../dtos/upload.class.dto";
import {
	type UploadDeleteDto,
	type UploadMultipartCompleteDto,
	type UploadMultipartCreateDto,
	type UploadMultipartSignPartDto,
	type UploadPresignedUrlDto,
	uploadDeleteDto,
	uploadMultipartCompleteDto,
	uploadMultipartCreateDto,
	uploadMultipartSignPartDto,
	uploadPresignedUrlDto,
} from "../dtos/upload.request.dto";
import {
	UploadDeleteResponseClassDto,
	UploadMultipartCompleteResponseClassDto,
	UploadMultipartInitResponseClassDto,
	UploadPresignedUrlResponseClassDto,
	UploadProviderResponseClassDto,
	UploadResponseClassDto,
	UploadSignedPartResponseClassDto,
} from "../dtos/upload.response.class.dto";
import type {
	UploadDeleteResponseDto,
	UploadMultipartCompleteResponseDto,
	UploadMultipartInitResponseDto,
	UploadPresignedUrlResponseDto,
	UploadProviderResponseDto,
	UploadResponseDto,
	UploadSignedPartResponseDto,
} from "../dtos/upload.response.dto";
import { UploadService } from "../services/upload.service";

@ApiTags("Uploads")
@Controller("/upload")
export class UploadController {
	constructor(
		private readonly uploadService: UploadService,
		private readonly rustFSService: RustFSService,
	) {}

	@Public()
	@Get("/provider")
	@ApiOperation({ summary: "Get the current storage provider type" })
	@ApiResponse({ status: 200, type: UploadProviderResponseClassDto })
	async getProvider(): Promise<UploadProviderResponseDto> {
		return this.uploadService.getProvider();
	}

	// =========================================================================
	// DIRECT UPLOAD (Images/Formidable)
	// =========================================================================

	/**
	 * Upload file directly to S3/MinIO.
	 * Processes images/videos if applicable.
	 */
	@Public()
	@Post("/:entity/:property")
	@ApiOperation({ summary: "Upload file directly to storage" })
	@ApiResponse({ status: 201, type: UploadResponseClassDto })
	async upload(
		@Req() req: Request,
		@Param("entity") entity: EntityFile,
		@Param("property") property: EntityFileProperty,
	): Promise<UploadResponseDto> {
		const { fields, ...response } = await this.uploadService.uploadFormidable(
			req,
			entity,
			property,
		);
		return response;
	}

	// =========================================================================
	// PRESIGNED URL - SIMPLE UPLOAD
	// =========================================================================

	@Public()
	@Post("/:entity/:property/presigned-simple")
	@ApiOperation({ summary: "Get presigned URL for simple upload" })
	@ApiBody({ type: UploadPresignedUrlClassDto })
	@ApiResponse({ status: 201, type: UploadPresignedUrlResponseClassDto })
	async getPresignedUrl(
		@Param("entity") entity: EntityFile,
		@Param("property") property: EntityFileProperty,
		@Body(new ZodPipe(uploadPresignedUrlDto)) body: UploadPresignedUrlDto,
	): Promise<UploadPresignedUrlResponseDto> {
		return this.uploadService.getPresignedUrl(
			entity,
			property,
			body.fileName,
			body.fileType,
		);
	}

	@Public()
	@Put("/local/put")
	@ApiOperation({ summary: "Local simulation for presigned S3 PUT" })
	async localPut(@Req() req: Request): Promise<{ success: boolean }> {
		if (this.uploadService.providerType !== "LOCAL") {
			throw new BadRequestException(
				"This endpoint is only available for LOCAL storage provider",
			);
		}
		const key = req.query.key as string;
		const signature = req.query.signature as string;

		if (!key) throw new BadRequestException("Missing key");
		if (!signature) throw new BadRequestException("Missing signature");

		if (!this.rustFSService.verifyLocalSignature(key, signature)) {
			throw new BadRequestException("Invalid signature");
		}

		await this.uploadService.handleLocalPut(req, key);
		return { success: true };
	}

	// =========================================================================
	// MULTIPART UPLOAD
	// =========================================================================

	@Public()
	@Post("/:entity/:property/multipart-create")
	@ApiOperation({ summary: "Initialize multipart upload" })
	@ApiBody({ type: UploadMultipartCreateClassDto })
	@ApiResponse({ status: 201, type: UploadMultipartInitResponseClassDto })
	async createMultipart(
		@Param("entity") entity: EntityFile,
		@Param("property") property: EntityFileProperty,
		@Body(new ZodPipe(uploadMultipartCreateDto)) body: UploadMultipartCreateDto,
	): Promise<UploadMultipartInitResponseDto> {
		return this.uploadService.createMultipart(
			entity,
			property,
			body.filename,
			body.type,
		);
	}

	@Public()
	@Post("/multipart-sign-part")
	@ApiOperation({ summary: "Sign multipart upload part" })
	@ApiBody({ type: UploadMultipartSignPartClassDto })
	@ApiResponse({ status: 201, type: UploadSignedPartResponseClassDto })
	async signPart(
		@Body(new ZodPipe(uploadMultipartSignPartDto))
		body: UploadMultipartSignPartDto,
	): Promise<UploadSignedPartResponseDto> {
		return this.uploadService.signPart(
			body.key,
			body.uploadId,
			body.partNumber,
		);
	}

	@Public()
	@Post("/multipart-complete")
	@ApiOperation({ summary: "Complete multipart upload" })
	@ApiBody({ type: UploadMultipartCompleteClassDto })
	@ApiResponse({ status: 201, type: UploadMultipartCompleteResponseClassDto })
	async completeMultipart(
		@Body(new ZodPipe(uploadMultipartCompleteDto))
		body: UploadMultipartCompleteDto,
	): Promise<UploadMultipartCompleteResponseDto> {
		return this.uploadService.completeMultipart(
			body.key,
			body.uploadId,
			body.parts,
		);
	}

	// =========================================================================
	// DELETE FILE
	// =========================================================================

	/**
	 * Delete a file from storage.
	 * Receives the key in the body because keys can contain slashes (e.g., "blogs/uuid.webp")
	 */
	@UseGuards(JwtAuthGuard, RolesGuard)
	// @Roles("ADMIN", "MODERATOR")
	@Delete("/file")
	@ApiOperation({ summary: "Delete file from storage" })
	@ApiBody({ type: UploadDeleteClassDto })
	@ApiResponse({ status: 200, type: UploadDeleteResponseClassDto })
	async deleteFile(
		@Body(new ZodPipe(uploadDeleteDto)) body: UploadDeleteDto,
	): Promise<UploadDeleteResponseDto> {
		return this.uploadService.deleteByKey(body.key);
	}
}
