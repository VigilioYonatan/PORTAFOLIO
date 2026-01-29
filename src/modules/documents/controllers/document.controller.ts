import { ZodPipe } from "@infrastructure/pipes/zod.pipe";
import { ZodQueryPipe } from "@infrastructure/pipes/zod-query.pipe";
import { Roles } from "@modules/auth/decorators/roles.decorator";
import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
	Req,
	UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { DocumentQueryClassDto } from "../dtos/document.query.class.dto";
import { documentQueryDto } from "../dtos/document.query.dto";
import {
	DocumentDestroyResponseClassDto,
	DocumentIndexResponseClassDto,
	DocumentProcessResponseClassDto,
	DocumentShowResponseClassDto,
	DocumentStoreResponseClassDto,
	DocumentUpdateResponseClassDto,
} from "../dtos/document.response.class.dto";
import type {
	DocumentDestroyResponseDto,
	DocumentIndexResponseDto,
	DocumentShowResponseDto,
	DocumentStoreResponseDto,
	DocumentUpdateResponseDto,
} from "../dtos/document.response.dto";
import { DocumentStoreClassDto } from "../dtos/document.store.class.dto";
import {
	type DocumentStoreDto,
	documentStoreDto,
} from "../dtos/document.store.dto";
import { DocumentService } from "../services/document.service";

@ApiTags("Documentos (RAG)")
@UseGuards(AuthenticatedGuard)
@Controller("document")
export class DocumentController {
	constructor(private readonly documentService: DocumentService) {}

	/**
	 * 13.2 GET /documents - List documents with pagination
	 */
	@Roles(1)
	@Get("/")
	@ApiOperation({ summary: "Listar documentos (paginado)" })
	@ApiResponse({
		status: 200,
		type: DocumentIndexResponseClassDto,
		description: "Lista de documentos recuperada con éxito",
	})
	index(
		@Req() req: Request,
		@Query(new ZodQueryPipe(documentQueryDto)) query: DocumentQueryClassDto,
	): Promise<DocumentIndexResponseDto> {
		return this.documentService.index(req.locals.tenant.id, query);
	}

	/**
	 * 13.1 POST /documents - Upload new document
	 */
	@HttpCode(201)
	@Post("/")
	@Roles(1)
	@ApiOperation({ summary: "Subir nuevo documento para RAG" })
	@ApiBody({ type: DocumentStoreClassDto })
	@ApiResponse({
		status: 201,
		type: DocumentStoreResponseClassDto,
		description: "Documento creado exitosamente",
	})
	store(
		@Req() req: Request,
		@Body(new ZodPipe(documentStoreDto)) body: DocumentStoreDto,
	): Promise<DocumentStoreResponseDto> {
		return this.documentService.store(
			req.locals.tenant.id,
			req.locals.user.id,
			body,
		);
	}

	/**
	 * 13.3 POST /documents/:id/process - Process document for RAG
	 */
	@HttpCode(200)
	@Post("/:id/process")
	@Roles(1)
	@ApiOperation({
		summary: "Procesar documento para RAG (fragmentación y vectorización)",
	})
	@ApiResponse({
		status: 200,
		type: DocumentShowResponseClassDto, // Usually returns same structure as show/store
		description: "Documento procesado exitosamente",
	})
	process(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<DocumentProcessResponseClassDto> {
		// Process returns message too, checking DTO compatibility
		// Process returns { success, document, message }
		return this.documentService.process(req.locals.tenant.id, id);
	}

	/**
	 * GET /documents/:id - Show document details
	 */
	@Get("/:id")
	@Roles(1)
	@ApiOperation({ summary: "Obtener detalle del documento" })
	@ApiResponse({ status: 200, type: DocumentShowResponseClassDto })
	show(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<DocumentShowResponseDto> {
		return this.documentService.show(req.locals.tenant.id, id);
	}

	/**
	 * PUT /documents/:id - Update document metadata
	 */
	@HttpCode(200)
	@Put("/:id")
	@Roles(1)
	@ApiOperation({ summary: "Actualizar metadatos del documento" })
	@ApiBody({ type: DocumentStoreClassDto })
	@ApiResponse({
		status: 200,
		type: DocumentUpdateResponseClassDto,
		description: "Información actualizada",
	})
	update(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
		@Body(new ZodPipe(documentStoreDto)) body: DocumentStoreDto,
	): Promise<DocumentUpdateResponseDto> {
		return this.documentService.update(req.locals.tenant.id, id, body);
	}

	/**
	 * DELETE /documents/:id - Delete document and chunks
	 */
	@HttpCode(200)
	@Delete("/:id")
	@Roles(1)
	@ApiOperation({ summary: "Eliminar documento y sus chunks" })
	@ApiResponse({
		status: 200,
		type: DocumentDestroyResponseClassDto,
		description: "Documento eliminado exitosamente",
	})
	destroy(
		@Req() req: Request,
		@Param("id", ParseIntPipe) id: number,
	): Promise<DocumentDestroyResponseDto> {
		return this.documentService.destroy(req.locals.tenant.id, id);
	}
}
