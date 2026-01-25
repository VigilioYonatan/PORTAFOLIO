import { z } from "@infrastructure/config/zod-i18n.config";
import { querySchema } from "@infrastructure/schemas/query.schema";
import { userSchema } from "../schemas/user.schema";

export const userQueryDto = querySchema.extend({
	role_id: z.coerce.number().int().positive().optional(),
	status: userSchema.shape.status.optional(),
});

export type UserQueryDto = z.infer<typeof userQueryDto>;
