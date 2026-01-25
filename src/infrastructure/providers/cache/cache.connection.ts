import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

export function getRedisUrl(configService: ConfigService) {
	const host = configService.get("REDIS_HOST");
	const port = configService.get("REDIS_PORT") || 6379;
	const password = configService.get("REDIS_PASSWORD");

	return password
		? `redis://:${password}@${host}:${port}`
		: `redis://${host}:${port}`;
}

// Y para las sesiones que SÍ necesitan el cliente ioredis:
export function getRedisClient(configService: ConfigService) {
	return new Redis(getRedisUrl(configService));
}
