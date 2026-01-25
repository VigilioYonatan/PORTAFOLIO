import { createZodDto } from "nestjs-zod";
import {
	documentDestroyResponseDto,
	documentIndexResponseDto,
	documentProcessResponseDto,
	documentResponseDto,
	documentShowResponseDto,
	documentStoreResponseDto,
	documentUpdateResponseDto,
} from "./document.response.dto";

export class DocumentIndexResponseClassDto extends createZodDto(
	documentIndexResponseDto,
) {}
export class DocumentShowResponseClassDto extends createZodDto(
	documentShowResponseDto,
) {}
export class DocumentStoreResponseClassDto extends createZodDto(
	documentStoreResponseDto,
) {}
export class DocumentUpdateResponseClassDto extends createZodDto(
	documentUpdateResponseDto,
) {}
export class DocumentDestroyResponseClassDto extends createZodDto(
	documentDestroyResponseDto,
) {}
export class DocumentProcessResponseClassDto extends createZodDto(
	documentProcessResponseDto,
) {}
export class DocumentResponseClassDto extends createZodDto(
	documentResponseDto,
) {}
