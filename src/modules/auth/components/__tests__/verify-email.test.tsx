// @vitest-environment happy-dom
import { render, screen } from "@testing-library/preact";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authVerifyEmailApi } from "../../apis/auth.verify-email.api";
import VerifyEmail from "../verify-email";

// Mock the API hook module
vi.mock("../../apis/auth.verify-email.api");

describe("VerifyEmail Component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render loading state", () => {
		// Setup mock return value for this test
		vi.mocked(authVerifyEmailApi).mockReturnValue({
			mutate: vi.fn(),
			isLoading: true,
			isSuccess: false,
			isError: false,
			error: null,
		} as any);

		render(<VerifyEmail token="test-token" />);
		expect(screen.getByText(/Verifying your email/i)).toBeTruthy();
	});

	it("should render success state", () => {
		vi.mocked(authVerifyEmailApi).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
			isSuccess: true,
			isError: false,
			error: null,
		} as any);

		render(<VerifyEmail token="test-token" />);
		expect(screen.getByText(/¡Email Verificado!/i)).toBeTruthy();
	});

	it("should render error state", () => {
		vi.mocked(authVerifyEmailApi).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
			isSuccess: false,
			isError: true,
			error: { message: "Invalid token" },
		} as any);

		render(<VerifyEmail token="test-token" />);
		expect(screen.getByText(/Error de Verificación/i)).toBeTruthy();
	});
});
