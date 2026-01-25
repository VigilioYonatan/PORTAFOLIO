import { createZodDto } from "nestjs-zod";
import {
	uploadDeleteDto,
	uploadMultipartCompleteDto,
	uploadMultipartCreateDto,
	uploadMultipartSignPartDto,
	uploadPresignedUrlDto,
} from "./upload.request.dto";
// Request Class DTOs
export class UploadPresignedUrlClassDto extends createZodDto(
	uploadPresignedUrlDto,
) {}
export class UploadMultipartCreateClassDto extends createZodDto(
	uploadMultipartCreateDto,
) {}
export class UploadMultipartSignPartClassDto extends createZodDto(
	uploadMultipartSignPartDto,
) {}
export class UploadMultipartCompleteClassDto extends createZodDto(
	uploadMultipartCompleteDto,
) {}
export class UploadDeleteClassDto extends createZodDto(uploadDeleteDto) {}
