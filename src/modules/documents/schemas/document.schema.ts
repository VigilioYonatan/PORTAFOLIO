import { z } from "@infrastructure/config/zod-i18n.config";
import { timeStampSchema } from "@infrastructure/schemas/time_stamp.schema";
import { filesSchema } from "@modules/uploads/schemas/upload.schema";

/**
 * Document Schema for RAG (Retrieval-Augmented Generation) system
 * Stores uploaded documents (PDF, etc.) for AI processing
 */
export const documentSchema = z
	.object({
		id: z.number().int().positive(), // identificador único
		title: z.string().min(1).max(200), // título del documento
		chunk_count: z.number().int().nonnegative(), // cantidad de fragmentos generados
		is_indexed: z.boolean(), // indica si el documento ha sido indexado para RAG
		status: z.enum(["PENDING", "PROCESSING", "READY", "FAILED"]), // estado del procesamiento
		file: filesSchema(), // archivo PDF subido (FileUpload)
		metadata: z.record(z.string(), z.string()).nullable(), // metadatos adicionales (author, pages, language)
		processed_at: z.date().nullable(), // fecha de procesamiento
		user_id: z.number().int().positive(), // FK al usuario que subió el documento
		tenant_id: z.number().int().positive(), // FK al tenant (multi-tenancy)
		...timeStampSchema.shape, // created_at, updated_at
	})
	.strict();

export type DocumentSchema = z.infer<typeof documentSchema>;

/**
 * Document Chunk Schema for vectorized fragments
 * Stores text chunks with embeddings for semantic search
 */
