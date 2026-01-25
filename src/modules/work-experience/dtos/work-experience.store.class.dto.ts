import { createZodDto } from "nestjs-zod";
import { workExperienceStoreDto } from "./work-experience.store.dto";

export class WorkExperienceStoreClassDto extends createZodDto(
	workExperienceStoreDto,
) {}
