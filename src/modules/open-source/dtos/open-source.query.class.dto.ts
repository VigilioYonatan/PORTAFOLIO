import { createZodDto } from "nestjs-zod";
import { openSourceQueryDto } from "./open-source.query.dto";

export class OpenSourceQueryClassDto extends createZodDto(openSourceQueryDto) {}
