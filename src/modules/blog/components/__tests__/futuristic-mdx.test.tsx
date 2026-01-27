// @vitest-environment happy-dom
import { render } from "@testing-library/preact";
import { describe, expect, it } from "vitest";
import FuturisticMDX from "../futuristic-mdx";

describe("FuturisticMDX Component", () => {
	it("renders HTML content correctly", () => {
		const content = "<h1>Test Title</h1><p>Test Paragraph</p>";
		const { container } = render(<FuturisticMDX content={content} />);
		expect(container.querySelector("h1")).toHaveTextContent("Test Title");
		expect(container.querySelector("p")).toHaveTextContent("Test Paragraph");
	});

	it("applies prose classes for styling", () => {
		const { container } = render(<FuturisticMDX content="<p>text</p>" />);
		const article = container.querySelector("article");
		expect(article).toHaveClass("prose");
		expect(article).toHaveClass("prose-invert");
	});

	it("handles custom class names", () => {
		const { container } = render(
			<FuturisticMDX content="<p>text</p>" class="custom-class" />,
		);
		expect(container.querySelector("article")).toHaveClass("custom-class");
	});
});
