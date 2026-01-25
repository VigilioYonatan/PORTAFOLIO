import { now } from "@infrastructure/utils/hybrid";
import { paginator } from "@infrastructure/utils/server";
import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { DocumentCache } from "../cache/document.cache";
import type { DocumentQueryDto } from "../dtos/document.query.dto";
import type {
	DocumentDestroyResponseDto,
	DocumentIndexResponseDto,
	DocumentProcessResponseDto,
	DocumentShowResponseDto,
	DocumentStoreResponseDto,
	DocumentUpdateResponseDto,
} from "../dtos/document.response.dto";
import type { DocumentStoreDto } from "../dtos/document.store.dto";
import { DocumentRepository } from "../repositories/document.repository";
import type { DocumentSchema } from "../schemas/document.schema";

@Injectable()
export class DocumentService {
	private readonly logger = new Logger(DocumentService.name);

	constructor(
		private readonly repository: DocumentRepository,
		private readonly cache: DocumentCache,
	) {}

	/**
	 * List documents with pagination and caching
	 */
	async index(
		tenant_id: number,
		query: DocumentQueryDto,
	): Promise<DocumentIndexResponseDto> {
		this.logger.log({ tenant_id }, "Listing documents");

		return await paginator<DocumentQueryDto, DocumentSchema>("/documents", {
			filters: query,
			cb: async (filters, isClean) => {
				// If clean query, try cache first
				if (isClean) {
					const cached = await this.cache.getList<[DocumentSchema[], number]>(
						tenant_id,
						filters,
					);
					if (cached) return cached;
				}

				// Try DB
				const result = await this.repository.index(tenant_id, filters);

				// Set cache for clean queries
				if (isClean) {
					await this.cache.setList(tenant_id, filters, result);
				}

				return result;
			},
		});
	}

	/**
	 * Upload a new document
	 */
	async store(
		tenant_id: number,
		user_id: number,
		body: DocumentStoreDto,
	): Promise<DocumentStoreResponseDto> {
		this.logger.log({ tenant_id, user_id }, "Uploading document");

		const document = await this.repository.store(tenant_id, user_id, body);

		// Invalidate lists cache
		await this.cache.invalidateLists(tenant_id);

		return { success: true, document: document };
	}

	/**
	 * Get document details
	 */
	async show(tenant_id: number, id: number): Promise<DocumentShowResponseDto> {
		this.logger.log({ tenant_id, id }, "Fetching document by ID");

		// 1. Try Cache
		let document = await this.cache.get(tenant_id, id);

		if (!document) {
			// 2. Try DB
			document = await this.repository.showById(tenant_id, id);

			if (!document) {
				this.logger.warn({ tenant_id, id }, "Document not found");
				throw new NotFoundException(`Document #${id} not found`);
			}

			// 3. Set Cache
			await this.cache.set(tenant_id, document);
		}

		return { success: true, document: document };
	}

	/**
	 * Update document metadata
	 */
	async update(
		tenant_id: number,
		id: number,
		body: Partial<DocumentSchema>,
	): Promise<DocumentUpdateResponseDto> {
		this.logger.log({ tenant_id, id }, "Updating document");

		// Check if exists
		await this.show(tenant_id, id);

		const document = await this.repository.update(tenant_id, id, body);

		// Invalidate cache
		await this.cache.invalidate(tenant_id, id);
		await this.cache.invalidateLists(tenant_id);

		return { success: true, document: document };
	}

	/**
	 * Delete document and its chunks
	 */
	async destroy(
		tenant_id: number,
		id: number,
	): Promise<DocumentDestroyResponseDto> {
		this.logger.log({ tenant_id, id }, "Deleting document");

		// Check if exists
		await this.show(tenant_id, id);

		await this.repository.destroy(tenant_id, id);

		// Invalidate cache
		await this.cache.invalidate(tenant_id, id);
		await this.cache.invalidateLists(tenant_id);

		return { success: true, message: "Document deleted successfully" };
	}

	/**
	 * 13.3 Process document for RAG (fragmentation and vectorization)
	 * Initiates the chunking and embedding process for a document
	 */
	async process(
		tenant_id: number,
		id: number,
	): Promise<DocumentProcessResponseDto> {
		this.logger.log({ tenant_id, id }, "Processing document for RAG");

		// 1. Get document and validate
		const { document } = await this.show(tenant_id, id);

		// 2. Check if already processed or processing
		if (document.status === "PROCESSING") {
			throw new BadRequestException(
				`Document #${id} is already being processed`,
			);
		}

		if (document.status === "READY" && document.is_indexed) {
			throw new BadRequestException(
				`Document #${id} has already been processed`,
			);
		}

		// 3. Update status to PROCESSING
		await this.repository.update(tenant_id, id, { status: "PROCESSING" });
		this.logger.log({ tenant_id, id }, "Document status set to PROCESSING");

		try {
			// 4. Delete existing chunks if any (re-processing)
			await this.repository.destroyChunks(id);

			// Placeholder: Create sample chunks for demonstration
			// In production, replace with actual chunking logic
			const sampleChunks = [
				{
					content: `Document: ${document.title} - Chunk 1. This is placeholder content.`,
					chunk_index: 0,
					token_count: 15,
					embedding: null, // Will be populated by embedding service
				},
				{
					content: `Document: ${document.title} - Chunk 2. RAG processing pending.`,
					chunk_index: 1,
					token_count: 12,
					embedding: null,
				},
			];

			// 5. Store chunks in database
			const chunkCount = await this.repository.storeChunks(id, sampleChunks);

			// 6. Update document status to READY
			const processedDocument = await this.repository.update(tenant_id, id, {
				status: "READY",
				is_indexed: true,
				chunk_count: chunkCount,
				processed_at: now().toDate(),
			});

			if (!processedDocument) {
				this.logger.error(
					{ tenant_id, id },
					"Failed to update document status to READY",
				);
				throw new Error(
					"Failed to update document status to READY. Document not found or update returned null.",
				);
			}

			// 7. Invalidate cache
			await this.cache.invalidate(tenant_id, id);
			await this.cache.invalidateLists(tenant_id);

			this.logger.log(
				{ tenant_id, id, chunkCount },
				"Document processed successfully",
			);

			return {
				success: true,
				document: processedDocument,
				message: `Document processed: ${chunkCount} chunks created`,
			};
		} catch (error) {
			// On error, set status to FAILED
			this.logger.error(
				{
					tenant_id,
					id,
					error: error instanceof Error ? error.message : error,
				},
				"Document processing failed",
			);

			await this.repository.update(tenant_id, id, { status: "FAILED" });
			await this.cache.invalidate(tenant_id, id);

			throw error;
		}
	}
}
