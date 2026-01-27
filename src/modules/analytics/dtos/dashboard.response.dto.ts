import { z } from "@infrastructure/config/zod-i18n.config";

/**
 * Weekly visit data for chart
 */
export const weeklyVisitSchema = z.object({
	name: z.string(),
	visits: z.number().int().nonnegative(),
});

/**
 * Dashboard metrics schema
 */
export const dashboardMetricsSchema = z.object({
	totalViews: z.number().int().nonnegative(),
	totalUsers: z.number().int().nonnegative(),
	totalDocuments: z.number().int().nonnegative(),
	totalChats: z.number().int().nonnegative(),
	weeklyVisits: z.array(weeklyVisitSchema),
});

/**
 * Dashboard response DTO
 */
export const dashboardResponseDto = z.object({
	success: z.literal(true),
	metrics: dashboardMetricsSchema,
});

export type WeeklyVisit = z.infer<typeof weeklyVisitSchema>;
export type DashboardMetricsSchema = z.infer<typeof dashboardMetricsSchema>;
export type DashboardResponseDto = z.infer<typeof dashboardResponseDto>;
