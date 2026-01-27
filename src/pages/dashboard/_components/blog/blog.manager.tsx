import CategoryManager from "@modules/blog-category/components/category.manager";
import PostBentoGrid from "@modules/blog-post/components/post-bento-grid";
import { ArchiveIcon, FileCodeIcon, List } from "lucide-preact";

export default function BlogManager() {
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
							{">"} BLOG_ARTICLES_v2.0
						</h1>
						<div class="flex items-center gap-3 mt-1">
							<span class="text-[9px] text-primary font-mono uppercase tracking-[0.4em]">
								Content_Engine
							</span>
							<span class="w-1 h-1 bg-white/20 rounded-full" />
							<span class="text-[9px] text-muted-foreground font-mono uppercase tracking-[0.4em]">
								SEO_Optimized
							</span>
						</div>
					</div>
				</div>

				<div class="flex items-center gap-2 bg-zinc-950/60 p-1.5 border border-white/10 rounded-sm backdrop-blur-md">
					<div class="flex items-center gap-3 px-6 py-2.5 bg-primary/10 border border-primary/20 text-primary font-mono text-[10px] font-black uppercase tracking-widest rounded-sm">
						<FileCodeIcon size={12} />
						ACTIVE_VIEW
					</div>
				</div>
			</div>

			<div class="min-h-[600px] relative">
				{/* Decoration */}
				<div class="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />

				<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
					<div class="lg:col-span-3">
						<div class="sticky top-24 bg-zinc-950/40 border border-white/5 p-4 rounded-sm backdrop-blur-md">
							<div class="mb-4 px-2 flex justify-between items-center text-[9px] font-black tracking-[0.2em] text-zinc-500 uppercase">
								<span>Filter_Tags</span>
								<List size={10} />
							</div>
							<CategoryManager />
						</div>
					</div>
					<div class="lg:col-span-9">
						<PostBentoGrid />
					</div>
				</div>
			</div>
		</div>
	);
}
