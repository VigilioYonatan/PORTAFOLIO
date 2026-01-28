import Form from "@components/form";
import { UPLOAD_CONFIG, typeTextExtensions } from "@modules/uploads/const/upload.const";
import { handlerError } from "@infrastructure/utils/client";
import type { Refetch } from "@infrastructure/types/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { sweetModal } from "@vigilio/sweet";
import { type Resolver, useForm } from "react-hook-form";
import { documentsStoreApi } from "../apis/documents.store.api";
import { type DocumentStoreDto, documentStoreDto } from "../dtos/document.store.dto";
import type { DocumentIndexResponseDto } from "../dtos/document.response.dto";
import type { DocumentSchema } from "../schemas/document.schema";

// ... existing code

interface DocumentStoreProps {
	refetch?: (data: Refetch<DocumentIndexResponseDto["results"]>) => void;
}

export default function DocumentStore({ refetch }: DocumentStoreProps) {
	const documentStoreForm = useForm<DocumentStoreDto>({
		resolver: zodResolver(documentStoreDto) as Resolver<DocumentStoreDto>,
		mode: "all",defaultValues:{metadata:null}
		
	});

	const storeMutation = documentsStoreApi();

	function onDocumentStore(body: DocumentStoreDto) {
		storeMutation.mutate(body, {
			onSuccess(data) {
				sweetModal({
					icon: "success",
					title: "Documento Subido",
					text: "El documento ha sido encolado para procesamiento RAG.",
					timer: 2000,
				});
				documentStoreForm.reset();
				refetch?.(data.document);
			},
			onError(error) {
				handlerError(documentStoreForm, error, "Error al Subir");
			},
		});
	}

	return (
		<Form {...documentStoreForm} onSubmit={onDocumentStore}>
			<Form.control<DocumentStoreDto>
				name="title"
				title="Título del Documento"
				placeholder="Ingrese el título del documento"
				required
			/>
			<Form.control.file<DocumentStoreDto>
				name="file"
				title="Subir Documento"
				entity="document"
				property="file"
				fileNormal="big"
				typeFile="file"
				accept={UPLOAD_CONFIG.document.file!.mime_types.join(", ")}
				typesText={typeTextExtensions(UPLOAD_CONFIG.document.file!.mime_types)}
				required
			/>
			<Form.button.submit
				title="Subir Documento"
				loading_title="Subiendo..."
				isLoading={storeMutation.isLoading || false}
				disabled={storeMutation.isLoading || false}
			/>
		</Form>
	);
}

// ============================================
// STATUS BADGE (Exported for reuse)
// ============================================

export function IndexStatus({
	status,
}: {
	status: DocumentSchema["status"];
}) {
	const colors = {
		PENDING: "bg-yellow-500/20 text-yellow-500",
		PROCESSING: "bg-blue-500/20 text-blue-500 animate-pulse",
		READY: "bg-green-500/20 text-green-500",
		LISTO: "bg-green-500/20 text-green-500",
		FAILED: "bg-red-500/20 text-red-500",
		ERROR: "bg-red-500/20 text-red-500",
	};

	return (
		<div
			class={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-mono ${colors[status] || colors.PENDING}`}
		>
			<div
				class={`w-2 h-2 rounded-full ${status === "PROCESSING" ? "bg-current animate-ping" : "bg-current"}`}
			/>
			{status}
		</div>
	);
}
