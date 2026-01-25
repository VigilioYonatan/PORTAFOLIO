import { createZodDto } from "nestjs-zod";
import { workExperienceQueryDto } from "./work-experience.query.dto";

export class WorkExperienceQueryClassDto extends createZodDto(
	workExperienceQueryDto,
) {}
