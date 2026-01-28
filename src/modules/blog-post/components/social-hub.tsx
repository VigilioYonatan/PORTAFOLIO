import { cn } from "@infrastructure/utils/client";
import { useSignal } from "@preact/signals";
import {
	MessageSquare,
	ThumbsUp,
	Send,
	User,
	Loader2,
} from "lucide-preact";
import { useEffect } from "preact/hooks";
import {
	socialReactionsSummaryApi,
	socialReactionToggleApi,
} from "@modules/social/apis/social-reaction.api";
import { socialCommentStoreApi } from "@modules/social/apis/social-comment.api";
import { useForm } from "react-hook-form";
import { socialCommentStoreDto } from "@modules/social/dtos/social-comment.store.dto";
import { zodResolver } from "@hookform/resolvers/zod";
import usePaginator from "@vigilio/preact-paginator";
import { sweetModal } from "@vigilio/sweet";
import { formatTimeAgo } from "@infrastructure/utils/hybrid/date.utils";
import { useQuery } from "@vigilio/preact-fetching";
import type { SocialReactionSchema } from "@modules/social/schemas/social-reaction.schema";
import type { SocialCommentStoreDto } from "@modules/social/dtos/social-comment.store.dto";
import type { SocialReactionStoreDto } from "@modules/social/dtos/social-reaction.store.dto";
import type { SocialCommentSchema } from "@modules/social/schemas/social-comment.schema";

interface SocialHubProps {
	likes?: number;
	comments?: number;
	lang?: string;
	id: number;
    // Use the comprehensive entity type or the specific one?
    // Comments only support POST/PROJECT. Reactions support more.
    // Since this hub supports both, we must limit to the intersection effectively,
    // which is what SocialCommentSchema provides.
	entityType: SocialCommentSchema["commentable_type"];
}

export default function SocialHub({
	likes = 0,
	comments = 0,
	id,
	entityType,
}: SocialHubProps) {
	const isLiked = useSignal(false);
	const likeCount = useSignal(likes);
	const showComments = useSignal(false);
	const visitorId = useSignal<string | null>(null);

	// Get or create generic visitor ID
	useEffect(() => {
		let vid = localStorage.getItem("visitor_id");
		if (!vid) {
			vid = crypto.randomUUID();
			localStorage.setItem("visitor_id", vid);
		}
		visitorId.value = vid;
	}, []);

	// API Integrations
	const reactionsQuery = socialReactionsSummaryApi(String(id), entityType);
	const likeMutation = socialReactionToggleApi();
    
    // Fetch comment count effectively (limit=1 just to get count metadata)
    const commentCountQuery = useQuery<{ count: number }, unknown>(
        `/api/v1/social-comment?limit=1&commentable_id=${id}&commentable_type=${entityType}&is_visible=true`,
        async (url) => {
			const response = await fetch(`${url}`);
			const data = await response.json();
			return data;
		}
    );

    const commentCount = useSignal(comments);

    // Update comment count from API
    useEffect(() => {
        if (commentCountQuery.data) {
            commentCount.value = commentCountQuery.data.count;
        }
    }, [commentCountQuery.data]);

    // Refetch counts when a new comment is added
    useEffect(() => {
        function handleNewComment() {
             commentCountQuery.refetch(false);
        }
        window.addEventListener("comment-added", handleNewComment);
        return () => window.removeEventListener("comment-added", handleNewComment);
    }, []);

	// Update like count from API if available
	useEffect(() => {
		if (reactionsQuery.data) {
            // Data is Record<string, number> where keys are reaction types (LIKE, LOVE etc)
			const count = reactionsQuery.data["LIKE"];
			if (typeof count === "number") {
				likeCount.value = count;
			}
		}
	}, [reactionsQuery.data]);

	function handleLike() {
		if (!visitorId.value) return;

		const previousState = isLiked.value;
		const previousCount = likeCount.value;

		// Optimistic update
		isLiked.value = !isLiked.value;
		likeCount.value = isLiked.value ? likeCount.value + 1 : likeCount.value - 1;

		const body: SocialReactionStoreDto = {
			type: "LIKE",
			reactable_id: id,
			reactable_type: entityType, // Valid because entityType is subset
			visitor_id: visitorId.value,
		};

		likeMutation.mutate(body, {
			onError: () => {
				// Revert on error
				isLiked.value = previousState;
				likeCount.value = previousCount;
			},
			onSuccess: () => {
				reactionsQuery.refetch();
			},
		});
	}

	return (
		<div class="border-t border-border mt-12 pt-8">
			<div class="flex items-center justify-between mb-8">
				<h3 class="text-xl font-bold font-heading">
					Community
					<span class="text-primary ml-1">Hub</span>
				</h3>
				<div class="flex items-center gap-4">
					<button
						type="button"
						onClick={handleLike}
						class={cn(
							"flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
							isLiked.value
								? "bg-primary text-black font-bold shadow-lg shadow-primary/20 scale-105"
								: "bg-surface hover:bg-white/10 text-muted-foreground hover:text-white",
						)}
					>
						<ThumbsUp
							size={18}
							class={cn(
								"transition-transform duration-300",
								isLiked.value ? "-rotate-12 fill-black" : "",
							)}
						/>
						<span class="font-mono text-sm">{likeCount.value}</span>
					</button>

					<button
						type="button"
						onClick={() => {
							showComments.value = !showComments.value;
						}}
						class={cn(
							"flex items-center gap-2 px-4 py-2 rounded-full transition-all",
							showComments.value
								? "bg-white/10 text-white"
								: "bg-surface hover:bg-white/10 text-muted-foreground hover:text-white",
						)}
					>
						<MessageSquare size={18} />
						<span class="font-mono text-sm">{commentCount.value}</span>
					</button>
				</div>
			</div>

			{showComments.value && (
				<div class="animate-in fade-in slide-in-from-top-4 duration-300 space-y-8">
					<SocialCommentForm
						entityId={id}
						entityType={entityType}
						visitorId={visitorId.value}
					/>
					<SocialCommentList entityId={id} entityType={entityType} />
				</div>
			)}
		</div>
	);
}

function SocialCommentForm({
	entityId,
	entityType,
	visitorId,
}: {
	entityId: number;
	entityType: SocialCommentSchema["commentable_type"];
	visitorId: string | null;
}) {
	const commentMutation = socialCommentStoreApi();
	const form = useForm<SocialCommentStoreDto>({
		resolver: zodResolver(socialCommentStoreDto),
		defaultValues: {
			content: "",
			name: "",
			surname: "",
			commentable_id: entityId,
			commentable_type: entityType,
			visitor_id: visitorId, // Correctly nullable
            ip_address: null, // Initial value
		},
	});

	function onSubmit(data: SocialCommentStoreDto) {
		const payload: SocialCommentStoreDto = {
			...data,
			commentable_id: entityId,
			commentable_type: entityType,
			visitor_id: visitorId,
            ip_address: null, // Backend handles IP usually, but schema allows null
		};

		commentMutation.mutate(payload, {
			onSuccess: () => {
				form.reset();
				sweetModal({
					icon: "success",
					title: "Comment added!",
					text: "Your comment has been posted successfully.",
					timer: 3000,
				});
				// Dispatch event for list to refetch
				window.dispatchEvent(new CustomEvent("comment-added"));
			},
			onError: (err) => {
				sweetModal({
					icon: "danger",
					title: "Error",
					text: JSON.stringify(err),
				});
			},
		});
	}

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			class="bg-surface/50 p-6 rounded-xl border border-white/5 space-y-4"
		>
			<h4 class="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
				Leave a Comment
			</h4>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-1">
					<label class="text-xs text-muted-foreground ml-1">Name</label>
					<input
						{...form.register("name")}
						placeholder="John"
						class="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
					/>
					{form.formState.errors.name && (
						<p class="text-red-500 text-[10px] ml-1">
							{form.formState.errors.name.message}
						</p>
					)}
				</div>
				<div class="space-y-1">
					<label class="text-xs text-muted-foreground ml-1">Surname</label>
					<input
						{...form.register("surname")}
						placeholder="Doe"
						class="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
					/>
					{form.formState.errors.surname && (
						<p class="text-red-500 text-[10px] ml-1">
							{form.formState.errors.surname.message}
						</p>
					)}
				</div>
			</div>

			<div class="space-y-1">
				<label class="text-xs text-muted-foreground ml-1">Comment</label>
				<textarea
					{...form.register("content")}
					rows={3}
					placeholder="Share your thoughts..."
					class="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-none"
				/>
				{form.formState.errors.content && (
					<p class="text-red-500 text-[10px] ml-1">
						{form.formState.errors.content.message}
					</p>
				)}
			</div>

			<div class="flex justify-end">
				<button
					type="submit"
					disabled={!!commentMutation.isLoading}
					class="bg-primary text-black font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
				>
					{commentMutation.isLoading ? (
						<Loader2 size={14} class="animate-spin" />
					) : (
						<>
							Send Comment <Send size={14} />
						</>
					)}
				</button>
			</div>
		</form>
	);
}

function SocialCommentList({
	entityId,
	entityType,
}: {
	entityId: number;
	entityType: SocialCommentSchema["commentable_type"];
}) {
	const paginator = usePaginator({ limit: 12 });

	const query = useQuery<{ count: number; results: SocialCommentSchema[] }, unknown>(
		`/api/v1/social-comment?commentable_id=${entityId}&commentable_type=${entityType}&offset=${paginator.pagination.value.offset}&limit=${paginator.pagination.value.limit}&is_visible=true`,
		async (url) => {
			const response = await fetch(`${url}`);
			const data = await response.json();
			return data;
		},
		{
			onSuccess(data) {
				paginator.updateData({ total: data.count });
			},
		},
	);

	useEffect(() => {
		const handleNewComment = () => query.refetch(false);
		window.addEventListener("comment-added", handleNewComment);
		return () => window.removeEventListener("comment-added", handleNewComment);
	}, []);

	useEffect(() => {
		query.refetch(false);
	}, [paginator.pagination.value.offset]);

	if (query.isLoading) {
		return (
			<div class="flex justify-center p-8">
				<Loader2 class="animate-spin text-primary" size={24} />
			</div>
		);
	}

	if (!query.data?.results.length) {
		return (
			<div class="text-center p-8 border border-white/5 border-dashed rounded-lg">
				<p class="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
					NO_DATA_STREAM_FOUND
				</p>
			</div>
		);
	}

	return (
		<div class="space-y-6">
			{query.data.results.map((comment) => (
				<div key={comment.id} class="flex gap-4 group">
					<div class="flex-shrink-0">
						<div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
							<User size={14} />
						</div>
					</div>
					<div class="flex-1 space-y-1.5">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<span class="text-xs font-bold text-foreground">
									{comment.name} {comment.surname}
								</span>
								<span class="text-[9px] font-mono text-muted-foreground/50">
									{formatTimeAgo(comment.created_at)}
								</span>
							</div>
						</div>
						<div class="text-xs text-muted-foreground leading-relaxed">
							{comment.content}
						</div>

						{/* Admin Reply */}
						{comment.reply && (
							<div class="mt-4 ml-2 border-l-2 border-primary/30 pl-4 py-1">
								<div class="flex items-center gap-2 mb-1">
									<div class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
									<span class="text-[9px] font-mono text-primary tracking-widest uppercase">
										ADMIN_RESPONSE
									</span>
								</div>
								<p class="text-xs text-primary/80 italic">"{comment.reply}"</p>
							</div>
						)}
					</div>
				</div>
			))}

			{/* Pagination controls */}
			<div class="flex justify-center gap-2 pt-4">
				<button
					type="button"
					disabled={paginator.pagination.value.offset === 0}
					onClick={() => paginator.pagination.onBackPage()}
					class="text-[10px] uppercase font-mono px-3 py-1 border border-white/10 hover:bg-white/5 disabled:opacity-30 transition-colors"
				>
					PREV
				</button>
				<button
					type="button"
					disabled={
						query.data.count <=
						paginator.pagination.value.offset + paginator.pagination.value.limit
					}
					onClick={() => paginator.pagination.onNextPage()}
					class="text-[10px] uppercase font-mono px-3 py-1 border border-white/10 hover:bg-white/5 disabled:opacity-30 transition-colors"
				>
					NEXT
				</button>
			</div>
		</div>
	);
}
