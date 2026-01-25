import { createZodDto } from "nestjs-zod";
import {
	aiInsightGenerateResponseDto,
	aiInsightIndexResponseDto,
} from "./analytics.response.dto";

export class AiInsightIndexResponseClassDto extends createZodDto(
	aiInsightIndexResponseDto,
) {}
export class AiInsightGenerateResponseClassDto extends createZodDto(
	aiInsightGenerateResponseDto,
) {}
