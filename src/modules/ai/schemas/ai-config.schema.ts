import { z } from "@infrastructure/config/zod-i18n.config";
import { timeStampSchema } from "@infrastructure/schemas/time_stamp.schema";

/**
 * AI Model Configuration Schema
 * Stores technical parameters for LLM models (embedding, chat, chunking)
 */
export const aiConfigSchema = z
	.object({
		id: z.number().int().positive(), // Identificador único
		tenant_id: z.number().int().positive(), // ID del tenant

		// Model Parameters
		chat_model: z.string().min(1).max(100), // Modelo de chat (ej: gpt-4o-mini)
		embedding_model: z.string().min(1).max(100), // Modelo de embeddings
		embedding_dimensions: z.number().int().positive(), // Dimensiones del vector

		// RAG Parameters
		chunk_size: z.number().int().positive(), // Tamaño de chunks para RAG
		chunk_overlap: z.number().int().nonnegative(), // Overlap entre chunks

		// Technical Parameters
		system_prompt: z.string().nullable(),
		temperature: z.number().min(0).max(2),
		max_tokens: z.number().int().positive(), // Máximo de tokens

		// Status
		is_active: z.boolean(), // Estado: true = configuración activa

		...timeStampSchema.shape,
	})
	.strict();

export type AiConfigSchema = z.infer<typeof aiConfigSchema>;
