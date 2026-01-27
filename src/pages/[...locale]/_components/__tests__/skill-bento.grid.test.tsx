// @vitest-environment happy-dom

import { technologyIndexApi } from "@modules/technology/apis/technology.index.api";
import { render, screen } from "@testing-library/preact";
import { describe, expect, it, vi } from "vitest";
import SkillBentoGrid from "../skill-bento.grid";

// Mocking the hooks
vi.mock("@hooks/use-motion", () => ({
	useEntranceAnimation: vi.fn(() => ({ current: null })),
}));

// Mocking the API
vi.mock("@modules/technology/apis/technology.index.api", () => ({
	technologyIndexApi: vi.fn(() => ({
		isLoading: false,
		isError: false,
		isSuccess: true,
		data: {
			results: [
				{
					id: 1,
					name: "React & Next.js",
					category: "FRONTEND",
				},
				{
					id: 2,
					name: "NestJS",
					category: "BACKEND",
				},
			],
		},
	})),
}));

describe("SkillBentoGrid Component", () => {
	it("renders technologies correctly from API", () => {
		render(<SkillBentoGrid />);
		expect(screen.getByText("React & Next.js")).toBeInTheDocument();
		expect(screen.getByText("NestJS")).toBeInTheDocument();
		expect(screen.getByText("FRONTEND")).toBeInTheDocument();
		expect(screen.getByText("BACKEND")).toBeInTheDocument();
	});

	it("renders grid headers", () => {
		render(<SkillBentoGrid />);
		expect(screen.getByText("CAPABILITIES_INVENTORY")).toBeInTheDocument();
		expect(screen.getByText("SKILL_SET.manifest")).toBeInTheDocument();
	});

	it("shows empty state when no technologies found", () => {
		vi.mocked(technologyIndexApi).mockReturnValue({
			isLoading: false,
			isError: false,
			isSuccess: true,
			data: { results: [] },
		} as any);

		render(<SkillBentoGrid />);
		expect(screen.getByText("[ EMPTY_RECOGNITION_POOL ]")).toBeInTheDocument();
	});
});
