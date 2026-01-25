import { RustFSModule } from "@infrastructure/providers/storage/rustfs.module";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "../controllers/health.controller";
import { HealthService } from "../services/health.service";

/**
 * Health Module
 *
 * Provides health check endpoints using @nestjs/terminus.
 * Required for:
 * - Kubernetes liveness/readiness probes
 * - Load balancer health checks
 * - Monitoring and alerting systems
 */
@Module({
	imports: [TerminusModule, HttpModule, RustFSModule],
	controllers: [HealthController],
	providers: [HealthService],
})
export class HealthModule {}
