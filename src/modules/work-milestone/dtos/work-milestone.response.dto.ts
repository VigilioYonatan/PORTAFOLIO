import { z } from "@infrastructure/config/zod-i18n.config";
import { createPaginatorSchema } from "@infrastructure/schemas/paginator.schema";
import { workMilestoneSchema } from "../schemas/work-milestone.schema";

// --- Index / List ---
export const workMilestoneIndexResponseDto =
	createPaginatorSchema(workMilestoneSchema);
export type WorkMilestoneIndexResponseDto = z.infer<
	typeof workMilestoneIndexResponseDto
>;

// --- Store ---
export const workMilestoneStoreResponseDto = z.object({
	success: z.literal(true),
	milestone: workMilestoneSchema,
});
export type WorkMilestoneStoreResponseDto = z.infer<
	typeof workMilestoneStoreResponseDto
>;

// --- Update ---
export const workMilestoneUpdateResponseDto = z.object({
	success: z.literal(true),
	milestone: workMilestoneSchema,
});
export type WorkMilestoneUpdateResponseDto = z.infer<
	typeof workMilestoneUpdateResponseDto
>;

// --- Destroy ---
export const workMilestoneDestroyResponseDto = z.object({
	success: z.literal(true),
	message: z.string(),
});
export type WorkMilestoneDestroyResponseDto = z.infer<
	typeof workMilestoneDestroyResponseDto
>;
