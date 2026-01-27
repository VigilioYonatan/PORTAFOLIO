import { cn } from "@infrastructure/utils/client";
import { useSignal } from "@preact/signals";
import { HeartIcon, MessageSquareIcon, Share2Icon } from "lucide-preact";

import { useTranslations } from "@src/i18n";

interface SocialHubProps {
	likes?: number;
	comments?: number;
    lang?: string;
}

export default function SocialHub({ likes = 0, comments = 0, lang = "es" }: SocialHubProps) {
    const t = useTranslations(lang as any);
	const isLiked = useSignal(false);
	const likeCount = useSignal(likes);

	const handleLike = () => {
		isLiked.value = !isLiked.value;
		likeCount.value += isLiked.value ? 1 : -1;
	};

	return (
		<div class="flex items-center gap-6 py-8 border-t border-b border-border/50 my-12 bg-card/10 px-6 rounded-sm backdrop-blur-md relative overflow-hidden group">
			<div class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
			<div class="flex gap-6 relative z-10">
				<button
					type="button"
					onClick={handleLike}
					aria-label={isLiked.value ? "Unlike post" : "Like post"}
					class={cn(
						"flex items-center gap-2.5 transition-all duration-300 group/btn",
						isLiked.value
							? "text-primary shadow-glow"
							: "text-muted-foreground hover:text-primary",
					)}
				>
					<div class="relative">
						<HeartIcon
							size={18}
							class={cn(
								"transition-transform",
								isLiked.value
									? "fill-current scale-110"
									: "group-hover/btn:scale-110",
							)}
						/>
						{isLiked.value && (
							<div class="absolute inset-0 bg-primary/20 blur-md rounded-full -z-10 animate-pulse" />
						)}
					</div>
					<span class="text-xs font-bold tracking-widest">
						{likeCount.value.toLocaleString()}
					</span>
				</button>

				<button
					type="button"
					aria-label="View comments"
					class="flex items-center gap-2.5 text-muted-foreground hover:text-primary transition-all group/btn"
				>
					<MessageSquareIcon
						size={18}
						class="group-hover/btn:scale-110 transition-transform"
					/>
					<span class="text-xs font-bold tracking-widest">
						{comments.toLocaleString()}
					</span>
				</button>
			</div>

			<div class="ml-auto relative z-10">
				<button
					type="button"
					aria-label="Share post"
					class="flex items-center gap-2 text-primary/60 hover:text-primary transition-all text-[10px] font-bold tracking-[0.3em] uppercase group/share"
				>
					<Share2Icon
						size={16}
						class="group-hover/share:rotate-12 transition-transform"
					/>
					<span class="hidden sm:inline">{t("slug.propagate")}</span>
				</button>
			</div>
		</div>
	);
}
