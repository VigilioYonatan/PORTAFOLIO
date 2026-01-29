import { render, waitFor } from "@testing-library/preact";
import { describe, expect, it, vi } from "vitest";
import FuturisticMDX from "../futuristic-mdx";

vi.mock("shiki", () => ({
	createHighlighter: vi.fn().mockResolvedValue({
		codeToHtml: (code: string) => `<code>${code}</code>`,
	}),
}));

describe("FuturisticMDX Component", () => {
	it("renders HTML content correctly", async () => {
		const content = "<h1>Test Title</h1><p>Test Paragraph</p>";
		const { container } = render(<FuturisticMDX content={content} />);
		await waitFor(() => {
			expect(container.querySelector("h1")).toHaveTextContent("Test Title");
			expect(container.querySelector("p")).toHaveTextContent("Test Paragraph");
		});
	});

	it("applies prose classes for styling", async () => {
		const { container } = render(<FuturisticMDX content="<p>text</p>" />);
		await waitFor(() => {
			const article = container.querySelector("article");
			expect(article).not.toBeNull();
			expect(article).toHaveClass("prose");
			expect(article).toHaveClass("prose-invert");
		});
	});

	it("handles custom class names", async () => {
		const { container } = render(
			<FuturisticMDX content="<p>text</p>" class="custom-class" />,
		);
		await waitFor(() => {
			expect(container.querySelector("article")).toHaveClass("custom-class");
		});
	});
});
