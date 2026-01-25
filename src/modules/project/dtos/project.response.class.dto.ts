import { createZodDto } from "nestjs-zod";
import {
	projectDestroyResponseDto,
	projectIndexResponseDto,
	projectResponseDto,
	projectShowResponseDto,
	projectStoreResponseDto,
	projectSyncResponseDto,
	projectUpdateResponseDto,
} from "./project.response.dto";

export class ProjectIndexResponseClassDto extends createZodDto(
	projectIndexResponseDto,
) {}
export class ProjectShowResponseClassDto extends createZodDto(
	projectShowResponseDto,
) {}
export class ProjectStoreResponseClassDto extends createZodDto(
	projectStoreResponseDto,
) {}
export class ProjectUpdateResponseClassDto extends createZodDto(
	projectUpdateResponseDto,
) {}
export class ProjectDestroyResponseClassDto extends createZodDto(
	projectDestroyResponseDto,
) {}
export class ProjectSyncResponseClassDto extends createZodDto(
	projectSyncResponseDto,
) {}
export class ProjectResponseClassDto extends createZodDto(projectResponseDto) {}
