// @vitest-environment happy-dom
import { render, screen } from "@testing-library/preact";
import { describe, expect, it } from "vitest";
import SkillBentoGrid from "../skill-bento-grid";

describe("SkillBentoGrid Component", () => {
	it("renders all categories correctly", () => {
		render(<SkillBentoGrid />);
		expect(screen.getByText("skills.cat.frontend.title")).toBeInTheDocument();
		expect(screen.getByText("skills.cat.backend.title")).toBeInTheDocument();
		expect(screen.getByText("skills.cat.devops.title")).toBeInTheDocument();
		expect(screen.getByText("skills.cat.ai.title")).toBeInTheDocument();
		expect(screen.getByText("skills.cat.mobile.title")).toBeInTheDocument();
	});

	it("renders specific technologies and their levels", () => {
		render(<SkillBentoGrid />);
		expect(screen.getByText("React / Preact")).toBeInTheDocument();
		expect(screen.getByText("LangChain")).toBeInTheDocument();
		// Check levels
		const experts = screen.getAllByText("Expert");
		expect(experts.length).toBeGreaterThan(0);
	});

	it("renders descriptions for categories", () => {
		render(<SkillBentoGrid />);
		expect(
			screen.getByText(/skills\.cat\.frontend\.desc/),
		).toBeInTheDocument();
		expect(screen.getByText(/skills\.cat\.ai\.desc/i)).toBeInTheDocument();
	});
});
