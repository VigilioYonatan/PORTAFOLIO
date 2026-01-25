import { createZodDto } from "nestjs-zod";
import { aiConfigUpdateDto } from "./ai-config.update.dto";

export class AiConfigUpdateClassDto extends createZodDto(aiConfigUpdateDto) {}
