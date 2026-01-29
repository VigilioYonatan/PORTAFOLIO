import { CacheService } from "@infrastructure/providers/cache";
import { RustFSService } from "@infrastructure/providers/storage/rustfs.service";
import { Injectable } from "@nestjs/common";
import { HealthCheckService, MemoryHealthIndicator } from "@nestjs/terminus";
import type {
	HealthCheckResponseDto,
	HealthLivenessResponseDto,
	HealthReadinessResponseDto,
} from "../dtos/health.response.dto";

@Injectable()
export class HealthService {
	constructor(
		private health: HealthCheckService,
		private memory: MemoryHealthIndicator,
		private cacheService: CacheService,
		private rustfsService: RustFSService,
	) {}
	check(): HealthCheckResponseDto {
		return { status: "ok", timestamp: new Date().toISOString() };
	}

	checkDetailed(): Promise<import("@nestjs/terminus").HealthCheckResult> {
		return this.health.check([
			// 1. Memory Check
			() => this.memory.checkRSS("memory_rss", 300 * 1024 * 1024),
			() => this.memory.checkHeap("memory_heap", 200 * 1024 * 1024),

			// 2. Redis Check using CacheService
			async () => {
				const isHealthy = await this.cacheService.checkHealth();
				if (!isHealthy) {
					throw new Error("Redis connection failed");
				}
				return {
					redis: {
						status: "up",
					},
				};
			},

			// 3. S3 (RustFS) Check
			async () => {
				const isHealthy = await this.rustfsService.checkHealth();
				if (!isHealthy) {
					throw new Error("S3 object storage unreachable");
				}
				return {
					s3_storage: {
						status: "up",
					},
				};
			},
		]);
	}

	async readiness(): Promise<HealthReadinessResponseDto> {
		// En readiness verificamos conexiones críticas
		const redis = await this.cacheService.checkHealth();
		// S3 es opcional para arrancar si no es crítico, pero recomendable
		const s3 = await this.rustfsService.checkHealth();

		if (!redis) {
			// Service Unavailable
			throw new Error("Critical services are not ready");
		}

		return {
			status: "ready",
			services: {
				redis: redis ? "up" : "down",
				s3: s3 ? "up" : "down",
			},
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
		};
	}

	liveness(): HealthLivenessResponseDto {
		return {
			status: "alive",
			timestamp: new Date().toISOString(),
			pid: process.pid,
		};
	}
}
