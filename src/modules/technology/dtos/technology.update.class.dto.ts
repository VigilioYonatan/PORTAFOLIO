import { createZodDto } from "nestjs-zod";
import { technologyUpdateDto } from "./technology.update.dto";

export class TechnologyUpdateClassDto extends createZodDto(
	technologyUpdateDto,
) {}
