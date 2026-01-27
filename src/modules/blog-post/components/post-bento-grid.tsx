import Modal from "@components/extras/modal";
import { useEntranceAnimation } from "@hooks/use-motion";
import { cn } from "@infrastructure/utils/client";
import { formatDateTz } from "@infrastructure/utils/hybrid/date.utils";
import { printFileWithDimension } from "@infrastructure/utils/hybrid/file.utils";
import { blogPostDestroyApi } from "@modules/blog-post/apis/blog-post.destroy.api";
import { blogPostIndexApi } from "@modules/blog-post/apis/blog-post.index.api";
import BlogPostStore from "@modules/blog-post/components/blog-post.store";
import BlogPostUpdate from "@modules/blog-post/components/blog-post.update";
import { DIMENSION_IMAGE } from "@modules/uploads/const/upload.const";
import { useComputed, useSignal } from "@preact/signals";
import { audioStore } from "@stores/audio.store";
import usePaginator from "@vigilio/preact-paginator";
import { sweetModal } from "@vigilio/sweet";
import {
	Edit,
	ExternalLink,
	FileText,
	Plus,
	Search,
	Trash,
} from "lucide-preact";
import { useEffect } from "preact/hooks";
import type { BlogPostSchema } from "../schemas/blog-post.schema";

export default function PostBentoGrid() {
	const containerRef = useEntranceAnimation(0.2);
	const bassIntensity = useComputed(() => audioStore.state.bassIntensity.value);
	const isStoreModalOpen = useSignal(false);
	const editingPost = useSignal<BlogPostSchema | null>(null);
	const destroyMutation = blogPostDestroyApi();

	const paginator = usePaginator({ limit: 12 });

	// Fetch posts
	const query = blogPostIndexApi(null, paginator);

	// Results synced with query for manual updates
	const results = useSignal<BlogPostSchema[]>([]);

	useEffect(() => {
		if (query.data) {
			results.value = query.data.results;
		}
	}, [query.data]);

	return (
		<div class="space-y-6">
			{/* Header Action */}
			<div class="flex justify-between items-center bg-zinc-950/40 border border-white/5 p-4 rounded-xl backdrop-blur-sm">
				<div class="flex items-center gap-4 w-full md:w-auto">
					{/* Search */}
					<div class="relative group w-full md:w-64">
						<div class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors">
							<Search size={14} />
						</div>
						<input
							type="text"
							placeholder="SEARCH_LOGS..."
							class="bg-black/40 border border-white/5 text-[10px] font-mono tracking-widest rounded-lg pl-9 pr-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all placeholder:text-muted-foreground/30"
							value={paginator.search.value}
							onInput={(e) =>
								paginator.search.onSearchByName(e.currentTarget.value)
							}
						/>
					</div>
				</div>
				<button
					type="button"
					onClick={() => {
						isStoreModalOpen.value = true;
					}}
					class="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] z-10"
				>
					<Plus size={14} strokeWidth={3} />
					New Post
				</button>
			</div>

			{query.isLoading ? (
				<div class="w-full h-64 flex items-center justify-center">
					<div class="flex flex-col items-center gap-4">
						<div class="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
						<span class="text-[10px] font-mono tracking-widest text-muted-foreground animate-pulse">
							LOADING_NEURAL_ARCHIVES...
						</span>
					</div>
				</div>
			) : !results.value.length ? (
				<div class="w-full h-64 flex items-center justify-center border border-dashed border-border rounded-xl">
					<div class="text-center text-muted-foreground">
						<FileText size={32} class="mx-auto mb-2 opacity-50" />
						<p className="font-mono text-xs">NO_DATA_FOUND</p>
					</div>
				</div>
			) : (
				<div
					ref={containerRef}
					class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
				>
					{results.value.map((post, i) => (
						<div
							key={post.id}
							className="group relative rounded-xl border border-white/5 bg-zinc-950/40 backdrop-blur-sm overflow-hidden hover:border-primary/30 transition-all duration-300 flex flex-col"
							style={{
								transform: `translateY(${bassIntensity.value * (i % 2 === 0 ? 2 : -2)}px)`,
							}}
						>
							{/* Status Indicator */}
							<div className="absolute top-3 right-3 z-20 flex gap-2">
								<span
									className={cn(
										"w-2 h-2 rounded-full",
										post.is_published
											? "bg-emerald-500 shadow-[0_0_8px_#10b981]"
											: "bg-zinc-500",
									)}
								/>
							</div>

							{/* Cover Image */}
							<div className="relative h-40 overflow-hidden border-b border-white/5">
								{post.cover ? (
									<img
										src={
											printFileWithDimension(post.cover, DIMENSION_IMAGE.md)[0]
										}
										alt={post.title}
										title={post.title}
										width={DIMENSION_IMAGE.md}
										height={DIMENSION_IMAGE.md}
										className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
									/>
								) : (
									<div className="w-full h-full bg-zinc-900 flex items-center justify-center">
										<FileText className="text-zinc-800" size={48} />
									</div>
								)}
								<div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80" />

								{/* Category Chip */}
								{post.category_id && (
									<span className="absolute bottom-3 left-3 text-[10px] font-bold bg-white/10 px-2 py-1 rounded backdrop-blur-md border border-white/5 uppercase tracking-wider text-white/80">
										CAT::ID_{post.category_id}
									</span>
								)}
							</div>

							{/* Content */}
							<div className="p-5 flex flex-col flex-1">
								<div className="mb-4">
									<span className="text-[10px] text-primary/60 font-mono mb-1 block">
										{formatDateTz(post.created_at)}
									</span>
									<h3 className="text-lg font-bold text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors uppercase tracking-tight">
										{post.title}
									</h3>
								</div>

								<p className="text-xs text-muted-foreground line-clamp-3 mb-4 flex-1 font-medium leading-relaxed">
									{post.extract || "No description provided."}
								</p>

								{/* Actions */}
								<div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
									<div className="flex gap-1">
										<button
											type="button"
											className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-amber-400"
											title="Edit Article"
											onClick={() => {
												editingPost.value = post;
											}}
										>
											<Edit size={14} />
										</button>
										<button
											type="button"
											className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-red-500"
											title="Purge Article"
											onClick={() => {
												sweetModal({
													title: "TERMINATE_POST?",
													text: `Remove neural record for "${post.title}"?`,
													icon: "danger",
													showCancelButton: true,
													confirmButtonText: "TERMINATE",
												}).then(({ isConfirmed }) => {
													if (isConfirmed) {
														destroyMutation.mutate(post.id, {
															onSuccess() {
																results.value = results.value.filter(
																	(p) => p.id !== post.id,
																);
																sweetModal({
																	icon: "success",
																	title: "Record Purged",
																});
															},
														});
													}
												});
											}}
										>
											<Trash size={14} />
										</button>
									</div>
									<a
										href={`/blog/${post.slug}`}
										target="_blank"
										rel="noreferrer"
										className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
									>
										UPLINK <ExternalLink size={10} />
									</a>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Pagination Controls */}
			<div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-sm gap-4">
				<div className="flex gap-2">
					<button
						type="button"
						disabled={paginator.pagination.page <= 1}
						onClick={() => paginator.pagination.onBackPage()}
						class="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg disabled:opacity-50 disabled:pointer-events-none transition-colors"
					>
						Previous
					</button>
					<div className="flex items-center gap-1">
						{paginator.pagination.paginator.pages.map((page: number) => (
							<button
								key={page}
								type="button"
								onClick={() => paginator.pagination.onChangePage(page)}
								class={cn(
									"w-8 h-8 flex items-center justify-center text-[10px] font-black rounded-lg transition-colors border",
									paginator.pagination.page === page
										? "bg-primary text-black border-primary"
										: "bg-transparent text-muted-foreground border-transparent hover:bg-white/5",
								)}
							>
								{page}
							</button>
						))}
					</div>
					<button
						type="button"
						disabled={!query.data?.next} // Using query next cursor or similar if available, or math
						// Actually paginator logic handles simplified next/back usually but let's trust paginator methods
						onClick={() => paginator.pagination.onNextPage()}
						class="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg disabled:opacity-50 disabled:pointer-events-none transition-colors"
					>
						Next
					</button>
				</div>
				<div className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">
					TOTAL_LOGS: {query.data?.count ?? 0}
				</div>
			</div>

			{/* Modals */}
			<Modal
				isOpen={isStoreModalOpen.value}
				onClose={() => {
					isStoreModalOpen.value = false;
				}}
				contentClassName="max-w-4xl w-full self-start bg-zinc-950 border border-white/10"
			>
				<BlogPostStore
					refetch={(data) => {
						results.value = [data, ...results.value];
						isStoreModalOpen.value = false;
					}}
					onClose={() => {
						isStoreModalOpen.value = false;
					}}
				/>
			</Modal>

			<Modal
				isOpen={!!editingPost.value}
				onClose={() => {
					editingPost.value = null;
				}}
				contentClassName="max-w-4xl w-full self-start bg-zinc-950 border border-white/10"
			>
				<BlogPostUpdate
					post={editingPost.value!}
					refetch={(data) => {
						results.value = results.value.map((item) =>
							item.id === data.id ? { ...item, ...data } : item,
						);
						editingPost.value = null;
					}}
					onClose={() => {
						editingPost.value = null;
					}}
				/>
			</Modal>
		</div>
	);
}
