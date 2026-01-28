import { AI_TECHNICAL_PROTECTION } from "../const/ai-prompts.const";
import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { now } from "@infrastructure/utils/hybrid";
import { Inject, Injectable, Logger } from "@nestjs/common";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { aiModelConfigEntity } from "../entities/ai-config.entity";
import type { AiConfigSchema } from "../schemas/ai-config.schema";

@Injectable()
export class AiConfigSeeder {
	private readonly logger = new Logger(AiConfigSeeder.name);

	/**
	 * Default AI model configuration data
	 * Provides reasonable defaults for RAG and chat functionality
	 */
	private readonly data: Omit<
		AiConfigSchema,
		"id" | "tenant_id" | "created_at" | "updated_at"
	>[] = [
		{
			// Chat model configuration
			chat_model: "gpt-4o-mini", // Modelo de chat principal
			embedding_model: "text-embedding-3-small", // Modelo de embeddings
			embedding_dimensions: 1536, // Dimensiones del vector (OpenAI default)

			// RAG parameters
			chunk_size: 1000, // Tamaño de chunks en caracteres
			chunk_overlap: 200, // Overlap entre chunks

			// Technical parameters
			system_prompt: `Eres un asistente profesional para el portfolio de un Senior Developer. 
Responde preguntas sobre su experiencia, proyectos y habilidades técnicas basándote en el contexto proporcionado. 
Sé conciso, profesional y amigable.

${AI_TECHNICAL_PROTECTION}`,
			temperature: 0.7, // Balance entre creatividad y precisión
			max_tokens: 2000, // Límite de tokens por respuesta

			// Status
			is_active: true, // Configuración activa por defecto
		},
	];

	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	/**
	 * Ejecuta el seeder
	 * Crea la configuración inicial de IA para un tenant
	 */
	async run(tenant_id: number): Promise<AiConfigSchema[]> {
		this.logger.log({ tenant_id }, "Seeding AI model config...");

		const aiConfigSeed = this.data.map((config) => ({
			...config,
			tenant_id,
			created_at: now().toDate(),
			updated_at: now().toDate(),
		}));

		const result = await this.db
			.insert(aiModelConfigEntity)
			.values(aiConfigSeed)
			.returning();

		this.logger.log(
			{ tenant_id },
			`Created ${result.length} AI config record(s)`,
		);
		return result;
	}
}
