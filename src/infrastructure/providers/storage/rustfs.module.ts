import { Module } from "@nestjs/common";
import { AppConfigModule } from "../../modules/config.module";
import { LocalStorageProvider } from "./providers/local-storage.provider";
import { S3StorageProvider } from "./providers/s3-storage.provider";
import { RustFSService } from "./rustfs.service";
import { MediaProcessorService } from "./services/media-processor.service";
import { StorageFactory } from "./storage.factory";

@Module({
	imports: [AppConfigModule],
	providers: [
		RustFSService,
		MediaProcessorService,
		LocalStorageProvider,
		S3StorageProvider,
		StorageFactory,
	],
	exports: [
		RustFSService,
		MediaProcessorService,
		LocalStorageProvider,
		S3StorageProvider,
		StorageFactory,
	],
})
export class RustFSModule {}
