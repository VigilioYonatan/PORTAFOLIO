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
import ResetPasswordForm from "../reset-password.form";

// Mock the API and SweetModal
vi.mock("../../apis/auth.reset-password.api", () => ({
	authResetPasswordApi: vi.fn(),
}));

vi.mock("@vigilio/sweet", () => ({
	sweetModal: vi.fn(() => Promise.resolve({ isConfirmed: true })),
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

		expect(
			screen.getAllByPlaceholderText("••••••••••••")[0],
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /restablecer contraseña/i }),
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

		const passInputs = screen.getAllByPlaceholderText("••••••••••••");
		const submitButton = screen.getByRole("button", {
			name: /restablecer contraseña/i,
		});

		await fireEvent.change(passInputs[0], { target: { value: "NewPass123!" } });
		await fireEvent.change(passInputs[1], { target: { value: "NewPass123!" } });
		await fireEvent.click(submitButton);

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
		const mutateMock = vi.fn((data, options) => {
			options.onSuccess();
		});
		(authResetPasswordApi as any).mockReturnValue({
			mutate: mutateMock,
			isLoading: false,
			error: null,
		});

		render(<ResetPasswordForm token="valid-token" />);

		const passInputs = screen.getAllByPlaceholderText("••••••••••••");
		const submitButton = screen.getByRole("button", {
			name: /restablecer contraseña/i,
		});

		await fireEvent.change(passInputs[0], { target: { value: "NewPass123!" } });
		await fireEvent.change(passInputs[1], { target: { value: "NewPass123!" } });
		await fireEvent.click(submitButton);

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
