/**
 * Constantes para el proveedor OpenRouter
 * @module infrastructure/providers/openrouter
 */

/** Tiempo máximo de espera para llamadas al LLM (30 segundos) */
export const LLM_TIMEOUT_MS = 30000;

/** Configuración del circuit breaker */
export const CIRCUIT_BREAKER_CONFIG = {
	/** Número de fallos antes de abrir el circuito */
	failureThreshold: 5,
	/** Tiempo de espera antes de reintentar (ms) */
	resetTimeout: 30000,
} as const;

/** Configuración de reintentos con backoff exponencial */
export const RETRY_CONFIG = {
	/** Número máximo de reintentos */
	maxRetries: 3,
	/** Delay base en ms (se multiplica exponencialmente) */
	baseDelay: 1000,
} as const;

/** Orden de modelos de fallback (de más barato a más caro) */
export const FALLBACK_MODELS = {
	chat: [
		"google/gemini-2.0-flash-001",
		"deepseek/deepseek-chat:free",
		"openai/gpt-4o-mini",
		"openai/gpt-4o",
	],
	embedding: ["openai/text-embedding-3-small", "openai/text-embedding-3-large"],
} as const;

/** Patrones de inyección de prompts a detectar */
export const INJECTION_PATTERNS = [
	/ignore (all )?(previous|above) instructions/i,
	/disregard (all )?(previous|above)/i,
	/forget (everything|all|your)/i,
	/you are now/i,
	/new instructions:/i,
	/system prompt:/i,
	/\[INST\]/i,
	/\[\/INST\]/i,
] as const;

/** Patrones de PII para sanitización */
export const PII_PATTERNS = {
	email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
	phone: /(\+?[\d\s\-()]{10,})/g,
	creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
	ssn: /\b\d{3}[\s-]?\d{2}[\s-]?\d{4}\b/g,
	ipAddress: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
} as const;
