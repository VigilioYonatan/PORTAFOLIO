import { marked } from "marked";
import { createHighlighter } from "shiki";

// Singleton highlighter to avoid reloading themes on every request
let highlighter: Awaited<ReturnType<typeof createHighlighter>> | null = null;

async function getHighlighter() {
	if (!highlighter) {
		highlighter = await createHighlighter({
			themes: ["dracula", "min-light"], // Dark and light themes
			langs: [
				"javascript",
				"typescript",
				"tsx",
				"jsx",
				"css",
				"json",
				"html",
				"bash",
				"python",
				"go",
				"rust",
				"sql",
				"yaml",
				"markdown",
				"docker",
			],
		});
	}
	return highlighter;
}

/**
 * Processes markdown content into HTML with Shiki syntax highlighting.
 * @param content Raw markdown string
 * @returns HTML string
 */
export async function processMarkdown(content: string): Promise<string> {
	const hl = await getHighlighter();

	// Create a new renderer to avoid type issues with object literal
	const renderer = new marked.Renderer();

	renderer.code = ({ text, lang }: any) => {
		const languageRaw = lang || "text";

		// Safe fallback
		const language = hl.getLoadedLanguages().includes(languageRaw)
			? languageRaw
			: "text";

		const html = hl.codeToHtml(text, {
			lang: language,
			theme: "dracula",
		});
		return `<div class="code-block relative group my-6 overflow-hidden rounded-lg border border-white/5 bg-[#1e1e2e] shadow-2xl backdrop-blur-sm transition-all hover:border-primary/20">
            <div class="absolute right-3 top-3 z-10 opacity-0 transition-opacity group-hover:opacity-100">
                    <button class="copy-btn rounded bg-white/10 p-1.5 text-xs text-white backdrop-blur-md hover:bg-primary/20" data-code="${encodeURIComponent(
											text,
										)}">
                    Copy
                    </button>
            </div>
            ${html}
        </div>`;
	};

	renderer.blockquote = (quote) => {
		const text =
			typeof quote === "string"
				? quote
				: (quote as any).text ||
					(quote as any).tokens?.map((t: any) => t.text).join("") ||
					"";
		return `<blockquote class="border-l-4 border-primary/50 bg-primary/5 pl-4 py-2 my-4 italic text-muted-foreground rounded-r-lg backdrop-blur-sm">
            ${text}
        </blockquote>`;
	};

	renderer.link = function (this: any, { href, title, tokens }: any) {
		const linkHref = href;
		const linkTitle = title;
		const linkText = this.parser.parseInline(tokens);

		const isExternal = linkHref?.startsWith("http");
		const target = isExternal
			? 'target="_blank" rel="noopener noreferrer"'
			: "";
		return `<a href="${linkHref}" title="${linkTitle || ""}" ${target} class="text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-colors">${linkText}</a>`;
	};

	return await marked.parse(content, {
		async: true,
		gfm: true,
		breaks: true,
		renderer: renderer as any, // Force cast to avoid strict type mismatch
	});
}
