import { cn } from "@infrastructure/utils/client";
import { useSignal } from "@preact/signals";
import { BookOpen, Clock } from "lucide-preact";
import { useEffect, useRef } from "preact/hooks";
import FuturisticMDX from "./futuristic-mdx";
import SocialHub from "./social-hub";

interface BlogReaderProps {
	title: string;
	content: string;
	author: string;
	date: string;
	readingTime: string;
	likes: number;
	comments: number;
	class?: string;
}

export default function BlogReader({
	title,
	content,
	author,
	date,
	readingTime,
	likes,
	comments,
	class: className,
}: BlogReaderProps) {
	const progress = useSignal(0);
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleScroll = () => {
			if (!contentRef.current) return;
			const element = contentRef.current;
			const totalHeight = element.clientHeight - window.innerHeight;
			const windowScrollTop =
				window.scrollY || document.documentElement.scrollTop;

			if (windowScrollTop === 0) {
				progress.value = 0;
			} else if (windowScrollTop > totalHeight) {
				progress.value = 100;
			} else {
				progress.value = (windowScrollTop / totalHeight) * 100;
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<div class={cn("relative", className)} ref={contentRef}>
			{/* Reading Progress Bar */}
			<div class="fixed top-0 left-0 w-full h-[2px] bg-zinc-900 z-100">
				<div
					class="h-full bg-primary shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all duration-150 ease-out"
					style={{ width: `${progress.value}%` }}
				/>
				<div class="absolute top-2 right-4 font-mono text-[9px] text-primary/60  tracking-widest bg-black/80 px-2 py-0.5 rounded-sm border border-primary/20 backdrop-blur-md">
					READ_PROGRESS: {Math.round(progress.value)}%
				</div>
			</div>

			{/* Header Content */}
			<header class="mb-12 border-b border-white/5 pb-12">
				<div class="flex items-center gap-2 mb-4">
					<div class="w-1.5 h-1.5 rounded-full bg-primary shadow-glow animate-pulse" />
					<span class="text-[10px] font-mono text-primary/60 tracking-[0.3em] uppercase">
						{"NEURAL_STDOUT // ARTICLE"}
					</span>
				</div>

				<h1 class="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none mb-6 text-glow">
					{title}
				</h1>

				<div class="flex flex-wrap items-center gap-6 text-[10px] font-mono  text-muted-foreground/60 uppercase tracking-[0.2em]">
					<div class="flex items-center gap-2">
						<Clock size={12} class="text-primary/40" />
						{readingTime} ESTIMATED_SYNC_TIME
					</div>
					<div class="flex items-center gap-2">
						<BookOpen size={12} class="text-primary/40" />
						{author} SOURCE_ID
					</div>
					<div class="flex items-center gap-2">
						<span class="text-primary/40">CAL::</span>
						{date}
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main class="relative">
				{/* Side metadata (Desktop only) */}
				<aside class="absolute -left-32 top-0 hidden lg:flex flex-col gap-8 opacity-40 hover:opacity-100 transition-opacity">
					<div class="flex flex-col gap-1 border-l border-primary/20 pl-4 py-2">
						<span class="text-[8px] font-mono text-zinc-500">VERSION</span>
						<span class="text-[10px] font-mono  text-primary">v2.4.0</span>
					</div>
					<div class="flex flex-col gap-1 border-l border-primary/20 pl-4 py-2">
						<span class="text-[8px] font-mono text-zinc-500">STATUS</span>
						<span class="text-[10px] font-mono  text-green-500">VERIFIED</span>
					</div>
				</aside>

				<FuturisticMDX content={content} />

				<SocialHub likes={likes} comments={comments} />

				{/* Footer decorations */}
				<div class="mt-20 pt-10 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-muted-foreground/30 uppercase tracking-[0.4em]">
					<span>[ END_OF_TRANSMISSION ]</span>
					<div class="flex gap-2">
						<div class="w-2 h-2 border border-current" />
						<div class="w-2 h-2 border border-current opacity-50" />
						<div class="w-2 h-2 border border-current opacity-20" />
					</div>
				</div>
			</main>
		</div>
	);
}
