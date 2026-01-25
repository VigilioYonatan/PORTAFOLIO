import type { Environments } from "@infrastructure/config/server/environments.config";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OpenAI } from "openai";
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

	private getClient(apiKey: string, baseURL?: string): OpenAI {
		return new OpenAI({
			apiKey,
			baseURL: baseURL || "https://openrouter.ai/api/v1",
            defaultHeaders: {
                "HTTP-Referer": "https://portfolio.neuro-dev.com", // Site URL
                "X-Title": "NeuroPortfolio", // Site Title
            }
		});
	}

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

		const config = await this.aiConfigRepository.update(tenant_id, body);
		if (!config) {
			this.logger.error({ tenant_id }, "AI Configuration not found for update");
			throw new Error("AI Configuration not found (Update failed)");
		}

		// Invalidate Cache
		await this.aiCache.invalidate(tenant_id);
		// Write-through
		await this.aiCache.set(tenant_id, config);

		return { success: true, config };
	}

	async generateStream(props: {
		model: string;
		temperature: number;
		system: string;
		messages: { role: "user" | "assistant" | "system"; content: string }[];
	}): Promise<Observable<{ data: { content: string } }>> {
		this.logger.log({ model: props.model }, "Generating AI stream");

		const apiKey = this.configService.get("OPENROUTER_API_KEY", {
			infer: true,
		})!;

		const client = this.getClient(apiKey);
		const subject = new Subject<{ data: { content: string } }>();

		(async () => {
			try {
				const stream = await client.chat.completions.create({
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

	async getEmbeddings(text: string): Promise<number[]> {
		this.logger.debug({ textLength: text.length }, "Generating embeddings");

		// =========================================================================
		// SIMPLE WORD-BASED EMBEDDINGS (No external dependencies)
		// =========================================================================
		// Uses word hashing to create a fixed-size vector (384 dimensions)
		// Not as accurate as neural embeddings but works without API or sharp
		// =========================================================================

		const DIMENSIONS = 384;
		const embedding = new Array(DIMENSIONS).fill(0);

		// Normalize and tokenize text
		const words = text
			.toLowerCase()
			.replace(/[^\w\s]/g, " ")
			.split(/\s+/)
			.filter((word) => word.length > 2);

		if (words.length === 0) {
			return embedding;
		}

		// Simple hash function
		const hashWord = (word: string): number => {
			let hash = 0;
			for (let i = 0; i < word.length; i++) {
				const char = word.charCodeAt(i);
				hash = (hash << 5) - hash + char;
				hash = hash & hash; // Convert to 32bit integer
			}
			return Math.abs(hash);
		};

		// Create embedding by distributing word hashes across dimensions
		for (const word of words) {
			const hash = hashWord(word);
			const primaryIndex = hash % DIMENSIONS;
			const secondaryIndex = (hash * 31) % DIMENSIONS;
			const value = ((hash % 1000) / 1000) * 2 - 1; // Value between -1 and 1

			embedding[primaryIndex] += value;
			embedding[secondaryIndex] += value * 0.5;
		}

		// Normalize the embedding (L2 normalization)
		const magnitude = Math.sqrt(
			embedding.reduce((sum, val) => sum + val * val, 0),
		);

		if (magnitude > 0) {
			for (let i = 0; i < DIMENSIONS; i++) {
				embedding[i] = embedding[i] / magnitude;
			}
		}

		return embedding;
	}
}
