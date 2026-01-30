import { createZodDto } from "nestjs-zod";
import {
	openSourceDestroyResponseDto,
	openSourceIndexResponseDto,
	openSourceShowResponseDto,
	openSourceStoreResponseDto,
	openSourceUpdateResponseDto,
} from "./open-source.response.dto";

export class OpenSourceIndexResponseClassDto extends createZodDto(
	openSourceIndexResponseDto,
) {}
export class OpenSourceShowResponseClassDto extends createZodDto(
	openSourceShowResponseDto,
) {}
export class OpenSourceStoreResponseClassDto extends createZodDto(
	openSourceStoreResponseDto,
) {}
export class OpenSourceUpdateResponseClassDto extends createZodDto(
	openSourceUpdateResponseDto,
) {}
export class OpenSourceDestroyResponseClassDto extends createZodDto(
	openSourceDestroyResponseDto,
) {}
