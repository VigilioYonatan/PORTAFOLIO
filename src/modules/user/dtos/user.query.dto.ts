import { z } from "@infrastructure/config/zod-i18n.config";
import { querySchema } from "@infrastructure/schemas/query.schema";
import { userSchema } from "../schemas/user.schema";

export const userQueryDto = userSchema
	.pick({
		role_id: true,
		status: true,
	})
	.partial()
	.extend(querySchema.shape);

export type UserQueryDto = z.infer<typeof userQueryDto>;
