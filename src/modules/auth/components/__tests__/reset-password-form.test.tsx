// @vitest-environment happy-dom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/preact";
import { sweetModal } from "@vigilio/sweet";
import { afterEach, describe, expect, it, vi } from "vitest";
import { authResetPasswordApi } from "../../apis/auth.reset-password.api";
import ResetPasswordForm from "../reset-password-form";

// Mock the API and SweetModal
vi.mock("../../apis/auth.reset-password.api", () => ({
	authResetPasswordApi: vi.fn(),
}));

vi.mock("@vigilio/sweet", () => ({
	sweetModal: vi.fn(() => Promise.resolve({ isConfirmed: true })),
}));




vi.mock("@src/i18n", () => ({
	useTranslations: () => (key: string) => {
		const translations: Record<string, string> = {
			"auth.reset.new_password": "New Password",
			"auth.reset.confirm_password": "Confirm Password",
			"auth.reset.submit": "Reset Password",
			"auth.reset.success.title": "Success",
			"auth.reset.success.message": "Password reset successfully",
			"auth.reset.success.back": "Back to Login",
		};
		return translations[key] || key;
	},
}));

describe("ResetPasswordForm", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("renders reset password form correctly", () => {
		(authResetPasswordApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
			error: null,
		});

		render(<ResetPasswordForm token="valid-token" />);

		expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /Reset Password/i }),
		).toBeInTheDocument();
	});

	it("submits form with matching passwords", async () => {
		const mutateMock = vi.fn();
		(authResetPasswordApi as any).mockReturnValue({
			mutate: mutateMock,
			isLoading: false,
			error: null,
		});

		render(<ResetPasswordForm token="valid-token" />);

		const newPassInput = screen.getByLabelText(/New Password/i);
		const repeatPassInput = screen.getByLabelText(/Confirm Password/i);
		const submitButton = screen.getByRole("button", { name: /Reset Password/i });

		fireEvent.input(newPassInput, { target: { value: "NewPass123!" } });
		fireEvent.input(repeatPassInput, { target: { value: "NewPass123!" } });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(mutateMock).toHaveBeenCalledWith(
				{
					token: "valid-token",
					new_password: "NewPass123!",
					repeat_password: "NewPass123!",
				},
				expect.any(Object),
			);
		});
	});

	it("calls sweetModal on success", async () => {
		const mutateMock = vi.fn((_, options) => {
			options.onSuccess();
		});
		(authResetPasswordApi as any).mockReturnValue({
			mutate: mutateMock,
			isLoading: false,
			error: null,
		});

		render(<ResetPasswordForm token="valid-token" />);


		const newPassInput = screen.getByLabelText(/New Password/i);
		const repeatPassInput = screen.getByLabelText(/Confirm Password/i);
		const submitButton = screen.getByRole("button", { name: /Reset Password/i });

		fireEvent.input(newPassInput, { target: { value: "NewPass123!" } });
		fireEvent.input(repeatPassInput, { target: { value: "NewPass123!" } });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(sweetModal).toHaveBeenCalled();
		});
	});

	it("displays error message when API fails", () => {
		(authResetPasswordApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
			error: { message: "Token expired" },
		});

		render(<ResetPasswordForm token="invalid-token" />);

		expect(screen.getByText("Token expired")).toBeInTheDocument();
	});
});
