import { Module } from "@nestjs/common";
import { DocumentCache } from "./cache/document.cache";
import { DocumentController } from "./controllers/document.controller";
import { DocumentRepository } from "./repositories/document.repository";
import { DocumentService } from "./services/document.service";

@Module({
	controllers: [DocumentController],
	providers: [DocumentService, DocumentRepository, DocumentCache],
	exports: [DocumentService],
})
export class DocumentModule {}
