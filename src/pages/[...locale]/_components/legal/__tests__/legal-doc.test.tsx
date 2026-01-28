// @vitest-environment happy-dom
import { render, screen } from "@testing-library/preact";
import { describe, expect, it } from "vitest";
import LegalDoc from "../legal-doc";

describe("LegalDoc Component", () => {
	it("renders title and last updated correctly", () => {
		render(
			<LegalDoc title="TEST_POLICY" lastUpdated="2026-01-24">
				<p>Test Content</p>
			</LegalDoc>,
		);
		expect(screen.getByText("TEST_POLICY")).toBeInTheDocument();
		expect(screen.getByText(/LAST_UPDATED: 2026-01-24/)).toBeInTheDocument();
		expect(screen.getByText("Test Content")).toBeInTheDocument();
	});

	it("renders children correctly", () => {
		render(
			<LegalDoc title="TITLE" lastUpdated="DATE">
				<ul data-testid="test-list">
					<li>Item 1</li>
				</ul>
			</LegalDoc>,
		);
		expect(screen.getByTestId("test-list")).toBeInTheDocument();
		expect(screen.getByText("Item 1")).toBeInTheDocument();
	});
});
