import { documentsStoreApi } from "@modules/documents/apis/documents.store.api";
import { useSignal } from "@preact/signals";
import { sweetModal } from "@vigilio/sweet";
import { CheckCircle, FileText, Loader, Upload } from "lucide-preact";

export default function DocumentDropzone() {
	const isDragging = useSignal(false);
	const storeMutation = documentsStoreApi();

	const onDrop = (e: DragEvent) => {
		e.preventDefault();
		isDragging.value = false;

		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			const file = e.dataTransfer.files[0];
			handleUpload(file);
		}
	};

	const onFileSelect = (e: Event) => {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			handleUpload(target.files[0]);
		}
	};

	const handleUpload = (file: File) => {
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
			onError(err: any) {
				const error = err as { message: string };
				sweetModal({
					icon: "danger",
					title: "Upload Failed",
					text: error.message || "Unknown error occurred.",
				});
			},
		});
	};

	return (
		<div
			class={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer relative overflow-hidden group ${isDragging.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-secondary/10"}`}
			onDragOver={(e) => {
				e.preventDefault();
				isDragging.value = true;
			}}
			onDragLeave={() => (isDragging.value = false)}
			onDrop={onDrop}
			onClick={() => document.getElementById("doc-upload")?.click()}
		>
			<input
				type="file"
				id="doc-upload"
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
