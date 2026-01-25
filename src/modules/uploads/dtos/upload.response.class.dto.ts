import { createZodDto } from "nestjs-zod";
import {
	uploadDeleteResponseDto,
	uploadMultipartCompleteResponseDto,
	uploadMultipartInitResponseDto,
	uploadPresignedUrlResponseDto,
	uploadProviderResponseDto,
	uploadResponseDto,
	uploadSignedPartResponseDto,
} from "./upload.response.dto";

export class UploadProviderResponseClassDto extends createZodDto(
	uploadProviderResponseDto,
) {}
export class UploadResponseClassDto extends createZodDto(uploadResponseDto) {}
export class UploadPresignedUrlResponseClassDto extends createZodDto(
	uploadPresignedUrlResponseDto,
) {}
export class UploadMultipartInitResponseClassDto extends createZodDto(
	uploadMultipartInitResponseDto,
) {}
export class UploadSignedPartResponseClassDto extends createZodDto(
	uploadSignedPartResponseDto,
) {}
export class UploadMultipartCompleteResponseClassDto extends createZodDto(
	uploadMultipartCompleteResponseDto,
) {}
export class UploadDeleteResponseClassDto extends createZodDto(
	uploadDeleteResponseDto,
) {}
