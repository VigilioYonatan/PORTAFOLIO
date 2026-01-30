import { z } from "@infrastructure/config/zod-i18n.config";
import { createZodDto } from "nestjs-zod";

export const openSourceQueryDto = z.object({
	offset: z.coerce.number().int().nonnegative().optional(),
	limit: z.coerce.number().int().positive().optional(),
	name: z.string().optional(),
});

export type OpenSourceQueryDto = z.infer<typeof openSourceQueryDto>;

export class OpenSourceQueryClassDto extends createZodDto(openSourceQueryDto) {}
