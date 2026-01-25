import { createZodDto } from "nestjs-zod";
import { workMilestoneStoreDto } from "./work-milestone.store.dto";

export class WorkMilestoneStoreClassDto extends createZodDto(
	workMilestoneStoreDto,
) {}
