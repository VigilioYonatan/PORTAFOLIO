// @vitest-environment happy-dom
import { render, screen } from "@testing-library/preact";
import { describe, expect, it } from "vitest";
import SkillBentoGrid from "../SkillBentoGrid";

describe("SkillBentoGrid Component", () => {
	it("renders all categories correctly", () => {
		render(<SkillBentoGrid />);
		expect(screen.getByText("Frontend Engineering")).toBeInTheDocument();
		expect(screen.getByText("Backend Architecture")).toBeInTheDocument();
		expect(screen.getByText("DevOps & Cloud")).toBeInTheDocument();
		expect(screen.getByText("Artificial Intelligence")).toBeInTheDocument();
		expect(screen.getByText("Mobile Development")).toBeInTheDocument();
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
        expect(screen.getByText(/Building immersive, high-performance interfaces/)).toBeInTheDocument();
        expect(screen.getByText(/integrating LLMs and RAG/i)).toBeInTheDocument();
    });
});
