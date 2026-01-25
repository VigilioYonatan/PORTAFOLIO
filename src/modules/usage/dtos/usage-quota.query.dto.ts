import { z } from "@infrastructure/config/zod-i18n.config";
import { createZodDto } from "nestjs-zod";
import { usageQuotaSchema } from "../schemas/usage-quota.schema";

export const usageQuotaQuerySchema = usageQuotaSchema
	.pick({
		year: true,
		month: true,
	})
	.partial();

export class UsageQuotaQueryDto extends createZodDto(usageQuotaQuerySchema) {}
