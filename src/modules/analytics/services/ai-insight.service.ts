import { paginator } from "@infrastructure/utils/server";
import type { AiConfigSchema } from "@modules/ai/schemas/ai-config.schema";
import { AiService } from "@modules/ai/services/ai.service";
import { ConversationService } from "@modules/chat/services/conversation.service";
import { Injectable, Logger } from "@nestjs/common";
import { lastValueFrom } from "rxjs";
import { last, scan } from "rxjs/operators";
import { AiInsightCache } from "../cache/ai-insight.cache";
import type { AiInsightQueryDto } from "../dtos/ai-insight.query.dto";
import type {
	AiInsightGenerateResponseDto,
	AiInsightIndexResponseDto,
} from "../dtos/analytics.response.dto";
import { AiInsightRepository } from "../repositories/ai-insight.repository";
import type { AiInsightSchema } from "../schemas/ai-insight.schema";

@Injectable()
export class AiInsightService {
	private readonly logger = new Logger(AiInsightService.name);

	constructor(
		private readonly repository: AiInsightRepository,
		private readonly conversationService: ConversationService,
		private readonly aiService: AiService,
		private readonly cache: AiInsightCache,
	) {}

	async index(
		tenant_id: number,
		query: AiInsightQueryDto,
	): Promise<AiInsightIndexResponseDto> {
		this.logger.log({ tenant_id }, "Listing AI insights");

		return await paginator<AiInsightQueryDto, AiInsightSchema>(
			"/ai-insight",
			{
				filters: query,
				cb: async (filters, isClean) => {
					if (isClean) {
						const cached = await this.cache.getList(tenant_id, filters);
						if (cached) return cached;
					}

					const [data, count] = await this.repository.index(tenant_id, filters);

					if (isClean) {
						await this.cache.setList(tenant_id, filters, [data, count]);
					}

					return [data, count];
				},
			},
		);
	}

	async generate(tenant_id: number): Promise<AiInsightGenerateResponseDto> {
		this.logger.log({ tenant_id }, "Generating AI insights");

		// 1. Fetch recent conversations
		const conversations = await this.conversationService.getRecentForAnalysis(
			tenant_id,
			50,
		);

		if (conversations.length === 0) {
			this.logger.warn("No conversations to analyze");
			return this.storeInsight(tenant_id, null, {
				themes: ["No Data"],
				sentiment: "NEUTRAL",
				actions: [],
			});
		}

		// 2. Prepare Data for AI
		const conversationText = conversations
			.map(
				(c) =>
					`Conversation ${c.id} (${c.mode}):\n` +
					c.messages
						.map((m) => `${m.role}: ${m.content}`)
						.join("\n")
						.slice(0, 1000),
			)
			.join("\n\n---\n\n")
			.slice(0, 10000);

		// 3. Get AI Config
		let config: AiConfigSchema | null = null;
		try {
			const configRes = await this.aiService.show(tenant_id);
			config = configRes.config;
		} catch (e) {
			this.logger.error("Failed to fetch AI config", e);
		}

		if (!config || !config.is_active) {
			this.logger.warn("AI not configured or active, using fallback");
			return this.storeInsight(tenant_id, config?.id || null, {
				themes: ["Manual Review Required"],
				sentiment: "NEUTRAL",
				actions: ["Configure AI for automated insights"],
			});
		}

		// 4. Call AI
		const systemPrompt = `You are an expert Data Analyst for a portfolio website.
Analyze the following conversation logs between visitors and the AI Assistant (or Admin).
Extract:
1. Key Themes (topics discussed e.g., 'Pricing', 'React', 'Contact').
2. Overall Sentiment (POSITIVE, NEUTRAL, NEGATIVE).
3. Recommended Actions (e.g., 'Update CV', 'Fix pricing info').

Return ONLY raw JSON with this structure:
{
  "themes": ["string"],
  "sentiment": "string",
  "actions": ["string"]
}`;

		try {
			const stream$ = await this.aiService.generateStream({
				model: config.chat_model,
				temperature: 0.2,
				system: systemPrompt,
				messages: [{ role: "user", content: conversationText }],
			});

			const responseText = await lastValueFrom(
				stream$.pipe(
					scan((acc, curr) => acc + curr.data.content, ""),
					last(),
				),
			);

			const jsonStr = responseText.replace(/```json\n?|\n?```/g, "").trim();
			const insightsData = JSON.parse(jsonStr);

			const finalData = {
				themes: Array.isArray(insightsData.themes) ? insightsData.themes : [],
				sentiment:
					typeof insightsData.sentiment === "string"
						? insightsData.sentiment
						: "NEUTRAL",
				actions: Array.isArray(insightsData.actions)
					? insightsData.actions
					: [],
			};

			return this.storeInsight(tenant_id, config.id, finalData);
		} catch (error) {
			this.logger.error("Failed to generate insight", error);
			return this.storeInsight(tenant_id, config.id, {
				themes: ["Error"],
				sentiment: "ERROR",
				actions: ["Check logs"],
			});
		}
	}

	private async storeInsight(
		tenant_id: number,
		model_id: number | null,
		data: { themes: string[]; sentiment: string; actions: string[] },
	): Promise<AiInsightGenerateResponseDto> {
		const insight = await this.repository.store(tenant_id, {
			model_id,
			insights_data: data,
			generated_at: new Date(),
		});

		await this.cache.invalidateLists(tenant_id);
		return { success: true, insight };
	}
}
