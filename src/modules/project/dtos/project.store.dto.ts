import { z } from "@infrastructure/config/zod-i18n.config";
import { projectSchema } from "../schemas/project.schema";

export const projectStoreDto = projectSchema.omit({
	id: true,
	created_at: true,
	updated_at: true,
	github_stars: true,
	github_forks: true,
	languages_stats: true,
}).extend({
	techeables: z.array(z.number()),
})
export type ProjectStoreDto = z.infer<typeof projectStoreDto>;
