import { createZodDto } from "nestjs-zod";
import { aiInsightQueryDto } from "./ai-insight.query.dto";

export class AiInsightQueryClassDto extends createZodDto(aiInsightQueryDto) {}
