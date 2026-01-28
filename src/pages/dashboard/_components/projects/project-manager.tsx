import ProjectTable from "@modules/project/components/project-table";
import { ArchiveIcon, DatabaseIcon } from "lucide-preact";
import { type Lang, useTranslations } from "@src/i18n";

interface ProjectManagerProps {
    lang?: Lang;
}

export default function ProjectManager({ lang = "es" }: ProjectManagerProps) {
    const t = useTranslations(lang);
	return (
		<div class="flex flex-col gap-8 animate-in fade-in duration-500 relative">
			{/* Ambient Artifacts */}
			<div class="absolute inset-x-0 -top-8 h-40 bg-primary/5 blur-[100px] opacity-20 pointer-events-none" />

			<div class="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-8">
				<div class="flex items-center gap-4">
					<div class="p-3 bg-zinc-900/60 border border-white/10 rounded-sm">
						<ArchiveIcon size={24} class="text-primary/80" />
					</div>
					<div>
						<h1 class="text-3xl font-black text-white tracking-tighter uppercase italic">
							{">"} {t("dashboard.project.title")}
						</h1>
						<div class="flex items-center gap-3 mt-1">
							<span class="text-[9px] text-primary font-mono uppercase tracking-[0.4em]">
								{t("dashboard.project.subtitle")}
							</span>
							<span class="w-1 h-1 bg-white/20 rounded-full" />
							<span class="text-[9px] text-muted-foreground font-mono uppercase tracking-[0.4em]">
								{t("dashboard.project.sync")}
							</span>
						</div>
					</div>
				</div>

				<div class="flex items-center gap-2 bg-zinc-950/60 p-1.5 border border-white/10 rounded-sm backdrop-blur-md">
					<div class="flex items-center gap-3 px-6 py-2.5 bg-primary/10 border border-primary/20 text-primary font-mono text-[10px] font-black uppercase tracking-widest rounded-sm">
						<DatabaseIcon size={12} />
						{t("dashboard.project.view_active")}
					</div>
				</div>
			</div>

			<div class="min-h-[600px] relative">
				{/* Decoration */}
				<div class="absolute -left-4 top-0 bottom-0 w-px bg-linear-to-b from-transparent via-primary/20 to-transparent" />

				<div class="animate-in fade-in slide-in-from-bottom-2 duration-500">
					<ProjectTable lang={lang} />
				</div>
			</div>
		</div>
	);
}
