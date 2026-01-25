import { z } from "@infrastructure/config/zod-i18n.config";
import { createPaginatorSchema } from "@infrastructure/schemas/paginator.schema";
import { technologySchema } from "../schemas/technology.schema";

// --- Index / List ---
export const technologyIndexResponseDto =
	createPaginatorSchema(technologySchema);
export type TechnologyIndexResponseDto = z.infer<
	typeof technologyIndexResponseDto
>;
export type TechnologyIndexResponseApi = TechnologyIndexResponseDto; // Alias for backward compatibility if needed

// --- Show ---
export const technologyShowResponseDto = z.object({
	success: z.literal(true),
	technology: technologySchema,
});
export type TechnologyShowResponseDto = z.infer<
	typeof technologyShowResponseDto
>;

// --- Store ---
export const technologyStoreResponseDto = z.object({
	success: z.literal(true),
	technology: technologySchema,
});
export type TechnologyStoreResponseDto = z.infer<
	typeof technologyStoreResponseDto
>;

// --- Update ---
export const technologyUpdateResponseDto = z.object({
	success: z.literal(true),
	technology: technologySchema,
});
export type TechnologyUpdateResponseDto = z.infer<
	typeof technologyUpdateResponseDto
>;

// --- Destroy ---
export const technologyDestroyResponseDto = z.object({
	success: z.literal(true),
	message: z.string(),
});
export type TechnologyDestroyResponseDto = z.infer<
	typeof technologyDestroyResponseDto
>;
