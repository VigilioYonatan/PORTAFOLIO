import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { toNull } from "@infrastructure/utils/server";
import { Inject, Injectable } from "@nestjs/common";
import {
	and,
	asc,
	desc,
	eq,
	getTableColumns,
	gt,
	ilike,
	type SQL,
	sql,
} from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { DocumentQueryDto } from "../dtos/document.query.dto";
import { documentEntity } from "../entities/document.entity";
import { documentChunkEntity } from "../entities/document-chunk.entity";
import type { DocumentSchema } from "../schemas/document.schema";
import { type DocumentChunkSchema } from "../schemas/document-chunk.schema";

@Injectable()
export class DocumentRepository {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	/**
	 * Store a new document
	 * @param tenant_id - Tenant ID for multi-tenancy
	 * @param user_id - User who uploaded the document
	 * @param body - Document data
	 */
	async store(
		tenant_id: number,
		body: Omit<
			DocumentSchema,
			"id" | "tenant_id" | "created_at" | "updated_at"
		>,
	): Promise<DocumentSchema> {
		const [result] = await this.db
			.insert(documentEntity)
			.values({
				...body,
				tenant_id,
			})
			.returning();
		return result;
	}

	/**
	 * Update a document
	 * @param tenant_id - Tenant ID for multi-tenancy
	 * @param id - Document ID
	 * @param body - Partial document data
	 */
	async update(
		tenant_id: number,
		id: number,
		body: Partial<DocumentSchema>,
	): Promise<DocumentSchema> {
		const [result] = await this.db
			.update(documentEntity)
			.set(body)
			.where(
				and(eq(documentEntity.id, id), eq(documentEntity.tenant_id, tenant_id)),
			)
			.returning();
		return result;
	}

	/**
	 * Find a document by ID
	 * @param tenant_id - Tenant ID for multi-tenancy
	 * @param id - Document ID
	 */
	async showById(
		tenant_id: number,
		id: number,
	): Promise<DocumentSchema | null> {
		const result = await this.db.query.documentEntity.findFirst({
			where: and(
				eq(documentEntity.tenant_id, tenant_id),
				eq(documentEntity.id, id),
			),
		});
		return toNull(result)
	}

	/**
	 * List documents with pagination and filters
	 * @param tenant_id - Tenant ID for multi-tenancy
	 * @param query - Query filters and pagination options
	 */
	async index(
		tenant_id: number,
		query: DocumentQueryDto,
	): Promise<[DocumentSchema[], number]> {
		const { limit, offset, status, is_indexed, sortBy, sortDir, search } =
			query;

		// Base filters
		const baseWhere: SQL[] = [eq(documentEntity.tenant_id, tenant_id)];

		if (status) {
			baseWhere.push(eq(documentEntity.status, status));
		}
		if (is_indexed !== undefined) {
			baseWhere.push(eq(documentEntity.is_indexed, is_indexed));
		}
		if (search) {
			baseWhere.push(ilike(documentEntity.title, `%${search}%`));
		}

		const baseWhereClause = and(...baseWhere);

		// Dynamic sorting
		let orderBy: SQL<unknown>[] = [desc(documentEntity.created_at)];

		if (sortBy && sortDir) {
			const columns = getTableColumns(documentEntity);
			const column = columns[sortBy as keyof typeof columns];
			if (column) {
				orderBy = [sortDir === "ASC" ? asc(column) : desc(column)];
			}
		}

		const result = await Promise.all([
			this.db.query.documentEntity.findMany({
				limit,
				offset,
				where: baseWhereClause,
				orderBy: orderBy,
			}),
			this.db
				.select({ count: sql<number>`count(*)` })
				.from(documentEntity)
				.where(baseWhereClause)
				.then((result) => Number(result[0].count)),
		]);

		return result;
	}

	/**
	 * Delete a document
	 * @param tenant_id - Tenant ID for multi-tenancy
	 * @param id - Document ID
	 */
	async destroy(tenant_id: number, id: number): Promise<DocumentSchema> {
		const [result] = await this.db
			.delete(documentEntity)
			.where(
				and(eq(documentEntity.id, id), eq(documentEntity.tenant_id, tenant_id)),
			)
			.returning();
		return result ;
	}

	/**
	 * Delete all chunks for a document (for re-processing)
	 * @param document_id - Document ID
	 */
	async destroyChunks(document_id: number): Promise<void> {
		await this.db
			.delete(documentChunkEntity)
			.where(eq(documentChunkEntity.document_id, document_id));
	}

	/**
	 * Store document chunks for RAG
	 * @param document_id - Document ID
	 * @param chunks - Array of chunk data
	 * @returns Number of chunks created
	 */
	async storeChunks(
		document_id: number,
		chunks: Array<{
			content: string;
			chunk_index: number;
			token_count: number;
			embedding: number[] | null;
		}>,
	): Promise<number> {
		if (chunks.length === 0) {
			return 0;
		}

		const values = chunks.map((chunk) => ({
			document_id,
			content: chunk.content,
			chunk_index: chunk.chunk_index,
			token_count: chunk.token_count,
			embedding: chunk.embedding,
		}));

		await this.db.insert(documentChunkEntity).values(values);

		return chunks.length;
	}

	async showChunks(document_id: number): Promise<DocumentChunkSchema[]> {
		const result = await this.db.query.documentChunkEntity.findMany({
			where: eq(documentChunkEntity.document_id, document_id),
			orderBy: [asc(documentChunkEntity.chunk_index)],
		});
		return result
	}

	/**
	 * Find similar chunks using vector similarity search
	 * @param tenant_id - Tenant ID
	 * @param embedding - Vector embedding to search for
	 * @param limit - Max number of chunks to return
	 */
	async findSimilarChunks(
		tenant_id: number,
		embedding: number[],
		limit = 5,
	): Promise<(DocumentChunkSchema & { similarity: number })[]> {
		// Calculate cosine similarity: 1 - cosine_distance
		// operator <=> is cosine distance in pgvector
		const similarity = sql<number>`1 - (${documentChunkEntity.embedding} <=> ${JSON.stringify(embedding)}::vector)`;

		const result = await this.db
			.select({
				...getTableColumns(documentChunkEntity),
				similarity,
			})
			.from(documentChunkEntity)
			.innerJoin(
				documentEntity,
				eq(documentChunkEntity.document_id, documentEntity.id),
			)
			.where(
				and(
					eq(documentEntity.tenant_id, tenant_id),
					// Filter by similarity threshold to avoid irrelevant noise
					gt(similarity, 0.4),
				),
			)
			.orderBy(desc(similarity))
			.limit(limit);

		return result
	}

	async countByTenant(tenant_id: number): Promise<number> {
		const result = await this.db
			.select({ count: sql<number>`count(*)` })
			.from(documentEntity)
			.where(eq(documentEntity.tenant_id, tenant_id));
		return Number(result[0].count);
	}
}

