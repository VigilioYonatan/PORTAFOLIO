import { z } from "@infrastructure/config/zod-i18n.config";
import { createPaginatorSchema } from "@infrastructure/schemas/paginator.schema";
import { workExperienceSchema } from "../schemas/work-experience.schema";

// --- Index / List ---
export const workExperienceIndexResponseDto =
	createPaginatorSchema(workExperienceSchema);
export type WorkExperienceIndexResponseDto = z.infer<
	typeof workExperienceIndexResponseDto
>;

// --- Show ---
export const workExperienceShowResponseDto = z.object({
	success: z.literal(true),
	experience: workExperienceSchema,
});
export type WorkExperienceShowResponseDto = z.infer<
	typeof workExperienceShowResponseDto
>;

// --- Store ---
export const workExperienceStoreResponseDto = z.object({
	success: z.literal(true),
	experience: workExperienceSchema,
});
export type WorkExperienceStoreResponseDto = z.infer<
	typeof workExperienceStoreResponseDto
>;

// --- Update ---
export const workExperienceUpdateResponseDto = z.object({
	success: z.literal(true),
	experience: workExperienceSchema,
});
export type WorkExperienceUpdateResponseDto = z.infer<
	typeof workExperienceUpdateResponseDto
>;

// --- Destroy ---
export const workExperienceDestroyResponseDto = z.object({
	success: z.literal(true),
	message: z.string(),
});
export type WorkExperienceDestroyResponseDto = z.infer<
	typeof workExperienceDestroyResponseDto
>;
