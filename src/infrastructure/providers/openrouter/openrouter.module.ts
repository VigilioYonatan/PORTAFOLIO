import { Global, Module } from "@nestjs/common";
import { OpenRouterProvider } from "./openrouter.provider";

/**
 * Módulo global de OpenRouter
 * Exporta el proveedor para uso en toda la aplicación
 */
@Global()
@Module({
	providers: [OpenRouterProvider],
	exports: [OpenRouterProvider],
})
export class OpenRouterModule {}
