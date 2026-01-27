import { getEnvironments } from "@infrastructure/config/server/environments.config";
import { Injectable, Logger } from "@nestjs/common";
import { OpenRouter } from "@openrouter/sdk";
import {
	CIRCUIT_BREAKER_CONFIG,
	INJECTION_PATTERNS,
	LLM_TIMEOUT_MS,
	PII_PATTERNS,
	RETRY_CONFIG,
} from "./const/openrouter.const";
import type {
	ChatMessage,
	ChatResponse,
	EmbeddingResponse,
} from "./schemas/openrouter.schema";

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

/** Tipos para respuesta de la API de OpenRouter */
interface OpenRouterChatResponse {
	choices: Array<{
		message?: {
			content?: string;
		};
	}>;
	model?: string;
	usage?: {
		promptTokens?: number;
		completionTokens?: number;
		totalTokens?: number;
	};
}

interface OpenRouterEmbeddingData {
	object: "embedding";
	embedding: number[] | string;
	index?: number;
}

interface OpenRouterEmbeddingResponse {
	id?: string;
	object: "list";
	data: OpenRouterEmbeddingData[];
	model: string;
	usage?: {
		promptTokens: number;
		totalTokens: number;
		cost?: number;
	};
}

/**
 * Proveedor de OpenRouter con patrones de resiliencia
 * - Circuit Breaker
 * - Retry con Exponential Backoff
 * - Token Tracking
 * - Prompt Injection Protection
 * - PII Sanitization
 */
@Injectable()
export class OpenRouterProvider {
	private readonly logger = new Logger(OpenRouterProvider.name);
	private readonly client: OpenRouter;

	// Circuit breaker state
	private circuitState: CircuitState = "CLOSED";
	private failureCount = 0;
	private lastFailureTime = 0;

	constructor() {
		this.client = new OpenRouter({
			apiKey: getEnvironments().OPENROUTER_API_KEY,
		});
		this.logger.log("OpenRouterProvider inicializado");
	}

	/**
	 * Genera una respuesta de chat usando el modelo especificado
	 */
	async chat(model: string, messages: ChatMessage[]): Promise<ChatResponse> {
		this.logger.log({ model, messageCount: messages.length }, "Iniciando chat");

		// Check circuit breaker
		if (!this.canMakeRequest()) {
			throw new Error("Servicio de IA temporalmente no disponible");
		}

		// Sanitize messages
		const sanitizedMessages = messages.map((msg) => ({
			...msg,
			content:
				msg.role === "user" ? this.sanitizeUserInput(msg.content) : msg.content,
		}));

		// Retry logic with exponential backoff
		let lastError: Error | null = null;

		for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
			try {
				const response = (await this.callWithTimeout(
					this.client.chat.send({
						model,
						messages: sanitizedMessages,
					}),
				)) as OpenRouterChatResponse;

				// Reset circuit breaker on success
				this.onSuccess();

				const result: ChatResponse = {
					content: response.choices[0]?.message?.content ?? "",
					model: response.model ?? model,
					promptTokens: response.usage?.promptTokens ?? 0,
					completionTokens: response.usage?.completionTokens ?? 0,
					totalTokens: response.usage?.totalTokens ?? 0,
				};

				this.logger.log(
					{
						model: result.model,
						promptTokens: result.promptTokens,
						completionTokens: result.completionTokens,
					},
					"Chat completado",
				);

				return result;
			} catch (error) {
				lastError = error as Error;
				this.logger.warn(
					{ attempt: attempt + 1, error: lastError.message },
					"Error en chat, reintentando...",
				);

				if (attempt < RETRY_CONFIG.maxRetries - 1) {
					const delay = RETRY_CONFIG.baseDelay * 2 ** attempt;
					await this.sleep(delay);
				}
			}
		}

		// All retries failed
		this.onFailure();
		throw lastError ?? new Error("Error desconocido en chat");
	}

	/**
	 * Genera embeddings usando la API de OpenRouter
	 */
	async generateEmbedding(
		model: string,
		text: string,
	): Promise<EmbeddingResponse> {
		this.logger.log({ model, textLength: text.length }, "Generando embedding");

		// Check circuit breaker
		if (!this.canMakeRequest()) {
			throw new Error("Servicio de IA temporalmente no disponible");
		}

		// Sanitize input
		const sanitizedText = this.sanitizePII(text);

		// Retry logic with exponential backoff
		let lastError: Error | null = null;

		for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
			try {
				// Usar el cliente SDK de embeddings
				const response = (await this.callWithTimeout(
					this.client.embeddings.generate({
						model,
						input: sanitizedText,
					}),
				)) as OpenRouterEmbeddingResponse;

				// Reset circuit breaker on success
				this.onSuccess();

				// Handle embedding which can be number[] or string (base64)
				const rawEmbedding = response.data?.[0]?.embedding;
				const embedding = Array.isArray(rawEmbedding) ? rawEmbedding : [];
				const tokensUsed = response.usage?.totalTokens ?? 0;

				const result: EmbeddingResponse = {
					embedding,
					model: response.model ?? model,
					tokensUsed,
				};

				this.logger.log(
					{
						model: result.model,
						dimensions: embedding.length,
						tokensUsed,
					},
					"Embedding generado",
				);

				return result;
			} catch (error) {
				lastError = error as Error;
				this.logger.warn(
					{ attempt: attempt + 1, error: lastError.message },
					"Error en embedding, reintentando...",
				);

				if (attempt < RETRY_CONFIG.maxRetries - 1) {
					const delay = RETRY_CONFIG.baseDelay * 2 ** attempt;
					await this.sleep(delay);
				}
			}
		}

		// All retries failed
		this.onFailure();
		throw lastError ?? new Error("Error desconocido generando embedding");
	}

	// =================== SECURITY UTILS ===================

	/**
	 * Sanitiza input del usuario para prevenir prompt injection
	 */
	sanitizeUserInput(input: string): string {
		// 1. Remove control characters
		// biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
		let sanitized = input.replace(/[\x00-\x1F\x7F]/g, "");

		// 2. Remove code blocks that could contain instructions
		sanitized = sanitized.replace(/```/g, "");

		// 3. Check for injection patterns
		if (this.detectInjection(sanitized)) {
			this.logger.warn("Posible intento de prompt injection detectado");
			return "[CONTENIDO SANITIZADO - Posible intento de inyección]";
		}

		// 4. Limit length
		return sanitized.slice(0, 4000);
	}

	/**
	 * Detecta patrones de prompt injection
	 */
	detectInjection(input: string): boolean {
		return INJECTION_PATTERNS.some((pattern: RegExp) => pattern.test(input));
	}

	/**
	 * Sanitiza PII antes de enviar al LLM
	 */
	sanitizePII(text: string): string {
		let sanitized = text;
		sanitized = sanitized.replace(PII_PATTERNS.email, "[EMAIL]");
		sanitized = sanitized.replace(PII_PATTERNS.phone, "[PHONE]");
		sanitized = sanitized.replace(PII_PATTERNS.creditCard, "[CARD]");
		sanitized = sanitized.replace(PII_PATTERNS.ssn, "[SSN]");
		sanitized = sanitized.replace(PII_PATTERNS.ipAddress, "[IP]");
		return sanitized;
	}

	// =================== CIRCUIT BREAKER ===================

	/**
	 * Verifica si se puede hacer una request
	 */
	private canMakeRequest(): boolean {
		if (this.circuitState === "CLOSED") {
			return true;
		}

		if (this.circuitState === "OPEN") {
			const now = Date.now();
			if (now - this.lastFailureTime >= CIRCUIT_BREAKER_CONFIG.resetTimeout) {
				this.circuitState = "HALF_OPEN";
				this.logger.log("Circuit breaker cambiando a HALF_OPEN");
				return true;
			}
			return false;
		}

		// HALF_OPEN - allow one request
		return true;
	}

	/**
	 * Registra una llamada exitosa
	 */
	private onSuccess(): void {
		if (this.circuitState !== "CLOSED") {
			this.logger.log("Circuit breaker cambiando a CLOSED");
		}
		this.failureCount = 0;
		this.circuitState = "CLOSED";
	}

	/**
	 * Registra una falla
	 */
	private onFailure(): void {
		this.failureCount++;
		this.lastFailureTime = Date.now();

		if (this.failureCount >= CIRCUIT_BREAKER_CONFIG.failureThreshold) {
			this.circuitState = "OPEN";
			this.logger.error(
				{ failureCount: this.failureCount },
				"Circuit breaker ABIERTO - Servicio degradado",
			);
		}
	}

	// =================== UTILS ===================

	/**
	 * Envuelve una promesa con timeout
	 */
	private async callWithTimeout<T>(promise: Promise<T>): Promise<T> {
		return Promise.race([
			promise,
			new Promise<never>((_, reject) =>
				setTimeout(
					() => reject(new Error("Timeout: La operación tardó demasiado")),
					LLM_TIMEOUT_MS,
				),
			),
		]);
	}

	/**
	 * Sleep async helper
	 */
	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Health check del proveedor
	 */
	getHealth(): {
		circuitState: CircuitState;
		failureCount: number;
		isAvailable: boolean;
	} {
		return {
			circuitState: this.circuitState,
			failureCount: this.failureCount,
			isAvailable: this.canMakeRequest(),
		};
	}
}
