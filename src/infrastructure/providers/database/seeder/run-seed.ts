import { NestFactory } from "@nestjs/core";
import { SeederModule } from "./seeder.module";
import { SeederService } from "./seeder.service";

async function bootstrap() {
	// createApplicationContext crea la app SIN levantar Express/Fastify
	// Es perfecto para scripts, cronjobs y seeders.
	const app = await NestFactory.createApplicationContext(SeederModule);

	try {
		const seeder = app.get(SeederService);
		await seeder.run();
	} catch (error) {
		// biome-ignore lint/suspicious/noConsole: Legacy support
		console.error("❌ Error en el Seeder:", error);
	} finally {
		// ---
		// biome-ignore lint/suspicious/noConsole: Log
		console.log("Seeding completed!");
		await app.close(); // Cerramos la conexión al terminar
	}
}

bootstrap();
