import { z } from "../config/zod-i18n.config";

export const querySchema = z.object({
	limit: z.coerce.number().optional(),
	offset: z.coerce.number().optional(),
	search: z.string().optional(),
	cursor: z.string().or(z.number()).optional(),
	sortBy: z.string().optional(),
	sortDir: z.enum(["ASC", "DESC"]).optional(),
});
export type QuerySchema = z.infer<typeof querySchema>;
