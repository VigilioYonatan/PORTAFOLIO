import { createZodDto } from "nestjs-zod";
import { workMilestoneQueryDto } from "./work-milestone.query.dto";
import { workMilestoneStoreDto } from "./work-milestone.store.dto";
import { workMilestoneUpdateDto } from "./work-milestone.update.dto";

export class WorkMilestoneStoreClassDto extends createZodDto(
	workMilestoneStoreDto,
) {}
export class WorkMilestoneUpdateClassDto extends createZodDto(
	workMilestoneUpdateDto,
) {}
export class WorkMilestoneQueryClassDto extends createZodDto(
	workMilestoneQueryDto,
) {}
