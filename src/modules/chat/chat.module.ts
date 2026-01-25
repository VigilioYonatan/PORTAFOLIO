import { AiModule } from "@modules/ai/modules/ai.module";
import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ConversationController } from "./controllers/conversation.controller";
import { ChatRepository } from "./repositories/chat.repository";
import { ConversationRepository } from "./repositories/conversation.repository";
import { ConversationSeeder } from "./seeders/conversation.seeder";
import { ChatService } from "./services/chat.service";
import { ConversationService } from "./services/conversation.service";

@Module({
	imports: [AiModule],
	controllers: [ChatController, ConversationController],
	providers: [
		ChatService,
		ChatRepository,
		ConversationService,
		ConversationRepository,
		ConversationSeeder,
	],
	exports: [ChatService, ConversationService, ConversationSeeder],
})
export class ChatModule {}
