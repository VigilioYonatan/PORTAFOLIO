// @vitest-environment happy-dom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { authLoginApi } from "../../apis/auth.login.api";
import LoginForm from "../login.form";

// Mock the API
vi.mock("../../apis/auth.login.api", () => ({
	authLoginApi: vi.fn(),
}));

describe("LoginForm", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("renders login form correctly", () => {
		// Mock implementation for initial render
		(authLoginApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
			error: null,
		});

		render(<LoginForm />);

		// Check that labels are rendered
		expect(screen.getByText("UID / EMAIL")).toBeInTheDocument();
		expect(screen.getByText("PASSPHRASE")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /EXECUTE LOGIN/i }),
		).toBeInTheDocument();
		expect(screen.getByTestId("forgot-password-link")).toBeInTheDocument();
	});

	it("handles user input correctly", async () => {
		(authLoginApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
			error: null,
		});

		render(<LoginForm />);

		const emailInput = screen.getByPlaceholderText("user@system.dev");
		const passwordInput = screen.getByPlaceholderText("•");

		fireEvent.change(emailInput, {
			target: { value: "test@example.com" },
		});
		fireEvent.change(passwordInput, {
			target: { value: "Password123!" },
		});

		expect(emailInput).toHaveValue("test@example.com");
		expect(passwordInput).toHaveValue("Password123!");
	});

	it("submits form with correct data", async () => {
		const mutateMock = vi.fn();
		(authLoginApi as any).mockReturnValue({
			mutate: mutateMock,
			isLoading: false,
			error: null,
		});

		render(<LoginForm />);

		const emailInput = screen.getByPlaceholderText("user@system.dev");
		const passwordInput = screen.getByPlaceholderText("•");
		const submitButton = screen.getByRole("button", {
			name: /EXECUTE LOGIN/i,
		});

		fireEvent.change(emailInput, {
			target: { value: "test@example.com" },
		});
		fireEvent.change(passwordInput, {
			target: { value: "Password123!" },
		});
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(mutateMock).toHaveBeenCalledWith(
				expect.objectContaining({
					email: "test@example.com",
					password: "Password123!",
					remember_me: false,
				}),
				expect.any(Object),
			);
		});
	});

	it("displays error message when API fails", () => {
		(authLoginApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
			error: { message: "Invalid credentials" },
		});

		render(<LoginForm />);

		expect(screen.getByTestId("error-message")).toHaveTextContent(
			"Invalid credentials",
		);
	});

	it("shows loading state when submitting", () => {
		(authLoginApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: true,
			error: null,
		});

		render(<LoginForm />);

		expect(
			screen.getByText("PROCESSING..."),
		).toBeInTheDocument();
	});


});
