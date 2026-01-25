import { cn } from "@infrastructure/utils/client";

interface FuturisticMDXProps {
	content: string;
	class?: string;
}

export default function FuturisticMDX({
	content,
	class: className,
}: FuturisticMDXProps) {
	return (
		<article
			class={cn(
				"prose prose-invert max-w-none font-sans",
				"prose-headings:font-mono prose-headings:text-primary prose-headings:tracking-tighter prose-headings:uppercase",
				"prose-h1:text-3xl md:prose-h1:text-4xl",
				"prose-h2:text-xl md:prose-h2:text-2xl prose-h2:border-l-2 prose-h2:border-primary/40 prose-h2:pl-4",
				"prose-p:text-zinc-400 prose-p:leading-relaxed text-sm md:text-base",
				"prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-primary/10 prose-pre:shadow-2xl prose-pre:rounded-sm",
				"prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-sm prose-code:before:content-none prose-code:after:content-none",
				"prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:italic prose-blockquote:text-zinc-300",
				"prose-strong:text-foreground prose-strong:font-bold",
				"prose-a:text-primary prose-a:no-underline hover:prose-a:text-glow transition-all",
				className,
			)}
			dangerouslySetInnerHTML={{ __html: content }}
		/>
	);
}
