import { z } from "@infrastructure/config/zod-i18n.config";
import { createPaginatorSchema } from "@infrastructure/schemas/paginator.schema";
import { openSourceSchema } from "../schemas/open-source.schema";

// --- Index / List ---
export const openSourceIndexResponseDto =
	createPaginatorSchema(openSourceSchema);
export type OpenSourceIndexResponseDto = z.infer<
	typeof openSourceIndexResponseDto
>;

// --- Show ---
export const openSourceShowResponseDto = z.object({
	success: z.literal(true),
	open_source: openSourceSchema,
});
export type OpenSourceShowResponseDto = z.infer<
	typeof openSourceShowResponseDto
>;

// --- Store ---
export const openSourceStoreResponseDto = z.object({
	success: z.literal(true),
	open_source: openSourceSchema,
});
export type OpenSourceStoreResponseDto = z.infer<
	typeof openSourceStoreResponseDto
>;

// --- Update ---
export const openSourceUpdateResponseDto = z.object({
	success: z.literal(true),
	open_source: openSourceSchema,
});
export type OpenSourceUpdateResponseDto = z.infer<
	typeof openSourceUpdateResponseDto
>;

// --- Destroy ---
export const openSourceDestroyResponseDto = z.object({
	success: z.literal(true),
	message: z.string(),
});
export type OpenSourceDestroyResponseDto = z.infer<
	typeof openSourceDestroyResponseDto
>;
