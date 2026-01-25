import { createZodDto } from "nestjs-zod";
import {
	aiConfigShowResponseDto,
	aiConfigUpdateResponseDto,
} from "./ai.response.dto";

export class AiConfigShowResponseClassDto extends createZodDto(
	aiConfigShowResponseDto,
) {}
export class AiConfigUpdateResponseClassDto extends createZodDto(
	aiConfigUpdateResponseDto,
) {}
