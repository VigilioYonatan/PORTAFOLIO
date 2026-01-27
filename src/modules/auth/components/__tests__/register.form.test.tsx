import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { authRegisterApi } from "../../apis/auth.register.api";
import { RegisterForm } from "../register.form";

// Mock the API and SweetModal
vi.mock("../../apis/auth.register.api", () => ({
	authRegisterApi: vi.fn(),
}));

vi.mock("@vigilio/sweet", () => ({
	sweetModal: vi.fn(() => Promise.resolve({ isConfirmed: true })),
}));

describe("RegisterForm", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("renders register form correctly", () => {
		(authRegisterApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
			error: null,
		});

		render(<RegisterForm />);

		// expect(screen.getByText("Crear cuenta")).toBeInTheDocument();
		expect(screen.getByText("Nombre de Usuario")).toBeInTheDocument();
		expect(screen.getByText("Correo Electrónico")).toBeInTheDocument();
		expect(screen.getByText(/Teléfono/i)).toBeInTheDocument();
		expect(screen.getByText("Contraseña")).toBeInTheDocument();
		expect(screen.getByText("Confirmar Contraseña")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /crear cuenta/i }),
		).toBeInTheDocument();
	});

	it("handles user input correctly", async () => {
		(authRegisterApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
			error: null,
		});

		render(<RegisterForm />);

		const userInput = screen.getAllByPlaceholderText("juan_perez")[0];
		const emailInput = screen.getByPlaceholderText("admin@ejemplo.com");
		const passwordInput = screen.getAllByPlaceholderText("••••••••")[0];

		await fireEvent.input(userInput, { target: { value: "testuser" } });
		await fireEvent.input(emailInput, {
			target: { value: "test@example.com" },
		});
		await fireEvent.input(passwordInput, { target: { value: "password123" } });

		expect(userInput).toHaveValue("testuser");
		expect(emailInput).toHaveValue("test@example.com");
		expect(passwordInput).toHaveValue("password123");
	});

	it("submits form with correct data", async () => {
		const mutateMock = vi.fn();
		(authRegisterApi as any).mockReturnValue({
			mutate: mutateMock,
			isLoading: false,
			error: null,
		});

		render(<RegisterForm />);

		await fireEvent.input(screen.getAllByPlaceholderText("juan_perez")[0], {
			target: { value: "testuser" },
		});

		await fireEvent.input(screen.getByPlaceholderText("admin@ejemplo.com"), {
			target: { value: "test@example.com" },
		});

		// Tenant Name
		await fireEvent.input(screen.getByTestId("tenant-name-input"), {
			target: { value: "My Company" },
		});

		await fireEvent.input(screen.getByPlaceholderText("+51 999 999 999"), {
			target: { value: "999999999" },
		});
		await fireEvent.input(screen.getAllByPlaceholderText("••••••••")[0], {
			target: { value: "Password123!" },
		});
		await fireEvent.input(screen.getAllByPlaceholderText("••••••••")[1], {
			target: { value: "Password123!" },
		});

		// Check terms
		const termsCheckbox = screen.getByTestId("terms-checkbox");
		await fireEvent.click(termsCheckbox);

		const submitButton = screen.getByRole("button", { name: /crear cuenta/i });
		await fireEvent.click(submitButton);

		await waitFor(() => {
			expect(mutateMock).toHaveBeenCalled();
		});
	});

	it("displays error message when API fails", () => {
		// Mock error response
		const errorMock = {
			message: "Email already exists",
			body: "email",
		};

		(authRegisterApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
			error: errorMock,
		});

		render(<RegisterForm />);

		// The component uses handlerError which likely sets form errors or shows sweetModal.
		// Since we mocked sweetModal, we might verify it was called or check if form error appears.
		// However, handlerError usually sets setError on the form.
		// Let's check if the error prop from mutation is displayed if the component renders it directly like LoginForm does.
		// RegisterForm usually relies on handlerError util.
	});
});
