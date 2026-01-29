import { z } from "@infrastructure/config/zod-i18n.config";
import { createPaginatorSchema } from "@infrastructure/schemas/paginator.schema";
import { techeableSchema } from "@modules/techeable/schemas/techeable.schema";
import { technologySchema } from "@modules/technology/schemas/technology.schema";
import { projectSchema } from "../schemas/project.schema";

// --- Index / List ---
export const projectIndexResponseDto = createPaginatorSchema(
	projectSchema.extend({
		techeables: z.array(
			techeableSchema.extend({
				technology: technologySchema,
			}),
		),
	}),
);
export type ProjectIndexResponseDto = z.infer<typeof projectIndexResponseDto>; // clean

// --- Show ---
export const projectShowResponseDto = z.object({
	success: z.literal(true),
	project: projectSchema.extend({
		techeables: z.array(
			techeableSchema.extend({
				technology: technologySchema,
			}),
		),
	}),
});
export type ProjectShowResponseDto = z.infer<typeof projectShowResponseDto>;

// --- Store ---
export const projectStoreResponseDto = z.object({
	success: z.literal(true),
	project: projectSchema,
});
export type ProjectStoreResponseDto = z.infer<typeof projectStoreResponseDto>;

// --- Update ---
export const projectUpdateResponseDto = z.object({
	success: z.literal(true),
	project: projectSchema,
});
export type ProjectUpdateResponseDto = z.infer<typeof projectUpdateResponseDto>;

// --- Destroy ---
export const projectDestroyResponseDto = z.object({
	success: z.literal(true),
	message: z.string(),
});
export type ProjectDestroyResponseDto = z.infer<
	typeof projectDestroyResponseDto
>;

// --- Sync (GitHub) ---
export const projectSyncResponseDto = z.object({
	success: z.literal(true),
	message: z.string(),
});
export type ProjectSyncResponseDto = z.infer<typeof projectSyncResponseDto>;

// --- Generic ---
export const projectResponseDto = z.object({
	success: z.literal(true),
	project: projectSchema.extend({
		techeables: z.array(techeableSchema),
	}),
});
export type ProjectResponseDto = z.infer<typeof projectResponseDto>;
