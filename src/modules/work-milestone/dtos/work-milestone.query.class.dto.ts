import { createZodDto } from "nestjs-zod";
import { workMilestoneQueryDto } from "./work-milestone.query.dto";

export class WorkMilestoneQueryClassDto extends createZodDto(
	workMilestoneQueryDto,
) {}
