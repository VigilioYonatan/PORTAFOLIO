import { z } from "@infrastructure/config/zod-i18n.config";

export const healthCheckResponseDto = z.object({
	status: z.string(),
	timestamp: z.string(),
});
export type HealthCheckResponseDto = z.infer<typeof healthCheckResponseDto>;

export const healthReadinessResponseDto = z.object({
	status: z.string(),
	services: z.object({
		redis: z.string(),
		s3: z.string(),
	}),
	timestamp: z.string(),
	uptime: z.number(),
});
export type HealthReadinessResponseDto = z.infer<
	typeof healthReadinessResponseDto
>;

export const healthLivenessResponseDto = z.object({
	status: z.string(),
	timestamp: z.string(),
	pid: z.number(),
});
export type HealthLivenessResponseDto = z.infer<typeof healthLivenessResponseDto>;
