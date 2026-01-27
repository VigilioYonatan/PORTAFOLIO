import { documentsStoreApi } from "@modules/documents/apis/documents.store.api";
import { useSignal } from "@preact/signals";
import { sweetModal } from "@vigilio/sweet";
import { Loader, Upload } from "lucide-preact";
import { useRef } from "preact/hooks";

export default function DocumentDropzone() {
	const isDragging = useSignal(false);
	const storeMutation = documentsStoreApi();
	const inputRef = useRef<HTMLInputElement>(null);

	function onDrop(e: DragEvent) {
		e.preventDefault();
		isDragging.value = false;

		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			const file = e.dataTransfer.files[0];
			handleUpload(file);
		}
	}

	function onFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			handleUpload(target.files[0]);
		}
	}

	function handleUpload(file: File) {
		// Validate type PDF/TXT/MD
		const allowed = ["application/pdf", "text/plain", "text/markdown"];
		if (!allowed.includes(file.type) && !file.name.endsWith(".md")) {
			sweetModal({
				icon: "danger",
				title: "Invalid File Type",
				text: "Only PDF, TXT, and Markdown files are supported.",
			});
			return;
		}

		const formData = new FormData();
		formData.append("file", file);
		formData.append("title", file.name);

		storeMutation.mutate(formData, {
			onSuccess() {
				sweetModal({
					icon: "success",
					title: "Document Uploaded",
					text: "The document has been queued for RAG processing.",
					timer: 2000,
				});
			},
			onError(err) {
				sweetModal({
					icon: "danger",
					title: "Upload Failed",
					text: err.message || "Unknown error occurred.",
				});
			},
		});
	}

	return (
		<div
			class={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer relative overflow-hidden group ${isDragging.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-secondary/10"}`}
			onDragOver={(e) => {
				e.preventDefault();
				isDragging.value = true;
			}}
			onDragLeave={() => {
				isDragging.value = false;
			}}
			onDrop={onDrop}
			onClick={() => inputRef.current?.click()}
		>
			<input
				type="file"
				ref={inputRef}
				class="hidden"
				accept=".pdf,.txt,.md"
				onChange={onFileSelect}
			/>

			{storeMutation.isLoading ? (
				<div class="flex flex-col items-center animate-pulse">
					<Loader size={32} class="animate-spin text-primary mb-2" />
					<span class="text-xs font-mono text-primary uppercase tracking-widest">
						Uploading_Stream...
					</span>
				</div>
			) : (
				<>
					<div class="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
						<Upload size={24} class="text-primary" />
					</div>
					<h3 class="font-bold text-lg mb-1">Upload Documents</h3>
					<p class="text-sm text-muted-foreground text-center max-w-xs">
						Drag & drop PDFs, TXT, or MD files here to train your AI model.
					</p>
				</>
			)}
		</div>
	);
}

export function IndexStatus({
	status,
}: {
	status: "PENDING" | "PROCESSING" | "READY" | "FAILED";
}) {
	const colors = {
		PENDING: "bg-yellow-500/20 text-yellow-500",
		PROCESSING: "bg-blue-500/20 text-blue-500 animate-pulse",
		READY: "bg-green-500/20 text-green-500",
		FAILED: "bg-red-500/20 text-red-500",
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
