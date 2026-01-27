// @vitest-environment happy-dom
import { fireEvent, render, screen } from "@testing-library/preact";
import { describe, expect, it, vi } from "vitest";
import Button from "../Button";

describe("Button Component", () => {
	it("renders children correctly", () => {
		render(<Button>Click me</Button>);
		expect(screen.getByText("Click me")).toBeInTheDocument();
	});

	it("handles onClick event", () => {
		const handleClick = vi.fn();
		render(<Button onClick={handleClick}>Click me</Button>);
		fireEvent.click(screen.getByText("Click me"));
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("renders as anchor when 'as' prop is 'a'", () => {
		render(
			<Button as="a" href="/test">
				Link
			</Button>,
		);
		const link = screen.getByText("Link");
		expect(link.tagName).toBe("A");
		expect(link).toHaveAttribute("href", "/test");
	});

	it("shows loading state", () => {
		render(
			<Button isLoading loading_title="Processing...">
				Submit
			</Button>,
		);
		expect(screen.getByText("Processing...")).toBeInTheDocument();
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("applies variant classes", () => {
		render(<Button variant="danger">Delete</Button>);
		const button = screen.getByRole("button");
		expect(button.className).toContain("bg-destructive");
	});
});
