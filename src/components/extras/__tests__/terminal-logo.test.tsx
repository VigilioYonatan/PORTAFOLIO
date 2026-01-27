import { render, screen } from "@testing-library/preact";
import TerminalLogo from "../terminal-logo";

describe("TerminalLogo", () => {
	it("renders correctly with default text", () => {
		render(<TerminalLogo />);
		expect(screen.getAllByText("DEV_TERM").length).toBeGreaterThanOrEqual(1);
		expect(screen.getByText(">")).toBeInTheDocument();
		expect(screen.getByText("_")).toBeInTheDocument();
	});

	it("has the correct link", () => {
		render(<TerminalLogo />);
		const link = screen.getByRole("link");
		expect(link).toHaveAttribute("href", "/");
	});

	it("applies custom className", () => {
		render(<TerminalLogo className="custom-class" />);
		const link = screen.getByRole("link");
		expect(link.className).toContain("custom-class");
	});
});
