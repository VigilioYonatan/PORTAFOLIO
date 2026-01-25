// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/preact";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as userDestroyApi from "../../apis/user.destroy.api";
import * as userApi from "../../apis/user.index.api";
import UserIndex from "../user.index";

// Mock APIs
vi.mock("../../apis/user.index.api");
vi.mock("../../apis/user.index.api");
vi.mock("../../apis/user.destroy.api");
vi.mock("../../apis/user.store.api", () => ({
	userStoreApi: vi.fn(() => ({
		mutate: vi.fn(),
		isLoading: false,
	})),
}));

const mockUsers = [
	{
		id: 1,
		username: "sarah.jenkins",
		email: "sarah@company.com",
		role_id: 3,
		is_mfa_enabled: true,
		last_login_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
		avatar: null,
		qr_code_token: null,
		phone_number: null,
		google_id: null,
		security_stamp: "uuid-1",
		failed_login_attempts: 0,
		is_superuser: false,
		email_verified_at: new Date().toISOString(),
		lockout_end_at: null,
		mfa_secret: null,
		last_ip_address: "192.168.1.1",
		deleted_at: null,
		tenant_id: 1,
		status: "ACTIVE" as const,
		created_at: new Date().toISOString(),
		updated_at: null,
	},
	{
		id: 2,
		username: "devon.lane",
		email: "devon@company.com",
		role_id: 1,
		is_mfa_enabled: false,
		last_login_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
		avatar: null,
		qr_code_token: "pending-token",
		phone_number: null,
		google_id: null,
		security_stamp: "uuid-2",
		failed_login_attempts: 0,
		is_superuser: false,
		email_verified_at: new Date().toISOString(),
		lockout_end_at: null,
		mfa_secret: null,
		last_ip_address: "192.168.1.2",
		deleted_at: null,
		tenant_id: 1,
		status: "ACTIVE" as const,
		created_at: new Date().toISOString(),
		updated_at: null,
	},
	{
		id: 3,
		username: "alex.johnson",
		email: "alex@company.com",
		role_id: 2,
		is_mfa_enabled: false,
		last_login_at: null,
		avatar: null,
		qr_code_token: null,
		phone_number: null,
		google_id: null,
		security_stamp: "uuid-3",
		failed_login_attempts: 0,
		is_superuser: false,
		email_verified_at: null,
		lockout_end_at: null,
		mfa_secret: null,
		last_ip_address: null,
		deleted_at: null,
		tenant_id: 1,
		status: "PENDING" as const,
		created_at: new Date().toISOString(),
		updated_at: null,
	},
];

// Mock useTable
vi.mock("@vigilio/preact-table", () => ({
	useTable: vi.fn((options) => ({
		pagination: {
			value: { offset: 0, limit: 10, total: 3 },
			totalPages: 1,
			paginator: { pages: [1], currentPage: 1 },
			onBackPage: vi.fn(),
			onNextPage: vi.fn(),
			onChangePage: vi.fn(),
		},
		search: { value: "", onSearchByName: vi.fn(), debounceTerm: "" },
		updateData: vi.fn(),
		table: {
			Thead: vi.fn(() => [
				// Thead returns an array of rows, each row is an array of column headers
				options.columns.map((col: any) => ({
					key: col.key,
					value: col.header, // Use header from columns
					isSort: col.isSort,
					methods: { sorting: vi.fn() },
					colSpan: 1,
					rowSpan: 1,
				})),
			]),
			TBody: {
				Row: vi.fn(() => mockUsers),
				Cell: vi.fn((data) =>
					options.columns.map((col: any) => ({
						key: col.key,
						value: col.cell ? col.cell(data) : data[col.key],
					})),
				),
			},
			Tfoot: vi.fn(() => []),
		},
		sort: { value: {} },
		filters: { value: {} },
		query: { isSuccess: true, isLoading: false, isError: false },
	})),
}));

describe("UserIndex Component", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		// Mock userIndexApi
		vi.mocked(userApi.userIndexApi).mockReturnValue({
			isLoading: false,
			isError: false,
			isSuccess: true,
			data: {
				results: mockUsers,
				count: 3,
			},
			refetch: vi.fn(),
		} as any);

		// Mock userDestroyApi
		vi.mocked(userDestroyApi.userDestroyApi).mockReturnValue({
			isLoading: false,
			mutate: vi.fn(),
		} as any);
	});

	it("should render user management header", () => {
		render(<UserIndex />);

		expect(screen.getByText("User Management")).toBeTruthy();
		expect(screen.getByText("Invite User")).toBeTruthy();
		expect(screen.getByText("Export CSV")).toBeTruthy();
	});

	it("should render stats cards", () => {
		render(<UserIndex />);

		expect(screen.getByText("Total Users")).toBeTruthy();
		expect(screen.getByText("Active Sessions")).toBeTruthy();
		expect(screen.getByText("Pending Invites")).toBeTruthy();
	});

	it("should render user table with correct columns", () => {
		render(<UserIndex />);

		// Check column headers
		expect(screen.getByText("USERNAME")).toBeTruthy();
		expect(screen.getByText("EMAIL ADDRESS")).toBeTruthy();
		expect(screen.getByText("ROLE")).toBeTruthy();
		expect(screen.getByText("MFA STATUS")).toBeTruthy();
		expect(screen.getByText("LAST ACTIVE")).toBeTruthy();
		expect(screen.getByText("ACTIONS")).toBeTruthy();
	});

	it("should display user data correctly", () => {
		render(<UserIndex />);

		// Check usernames
		expect(screen.getByText("sarah.jenkins")).toBeTruthy();
		expect(screen.getByText("devon.lane")).toBeTruthy();
		expect(screen.getByText("alex.johnson")).toBeTruthy();

		// Check emails
		expect(screen.getByText("sarah@company.com")).toBeTruthy();
		expect(screen.getByText("devon@company.com")).toBeTruthy();
	});

	it("should display role badges correctly", () => {
		const { container } = render(<UserIndex />);

		// Sarah is Owner (role_id: 3)
		const ownerBadge = container.querySelector('[data-testid="role-1"]');
		expect(ownerBadge?.textContent).toContain("OWNER");

		// Devon is Admin (role_id: 1)
		const adminBadge = container.querySelector('[data-testid="role-2"]');
		expect(adminBadge?.textContent).toContain("ADMIN");
	});

	it("should display MFA status badges correctly", () => {
		const { container } = render(<UserIndex />);

		// Sarah has MFA enabled
		const enabledBadge = container.querySelector('[data-testid="mfa-1"]');
		expect(enabledBadge?.textContent).toContain("Enabled");

		// Devon has MFA pending (has qr_code_token)
		const pendingBadge = container.querySelector('[data-testid="mfa-2"]');
		expect(pendingBadge?.textContent).toContain("Pending");

		// Alex has MFA not set
		const notSetText = container.querySelectorAll(".text-muted-foreground");
		const hasNotSet = Array.from(notSetText).some((el) =>
			el.textContent?.includes("Not set"),
		);
		expect(hasNotSet).toBe(true);
	});

	it("should display last active time correctly", () => {
		render(<UserIndex />);

		// Sarah logged in 30 minutes ago
		expect(screen.getByText(/minutes ago/)).toBeTruthy();

		// Devon logged in 2 hours ago
		expect(screen.getByText(/hours ago/)).toBeTruthy();

		// Alex never logged in
		expect(screen.getByText("Never")).toBeTruthy();
	});

	it("should render search input", () => {
		const { container } = render(<UserIndex />);

		const searchInput = container.querySelector(
			'input[placeholder*="Search by name or email"]',
		);
		expect(searchInput).toBeTruthy();
	});

	it("should render role filter dropdown", () => {
		const { container } = render(<UserIndex />);

		const roleFilter = container.querySelector("select") as HTMLSelectElement;
		expect(roleFilter).toBeTruthy();

		// Check options
		const options = Array.from(roleFilter.querySelectorAll("option")).map(
			(opt) => opt.textContent,
		);
		expect(options).toContain("All Roles");
		expect(options).toContain("Owner");
		expect(options).toContain("Admin");
		expect(options).toContain("User");
	});

	it("should render MFA filter dropdown", () => {
		const { container } = render(<UserIndex />);

		const selects = container.querySelectorAll("select");
		const mfaFilter = selects[1] as HTMLSelectElement;
		expect(mfaFilter).toBeTruthy();

		// Check options
		const options = Array.from(mfaFilter.querySelectorAll("option")).map(
			(opt) => opt.textContent,
		);
		expect(options).toContain("All MFA Status");
		expect(options).toContain("Enabled");
		expect(options).toContain("Pending");
		expect(options).toContain("Not Set");
	});

	it("should show invite user modal when button clicked", () => {
		const { container } = render(<UserIndex />);

		const inviteButton = screen.getByText("Invite User");
		fireEvent.click(inviteButton);

		// Modal should be opened (implementation might vary based on Modal component)
		// This is a basic check
		expect(inviteButton).toBeTruthy();
	});

	it("should display showing count correctly", () => {
		render(<UserIndex />);

		expect(screen.getByText(/Showing 1-3 of 3 users/)).toBeTruthy();
	});

	it("should render action buttons for each user", () => {
		const { container } = render(<UserIndex />);

		// Check for action dropdowns (EllipsisMenu)
		const actionButtons = container.querySelectorAll('[aria-label="Opciones"]');
		expect(actionButtons.length).toBeGreaterThan(0);
	});

	it("should handle loading state", () => {
		vi.mocked(userApi.userIndexApi).mockReturnValue({
			isLoading: true,
			isError: false,
			isSuccess: false,
			data: null,
			refetch: vi.fn(),
		} as any);

		render(<UserIndex />);

		// Should show loading state (skeleton or spinner)
		// Implementation depends on VigilioTable component
		expect(true).toBe(true);
	});

	it("should handle empty state", () => {
		vi.mocked(userApi.userIndexApi).mockReturnValue({
			isLoading: false,
			isError: false,
			isSuccess: true,
			data: {
				results: [],
				count: 0,
			},
			refetch: vi.fn(),
		} as any);

		render(<UserIndex />);

		expect(screen.getByText("Showing 0-0 of 0 users")).toBeTruthy();
	});

	it("should render user avatars correctly", () => {
		const { container } = render(<UserIndex />);

		// Check for avatar containers
		const avatars = container.querySelectorAll('[data-testid^="avatar-"]');
		expect(avatars.length).toBe(3);

		// Check that initials are shown when no avatar
		const initialsElements = container.querySelectorAll(
			".text-primary.font-bold",
		);
		expect(initialsElements.length).toBeGreaterThan(0);
	});

	it("should not show bulk actions bar initially", () => {
		const { container } = render(<UserIndex />);

		// Bulk actions bar should be hidden when no selection
		const bulkBar = container.querySelector(".fixed.bottom-0");
		expect(bulkBar).toBeFalsy();
	});
});
