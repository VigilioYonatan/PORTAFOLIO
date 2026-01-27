// @vitest-environment happy-dom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { authForgotPasswordApi } from "../../apis/auth.forgot-password.api";
import ForgotPasswordForm from "../forgot-password.form";

// Mock the API
vi.mock("../../apis/auth.forgot-password.api", () => ({
	authForgotPasswordApi: vi.fn(),
}));

describe("ForgotPasswordForm", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("renders forgot password form correctly", () => {
		(authForgotPasswordApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
			isSuccess: false,
			error: null,
		});

		render(<ForgotPasswordForm />);

		// Check that title and labels are rendered
		expect(screen.getByText("Recovery Mode")).toBeInTheDocument();
		expect(screen.getByText("Target Email")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /SEND INSTRUCTIONS/i }),
		).toBeInTheDocument();
		expect(screen.getByTestId("back-to-login")).toBeInTheDocument();
	});

	it("submits form with correct email", async () => {
		const mutateMock = vi.fn();
		(authForgotPasswordApi as any).mockReturnValue({
			mutate: mutateMock,
			isLoading: false,
			isSuccess: false,
			error: null,
		});

		render(<ForgotPasswordForm />);

		const emailInput = screen.getByPlaceholderText("admin@system.io");
		const submitButton = screen.getByRole("button", {
			name: /SEND INSTRUCTIONS/i,
		});

		fireEvent.change(emailInput, {
			target: { value: "test@example.com" },
		});
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(mutateMock).toHaveBeenCalledWith({ email: "test@example.com" });
		});
	});

	it("shows success message after submission", () => {
		(authForgotPasswordApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
			isSuccess: true,
			error: null,
		});

		render(<ForgotPasswordForm />);

		expect(screen.getByTestId("success-state")).toBeInTheDocument();
		expect(screen.getByTestId("back-to-login-link")).toBeInTheDocument();
	});

	it("displays error message when API fails", () => {
		(authForgotPasswordApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
			isSuccess: false,
			error: { message: "User not found" },
		});

		render(<ForgotPasswordForm />);

		expect(screen.getByTestId("error-message")).toHaveTextContent(
			"User not found",
		);
	});

	it("shows loading state when submitting", () => {
		(authForgotPasswordApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: true,
			isSuccess: false,
			error: null,
		});

		render(<ForgotPasswordForm />);

		expect(
			screen.getByRole("button", { name: /PROCESSING.../i }),
		).toBeInTheDocument();
	});
});
