import DocumentStore from "@modules/documents/components/document-store";
import DocumentTable from "@modules/ai/components/document-table";
import { type Lang, useTranslations } from "@src/i18n";
import { FileTextIcon, DatabaseIcon } from "lucide-preact";

interface DocumentManagerProps {
	params: {
		lang: Lang;
	};
}

export default function DocumentManager({ params }: DocumentManagerProps) {
	const t = useTranslations(params.lang);
	return (
		<div class="flex flex-col gap-8 animate-in fade-in duration-500 relative">
			{/* Ambient Artifacts */}
			<div class="absolute inset-x-0 -top-8 h-40 bg-primary/5 blur-[100px] opacity-20 pointer-events-none" />

			<div class="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-8">
				<div class="flex items-center gap-4">
					<div class="p-3 bg-zinc-900/60 border border-white/10 rounded-sm">
						<FileTextIcon size={24} class="text-primary/80" />
					</div>
					<div>
						<h1 class="text-3xl font-black text-white tracking-tighter uppercase italic">
							{">"} {t("dashboard.sidebar.documents")}
						</h1>
						<div class="flex items-center gap-3 mt-1">
							<span class="text-[9px] text-primary font-mono uppercase tracking-[0.4em]">
								KNOWLEDGE_BASE
							</span>
							<span class="w-1 h-1 bg-white/20 rounded-full" />
							<span class="text-[9px] text-muted-foreground font-mono uppercase tracking-[0.4em]">
								RAG_SYNC_READY
							</span>
						</div>
					</div>
				</div>

				<div class="flex items-center gap-2 bg-zinc-950/60 p-1.5 border border-white/10 rounded-sm backdrop-blur-md">
					<div class="flex items-center gap-3 px-6 py-2.5 bg-primary/10 border border-primary/20 text-primary font-mono text-[10px] uppercase tracking-widest rounded-sm">
						<DatabaseIcon size={12} />
						{t("dashboard.project.view_active")}
					</div>
				</div>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div class="lg:col-span-1">
					<div class="bg-zinc-950/60 border border-white/5 p-6 rounded-sm group hover:border-primary/20 transition-all">
						<h3 class="text-[10px] font-black tracking-[0.3em] text-white uppercase mb-6 flex items-center gap-2">
							<span class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
							UPLOAD_NEW_KNOWLEDGE
						</h3>
						<DocumentStore />
					</div>
				</div>
				<div class="lg:col-span-2">
					<div class="animate-in fade-in slide-in-from-right-4 duration-500">
						<DocumentTable />
					</div>
				</div>
			</div>
		</div>
	);
}
