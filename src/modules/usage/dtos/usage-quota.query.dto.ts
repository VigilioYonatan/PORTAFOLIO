import { querySchema } from "@infrastructure/schemas/query.schema";
import { createZodDto } from "nestjs-zod";
import { usageQuotaSchema } from "../schemas/usage-quota.schema";

export const usageQuotaQueryDto = usageQuotaSchema
	.pick({
		year: true,
		month: true,
	})
	.partial()
	.extend(querySchema.shape);

export class UsageQuotaQueryDto extends createZodDto(usageQuotaQueryDto) {}
