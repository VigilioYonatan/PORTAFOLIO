import Badge from "@components/extras/Badge";
import { formatTimeAgo } from "@infrastructure/utils/hybrid/date.utils";
import {
	socialCommentIndexApi,
	socialCommentUpdateApi,
} from "@modules/social/apis/social-comment.api";
import type { SocialCommentSchema } from "@modules/social/schemas/social-comment.schema";
import usePaginator from "@vigilio/preact-paginator";
import { sweetModal } from "@vigilio/sweet";
import { Check, Clock, Shield, X } from "lucide-preact";
import { useEffect } from "preact/hooks";

export default function CommentList() {
	const paginator = usePaginator({ limit: 10 });
	const query = socialCommentIndexApi(null, paginator);

	useEffect(() => {
		query.refetch(false);
	}, [paginator.pagination.value.offset]);

	return (
		<div class="space-y-4">
			<div class="flex items-center gap-2 mb-4">
				<Shield size={16} class="text-primary" />
				<h3 class="text-xs font-black tracking-[0.3em] uppercase">
					MODERATION_QUEUE
				</h3>
			</div>

			<div class="grid gap-4">
				{query.isLoading ? (
					<div class="p-8 text-center animate-pulse font-mono text-[10px] text-muted-foreground uppercase">
						SCANNING_COMMENTS...
					</div>
				) : (
					query.data?.results.map((comment) => (
						<CommentItem
							key={comment.id}
							comment={comment}
							onUpdate={(updated) => {
								query.transformData((prev) => ({
									...prev,
									results: prev.results.map((c) =>
										c.id === updated.id ? updated : c,
									),
								}));
							}}
						/>
					))
				)}
			</div>
		</div>
	);
}

function CommentItem({
	comment,
	onUpdate,
}: {
	comment: SocialCommentSchema;
	onUpdate: (comment: SocialCommentSchema) => void;
}) {
	const updateMutation = socialCommentUpdateApi(comment.id);

	return (
		<div class="bg-zinc-900/30 border border-white/5 p-4 rounded-xl flex items-start justify-between gap-4 group hover:bg-white/[0.02] transition-all">
			<div class="flex-1 space-y-2">
				<div class="flex items-center gap-3">
					<span class="font-black text-[11px] tracking-tight uppercase text-foreground">
						{comment.name} {comment.surname}
					</span>
					<span class="text-[9px] font-mono text-muted-foreground/30 uppercase flex items-center gap-1.5">
						<Clock size={10} /> {formatTimeAgo(comment.created_at)}
					</span>
					<Badge
						className={
							comment.is_visible
								? "bg-primary/10 text-primary border-primary/20"
								: "bg-amber-500/10 text-amber-500 border-amber-500/20"
						}
					>
						{comment.is_visible ? "APPROVED" : "PENDING"}
					</Badge>
				</div>
				<p class="text-xs text-muted-foreground leading-relaxed italic">
					"{comment.content}"
				</p>
				<div class="text-[9px] font-mono text-muted-foreground/20 uppercase tracking-[0.2em]">
					NODE_REF: {comment.commentable_type}#{comment.commentable_id}
				</div>
			</div>

			<div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
				<button
					type="button"
					onClick={() => {
						updateMutation.mutate(
							{ is_visible: !comment.is_visible },
							{
								onSuccess(data) {
									sweetModal({
										icon: "success",
										title: comment.is_visible ? "Node Hidden" : "Node Approved",
									});
									onUpdate(data.comment);
								},
							},
						);
					}}
					class="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
				>
					{comment.is_visible ? <X size={14} /> : <Check size={14} />}
				</button>
			</div>
		</div>
	);
}
