// Roles

// Conversations
import { aiModelConfigEntity } from "@modules/ai/entities/ai-config.entity";
import {
	aiInsightEntity,
	aiInsightRelations,
} from "@modules/analytics/entities/ai-insight.entity";
import {
	blogCategoryEntity,
	blogCategoryEntityRelations,
} from "@modules/blog-category/entities/blog-category.entity";
import {
	blogPostEntity,
	blogPostEntityRelations,
} from "@modules/blog-post/entities/blog-post.entity";
import {
	chatMessageRelations,
	conversationDocumentRelations,
	conversationRelations,
} from "@modules/chat/entities/chat.relations";
import { chatMessageEntity } from "@modules/chat/entities/chat-message.entity";
import { conversationEntity } from "@modules/chat/entities/conversation.entity";
import { conversationDocumentEntity } from "@modules/chat/entities/conversation-document.entity";
// Contact
import { contactMessageEntity } from "@modules/contact/entities/contact-message.entity";
import {
	documentEntity,
	documentEntityRelations,
} from "@modules/documents/entities/document.entity";
import {
	documentChunkEntity,
	documentChunkEntityRelations,
} from "@modules/documents/entities/document-chunk.entity";
import {
	musicTrackEntity,
	musicTrackEntityRelations,
} from "@modules/music/entities/music.entity";
import {
	notificationEntity,
	notificationRelations,
} from "@modules/notification/entities/notification.entity";
import { subscriptionEntity } from "@modules/notification/entities/subscription.entity";
import {
	openSourceEntity,
	openSourceEntityRelations,
} from "@modules/open-source/entities/open-source.entity";
// Portfolio Config
import {
	portfolioConfigEntity,
	portfolioConfigEntityRelations,
} from "@modules/portfolio-config/entities/portfolio-config.entity";
import {
	projectEntity,
	projectEntityRelations,
} from "@modules/project/entities/project.entity";
// import { demoUsageEntity } from "@modules/demo/entities/demo-usage.entity";
import {
	socialCommentEntity,
	socialCommentRelations,
} from "@modules/social/entities/social-comment.entity";
import {
	socialReactionEntity,
	socialReactionRelations,
} from "@modules/social/entities/social-reaction.entity";
import {
	techeableEntity,
	techeableEntityRelations,
} from "@modules/techeable/entities/techeable.entity";
import {
	technologyEntity,
	technologyEntityRelations,
} from "@modules/technology/entities/technology.entity";
/*
import {
  candidateEntity,
  candidateEntityRelations,
} from "@modules/recruitment/entities/candidate.entity";
// Recruitment
import {
  jobPositionEntity,
  jobPositionEntityRelations,
} from "@modules/recruitment/entities/job-position.entity";
import {
  roleEntity,
  roleEntityRelations,
} from "@modules/role/entities/role.entity";
*/
import { tenantEntity } from "@modules/tenant/entities/tenant.entity";
import {
	tenantEntityRelations,
	tenantSettingEntityRelations,
} from "@modules/tenant/entities/tenant.relations";
import { tenantSettingEntity } from "@modules/tenant/entities/tenant-setting.entity";
import {
	testimonialEntity,
	testimonialEntityRelations,
} from "@modules/testimonial/entities/testimonial.entity";
import {
	usageQuotaEntity,
	usageQuotaEntityRelations,
} from "@modules/usage/entities/usage-quota.entity";
import {
	userEntity,
	userEntityRelations,
} from "@modules/user/entities/user.entity";
import {
	workExperienceEntity,
	workExperienceEntityRelations,
} from "@modules/work-experience/entities/work-experience.entity";
import {
	workMilestoneEntity,
	workMilestoneEntityRelations,
} from "@modules/work-milestone/entities/work-milestone.entity";

export interface Schema {
	tenantEntity: typeof tenantEntity;
	tenantSettingEntity: typeof tenantSettingEntity;
	tenantEntityRelations: typeof tenantEntityRelations;
	tenantSettingEntityRelations: typeof tenantSettingEntityRelations;
	userEntity: typeof userEntity;
	userEntityRelations: typeof userEntityRelations;
	contactMessageEntity: typeof contactMessageEntity;
	socialCommentEntity: typeof socialCommentEntity;
	socialCommentRelations: typeof socialCommentRelations;
	socialReactionEntity: typeof socialReactionEntity;
	socialReactionRelations: typeof socialReactionRelations;
	documentEntity: typeof documentEntity;
	documentEntityRelations: typeof documentEntityRelations;
	documentChunkEntity: typeof documentChunkEntity;
	documentChunkEntityRelations: typeof documentChunkEntityRelations;
	// Usage
	usageQuotaEntity: typeof usageQuotaEntity;
	usageQuotaEntityRelations: typeof usageQuotaEntityRelations;
	/*
  roleEntity: typeof roleEntity;
  roleEntityRelations: typeof roleEntityRelations;
  // Recruitment
  jobPositionEntity: typeof jobPositionEntity;
  jobPositionEntityRelations: typeof jobPositionEntityRelations;
  candidateEntity: typeof candidateEntity;
  candidateEntityRelations: typeof candidateEntityRelations;
  */
	aiModelConfigEntity: typeof aiModelConfigEntity;
	// aiModelConfigRelations: typeof aiModelConfigRelations;
	// demoUsageEntity: typeof demoUsageEntity;
	// Portfolio Config
	portfolioConfigEntity: typeof portfolioConfigEntity;
	portfolioConfigEntityRelations: typeof portfolioConfigEntityRelations;
	// Testimonials
	testimonialEntity: typeof testimonialEntity;
	testimonialEntityRelations: typeof testimonialEntityRelations;
	// Projects
	projectEntity: typeof projectEntity;
	projectEntityRelations: typeof projectEntityRelations;
	// Work Experience
	workExperienceEntity: typeof workExperienceEntity;
	workExperienceEntityRelations: typeof workExperienceEntityRelations;
	// Work Milestones
	workMilestoneEntity: typeof workMilestoneEntity;
	workMilestoneEntityRelations: typeof workMilestoneEntityRelations;
	// Blog Categories
	blogCategoryEntity: typeof blogCategoryEntity;
	blogCategoryEntityRelations: typeof blogCategoryEntityRelations;
	// Blog Posts
	// Blog Posts
	blogPostEntity: typeof blogPostEntity;
	blogPostEntityRelations: typeof blogPostEntityRelations;
	// Technology
	// Technology
	technologyEntity: typeof technologyEntity;
	technologyEntityRelations: typeof technologyEntityRelations;
	// Techeable
	techeableEntity: typeof techeableEntity;
	techeableEntityRelations: typeof techeableEntityRelations;
	// Music
	musicTrackEntity: typeof musicTrackEntity;
	musicTrackEntityRelations: typeof musicTrackEntityRelations;
	// Chat
	conversationEntity: typeof conversationEntity;
	conversationRelations: typeof conversationRelations;
	chatMessageEntity: typeof chatMessageEntity;
	chatMessageRelations: typeof chatMessageRelations;
	conversationDocumentEntity: typeof conversationDocumentEntity;
	conversationDocumentRelations: typeof conversationDocumentRelations;
	// Notifications
	notificationEntity: typeof notificationEntity;
	notificationRelations: typeof notificationRelations;
	subscriptionEntity: typeof subscriptionEntity;
	aiInsightEntity: typeof aiInsightEntity;
	aiInsightRelations: typeof aiInsightRelations;
	// Open Source
	openSourceEntity: typeof openSourceEntity;
	openSourceEntityRelations: typeof openSourceEntityRelations;

	[key: string]: unknown;
}
export const schema: Schema = {
	// AI
	aiModelConfigEntity,
	// aiModelConfigRelations,
	// Tenants
	tenantEntity,
	tenantSettingEntity,
	tenantEntityRelations,
	tenantSettingEntityRelations,
	// Users
	userEntity,
	userEntityRelations,

	// Roles
	/*
  roleEntity,
  roleEntityRelations,
  */
	// Contact
	contactMessageEntity,
	// Social
	socialCommentEntity,
	socialCommentRelations,
	socialReactionEntity,
	socialReactionRelations,
	// Documents
	documentEntity,
	documentEntityRelations,
	documentChunkEntity,
	documentChunkEntityRelations,
	// Usage
	usageQuotaEntity,
	usageQuotaEntityRelations,
	// Recruitment
	/*
  jobPositionEntity,
  jobPositionEntityRelations,
  candidateEntity,
  candidateEntityRelations,
  */
	// demoUsageEntity,
	// Portfolio Config
	portfolioConfigEntity,
	portfolioConfigEntityRelations,
	// Testimonials
	testimonialEntity,
	testimonialEntityRelations,
	// Projects
	projectEntity,
	projectEntityRelations,
	// Work Experience
	workExperienceEntity,
	workExperienceEntityRelations,
	// Blog Categories
	blogCategoryEntity,
	blogCategoryEntityRelations,
	// Blog Posts
	blogPostEntity,
	blogPostEntityRelations,
	// Technology
	// Technology
	technologyEntity,
	technologyEntityRelations,
	// Techeable
	techeableEntity,
	techeableEntityRelations,
	// Music
	musicTrackEntity,
	musicTrackEntityRelations,
	// Chat
	conversationEntity,
	conversationRelations,
	chatMessageEntity,
	chatMessageRelations,
	conversationDocumentEntity,
	conversationDocumentRelations,
	// Notifications
	notificationEntity,
	notificationRelations,
	subscriptionEntity,
	// Work Milestones
	workMilestoneEntity,
	workMilestoneEntityRelations,
	aiInsightEntity,
	aiInsightRelations,
	// Open Source
	openSourceEntity,
	openSourceEntityRelations,
};
