import { documentEntity } from "@modules/documents/entities/document.entity";
import { tenantEntity } from "@modules/tenant/entities/tenant.entity";
import { userEntity } from "@modules/user/entities/user.entity";
import { relations } from "drizzle-orm";
import { chatMessageEntity } from "./chat-message.entity";
import { conversationEntity } from "./conversation.entity";
import { conversationDocumentEntity } from "./conversation-document.entity";

export const conversationRelations = relations(
	conversationEntity,
	({ one, many }) => ({
		tenant: one(tenantEntity, {
			fields: [conversationEntity.tenant_id],
			references: [tenantEntity.id],
		}),
		user: one(userEntity, {
			fields: [conversationEntity.user_id],
			references: [userEntity.id],
		}),
		messages: many(chatMessageEntity),
		documents: many(conversationDocumentEntity),
	}),
);

export const chatMessageRelations = relations(chatMessageEntity, ({ one }) => ({
	conversation: one(conversationEntity, {
		fields: [chatMessageEntity.conversation_id],
		references: [conversationEntity.id],
	}),
}));

export const conversationDocumentRelations = relations(
	conversationDocumentEntity,
	({ one }) => ({
		conversation: one(conversationEntity, {
			fields: [conversationDocumentEntity.conversation_id],
			references: [conversationEntity.id],
		}),
		document: one(documentEntity, {
			fields: [conversationDocumentEntity.document_id],
			references: [documentEntity.id],
		}),
	}),
);
