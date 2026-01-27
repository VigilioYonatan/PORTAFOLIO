import { marked } from "marked";
import { createHighlighter } from "shiki";

// Singleton highlighter to avoid re-initialization cost
let highlighter: any = null;

async function getShikiHighlighter() {
	if (!highlighter) {
		highlighter = await createHighlighter({
			themes: ["dracula", "github-light"], // "dracula" matches our cyberpunk/dark aesthetic well
			langs: [
				"typescript",
				"javascript",
				"tsx",
				"jsx",
				"css",
				"html",
				"bash",
				"json",
				"markdown",
				"sql",
				"python",
				"go",
				"rust",
			],
		});
	}
	return highlighter;
}

export async function renderMarkdown(content: string): Promise<string> {
	const shiki = await getShikiHighlighter();

	// Configure marked to use shiki for code blocks
	const renderer = new marked.Renderer();

	renderer.code = ({
		text,
		lang,
		escaped,
	}: {
		text: string;
		lang?: string;
		escaped?: boolean;
	}) => {
		const language = lang || "text";
		try {
			// Use dracula for dark mode compatibility (we default to dark)
			const html = shiki.codeToHtml(text, {
				lang: language,
				theme: "dracula",
			});
			return html;
		} catch (_e) {
			// Fallback to simple code block
			return `<pre><code class="language-${language}">${text}</code></pre>`;
		}
	};

	// Add custom classes or IDs if needed for "Futuristic" feel (e.g., glitch effects on specific headers)
	// For now, standard specific semantic HTML.

	marked.setOptions({
		renderer: renderer,
		gfm: true,
		breaks: true,
	});

	return marked(content);
}
