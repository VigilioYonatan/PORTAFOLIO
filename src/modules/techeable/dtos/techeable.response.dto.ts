import { z } from "@infrastructure/config/zod-i18n.config";
import { techeableSchema } from "../schemas/techeable.schema";

export const techeableStoreResponseDto = z.object({
	success: z.literal(true),
	techeable: techeableSchema,
});
export type TecheableStoreResponseDto = z.infer<
	typeof techeableStoreResponseDto
>;

export const techeableDestroyResponseDto = z.object({
	success: z.literal(true),
	message: z.string(),
});
export type TecheableDestroyResponseDto = z.infer<
	typeof techeableDestroyResponseDto
>;
