// @vitest-environment happy-dom

import { render, screen, within } from "@testing-library/preact";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock external dependencies
vi.mock("react-hook-form", async () => {
	const { mockReactHookForm } = await import(
		"@src/infrastructure/tests/mock-utils"
	);
	return mockReactHookForm();
});

vi.mock("@hookform/resolvers/zod", () => ({
	zodResolver: vi.fn(() => vi.fn()),
}));

vi.mock("../apis/auth.login.api", () => ({
	authLoginApi: vi.fn(() => ({
		mutate: vi.fn(),
		isLoading: false,
		error: null,
	})),
}));

vi.mock("../apis/auth.mfa-login.api", () => ({
	authMfaLoginApi: vi.fn(() => ({
		mutate: vi.fn(),
		isLoading: false,
		error: null,
	})),
}));

vi.mock("../dtos/login.dto", () => ({
	authLoginDto: {},
}));

vi.mock("../dtos/mfa-login.dto", () => ({
	authMfaLoginDto: {},
}));

vi.mock("lucide-preact", async () => {
	const { mockLucidePreact } = await import(
		"@src/infrastructure/tests/mock-utils"
	);
	return mockLucidePreact();
});

vi.mock("@infrastructure/utils/client/helpers", () => ({
	sizeIcon: {
		small: { width: 16, height: 16 },
		medium: { width: 20, height: 20 },
	},
}));

vi.mock("@src/i18n", async () => {
	const { mockI18n } = await import("@src/infrastructure/tests/mock-utils");
	return mockI18n();
});

// Mock WebForm
vi.mock("@components/web_form", () => {
	const MockWebForm = ({
		children,
		onSubmit,
		className,
	}: {
		children: preact.ComponentChildren;
		onSubmit?: (data: unknown) => void;
		className?: string;
	}) => (
		<form
			data-testid="web-form"
			class={className}
			onSubmit={(e) => {
				e.preventDefault();
				if (onSubmit) onSubmit({});
			}}
		>
			{children}
		</form>
	);

	return { default: MockWebForm };
});

describe("LoginForm Component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Form Rendering", () => {
		it("renders login form container", async () => {
			const { LoginForm } = await import("../components/login.form");
			render(<LoginForm />);
			expect(screen.getByTestId("web-form")).toBeInTheDocument();
		});

		it("renders email input field", async () => {
			const { LoginForm } = await import("../components/login.form");
			render(<LoginForm />);
			expect(screen.getByTestId("email-input")).toBeInTheDocument();
		});

		it("renders password input field", async () => {
			const { LoginForm } = await import("../components/login.form");
			render(<LoginForm />);
			expect(screen.getByTestId("password-input")).toBeInTheDocument();
		});

		it("renders submit button", async () => {
			const { LoginForm } = await import("../components/login.form");
			render(<LoginForm />);
			expect(screen.getByTestId("submit-button")).toBeInTheDocument();
		});

		it("renders submit button with correct text", async () => {
			const { LoginForm } = await import("../components/login.form");
			render(<LoginForm />);
			expect(screen.getByText("ACCESS SYSTEM")).toBeInTheDocument();
		});
	});

	describe("Forgot Password Link", () => {
		it("renders forgot password link", async () => {
			const { LoginForm } = await import("../components/login.form");
			render(<LoginForm />);
			expect(screen.getByTestId("forgot-password-link")).toBeInTheDocument();
		});

		it("has correct href for forgot password", async () => {
			const { LoginForm } = await import("../components/login.form");
			render(<LoginForm />);
			const link = screen.getByTestId("forgot-password-link");
			expect(link.getAttribute("href")).toBe("/auth/forgot-password");
		});

		it("displays correct text for forgot password link", async () => {
			const { LoginForm } = await import("../components/login.form");
			render(<LoginForm />);
			expect(screen.getByText("Forgot password?")).toBeInTheDocument();
		});
	});

	describe("Google Login Button", () => {
		it("renders Google login button", async () => {
			const { LoginForm } = await import("../components/login.form");
			render(<LoginForm />);
			expect(screen.getByTestId("google-login-button")).toBeInTheDocument();
		});

		it("has correct href for Google OAuth", async () => {
			const { LoginForm } = await import("../components/login.form");
			render(<LoginForm />);
			const button = screen.getByTestId("google-login-button");
			expect(button.getAttribute("href")).toBe("/api/v1/auth/google");
		});

		it("displays Google text on button", async () => {
			const { LoginForm } = await import("../components/login.form");
			render(<LoginForm />);
			expect(screen.getByText("GOOGLE_NET")).toBeInTheDocument();
		});
	});

	describe("Divider Section", () => {
		it("renders divider with social login text", async () => {
			const { LoginForm } = await import("../components/login.form");
			render(<LoginForm />);
			expect(screen.getByText("Or continue with")).toBeInTheDocument();
		});
	});

	describe("Form Labels", () => {
		it("renders email label", async () => {
			const { LoginForm } = await import("../components/login.form");
			render(<LoginForm />);
			expect(screen.getByText("Email")).toBeInTheDocument();
		});

		it("renders password label", async () => {
			const { LoginForm } = await import("../components/login.form");
			render(<LoginForm />);
			expect(screen.getByText("Password")).toBeInTheDocument();
		});
	});

	describe("Input Placeholders", () => {
		it("email input has correct placeholder", async () => {
			const { LoginForm } = await import("../components/login.form");
			render(<LoginForm />);
			const emailInput = screen.getByTestId("email-input");
			expect(emailInput.getAttribute("placeholder")).toBe("CYBER.PUNK@NET.COM");
		});

		it("password input has correct placeholder", async () => {
			const { LoginForm } = await import("../components/login.form");
			render(<LoginForm />);
			const passwordInput = screen.getByTestId("password-input");
			expect(passwordInput.getAttribute("placeholder")).toBe("••••••••");
		});
	});

	describe("Input Types", () => {
		it("email input has email type", async () => {
			const { LoginForm } = await import("../components/login.form");
			render(<LoginForm />);
			const emailInput = screen.getByTestId("email-input");
			expect(emailInput.getAttribute("type")).toBe("email");
		});

		it("password input has password type", async () => {
			const { LoginForm } = await import("../components/login.form");
			render(<LoginForm />);
			const passwordInput = screen.getByTestId("password-input");
			expect(passwordInput.getAttribute("type")).toBe("password");
		});
	});
});

describe("Form Behavior", () => {
	it("submits form with correct data", async () => {
		const { LoginForm } = await import("../components/login.form");
		const { authLoginApi } = await import("../apis/auth.login.api");

		const mutateMock = vi.fn();
		(authLoginApi as any).mockReturnValue({
			mutate: mutateMock,
			isLoading: false,
			error: null,
		});

		render(<LoginForm />);

		const form = screen.getByTestId("web-form");
		form.dispatchEvent(new Event("submit"));

		expect(mutateMock).toHaveBeenCalled();
	});

	it("displays error message on login failure", async () => {
		const { LoginForm } = await import("../components/login.form");
		const { authLoginApi } = await import("../apis/auth.login.api");

		// Mock error state
		(authLoginApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
			error: { message: "Credenciales inválidas" },
		});

		render(<LoginForm />);
		expect(screen.getByTestId("error-message")).toHaveTextContent(
			"Credenciales inválidas",
		);
	});

	it("displays failed attempts warning when remaining attempts provided", async () => {
		const { LoginForm } = await import("../components/login.form");
		const { authLoginApi } = await import("../apis/auth.login.api");

		// Mock validation error with remaining attempts
		const mutateMock = vi.fn((_, { onError }) => {
			onError({ remaining_attempts: 2, message: "Error" });
		});

		(authLoginApi as any).mockReturnValue({
			mutate: mutateMock,
			isLoading: false,
			error: { message: "Error" },
		});

		render(<LoginForm />);

		// Trigger submit to get error response
		const form = screen.getByTestId("web-form");
		form.dispatchEvent(new Event("submit"));

		// Check for warning
		expect(
			await screen.findByTestId("failed-attempts-warning"),
		).toHaveTextContent(/auth.attempts.remaining/);
	});

	it("displays lockout alert when account is locked", async () => {
		const { LoginForm } = await import("../components/login.form");
		const { authLoginApi } = await import("../apis/auth.login.api");

		// Mock lockout error
		const futureDate = new Date();
		futureDate.setMinutes(futureDate.getMinutes() + 30);
		const lockoutEndAt = futureDate.toISOString();

		const mutateMock = vi.fn((_, { onError }) => {
			onError({
				is_locked: true,
				lockout_end_at: lockoutEndAt,
				message: "Bloqueado",
			});
		});

		(authLoginApi as any).mockReturnValue({
			mutate: mutateMock,
			isLoading: false,
			error: { message: "Bloqueado" },
		});

		render(<LoginForm />);

		// Trigger submit to get error response
		const form = screen.getByTestId("web-form");
		form.dispatchEvent(new Event("submit"));

		// Check for lockout alert
		expect(await screen.findByTestId("lockout-alert")).toBeInTheDocument();
		const alertContainer = screen.getByTestId("lockout-alert");
		expect(
			within(alertContainer).getByText("auth.lockout.locked"),
		).toBeInTheDocument();
	});
});

describe("LoginForm Accessibility", () => {
	it("form has accessible structure", async () => {
		const { LoginForm } = await import("../components/login.form");
		render(<LoginForm />);
		expect(screen.getByTestId("web-form")).toBeInTheDocument();
	});

	it("Google login button is a link element", async () => {
		const { LoginForm } = await import("../components/login.form");
		render(<LoginForm />);
		const googleButton = screen.getByTestId("google-login-button");
		expect(googleButton.tagName.toLowerCase()).toBe("a");
	});

	it("forgot password is a link element", async () => {
		const { LoginForm } = await import("../components/login.form");
		render(<LoginForm />);
		const link = screen.getByTestId("forgot-password-link");
		expect(link.tagName.toLowerCase()).toBe("a");
	});
});
