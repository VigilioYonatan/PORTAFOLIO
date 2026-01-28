import { z } from "@infrastructure/config/zod-i18n.config";
import { timeStampSchema } from "@infrastructure/schemas/time_stamp.schema";

/**
 * Document Schema for RAG (Retrieval-Augmented Generation) system
 * Stores uploaded documents (PDF, etc.) for AI processing
 */

/**
 * Document Chunk Schema for vectorized fragments
 * Stores text chunks with embeddings for semantic search
 */
export const documentChunkSchema = z
	.object({
		id: z.number().int().positive(), // identificador único
		content: z.string().min(1), // contenido del fragmento
		embedding: z.array(z.number()).nullable(), // vector embedding (1536 dim)
		chunk_index: z.number().int().nonnegative(), // índice del fragmento
		token_count: z.number().int().nonnegative(), // cantidad de tokens
		document_id: z.number().int().positive(), // FK al documento padre
		...timeStampSchema.shape, // created_at, updated_at
	})

export type DocumentChunkSchema = z.infer<typeof documentChunkSchema>;
