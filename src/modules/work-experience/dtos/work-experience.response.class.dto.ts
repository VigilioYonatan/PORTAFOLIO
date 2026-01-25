import { createZodDto } from "nestjs-zod";
import {
	workExperienceDestroyResponseDto,
	workExperienceIndexResponseDto,
	workExperienceStoreResponseDto,
	workExperienceUpdateResponseDto,
} from "./work-experience.response.dto";

export class WorkExperienceIndexResponseClassDto extends createZodDto(
	workExperienceIndexResponseDto,
) {}
export class WorkExperienceStoreResponseClassDto extends createZodDto(
	workExperienceStoreResponseDto,
) {}
export class WorkExperienceUpdateResponseClassDto extends createZodDto(
	workExperienceUpdateResponseDto,
) {}
export class WorkExperienceDestroyResponseClassDto extends createZodDto(
	workExperienceDestroyResponseDto,
) {}
