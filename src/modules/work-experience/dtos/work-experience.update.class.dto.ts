import { createZodDto } from "nestjs-zod";
import { workExperienceUpdateDto } from "./work-experience.update.dto";

export class WorkExperienceUpdateClassDto extends createZodDto(
	workExperienceUpdateDto,
) {}
