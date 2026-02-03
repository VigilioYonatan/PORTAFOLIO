import type { OpenSourceSchema } from "@modules/open-source/schemas/open-source.schema";
import { type Lang, useTranslations } from "@src/i18n";

interface RecentOpenSourcesProps {
	latestOpenSources: OpenSourceSchema[];
	lang: Lang;
	
}

export default function RecentOpenSources({
	latestOpenSources,
	lang,
}: RecentOpenSourcesProps) {
	const t = useTranslations(lang);

	if (!latestOpenSources || latestOpenSources.length === 0) return null;

	return (
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			{latestOpenSources.map((project, index) => (
				<a
					key={project.id}
					href={`/${lang}/open-source/${project.slug}`}
					class="group relative flex flex-col p-6 bg-zinc-950/20 backdrop-blur-xs border border-white/5 hover:border-primary/40 hover:bg-zinc-950/40 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
					style={`animation-delay: ${index * 150}ms;`}
					aria-label={`${t("opensource.view_details")} ${project.name}`}
				>
					{/* Card Content */}
					<div class="relative z-10 flex-1 flex flex-col">
						<div class="flex justify-between items-start mb-6">
							<div class="flex flex-col gap-1">
								<div class="flex items-center gap-2">
									<div class="w-1 h-1 bg-primary rounded-full" />
									<span class="text-[8px] font-mono text-primary uppercase tracking-[0.4em]">
										Build_{project.version || "1.0"}
									</span>
								</div>
								<div class="h-px w-6 bg-primary/20 group-hover:w-12 transition-all duration-700" />
							</div>

							<div class="flex gap-3">
								<div class="flex flex-col items-end">
									<span class="text-[6px] font-mono text-white/20 uppercase tracking-[0.3em] mb-1">
										Stars
									</span>
									<span class="text-[10px] font-mono text-primary/80 group-hover:text-primary group-hover:text-glow transition-all">
										{project.stars}
									</span>
								</div>
								<div class="w-px h-5 bg-white/5" />
								<div class="flex flex-col items-end">
									<span class="text-[6px] font-mono text-white/20 uppercase tracking-[0.3em] mb-1">
										Loads
									</span>
									<span class="text-[10px] font-mono text-white/60">
										{project.downloads >= 1000
											? `${(project.downloads / 1000).toFixed(1)}k`
											: project.downloads}
									</span>
								</div>
							</div>
						</div>

						<h3 class="text-xl font-black mb-2 text-white group-hover:text-primary transition-all tracking-tighter uppercase italic leading-none drop-shadow-sm line-clamp-1">
							{project.name}
						</h3>

						<p class="text-zinc-500 text-xs font-mono leading-relaxed mb-6 group-hover:text-zinc-400 transition-colors line-clamp-2">
							{project.description}
						</p>

						<div class="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
							<div class="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.3em] group-hover:gap-3 transition-all duration-500">
								{t("opensource.view_details")}
								<span class="text-sm opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
									»
								</span>
							</div>

							<span class="text-[7px] font-mono text-white/30 uppercase tracking-[0.2em] px-2 py-1 bg-zinc-900 border border-white/5 group-hover:border-primary/40 group-hover:text-white transition-all">
								{project.category || "Module"}
							</span>
						</div>
					</div>

					{/* Hover bottom bar */}
					<div class="absolute bottom-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
				</a>
			))}
		</div>
	);
}
