import type { Environments } from "@infrastructure/config/server/environments.config";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { type Observable, Subject } from "rxjs";
import { AiCache } from "../caches/ai.cache";
import { DEFAULT_AI_CONFIG } from "../const/ai-config.const";
import type {
	AiConfigShowResponseDto,
	AiConfigUpdateResponseDto,
} from "../dtos/ai.response.dto";
import type { AiConfigUpdateDto } from "../dtos/ai-config.update.dto";
import { AiConfigRepository } from "../repositories/ai-config.repository";


@Injectable()
export class AiService {
	private readonly logger = new Logger(AiService.name);

	constructor(
		private readonly aiConfigRepository: AiConfigRepository,
		private readonly aiCache: AiCache,
		private readonly configService: ConfigService<Environments>,
	) {}

	async show(tenant_id: number): Promise<AiConfigShowResponseDto> {
		this.logger.log({ tenant_id }, "Fetching AI configuration");

		// 1. Try Cache
		let config = await this.aiCache.get(tenant_id);

		if (!config) {
			// 2. Try DB
			config = await this.aiConfigRepository.show(tenant_id);

			if (!config) {
				// Self-healing: Create default config if not exists
				this.logger.log({ tenant_id }, "Creating default AI config");
				config = await this.aiConfigRepository.store(
					tenant_id,
					DEFAULT_AI_CONFIG,
				);
			}

			// 3. Set Cache
			await this.aiCache.set(tenant_id, config!);
		}

		return { success: true, config: config! };
	}

	async update(
		tenant_id: number,
		body: AiConfigUpdateDto,
	): Promise<AiConfigUpdateResponseDto> {
		this.logger.log({ tenant_id }, "Updating AI configuration");

		const existing = await this.aiConfigRepository.show(tenant_id);
		if (!existing) {
			this.logger.error({ tenant_id }, "AI Configuration not found for update");
			throw new Error("AI Configuration not found (Update failed)");
		}

		const config = await this.aiConfigRepository.update(tenant_id, existing.id, body);

		// Invalidate Cache
		await this.aiCache.invalidate(tenant_id);

		return { success: true, config };
	}

	async generateStream(props: {
		model: string;
		temperature: number;
		system: string;
		messages: ChatCompletionMessageParam[];
	}): Promise<Observable<{ data: { content: string } }>> {
		this.logger.log({ model: props.model }, "Generating AI stream");

		const apiKey = this.configService.get("OPENROUTER_API_KEY", {
			infer: true,
		})!;

		const openai = new OpenAI({
			baseURL: "https://openrouter.ai/api/v1",
			apiKey,
		});

		const subject = new Subject<{ data: { content: string } }>();

		(async () => {
			try {
				const stream = await openai.chat.completions.create({
					model: props.model,
					temperature: props.temperature,
					messages: [
						{ role: "system", content: props.system },
						...props.messages,
					],
					stream: true,
				});

				for await (const chunk of stream) {
					const content = chunk.choices[0]?.delta?.content || "";
					if (content) {
						subject.next({ data: { content } });
					}
				}

				subject.complete();
			} catch (error) {
				this.logger.error("OpenRouter Stream Error", error);
				subject.error(error);
			}
		})();

		return subject.asObservable();
	}

	async generate(props: {
		model: string;
		temperature: number;
		system: string;
		messages: ChatCompletionMessageParam[];
	}): Promise<string> {
		this.logger.log({ model: props.model }, "Generating AI response");

		const apiKey = this.configService.get("OPENROUTER_API_KEY", {
			infer: true,
		})!;

		const openai = new OpenAI({
			baseURL: "https://openrouter.ai/api/v1",
			apiKey,
		});

		try {
			const response = await openai.chat.completions.create({
				model: props.model,
				temperature: props.temperature,
				messages: [
					{ role: "system", content: props.system },
					...props.messages,
				],
				stream: false,
			});

			return response.choices[0]?.message?.content || "";
		} catch (error) {
			this.logger.error("OpenRouter Generation Error", error);
			throw error;
		}
	}

	async getEmbeddings(text: string): Promise<number[]> {
		this.logger.debug({ textLength: text.length }, "Generating embeddings via API");

		const apiKey = this.configService.get("OPENROUTER_API_KEY", {
			infer: true,
		})!;

		const openai = new OpenAI({
			baseURL: "https://openrouter.ai/api/v1",
			apiKey,
		});

		try {
			const response = await openai.embeddings.create({
				model: "text-embedding-3-small",
				input: text,
				dimensions: 1536,
			});

			const embedding = response.data[0]?.embedding;

			if (!embedding || embedding.length !== 1536) {
				this.logger.error(
					"Invalid embedding dimensions or empty response",
					response,
				);
				throw new Error("Failed to generate valid embeddings");
			}

			return embedding;
		} catch (error) {
			this.logger.error("Embedding Generation Error", error);
			// Fallback or rethrow? For now rethrow as this is critical for RAG
			throw error;
		}
	}
}
