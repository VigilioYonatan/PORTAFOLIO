import type { AiConfigSchema } from "../schemas/ai-config.schema";

/**
 * Default AI configuration values
 * Used when creating initial config for a tenant
 */
export const DEFAULT_AI_CONFIG: Omit<
	AiConfigSchema,
	"id" | "tenant_id" | "created_at" | "updated_at"
> = {
	// Model Parameters
	chat_model: "openai/gpt-4o-mini",
	embedding_model: "text-embedding-3-small",
	embedding_dimensions: 1536,

	// Technical Parameters (rules-business #15)
	system_prompt: "Eres un asistente experto para este portfolio personal.",
	temperature: 0.7,
	max_tokens: 2000,

	// RAG Parameters
	chunk_size: 1000,
	chunk_overlap: 200,

	// Status
	is_active: true,
};
