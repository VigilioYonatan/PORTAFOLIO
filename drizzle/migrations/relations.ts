import { relations } from "drizzle-orm/relations";
import { tenants, contactMessages, workExperiences, workMilestones, conversations, users, projects, notifications, technologies, techeables, usageQuota, blogCategories, aiModelConfig, aiInsights, blogPosts, portfolioConfig, musicTracks, documents, documentChunks, tenantSetting, testimonials, chatMessages, socialReactions, socialComments, conversationDocuments } from "./schema";

export const contactMessagesRelations = relations(contactMessages, ({one}) => ({
	tenant: one(tenants, {
		fields: [contactMessages.tenantId],
		references: [tenants.id]
	}),
}));

export const tenantsRelations = relations(tenants, ({many}) => ({
	contactMessages: many(contactMessages),
	workExperiences: many(workExperiences),
	workMilestones: many(workMilestones),
	conversations: many(conversations),
	projects: many(projects),
	notifications: many(notifications),
	techeables: many(techeables),
	usageQuotas: many(usageQuota),
	blogCategories: many(blogCategories),
	users: many(users),
	aiModelConfigs: many(aiModelConfig),
	aiInsights: many(aiInsights),
	blogPosts: many(blogPosts),
	portfolioConfigs: many(portfolioConfig),
	musicTracks: many(musicTracks),
	documents: many(documents),
	technologies: many(technologies),
	tenantSettings: many(tenantSetting),
	testimonials: many(testimonials),
	chatMessages: many(chatMessages),
	socialReactions: many(socialReactions),
	socialComments: many(socialComments),
}));

export const workExperiencesRelations = relations(workExperiences, ({one, many}) => ({
	tenant: one(tenants, {
		fields: [workExperiences.tenantId],
		references: [tenants.id]
	}),
	workMilestones: many(workMilestones),
}));

export const workMilestonesRelations = relations(workMilestones, ({one}) => ({
	workExperience: one(workExperiences, {
		fields: [workMilestones.workExperienceId],
		references: [workExperiences.id]
	}),
	tenant: one(tenants, {
		fields: [workMilestones.tenantId],
		references: [tenants.id]
	}),
}));

export const conversationsRelations = relations(conversations, ({one, many}) => ({
	tenant: one(tenants, {
		fields: [conversations.tenantId],
		references: [tenants.id]
	}),
	user: one(users, {
		fields: [conversations.userId],
		references: [users.id]
	}),
	chatMessages: many(chatMessages),
	conversationDocuments: many(conversationDocuments),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	conversations: many(conversations),
	notifications: many(notifications),
	tenant: one(tenants, {
		fields: [users.tenantId],
		references: [tenants.id]
	}),
	blogPosts: many(blogPosts),
	documents: many(documents),
	socialComments: many(socialComments),
}));

export const projectsRelations = relations(projects, ({one}) => ({
	tenant: one(tenants, {
		fields: [projects.tenantId],
		references: [tenants.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	tenant: one(tenants, {
		fields: [notifications.tenantId],
		references: [tenants.id]
	}),
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));

export const techeablesRelations = relations(techeables, ({one}) => ({
	technology: one(technologies, {
		fields: [techeables.technologyId],
		references: [technologies.id]
	}),
	tenant: one(tenants, {
		fields: [techeables.tenantId],
		references: [tenants.id]
	}),
}));

export const technologiesRelations = relations(technologies, ({one, many}) => ({
	techeables: many(techeables),
	tenant: one(tenants, {
		fields: [technologies.tenantId],
		references: [tenants.id]
	}),
}));

export const usageQuotaRelations = relations(usageQuota, ({one}) => ({
	tenant: one(tenants, {
		fields: [usageQuota.tenantId],
		references: [tenants.id]
	}),
}));

export const blogCategoriesRelations = relations(blogCategories, ({one, many}) => ({
	tenant: one(tenants, {
		fields: [blogCategories.tenantId],
		references: [tenants.id]
	}),
	blogPosts: many(blogPosts),
}));

export const aiModelConfigRelations = relations(aiModelConfig, ({one, many}) => ({
	tenant: one(tenants, {
		fields: [aiModelConfig.tenantId],
		references: [tenants.id]
	}),
	aiInsights: many(aiInsights),
}));

export const aiInsightsRelations = relations(aiInsights, ({one}) => ({
	tenant: one(tenants, {
		fields: [aiInsights.tenantId],
		references: [tenants.id]
	}),
	aiModelConfig: one(aiModelConfig, {
		fields: [aiInsights.modelId],
		references: [aiModelConfig.id]
	}),
}));

export const blogPostsRelations = relations(blogPosts, ({one}) => ({
	tenant: one(tenants, {
		fields: [blogPosts.tenantId],
		references: [tenants.id]
	}),
	blogCategory: one(blogCategories, {
		fields: [blogPosts.categoryId],
		references: [blogCategories.id]
	}),
	user: one(users, {
		fields: [blogPosts.authorId],
		references: [users.id]
	}),
}));

export const portfolioConfigRelations = relations(portfolioConfig, ({one}) => ({
	tenant: one(tenants, {
		fields: [portfolioConfig.tenantId],
		references: [tenants.id]
	}),
}));

export const musicTracksRelations = relations(musicTracks, ({one}) => ({
	tenant: one(tenants, {
		fields: [musicTracks.tenantId],
		references: [tenants.id]
	}),
}));

export const documentsRelations = relations(documents, ({one, many}) => ({
	user: one(users, {
		fields: [documents.userId],
		references: [users.id]
	}),
	tenant: one(tenants, {
		fields: [documents.tenantId],
		references: [tenants.id]
	}),
	documentChunks: many(documentChunks),
	conversationDocuments: many(conversationDocuments),
}));

export const documentChunksRelations = relations(documentChunks, ({one}) => ({
	document: one(documents, {
		fields: [documentChunks.documentId],
		references: [documents.id]
	}),
}));

export const tenantSettingRelations = relations(tenantSetting, ({one}) => ({
	tenant: one(tenants, {
		fields: [tenantSetting.tenantId],
		references: [tenants.id]
	}),
}));

export const testimonialsRelations = relations(testimonials, ({one}) => ({
	tenant: one(tenants, {
		fields: [testimonials.tenantId],
		references: [tenants.id]
	}),
}));

export const chatMessagesRelations = relations(chatMessages, ({one}) => ({
	conversation: one(conversations, {
		fields: [chatMessages.conversationId],
		references: [conversations.id]
	}),
	tenant: one(tenants, {
		fields: [chatMessages.tenantId],
		references: [tenants.id]
	}),
}));

export const socialReactionsRelations = relations(socialReactions, ({one}) => ({
	tenant: one(tenants, {
		fields: [socialReactions.tenantId],
		references: [tenants.id]
	}),
}));

export const socialCommentsRelations = relations(socialComments, ({one}) => ({
	tenant: one(tenants, {
		fields: [socialComments.tenantId],
		references: [tenants.id]
	}),
	user: one(users, {
		fields: [socialComments.userId],
		references: [users.id]
	}),
}));

export const conversationDocumentsRelations = relations(conversationDocuments, ({one}) => ({
	conversation: one(conversations, {
		fields: [conversationDocuments.conversationId],
		references: [conversations.id]
	}),
	document: one(documents, {
		fields: [conversationDocuments.documentId],
		references: [documents.id]
	}),
}));