import { join } from "node:path";
import { validateEnvironments } from "@infrastructure/config/server";
import { configureApp } from "@infrastructure/config/server/app.config";
import { astroProxy } from "@infrastructure/utils/server";
import { SessionConfigService } from "@modules/auth/config/session.config";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import express, { type Request, type Response, type NextFunction, type Application } from "express";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module";

// Cacheamos la instancia del servidor para optimizar ejecuciones en Vercel
let serverCache: Application;

async function bootstrap(): Promise<Application> {
    // Validar variables de entorno
    validateEnvironments();

    // Especificamos que usamos la plataforma Express
    const app = await NestFactory.create(AppModule, { 
        bufferLogs: true 
    });
    
    app.enableShutdownHooks();

    const configService = app.get(ConfigService);
    const corsOrigins = configService.getOrThrow<string>("CORS_ORIGINS") as string;
    const port = configService.get<number>("PORT") || 3000;

    // Logger
    app.useLogger(app.get(Logger));

    // CORS
    app.enableCors({
        origin: corsOrigins === "*" ? "*" : corsOrigins.split(",").map((s) => s.trim()),
        credentials: true,
    });

    // Prefijos y configuración global
    configureApp(app);

    // Sesión
    const sessionConfig = app.get(SessionConfigService);
    sessionConfig.setup(app);
    
    // Servir archivos estáticos de la carpeta dist/client
    app.use(express.static(join(process.cwd(), "dist/client")));

    // Inicializamos la aplicación Nest sin bloquear el hilo con listen()
    await app.init();

    // Obtenemos la instancia subyacente de Express
    const expressApp = app.getHttpAdapter().getInstance() as Application;

    // Ejecución en local (fuera de Vercel)
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
        const httpServer = await app.listen(port);
        // Manejo de protocolos Upgrade (WebSockets) para el proxy de Astro
        httpServer.on("upgrade", astroProxy.upgrade);
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.log(`Application is running on: http://localhost:${port}`);
    }

    return expressApp;
}

/**
 * Handler para Vercel Serverless Functions
 */
export const handler = async (req: Request, res: Response, next: NextFunction) => {
    if (!serverCache) {
        serverCache = await bootstrap();
    }
    // Express maneja internamente la ejecución de la petición
    return serverCache(req, res, next);
};

// Punto de entrada manual si se ejecuta el archivo directamente
if (require.main === module) {
    bootstrap();
}