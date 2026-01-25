import { pgTable, index, foreignKey, serial, integer, text, varchar, boolean, timestamp, unique, jsonb, uuid, bigint, numeric, vector, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const chatModeEnum = pgEnum("chat_mode_enum", ['AI', 'LIVE'])
export const chatRoleEnum = pgEnum("chat_role_enum", ['USER', 'ASSISTANT', 'SYSTEM', 'ADMIN'])
export const defaultLanguageEnum = pgEnum("default_language_enum", ['ES', 'EN', 'PT'])
export const documentStatusEnum = pgEnum("document_status_enum", ['PENDING', 'PROCESSING', 'READY', 'FAILED'])
export const languageEnum = pgEnum("language_enum", ['ES', 'EN', 'PT'])
export const notificationTypeEnum = pgEnum("notification_type_enum", ['LIKE', 'COMMENT', 'CONTACT', 'SYSTEM'])
export const planEnum = pgEnum("plan_enum", ['FREE', 'BASIC', 'PRO', 'ENTERPRISE'])
export const reactionTypeEnum = pgEnum("reaction_type_enum", ['LIKE', 'LOVE', 'CLAP', 'FIRE'])
export const technologyCategoryEnum = pgEnum("technology_category_enum", ['FRONTEND', 'BACKEND', 'DATABASE', 'DEVOPS', 'LANGUAGE', 'MOBILE', 'AI'])
export const timeZoneEnum = pgEnum("time_zone_enum", ['UTC', 'America/Lima', 'America/Bogota'])
export const timezoneEnum = pgEnum("timezone_enum", ['UTC', 'America/Lima', 'America/New_York', 'America/Bogota', 'America/Mexico_City'])
export const userStatusEnum = pgEnum("user_status_enum", ['ACTIVE', 'BANNED', 'PENDING'])


export const contactMessages = pgTable("contact_messages", {
	id: serial().primaryKey().notNull(),
	tenantId: integer("tenant_id"),
	name: text().notNull(),
	email: varchar({ length: 255 }).notNull(),
	subject: varchar({ length: 200 }),
	message: text().notNull(),
	ipAddress: varchar("ip_address", { length: 45 }),
	isRead: boolean("is_read").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	phoneNumber: varchar("phone_number", { length: 50 }),
}, (table) => [
	index("idx_contact_msgs_tenant").using("btree", table.tenantId.asc().nullsLast().op("int4_ops")),
	index("idx_contact_msgs_tenant_read").using("btree", table.tenantId.asc().nullsLast().op("int4_ops"), table.isRead.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "contact_messages_tenant_id_tenants_id_fk"
		}),
]);

export const workExperiences = pgTable("work_experiences", {
	id: serial().primaryKey().notNull(),
	company: varchar({ length: 100 }).notNull(),
	position: varchar({ length: 100 }).notNull(),
	description: text().notNull(),
	location: varchar({ length: 100 }),
	sortOrder: integer("sort_order").default(0).notNull(),
	isCurrent: boolean("is_current").default(false).notNull(),
	isVisible: boolean("is_visible").default(true).notNull(),
	startDate: timestamp("start_date", { withTimezone: true, mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { withTimezone: true, mode: 'string' }),
	tenantId: integer("tenant_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("work_experiences_tenant_idx").using("btree", table.tenantId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "work_experiences_tenant_id_tenants_id_fk"
		}),
]);

export const workMilestones = pgTable("work_milestones", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 100 }).notNull(),
	description: varchar({ length: 500 }).notNull(),
	icon: varchar({ length: 100 }),
	milestoneDate: timestamp("milestone_date", { withTimezone: true, mode: 'string' }).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	workExperienceId: integer("work_experience_id").notNull(),
	tenantId: integer("tenant_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("work_milestones_experience_idx").using("btree", table.workExperienceId.asc().nullsLast().op("int4_ops")),
	index("work_milestones_tenant_idx").using("btree", table.tenantId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.workExperienceId],
			foreignColumns: [workExperiences.id],
			name: "work_milestones_work_experience_id_work_experiences_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "work_milestones_tenant_id_tenants_id_fk"
		}),
]);

export const tenants = pgTable("tenants", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	domain: varchar({ length: 100 }),
	logo: jsonb(),
	email: varchar({ length: 100 }).notNull(),
	phone: varchar({ length: 20 }),
	address: text(),
	plan: planEnum().default('FREE').notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	trialEndsAt: timestamp("trial_ends_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("tenants_slug_unique").on(table.slug),
	unique("tenants_domain_unique").on(table.domain),
]);

export const conversations = pgTable("conversations", {
	id: serial().primaryKey().notNull(),
	ipAddress: varchar("ip_address", { length: 45 }).notNull(),
	title: varchar({ length: 200 }).notNull(),
	mode: chatModeEnum().default('AI').notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	visitorId: uuid("visitor_id").notNull(),
	tenantId: integer("tenant_id").notNull(),
	userId: integer("user_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("conversations_tenant_idx").using("btree", table.tenantId.asc().nullsLast().op("int4_ops")),
	index("conversations_tenant_visitor_idx").using("btree", table.tenantId.asc().nullsLast().op("uuid_ops"), table.visitorId.asc().nullsLast().op("int4_ops")),
	index("conversations_user_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	index("conversations_visitor_idx").using("btree", table.visitorId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "conversations_tenant_id_tenants_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "conversations_user_id_users_id_fk"
		}),
]);

export const projects = pgTable("projects", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 200 }).notNull(),
	slug: varchar({ length: 200 }).notNull(),
	description: varchar({ length: 500 }).notNull(),
	content: text().notNull(),
	impactSummary: text("impact_summary").notNull(),
	websiteUrl: varchar("website_url", { length: 500 }),
	repoUrl: varchar("repo_url", { length: 500 }),
	githubStars: integer("github_stars").default(0),
	githubForks: integer("github_forks").default(0),
	languagesStats: jsonb("languages_stats"),
	sortOrder: integer("sort_order").default(0).notNull(),
	isFeatured: boolean("is_featured").default(false).notNull(),
	isVisible: boolean("is_visible").default(true).notNull(),
	images: jsonb(),
	tenantId: integer("tenant_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	seo: jsonb(),
	startDate: timestamp("start_date", { withTimezone: true, mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { withTimezone: true, mode: 'string' }),
	status: text().default('in_dev').notNull(),
}, (table) => [
	index("projects_tenant_idx").using("btree", table.tenantId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "projects_tenant_id_tenants_id_fk"
		}),
	unique("projects_tenant_slug_unique").on(table.slug, table.tenantId),
]);

export const notifications = pgTable("notifications", {
	id: serial().primaryKey().notNull(),
	tenantId: integer("tenant_id").notNull(),
	type: notificationTypeEnum().notNull(),
	title: varchar({ length: 100 }).notNull(),
	content: text().notNull(),
	isRead: boolean("is_read").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	userId: integer("user_id").notNull(),
	link: varchar({ length: 500 }),
}, (table) => [
	index("notifications_read_idx").using("btree", table.tenantId.asc().nullsLast().op("bool_ops"), table.isRead.asc().nullsLast().op("int4_ops")),
	index("notifications_tenant_idx").using("btree", table.tenantId.asc().nullsLast().op("int4_ops")),
	index("notifications_user_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "notifications_tenant_id_tenants_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_user_id_users_id_fk"
		}),
]);

export const techeables = pgTable("techeables", {
	id: serial().primaryKey().notNull(),
	techeableId: integer("techeable_id").notNull(),
	techeableType: text("techeable_type").notNull(),
	technologyId: integer("technology_id").notNull(),
	tenantId: integer("tenant_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.technologyId],
			foreignColumns: [technologies.id],
			name: "techeables_technology_id_technologies_id_fk"
		}),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "techeables_tenant_id_tenants_id_fk"
		}),
	unique("unique_techeable_technology").on(table.techeableId, table.techeableType, table.technologyId, table.tenantId),
]);

export const usageQuota = pgTable("usage_quota", {
	id: serial().primaryKey().notNull(),
	year: integer().notNull(),
	month: integer().notNull(),
	documentsCount: integer("documents_count").default(0).notNull(),
	messagesCount: integer("messages_count").default(0).notNull(),
	tokensCount: integer("tokens_count").default(0).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	storageBytes: bigint("storage_bytes", { mode: "number" }).default(0).notNull(),
	tenantId: integer("tenant_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("usage_quota_tenant_idx").using("btree", table.tenantId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "usage_quota_tenant_id_tenants_id_fk"
		}),
	unique("usage_quota_tenant_year_month_unique").on(table.month, table.tenantId, table.year),
]);

export const blogCategories = pgTable("blog_categories", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	description: text(),
	tenantId: integer("tenant_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("blog_categories_tenant_idx").using("btree", table.tenantId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "blog_categories_tenant_id_tenants_id_fk"
		}),
	unique("blog_categories_tenant_slug_unique").on(table.slug, table.tenantId),
	unique("blog_categories_tenant_name_unique").on(table.name, table.tenantId),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: varchar({ length: 50 }).notNull(),
	email: varchar({ length: 100 }).notNull(),
	phoneNumber: varchar("phone_number", { length: 50 }),
	password: varchar({ length: 200 }).notNull(),
	googleId: varchar("google_id", { length: 100 }),
	qrCodeToken: varchar("qr_code_token", { length: 100 }),
	status: userStatusEnum().default('PENDING').notNull(),
	securityStamp: uuid("security_stamp").defaultRandom().notNull(),
	failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
	isMfaEnabled: boolean("is_mfa_enabled").default(false).notNull(),
	isSuperuser: boolean("is_superuser").default(false).notNull(),
	emailVerifiedAt: timestamp("email_verified_at", { mode: 'string' }),
	lockoutEndAt: timestamp("lockout_end_at", { mode: 'string' }),
	mfaSecret: text("mfa_secret"),
	lastIpAddress: varchar("last_ip_address", { length: 45 }),
	lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: 'string' }),
	avatar: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	roleId: integer("role_id").notNull(),
	tenantId: integer("tenant_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "users_tenant_id_tenants_id_fk"
		}),
	unique("user_qr_token_unique").on(table.qrCodeToken),
	unique("user_email_tenant_unique").on(table.email, table.tenantId),
]);

export const aiModelConfig = pgTable("ai_model_config", {
	id: serial().primaryKey().notNull(),
	tenantId: integer("tenant_id").notNull(),
	chatModel: text("chat_model").default('gpt-4o-mini').notNull(),
	embeddingModel: text("embedding_model").default('text-embedding-3-small').notNull(),
	embeddingDimensions: integer("embedding_dimensions").default(1536).notNull(),
	systemPrompt: text("system_prompt"),
	temperature: numeric({ precision: 3, scale:  2 }).default('0.7').notNull(),
	maxTokens: integer("max_tokens").default(2000).notNull(),
	chunkSize: integer("chunk_size").default(1000).notNull(),
	chunkOverlap: integer("chunk_overlap").default(200).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ai_model_config_tenant_idx").using("btree", table.tenantId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "ai_model_config_tenant_id_tenants_id_fk"
		}),
]);

export const aiInsights = pgTable("ai_insights", {
	id: serial().primaryKey().notNull(),
	tenantId: integer("tenant_id").notNull(),
	insightsData: jsonb("insights_data").notNull(),
	modelId: integer("model_id"),
	generatedAt: timestamp("generated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ai_insights_tenant_idx").using("btree", table.tenantId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "ai_insights_tenant_id_tenants_id_fk"
		}),
	foreignKey({
			columns: [table.modelId],
			foreignColumns: [aiModelConfig.id],
			name: "ai_insights_model_id_ai_model_config_id_fk"
		}),
]);

export const blogPosts = pgTable("blog_posts", {
	id: serial().primaryKey().notNull(),
	tenantId: integer("tenant_id").notNull(),
	title: varchar({ length: 200 }).notNull(),
	slug: varchar({ length: 200 }).notNull(),
	content: text().notNull(),
	extract: varchar({ length: 500 }),
	isPublished: boolean("is_published").default(false).notNull(),
	readingTimeMinutes: integer("reading_time_minutes"),
	cover: jsonb(),
	seo: jsonb(),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	categoryId: integer("category_id"),
	authorId: integer("author_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("blog_posts_author_idx").using("btree", table.authorId.asc().nullsLast().op("int4_ops")),
	index("blog_posts_category_idx").using("btree", table.categoryId.asc().nullsLast().op("int4_ops")),
	index("blog_posts_tenant_idx").using("btree", table.tenantId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "blog_posts_tenant_id_tenants_id_fk"
		}),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [blogCategories.id],
			name: "blog_posts_category_id_blog_categories_id_fk"
		}),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "blog_posts_author_id_users_id_fk"
		}),
	unique("blog_posts_tenant_slug_unique").on(table.slug, table.tenantId),
]);

export const portfolioConfig = pgTable("portfolio_config", {
	id: serial().primaryKey().notNull(),
	tenantId: integer("tenant_id").notNull(),
	name: varchar({ length: 100 }).notNull(),
	profileTitle: varchar("profile_title", { length: 200 }).notNull(),
	biography: text().notNull(),
	email: varchar({ length: 100 }).notNull(),
	phone: varchar({ length: 20 }),
	address: text(),
	socialLinks: jsonb("social_links"),
	logo: jsonb(),
	colorPrimary: varchar("color_primary", { length: 50 }).notNull(),
	colorSecondary: varchar("color_secondary", { length: 50 }).notNull(),
	defaultLanguage: defaultLanguageEnum("default_language").default('ES').notNull(),
	timeZone: timeZoneEnum("time_zone"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "portfolio_config_tenant_id_tenants_id_fk"
		}),
	unique("portfolio_config_tenant_unique").on(table.tenantId),
]);

export const musicTracks = pgTable("music_tracks", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 200 }).notNull(),
	artist: varchar({ length: 100 }).notNull(),
	durationSeconds: integer("duration_seconds").notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	isFeatured: boolean("is_featured").default(false).notNull(),
	isPublic: boolean("is_public").default(true).notNull(),
	audioFile: jsonb("audio_file").notNull(),
	cover: jsonb().default([]),
	tenantId: integer("tenant_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	description: varchar({ length: 500 }).notNull(),
	releaseDate: timestamp("release_date", { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	index("music_tracks_tenant_idx").using("btree", table.tenantId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "music_tracks_tenant_id_tenants_id_fk"
		}),
]);

export const documents = pgTable("documents", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 200 }).notNull(),
	chunkCount: integer("chunk_count").default(0).notNull(),
	isIndexed: boolean("is_indexed").default(false).notNull(),
	status: documentStatusEnum().default('PENDING').notNull(),
	file: jsonb().notNull(),
	metadata: jsonb(),
	processedAt: timestamp("processed_at", { withTimezone: true, mode: 'string' }),
	userId: integer("user_id").notNull(),
	tenantId: integer("tenant_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("documents_tenant_idx").using("btree", table.tenantId.asc().nullsLast().op("int4_ops")),
	index("documents_user_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "documents_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "documents_tenant_id_tenants_id_fk"
		}),
]);

export const documentChunks = pgTable("document_chunks", {
	id: serial().primaryKey().notNull(),
	content: text().notNull(),
	embedding: vector({ dimensions: 1536 }),
	chunkIndex: integer("chunk_index").notNull(),
	tokenCount: integer("token_count").notNull(),
	documentId: integer("document_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("document_chunks_document_idx").using("btree", table.documentId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [documents.id],
			name: "document_chunks_document_id_documents_id_fk"
		}).onDelete("cascade"),
]);

export const technologies = pgTable("technologies", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	category: technologyCategoryEnum().notNull(),
	icon: jsonb().default([]).notNull(),
	tenantId: integer("tenant_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("technologies_tenant_idx").using("btree", table.tenantId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "technologies_tenant_id_tenants_id_fk"
		}),
	unique("technologies_tenant_name_unique").on(table.name, table.tenantId),
]);

export const tenantSetting = pgTable("tenant_setting", {
	id: serial().primaryKey().notNull(),
	isVerified: boolean("is_verified").default(false).notNull(),
	colorPrimary: varchar("color_primary", { length: 50 }).default('#000000').notNull(),
	colorSecondary: varchar("color_secondary", { length: 50 }).default('#ffffff').notNull(),
	defaultLanguage: languageEnum("default_language").default('ES').notNull(),
	timeZone: timezoneEnum("time_zone").default('UTC'),
	tenantId: integer("tenant_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "tenant_setting_tenant_id_tenants_id_fk"
		}),
	unique("tenant_setting_tenant_id_unique").on(table.tenantId),
]);

export const testimonials = pgTable("testimonials", {
	id: serial().primaryKey().notNull(),
	authorName: varchar("author_name", { length: 100 }).notNull(),
	authorRole: varchar("author_role", { length: 100 }).notNull(),
	authorCompany: varchar("author_company", { length: 100 }),
	content: text().notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	isVisible: boolean("is_visible").default(true).notNull(),
	avatar: jsonb(),
	tenantId: integer("tenant_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_testimonials_tenant").using("btree", table.tenantId.asc().nullsLast().op("int4_ops")),
	index("idx_testimonials_visible_sort").using("btree", table.isVisible.asc().nullsLast().op("int4_ops"), table.sortOrder.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "testimonials_tenant_id_tenants_id_fk"
		}),
]);

export const chatMessages = pgTable("chat_messages", {
	id: serial().primaryKey().notNull(),
	role: chatRoleEnum().default('USER').notNull(),
	content: text().notNull(),
	sources: jsonb().default([]).notNull(),
	isRead: boolean("is_read").default(false).notNull(),
	conversationId: integer("conversation_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	tenantId: integer("tenant_id").notNull(),
}, (table) => [
	index("chat_messages_conversation_idx").using("btree", table.conversationId.asc().nullsLast().op("int4_ops")),
	index("chat_messages_tenant_idx").using("btree", table.tenantId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [conversations.id],
			name: "chat_messages_conversation_id_conversations_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "chat_messages_tenant_id_tenants_id_fk"
		}),
]);

export const socialReactions = pgTable("social_reactions", {
	id: serial().primaryKey().notNull(),
	tenantId: integer("tenant_id").notNull(),
	type: reactionTypeEnum().default('LIKE').notNull(),
	reactableId: integer("reactable_id").notNull(),
	reactableType: varchar("reactable_type", { length: 50 }).notNull(),
	visitorId: varchar("visitor_id", { length: 100 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("social_reactions_reactable_idx").using("btree", table.reactableId.asc().nullsLast().op("int4_ops"), table.reactableType.asc().nullsLast().op("int4_ops")),
	index("social_reactions_tenant_idx").using("btree", table.tenantId.asc().nullsLast().op("int4_ops")),
	index("social_reactions_visitor_idx").using("btree", table.visitorId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "social_reactions_tenant_id_tenants_id_fk"
		}),
]);

export const socialComments = pgTable("social_comments", {
	id: serial().primaryKey().notNull(),
	tenantId: integer("tenant_id").notNull(),
	name: varchar({ length: 100 }).notNull(),
	surname: varchar({ length: 100 }).notNull(),
	content: text().notNull(),
	commentableId: integer("commentable_id").notNull(),
	commentableType: varchar("commentable_type", { length: 50 }).notNull(),
	isVisible: boolean("is_visible").default(true).notNull(),
	reply: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	visitorId: varchar("visitor_id", { length: 50 }),
	ipAddress: varchar("ip_address", { length: 45 }),
	userId: integer("user_id"),
}, (table) => [
	index("social_comments_commentable_idx").using("btree", table.commentableId.asc().nullsLast().op("text_ops"), table.commentableType.asc().nullsLast().op("int4_ops")),
	index("social_comments_tenant_idx").using("btree", table.tenantId.asc().nullsLast().op("int4_ops")),
	index("social_comments_visitor_idx").using("btree", table.visitorId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "social_comments_tenant_id_tenants_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "social_comments_user_id_users_id_fk"
		}),
]);

export const conversationDocuments = pgTable("conversation_documents", {
	conversationId: integer("conversation_id").notNull(),
	documentId: integer("document_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [conversations.id],
			name: "conversation_documents_conversation_id_conversations_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [documents.id],
			name: "conversation_documents_document_id_documents_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.conversationId, table.documentId], name: "conversation_documents_conversation_id_document_id_pk"}),
]);
