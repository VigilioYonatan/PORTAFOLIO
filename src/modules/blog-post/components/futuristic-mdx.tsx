import { cn } from "@infrastructure/utils/client";
import { marked } from "marked";
import { createHighlighter } from "shiki";
import { useEffect, useState } from "preact/hooks";

interface FuturisticMDXProps {
	content: string;
    renderedHtml?: string;
	class?: string;
}

export default function FuturisticMDX({
	content,
    renderedHtml,
	class: className,
}: FuturisticMDXProps) {
	const [htmlContent, setHtmlContent] = useState(renderedHtml || "");

	useEffect(() => {
        if (renderedHtml) {
            setHtmlContent(renderedHtml);
            return;
        }

		async function highlight() {
			const highlighter = await createHighlighter({
				themes: ["dracula"],
				langs: ["typescript", "javascript", "json", "bash", "sql", "html", "css"],
			});

			const renderer = new marked.Renderer();
			renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
				const language = lang || "text";
				try {
					return highlighter.codeToHtml(text, { lang: language, theme: "dracula" });
				} catch {
					return `<pre><code class="language-${language}">${text}</code></pre>`;
				}
			};

			marked.setOptions({ renderer });
			setHtmlContent(marked.parse(content) as string);
		}
		highlight();
	}, [content, renderedHtml]);

    if (!htmlContent) {
        // Fallback or loading state
         return (
             <div class={cn("animate-pulse bg-white/5 rounded h-64 w-full", className)}></div>
         )
    }

	return (
		<article
			class={cn(
				"prose prose-invert max-w-none font-sans",
				"prose-headings:font-mono prose-headings:text-primary prose-headings:tracking-tighter prose-headings:uppercase",
				"prose-h1:text-3xl md:prose-h1:text-4xl",
				"prose-h2:text-xl md:prose-h2:text-2xl prose-h2:border-l-2 prose-h2:border-primary/40 prose-h2:pl-4",
				"prose-p:text-zinc-400 prose-p:leading-relaxed text-sm md:text-base",
				"prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-primary/10 prose-pre:shadow-2xl prose-pre:rounded-lg prose-pre:overflow-x-auto",
				"prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-sm",
				"prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:italic prose-blockquote:text-zinc-300",
				"prose-strong:text-foreground prose-strong:font-bold",
				"prose-a:text-primary prose-a:no-underline hover:prose-a:text-glow transition-all",
                "prose-img:rounded-lg prose-img:border prose-img:border-white/10 prose-img:shadow-lg",
				className,
			)}
			dangerouslySetInnerHTML={{ __html: htmlContent }}
		/>
	);
}
