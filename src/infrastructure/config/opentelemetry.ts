// /*
// |--------------------------------------------------------------------------
// | OpenTelemetry Instrumentation
// |--------------------------------------------------------------------------
// |
// | Este archivo inicializa el SDK de OpenTelemetry para capturar métricas y
// | trazas (tracing) de la aplicación.
// |
// | IMPORTANTE: Debe importarse lo antes posible en la ejecución, idealmente
// | en la primera línea de `src/main.ts`.
// |
// */
// import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
// import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
// import { resourceFromAttributes } from "@opentelemetry/resources";
// import { NodeSDK } from "@opentelemetry/sdk-node";
// import {
// 	ATTR_SERVICE_NAME,
// 	ATTR_SERVICE_VERSION,
// } from "@opentelemetry/semantic-conventions";

// // Configuración del sdk
// const sdk = new NodeSDK({
// 	resource: resourceFromAttributes({
// 		[ATTR_SERVICE_NAME]: process.env.PUBLIC_NAME_APP || "astro-test-api",
// 		[ATTR_SERVICE_VERSION]: "2.0.0",
// 	}),
// 	// Exportador de trazas (hacia Jaeger, Tempo, SigNoz, etc.)
// 	// Por defecto busca en http://localhost:4318/v1/traces si no se define OTEL_EXPORTER_OTLP_ENDPOINT
// 	traceExporter: new OTLPTraceExporter(),
// 	// Instrumentaciones automáticas (Http, Express/Nest, Pg, Redis, etc.)
// 	instrumentations: [getNodeAutoInstrumentations()],
// });

// // Iniciar el SDK
// sdk.start();

// // Manejo de cierre elegante
// process.on("SIGTERM", () => {
// 	sdk
// 		.shutdown()
// 		// biome-ignore lint/suspicious/noConsole: Legacy support
// 		.then(() => console.log("Tracing terminated"))
// 		// biome-ignore lint/suspicious/noConsole: Legacy support
// 		.catch((error) => console.log("Error terminating tracing", error))
// 		.finally(() => process.exit(0));
// });
