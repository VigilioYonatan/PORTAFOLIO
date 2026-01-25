import { createZodDto } from "nestjs-zod";
import {
	technologyDestroyResponseDto,
	technologyIndexResponseDto,
	technologyShowResponseDto,
	technologyStoreResponseDto,
	technologyUpdateResponseDto,
} from "./technology.response.dto";

export class TechnologyIndexResponseClassDto extends createZodDto(
	technologyIndexResponseDto,
) {}
export class TechnologyShowResponseClassDto extends createZodDto(
	technologyShowResponseDto,
) {}
export class TechnologyStoreResponseClassDto extends createZodDto(
	technologyStoreResponseDto,
) {}
export class TechnologyUpdateResponseClassDto extends createZodDto(
	technologyUpdateResponseDto,
) {}
export class TechnologyDestroyResponseClassDto extends createZodDto(
	technologyDestroyResponseDto,
) {}
