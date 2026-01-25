import { z } from "@infrastructure/config/zod-i18n.config";

/**
 * Schema para mensaje de chat
 */
export const chatMessageSchema = z.object({
	role: z.enum(["user", "assistant", "system"]), // rol del mensaje
	content: z.string().min(1), // contenido del mensaje
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

/**
 * Schema para respuesta de chat
 */
export const chatResponseSchema = z.object({
	content: z.string(), // respuesta del modelo
	model: z.string(), // modelo utilizado
	promptTokens: z.number().int().nonnegative(), // tokens de entrada
	completionTokens: z.number().int().nonnegative(), // tokens de salida
	totalTokens: z.number().int().nonnegative(), // tokens totales
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;

/**
 * Schema para respuesta de embedding
 */
export const embeddingResponseSchema = z.object({
	embedding: z.array(z.number()), // vector de embedding
	model: z.string(), // modelo utilizado
	tokensUsed: z.number().int().nonnegative(), // tokens consumidos
});

export type EmbeddingResponse = z.infer<typeof embeddingResponseSchema>;
