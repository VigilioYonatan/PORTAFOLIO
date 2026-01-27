import { socialReactionsSummaryApi } from "@modules/social/apis/social-reaction.api";
import { Heart, Lightbulb, PartyPopper, ThumbsUp } from "lucide-preact";

export default function ReactionStats() {
	const query = socialReactionsSummaryApi();

	const icons = {
		LIKE: <ThumbsUp size={14} />,
		HEART: <Heart size={14} />,
		CELEBRATE: <PartyPopper size={14} />,
		INSIGHTFUL: <Lightbulb size={14} />,
	};

	return (
		<div class="space-y-4">
			<h3 class="text-xs font-black tracking-[0.3em] uppercase mb-4">
				ENTITY_REACTIONS
			</h3>

			<div class="grid grid-cols-2 gap-4">
				{query.isLoading
					? [1, 2, 3, 4].map((i) => (
							<div key={i} class="h-16 bg-white/5 animate-pulse rounded-xl" />
						))
					: Object.entries(icons).map(([type, icon]) => (
							<div
								key={type}
								class="bg-zinc-900/30 border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-primary/20 transition-all"
							>
								<div class="flex items-center gap-3">
									<div class="text-primary/40 group-hover:text-primary transition-colors">
										{icon}
									</div>
									<span class="text-[9px] font-black tracking-widest text-muted-foreground/60 uppercase">
										{type}
									</span>
								</div>
								<span class="text-lg font-black">
									{Math.floor(Math.random() * 100)}
								</span>
							</div>
						))}
			</div>
		</div>
	);
}
