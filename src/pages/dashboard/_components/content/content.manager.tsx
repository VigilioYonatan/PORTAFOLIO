import { cn } from "@infrastructure/utils/client";
import CategoryManager from "@modules/blog-category/components/category.manager";
import PostBentoGrid from "@modules/blog-post/components/post-bento-grid";
import ProjectTable from "@modules/project/components/project.table";
import { useSignal } from "@preact/signals";
import { ArchiveIcon, DatabaseIcon, FileCodeIcon, List } from "lucide-preact";
import { useEffect } from "preact/hooks";
import { useLocation } from "wouter-preact";

type ViewMode = "nodes" | "articles";

export default function ContentManager() {
	const [location] = useLocation();
	const view = useSignal<ViewMode>("nodes");

	// Sync view with URL route
	useEffect(() => {
		if (location.includes("/blog")) {
			view.value = "articles";
		} else if (location.includes("/projects")) {
			view.value = "nodes";
		}
	}, [location]);

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
							{">"} ASSET_REPOSITORY_v3.1
						</h1>
						<div class="flex items-center gap-3 mt-1">
							<span class="text-[9px] text-primary font-mono uppercase tracking-[0.4em]">
								Resource_Manager
							</span>
							<span class="w-1 h-1 bg-white/20 rounded-full" />
							<span class="text-[9px] text-muted-foreground font-mono uppercase tracking-[0.4em]">
								Content_Sync_Active
							</span>
						</div>
					</div>
				</div>

				<div class="flex items-center gap-2 bg-zinc-950/60 p-1.5 border border-white/10 rounded-sm backdrop-blur-md">
					<button
						type="button"
						onClick={() => {
							view.value = "nodes";
						}}
						class={cn(
							"flex items-center gap-3 px-6 py-2.5 transition-all font-mono text-[10px]k uppercase tracking-widest rounded-sm relative group",
							view.value === "nodes"
								? "bg-primary text-black shadow-glow"
								: "text-muted-foreground hover:text-white hover:bg-white/5",
						)}
					>
						<DatabaseIcon
							size={12}
							class={cn(
								view.value === "nodes" ? "text-black" : "text-primary/40",
							)}
						/>
						PROJECT_NODES
					</button>
					<button
						type="button"
						onClick={() => {
							view.value = "articles";
						}}
						class={cn(
							"flex items-center gap-3 px-6 py-2.5 transition-all font-mono text-[10px] uppercase tracking-widest rounded-sm relative group",
							view.value === "articles"
								? "bg-primary text-black shadow-glow"
								: "text-muted-foreground hover:text-white hover:bg-white/5",
						)}
					>
						<FileCodeIcon
							size={12}
							class={cn(
								view.value === "articles" ? "text-black" : "text-primary/40",
							)}
						/>
						BLOG_ARTICLES
					</button>
				</div>
			</div>

			<div class="min-h-[600px] relative">
				{/* Decoration */}
				<div class="absolute -left-4 top-0 bottom-0 w-px bg-linear-to-b from-transparent via-primary/20 to-transparent" />

				{view.value === "nodes" ? (
					<div class="animate-in fade-in slide-in-from-bottom-2 duration-500">
						<ProjectTable />
					</div>
				) : (
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
				)}
			</div>
		</div>
	);
}
