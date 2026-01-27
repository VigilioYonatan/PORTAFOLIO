import { now } from "@infrastructure/utils/hybrid";
import { ChatRepository } from "@modules/chat/repositories/chat.repository";
import { DocumentRepository } from "@modules/documents/repositories/document.repository";
import { UserRepository } from "@modules/user/repositories/user.repository";
import { Injectable, Logger } from "@nestjs/common";
import type { DashboardResponseDto } from "../dtos/dashboard.response.dto";

@Injectable()
export class DashboardService {
	private readonly logger = new Logger(DashboardService.name);

	constructor(
		private readonly userRepository: UserRepository,
		private readonly documentRepository: DocumentRepository,
		private readonly chatRepository: ChatRepository,
	) {}

	async getMetrics(tenant_id: number): Promise<DashboardResponseDto> {
		this.logger.log({ tenant_id }, "Fetching dashboard metrics");

		// Get counts in parallel
		const [totalUsers, totalDocuments, totalChats, weeklyChats] =
			await Promise.all([
				this.userRepository.countByTenant(tenant_id),
				this.documentRepository.countByTenant(tenant_id),
				this.chatRepository.countByTenant(tenant_id),
				this.chatRepository.countWeeklyByTenant(tenant_id),
			]);

		// Total views approximation (chats count as views for now)
		const totalViews = totalChats * 2; // Rough approximation

		// Format weekly data for chart
		const weeklyVisits = this.formatWeeklyData(weeklyChats);

		return {
			success: true,
			metrics: {
				totalViews,
				totalUsers,
				totalDocuments,
				totalChats,
				weeklyVisits,
			},
		};
	}

	private formatWeeklyData(
		weeklyChats: { day: string; count: number }[],
	): { name: string; visits: number }[] {
		const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		const today = now();

		// Create last 7 days
		const result: { name: string; visits: number }[] = [];
		for (let i = 6; i >= 0; i--) {
			const date = today.subtract(i, "day");
			const dayName = dayNames[date.day()];
			const dateStr = date.format("YYYY-MM-DD");

			const found = weeklyChats.find((w) => w.day === dateStr);
			result.push({
				name: dayName,
				visits: found?.count || 0,
			});
		}

		return result;
	}
}
