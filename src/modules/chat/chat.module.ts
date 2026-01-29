import { AiModule } from "@modules/ai/modules/ai.module";
import { DocumentModule } from "@modules/documents/document.module";
import { NotificationModule } from "@modules/notification/notification.module";
import { Module } from "@nestjs/common";
import { ChatCache } from "./caches/chat.cache";
import { ChatController } from "./controllers/chat.controller";
import { ChatGateway } from "./gateways/chat.gateway";
import { ChatRepository } from "./repositories/chat.repository";
import { ConversationRepository } from "./repositories/conversation.repository";
import { ConversationSeeder } from "./seeders/conversation.seeder";
import { ChatService } from "./services/chat.service";

@Module({
	imports: [AiModule, DocumentModule, NotificationModule],
	controllers: [ChatController],
	providers: [
		ChatService,
		ChatRepository,
		ConversationRepository,
		ConversationSeeder,
		ChatCache,
		ChatGateway,
	],
	exports: [ChatService, ConversationSeeder, ChatCache, ChatRepository],
})
export class ChatModule {}
