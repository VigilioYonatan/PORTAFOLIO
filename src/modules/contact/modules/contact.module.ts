import { Module } from "@nestjs/common";
import { ContactCache } from "../cache/contact.cache";
import { ContactController } from "../controllers/contact.controller";
import { ContactPublicController } from "../controllers/contact.public.controller";
import { ContactRepository } from "../repositories/contact.repository";
import { ContactService } from "../services/contact.service";

@Module({
	controllers: [ContactController, ContactPublicController],
	providers: [ContactService, ContactRepository, ContactCache],
	exports: [ContactService, ContactRepository],
})
export class ContactModule {}
