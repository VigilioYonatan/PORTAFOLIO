import { createZodDto } from "nestjs-zod";
import { workMilestoneUpdateDto } from "./work-milestone.update.dto";

export class WorkMilestoneUpdateClassDto extends createZodDto(
	workMilestoneUpdateDto,
) {}
