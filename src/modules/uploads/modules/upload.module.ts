import { AppConfigModule } from "@infrastructure/modules/config.module";
import { RustFSModule } from "@infrastructure/providers/storage/rustfs.module";
import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { UploadController } from "../controllers/upload.controller";
import { UploadService } from "../services/upload.service";
import { UploadCleanupService } from "../services/upload-cleanup.service";

@Module({
	imports: [AppConfigModule, RustFSModule, ScheduleModule.forRoot()],
	controllers: [UploadController],
	providers: [UploadService, UploadCleanupService],
	exports: [UploadService],
})
export class UploadModule {}
