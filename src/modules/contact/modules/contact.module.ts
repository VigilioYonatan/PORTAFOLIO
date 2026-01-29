import { NotificationModule } from "@modules/notification/notification.module";
import { Module } from "@nestjs/common";
import { ContactCache } from "../cache/contact.cache";
import { ContactController } from "../controllers/contact.controller";
import { ContactRepository } from "../repositories/contact.repository";
import { ContactService } from "../services/contact.service";

@Module({
	imports: [NotificationModule],
	controllers: [ContactController],
	providers: [ContactService, ContactRepository, ContactCache],
	exports: [ContactService, ContactRepository],
})
export class ContactModule {}
