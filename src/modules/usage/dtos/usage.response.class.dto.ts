import { createZodDto } from "nestjs-zod";
import {
	usageHistoryResponseDto,
	usageIndexResponseDto,
	usageResponseDto,
} from "./usage.response.dto";

export class UsageIndexResponseClassDto extends createZodDto(
	usageIndexResponseDto,
) {}
export class UsageHistoryResponseClassDto extends createZodDto(
	usageHistoryResponseDto,
) {}
export class UsageResponseClassDto extends createZodDto(usageResponseDto) {}
