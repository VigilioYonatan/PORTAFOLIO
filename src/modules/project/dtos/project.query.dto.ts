import { z } from "@infrastructure/config/zod-i18n.config";
import { querySchema } from "@infrastructure/schemas/query.schema";
import { projectSchema } from "../schemas/project.schema";

export const projectQueryDto = projectSchema
	.pick({
		is_featured: true,
		is_visible: true,
	})
	.partial()
	.extend(querySchema.shape);

export type ProjectQueryDto = z.infer<typeof projectQueryDto>;
