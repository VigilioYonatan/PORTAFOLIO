// @vitest-environment happy-dom

import * as aiApi from "@modules/ai/apis/ai.config.show.api";
import { useAuthStore } from "@src/stores/auth.store";
import { render, screen } from "@testing-library/preact";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as tenantApi from "../../apis/tenant.show.api";
import SettingsIndex from "../settings-index";

// Mock stores and APIs
vi.mock("@src/stores/auth.store");
vi.mock("../../apis/tenant.show.api");
vi.mock("@modules/ai/apis/ai.config.show.api");
vi.mock("../../apis/tenant.update-me.api");
vi.mock("../../apis/tenant-setting.update-me.api");
vi.mock("@modules/ai/apis/ai.config.update.api");
vi.mock("@vigilio/sweet", () => ({ sweetModal: vi.fn() }));

describe("SettingsIndex Component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useAuthStore).mockReturnValue({
			state: {
				value: {
					tenant_id: 1,
					user_id: 1,
					role_id: 1,
				},
			},
		} as any);
	});

	it("should render loading skeleton while fetching data", () => {
		// Mock loading state
		vi.mocked(tenantApi.tenantShowApi).mockReturnValue({
			isLoading: true,
			isError: false,
			isSuccess: false,
			data: null,
			error: null,
		} as any);

		vi.mocked(aiApi.aiConfigShowApi).mockReturnValue({
			isLoading: true,
			isError: false,
			isSuccess: false,
			data: null,
			error: null,
		} as any);

		render(<SettingsIndex />);

		// Should show skeleton
		expect(document.querySelector(".animate-pulse")).toBeTruthy();
	});

	it("should render error message when fetch fails", () => {
		vi.mocked(tenantApi.tenantShowApi).mockReturnValue({
			isLoading: false,
			isError: true,
			isSuccess: false,
			data: null,
			error: { message: "Failed to load" },
		} as any);

		vi.mocked(aiApi.aiConfigShowApi).mockReturnValue({
			isLoading: false,
			isError: false,
			isSuccess: false,
			data: null,
			error: null,
		} as any);

		render(<SettingsIndex />);
		expect(screen.getByText("Failed to load")).toBeTruthy();
	});
});
