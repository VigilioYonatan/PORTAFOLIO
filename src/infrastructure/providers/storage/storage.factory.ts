import type { Environments } from "@infrastructure/config/server";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { StorageProvider } from "./interfaces/storage-provider.interface";
import { LocalStorageProvider } from "./providers/local-storage.provider";
import { S3StorageProvider } from "./providers/s3-storage.provider";

// =============================================================================
// STORAGE FACTORY
// =============================================================================

/**
 * Factory that selects the appropriate storage provider based on configuration.
 * Implements the Factory pattern for storage backend selection.
 */
@Injectable()
export class StorageFactory {
	private readonly logger = new Logger(StorageFactory.name);
	private readonly providerType: Environments["STORAGE_PROVIDER"];

	constructor(
		private readonly configService: ConfigService<Environments>,
		private readonly localProvider: LocalStorageProvider,
		private readonly s3Provider: S3StorageProvider,
	) {
		this.providerType = this.configService.getOrThrow("STORAGE_PROVIDER");
		this.logger.log(`Storage provider configured: ${this.providerType}`);
	}

	/**
	 * Get the configured storage provider.
	 */
	getProvider(): StorageProvider {
		switch (this.providerType) {
			case "S3":
				return this.s3Provider;
			default:
				return this.localProvider;
		}
	}

	/**
	 * Get the current provider type.
	 */
	getProviderType(): Environments["STORAGE_PROVIDER"] {
		return this.providerType;
	}

	/**
	 * Get specifically the local provider (for local-only operations).
	 */
	getLocalProvider(): LocalStorageProvider {
		return this.localProvider;
	}

	/**
	 * Get specifically the S3 provider (for S3-only operations like multipart).
	 */
	getS3Provider(): S3StorageProvider {
		return this.s3Provider;
	}
}
