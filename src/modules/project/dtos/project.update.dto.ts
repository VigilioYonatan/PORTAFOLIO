import { z } from "@infrastructure/config/zod-i18n.config";
import { projectSchema } from "../schemas/project.schema";

export const projectUpdateDto = projectSchema
	.omit({
		id: true,
		seo: true,
		parent_id: true,
		tenant_id: true,
		created_at: true,
		updated_at: true,
		github_stars: true,
		github_forks: true,
		languages_stats: true,
	})
	.extend({
		techeables: z.array(z.number()),
	});

export type ProjectUpdateDto = z.infer<typeof projectUpdateDto>;
