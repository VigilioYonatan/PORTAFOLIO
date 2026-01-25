import { createZodDto } from "nestjs-zod";
import {
	workMilestoneDestroyResponseDto,
	workMilestoneIndexResponseDto,
	workMilestoneStoreResponseDto,
	workMilestoneUpdateResponseDto,
} from "./work-milestone.response.dto";

export class WorkMilestoneIndexResponseClassDto extends createZodDto(
	workMilestoneIndexResponseDto,
) {}
export class WorkMilestoneStoreResponseClassDto extends createZodDto(
	workMilestoneStoreResponseDto,
) {}
export class WorkMilestoneUpdateResponseClassDto extends createZodDto(
	workMilestoneUpdateResponseDto,
) {}
export class WorkMilestoneDestroyResponseClassDto extends createZodDto(
	workMilestoneDestroyResponseDto,
) {}
