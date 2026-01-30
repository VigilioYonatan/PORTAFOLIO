// @vitest-environment happy-dom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { projectUpdateApi } from "../apis/project.update.api";
import ProjectUpdate from "../components/project-update";
import type { ProjectWithRelations } from "../schemas/project.schema";

// Mock the API
vi.mock("../apis/project.update.api", () => ({
	projectUpdateApi: vi.fn(),
}));

// Mock sweetModal
vi.mock("@vigilio/sweet", () => ({
	sweetModal: vi.fn().mockResolvedValue({ isConfirmed: true }),
}));

// Mock technologies API
vi.mock("@modules/technology/apis/technology.index.api", () => ({
	technologyIndexApi: vi.fn(() => ({
		isLoading: false,
		data: { results: [{ id: 1, name: "React" }] },
	})),
}));

// Mock projects API
vi.mock("@modules/project/apis/project.index.api", () => ({
	projectIndexApi: vi.fn(() => ({
		isLoading: false,
		data: { results: [{ id: 1, title: "Test Project" }] },
	})),
}));

// Mock MKD Editor to avoid browser API issues in tests
vi.mock("@components/form/form-mkd-editor", () => ({
	FormMKDEditor: () => <div data-testid="mkd-editor" />,
}));

const mockProject: ProjectWithRelations = {
	id: 1,
	title: "Test Project",
	slug: "test-project",
	description: "Test description",
	content: "# Test content",
	impact_summary: "Test impact",
	website_url: "https://test.com",
	repo_url: "https://github.com/test/repo",
	github_stars: 10,
	github_forks: 5,
	languages_stats: null,
	status: "live",
	sort_order: 1,
	is_featured: false,
	is_visible: true,
	images: null,
	videos: null,
	start_date: new Date("2024-01-01"),
	end_date: null,
	seo: null,
	tenant_id: 1,
	created_at: new Date(),
	updated_at: new Date(),
	techeables: [],
	language: "es",
	parent_id: null,
};

describe("ProjectUpdate", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("renders update form with project data", () => {
		const mutateMock = vi.fn();
		(projectUpdateApi as ReturnType<typeof vi.fn>).mockReturnValue({
			mutate: mutateMock,
			isLoading: false,
			error: null,
		});

		const refetchMock = vi.fn();
		const onCloseMock = vi.fn();

		render(
			<ProjectUpdate
				project={mockProject}
				refetch={refetchMock}
				onClose={onCloseMock}
			/>,
		);

		// Check that form fields are populated
		expect(screen.getByDisplayValue("Test Project")).toBeInTheDocument();
		expect(screen.getByDisplayValue("test-project")).toBeInTheDocument();
	});

	it("handles user input correctly", async () => {
		const mutateMock = vi.fn();
		(projectUpdateApi as ReturnType<typeof vi.fn>).mockReturnValue({
			mutate: mutateMock,
			isLoading: false,
			error: null,
		});

		const refetchMock = vi.fn();
		const onCloseMock = vi.fn();

		render(
			<ProjectUpdate
				project={mockProject}
				refetch={refetchMock}
				onClose={onCloseMock}
			/>,
		);

		const titleInput = screen.getByDisplayValue("Test Project");

		fireEvent.change(titleInput, {
			target: { value: "Updated Project Title" },
		});

		expect(titleInput).toHaveValue("Updated Project Title");
	});

	it("shows loading state when submitting", () => {
		(projectUpdateApi as ReturnType<typeof vi.fn>).mockReturnValue({
			mutate: vi.fn(),
			isLoading: true,
			error: null,
		});

		const refetchMock = vi.fn();
		const onCloseMock = vi.fn();

		render(
			<ProjectUpdate
				project={mockProject}
				refetch={refetchMock}
				onClose={onCloseMock}
			/>,
		);

		expect(
			screen.getByRole("button", {
				name: /dashboard\.project\.form\.loading/i,
			}),
		).toBeInTheDocument();
	});

	it("auto-generates slug from title", async () => {
		const mutateMock = vi.fn();
		(projectUpdateApi as ReturnType<typeof vi.fn>).mockReturnValue({
			mutate: mutateMock,
			isLoading: false,
			error: null,
		});

		const refetchMock = vi.fn();
		const onCloseMock = vi.fn();

		render(
			<ProjectUpdate
				project={mockProject}
				refetch={refetchMock}
				onClose={onCloseMock}
			/>,
		);

		const titleInput = screen.getByDisplayValue("Test Project");

		fireEvent.change(titleInput, {
			target: { value: "My New Project Title" },
		});

		await waitFor(() => {
			const slugInput = screen.getByDisplayValue("my-new-project-title");
			expect(slugInput).toBeInTheDocument();
		});
	});
});
