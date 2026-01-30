import { createZodDto } from "nestjs-zod";
import { openSourceUpdateDto } from "./open-source.update.dto";

export class OpenSourceUpdateClassDto extends createZodDto(
	openSourceUpdateDto,
) {}
