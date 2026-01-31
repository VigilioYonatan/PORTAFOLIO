import { printFileWithDimension } from "@infrastructure/utils/hybrid";
import type { ProjectSchema } from "@modules/project/schemas/project.schema";
import { DIMENSION_IMAGE } from "@modules/uploads/const/upload.const";
import { useSignal } from "@preact/signals";
import { type Lang, useTranslations } from "@src/i18n";
import { Code2 } from "lucide-preact";

interface RecentProjectsProps {
	latestProjects: ProjectSchema[];
	lang: Lang;
}

export default function RecentProjects({
	latestProjects,
	lang,
}: RecentProjectsProps) {
	const t = useTranslations(lang);
	const hoverIndex = useSignal<number | null>(null);

	if (!latestProjects || latestProjects.length === 0) return null;

	return (
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			{latestProjects.map((project, index) => (
				<a
					key={project.id}
					href={`/${lang}/projects/${project.slug}`}
					class="group relative block bg-black/40 border border-white/10 rounded-xl overflow-hidden hover:border-primary/60 transition-all duration-500 hover:shadow-[0_0_30px_-5px_var(--color-primary)] hover:-translate-y-2"
					onMouseEnter={() => {
						hoverIndex.value = index;
					}}
					onMouseLeave={() => {
						hoverIndex.value = null;
					}}
				>
					{/* Holographic Border Effect */}
					<div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20">
						<div class="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary to-transparent animate-scanline" />
						<div class="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary to-transparent" />
					</div>

					{/* Image Section */}
					<div class="aspect-video relative overflow-hidden bg-muted">
						{project.images ? (
							<img
								src={
									printFileWithDimension(
										project.images,
										DIMENSION_IMAGE.md,
										window.env.STORAGE_URL,
									)[0]
								}
								alt={project.title}
								class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter group-hover:brightness-110"
								width="400"
								height="225"
							/>
						) : (
							<div class="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-700">
								<Code2 size={48} />
							</div>
						)}

						{/* Overlay with Glitch Text */}
						<div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] z-10">
							<span class="px-6 py-2 border border-primary text-primary font-mono text-sm tracking-widest uppercase rounded-sm bg-black/50 hover:bg-primary hover:text-black transition-colors">
								{t("projects.view_more")}
							</span>
						</div>

						{/* Cyberpunk corner markers */}
						<div class="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
						<div class="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
					</div>

					{/* Content Section */}
					<div class="p-6 relative">
						<div class="flex justify-between items-start mb-3">
							<h3 class="text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-1 font-mono">
								{project.title}
							</h3>
							{project.status === "live" && (
								<div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] text-green-400 font-mono tracking-wider">
									<span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
									LIVE
								</div>
							)}
						</div>

						<p class="text-xs text-muted-foreground line-clamp-2 mb-4 font-mono leading-relaxed">
							{project.description}
						</p>

						<div class="flex items-center gap-4 text-xs font-mono text-zinc-500">
							<span class="flex items-center gap-1.5">
								<Code2 size={12} class="text-primary" />
								PROJECT
							</span>
							<span class="w-1 h-1 rounded-full bg-zinc-700" />
							<span class="flex items-center gap-1.5">
								<span class="text-zinc-600">ID:</span>
								{String(project.id).padStart(3, "0")}
							</span>
						</div>
					</div>

					{/* Bottom Glow Bar */}
					<div class="absolute bottom-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
				</a>
			))}
		</div>
	);
}
