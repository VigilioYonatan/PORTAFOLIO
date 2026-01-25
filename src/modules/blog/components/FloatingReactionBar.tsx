import { useSignal } from "@preact/signals";
import { 
    HeartIcon, 
    Share2Icon, 
    MessageSquareIcon,
    ArrowUpIcon,
    BookmarkIcon
} from "lucide-preact";
import { cn } from "@infrastructure/utils/client";
import { useEffect } from "preact/hooks";

interface FloatingReactionBarProps {
    onCommentClick?: () => void;
}

export default function FloatingReactionBar({ onCommentClick }: FloatingReactionBarProps) {
    const isLiked = useSignal(false);
    const isBookmarked = useSignal(false);
    const showScrollTop = useSignal(false);

    useEffect(() => {
        const handleScroll = () => {
            showScrollTop.value = window.scrollY > 400;
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="fixed left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 hidden xl:flex flex-col gap-4">
            <div className="flex flex-col gap-2 p-2 bg-card/50 backdrop-blur-xl border border-border rounded-full shadow-2xl">
                <button 
                    onClick={() => isLiked.value = !isLiked.value}
                    aria-label="Like Article"
                    className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                        isLiked.value ? "bg-primary/20 text-primary shadow-glow" : "hover:bg-secondary text-muted-foreground hover:text-primary"
                    )}
                >
                    <HeartIcon size={20} fill={isLiked.value ? "currentColor" : "none"} />
                </button>

                <button 
                    onClick={onCommentClick}
                    aria-label="Toggle Comments"
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary text-muted-foreground hover:text-primary transition-all"
                >
                    <MessageSquareIcon size={20} />
                </button>

                <button 
                    onClick={() => isBookmarked.value = !isBookmarked.value}
                    aria-label="Bookmark Article"
                    className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                        isBookmarked.value ? "text-primary" : "hover:bg-secondary text-muted-foreground hover:text-primary"
                    )}
                >
                    <BookmarkIcon size={20} fill={isBookmarked.value ? "currentColor" : "none"} />
                </button>

                <div className="h-px bg-border mx-2 my-1" />

                <button 
                    aria-label="Share Article"
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary text-muted-foreground hover:text-primary transition-all"
                >
                    <Share2Icon size={20} />
                </button>
            </div>

            <button 
                onClick={scrollToTop}
                aria-label="Scroll to Top"
                className={cn(
                    "w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center transition-all duration-500 hover:bg-primary/20 hover:scale-110",
                    showScrollTop.value ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                )}
            >
                <ArrowUpIcon size={20} />
            </button>
        </div>
    );
}
