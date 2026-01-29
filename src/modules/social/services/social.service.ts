import { paginator } from "@infrastructure/utils/server";
import { NotificationService } from "@modules/notification/services/notification.service";
import { Injectable, Logger } from "@nestjs/common";
import { SocialCache } from "../caches/social.cache";
import type {
	SocialCommentDestroyResponseDto,
	SocialCommentIndexResponseDto,
	SocialCommentReplyResponseDto,
	SocialCommentStoreResponseDto,
	SocialCommentUpdateResponseDto,
	SocialReactionCountResponseDto,
	SocialReactionToggleResponseDto,
} from "../dtos/social.response.dto";
import type { SocialCommentQueryDto } from "../dtos/social-comment.query.dto";
import type { SocialCommentStoreDto } from "../dtos/social-comment.store.dto";
import type { SocialCommentUpdateDto } from "../dtos/social-comment.update.dto";
import type { SocialReactionStoreDto } from "../dtos/social-reaction.store.dto";
import { SocialRepository } from "../repositories/social.repository";
import type { SocialCommentSchema } from "../schemas/social-comment.schema";
import type { SocialReactionSchema } from "../schemas/social-reaction.schema";

@Injectable()
export class SocialService {
	private readonly logger = new Logger(SocialService.name);

	constructor(
		private readonly repository: SocialRepository,
		private readonly socialCache: SocialCache,
		private readonly notificationService: NotificationService,
	) {}

	async index(
		tenant_id: number,
		query: SocialCommentQueryDto,
	): Promise<SocialCommentIndexResponseDto> {
		this.logger.log({ tenant_id }, "Listing social comments");

		return await paginator<SocialCommentQueryDto, SocialCommentSchema>(
			"/social/comments",
			{
				filters: query,
				cb: async (filters) => {
					const result = await this.repository.indexComments(
						tenant_id,
						filters,
					);
					return result;
				},
			},
		);
	}

	async store(
		tenant_id: number,
		body: SocialCommentStoreDto,
	): Promise<SocialCommentStoreResponseDto> {
		this.logger.log({ tenant_id }, "Creating social comment");
		const comment = await this.repository.storeComment(tenant_id, {
			...body,
			is_visible: true, // Default to true
			user_id: null, // No admin user yet
			reply: null, // No reply yet
		});
		await this.socialCache.invalidateLists(tenant_id);

		// Send push notification to Admin
		this.notificationService.sendPushNotification(tenant_id, 1, {
			title: `New Comment from ${body.name}`,
			body: body.content.substring(0, 50) + "...",
			url: `/dashboard/content`, // Or specific project/post url
			icon: "/favicon.ico",
		});

		return { success: true, comment };
	}

	async toggleReaction(
		tenant_id: number,
		visitor_id: string,
		body: SocialReactionStoreDto,
	): Promise<SocialReactionToggleResponseDto> {
		this.logger.log({ tenant_id, visitor_id }, "Toggling social reaction");

		const existing = await this.repository.showReaction(
			tenant_id,
			visitor_id,
			body.reactable_id,
			body.reactable_type,
		);

		if (existing) {
			if (existing.type === body.type) {
				// Toggle OFF
				await this.repository.destroyReaction(tenant_id, existing.id);
				return { action: "REMOVED" };
			} else {
				// Change Type
				const updated = await this.repository.updateReaction(
					tenant_id,
					existing.id,
					body.type,
				);
				return { action: "ADDED", reaction: updated };
			}
		}

		// Create New
		const reaction = await this.repository.storeReaction(tenant_id, {
			...body,
			visitor_id,
		});
		return { action: "ADDED", reaction };
	}

	async getReactionCounts(
		reactable_id: number,
		reactable_type: SocialReactionSchema["reactable_type"],
	): Promise<SocialReactionCountResponseDto> {
		this.logger.log(
			{ reactable_id, reactable_type },
			"Fetching reaction counts",
		);

		// 1. Try Cache
		const cached = await this.socialCache.getReactionCounts(
			reactable_id,
			reactable_type,
		);
		if (cached) {
			return cached;
		}

		// 2. Try DB
		const counts = await this.repository.showReactionCounts(
			reactable_id,
			reactable_type,
		);

		// 3. Set Cache
		await this.socialCache.setReactionCounts(
			reactable_id,
			reactable_type,
			counts,
		);

		return counts;
	}

	async update(
		tenant_id: number,
		id: number,
		body: SocialCommentUpdateDto,
	): Promise<SocialCommentUpdateResponseDto> {
		this.logger.log({ tenant_id, id }, "Updating social comment");
		const comment = await this.repository.updateComment(tenant_id, id, body);
		await this.socialCache.invalidateLists(tenant_id);
		return { success: true, comment };
	}

	async reply(
		tenant_id: number,
		id: number,
		body: { content: string }, // Using content from DTO
	): Promise<SocialCommentReplyResponseDto> {
		this.logger.log({ tenant_id, id }, "Replying to social comment");
		const comment = await this.repository.updateComment(tenant_id, id, {
			reply: body.content,
		});
		await this.socialCache.invalidateLists(tenant_id);
		return { success: true, comment };
	}

	async destroy(
		tenant_id: number,
		id: number,
	): Promise<SocialCommentDestroyResponseDto> {
		this.logger.log({ tenant_id, id }, "Deleting social comment");
		await this.repository.destroyComment(tenant_id, id);
		await this.socialCache.invalidateLists(tenant_id);
		return { success: true, message: "Comment deleted successfully" };
	}
}
