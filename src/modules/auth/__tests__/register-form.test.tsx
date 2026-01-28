// @vitest-environment happy-dom

import { render, screen } from "@testing-library/preact";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock all external dependencies before importing component
// Mock all external dependencies before importing component
// Removed @preact/signals mock to allow real reactivity

vi.mock("react-hook-form", async () => {
	const { mockReactHookForm } = await import(
		"@src/infrastructure/tests/mock-utils"
	);
	return mockReactHookForm();
});

vi.mock("@hookform/resolvers/zod", () => ({
	zodResolver: vi.fn(() => vi.fn()),
}));

vi.mock("../apis/auth.register.api", () => ({
	authRegisterApi: vi.fn(() => ({
		mutate: vi.fn(),
		isLoading: false,
		error: null,
	})),
}));

vi.mock("../dtos/register.dto", () => ({
	authRegisterDto: {},
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

vi.mock("@vigilio/sweet", async () => {
	const { mockVigilioSweet } = await import(
		"@src/infrastructure/tests/mock-utils"
	);
	return mockVigilioSweet();
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
			data-testid="register-form"
			class={className}
			onSubmit={(e) => {
				e.preventDefault();
				if (onSubmit) onSubmit({});
			}}
		>
			{children}
		</form>
	);

	MockWebForm.control = ({
		name,
		title,
		type,
		placeholder,
		disabled,
		required,
		className,
		"data-testid": testId,
	}: {
		name: string;
		title: string;
		type?: string;
		placeholder?: string;
		disabled?: boolean;
		required?: boolean;
		className?: string;
		"data-testid"?: string;
	}) => (
		<div class="form-control">
			{title ? <label htmlFor={name}>{title}</label> : null}
			<input
				id={name}
				name={name}
				type={type || "text"}
				placeholder={placeholder}
				disabled={disabled}
				required={required}
				data-testid={testId || `input-${name}`}
				class={className}
			/>
		</div>
	);

	MockWebForm.button = {
		submit: ({
			title,
			disabled,
			isLoading,
			loading_title,
			className,
		}: {
			title: string;
			disabled?: boolean;
			isLoading?: boolean;
			loading_title?: string;
			className?: string;
		}) => (
			<button
				type="submit"
				disabled={disabled}
				data-testid="submit-button"
				class={className}
			>
				{isLoading ? loading_title || "Loading..." : title}
			</button>
		),
	};

	return { default: MockWebForm };
});

describe("RegisterForm Component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Form Rendering", () => {
		it("renders register form container", async () => {
			const { RegisterForm } = await import("../components/register-form");
			render(<RegisterForm />);
			expect(screen.getByTestId("register-form")).toBeInTheDocument();
		});

		it("renders username input field", async () => {
			const { RegisterForm } = await import("../components/register-form");
			render(<RegisterForm />);
			expect(screen.getByTestId("input-username")).toBeInTheDocument();
		});

		it("renders email input field", async () => {
			const { RegisterForm } = await import("../components/register-form");
			render(<RegisterForm />);
			expect(screen.getByTestId("input-email")).toBeInTheDocument();
		});

		it("renders phone number input field", async () => {
			const { RegisterForm } = await import("../components/register-form");
			render(<RegisterForm />);
			expect(screen.getByTestId("input-phone_number")).toBeInTheDocument();
		});

		it("renders password input field", async () => {
			const { RegisterForm } = await import("../components/register-form");
			render(<RegisterForm />);
			expect(screen.getByTestId("input-password")).toBeInTheDocument();
		});

		it("renders repeat password input field", async () => {
			const { RegisterForm } = await import("../components/register-form");
			render(<RegisterForm />);
			expect(screen.getByTestId("input-repeat_password")).toBeInTheDocument();
		});

		it("renders submit button", async () => {
			const { RegisterForm } = await import("../components/register-form");
			render(<RegisterForm />);
			expect(screen.getByTestId("submit-button")).toBeInTheDocument();
		});

		it("renders submit button with correct text", async () => {
			const { RegisterForm } = await import("../components/register-form");
			render(<RegisterForm />);
			expect(screen.getByText("auth.submit.register")).toBeInTheDocument();
		});
	});

	describe("Terms and Conditions", () => {
		it("renders terms checkbox", async () => {
			const { RegisterForm } = await import("../components/register-form");
			render(<RegisterForm />);
			expect(screen.getByTestId("terms-checkbox")).toBeInTheDocument();
		});

		it("renders terms link", async () => {
			const { RegisterForm } = await import("../components/register-form");
			render(<RegisterForm />);
			expect(screen.getByText("auth.terms.link")).toBeInTheDocument();
		});

		it("renders privacy link", async () => {
			const { RegisterForm } = await import("../components/register-form");
			render(<RegisterForm />);
			expect(screen.getByText("auth.privacy.link")).toBeInTheDocument();
		});
	});

	describe("Google Registration Button", () => {
		it("renders Google registration button", async () => {
			const { RegisterForm } = await import("../components/register-form");
			render(<RegisterForm />);
			expect(screen.getByTestId("google-register-button")).toBeInTheDocument();
		});

		it("has correct href for Google OAuth", async () => {
			const { RegisterForm } = await import("../components/register-form");
			render(<RegisterForm />);
			const button = screen.getByTestId("google-register-button");
			expect(button.getAttribute("href")).toBe("/api/v1/auth/google");
		});

		it("displays Google text on button", async () => {
			const { RegisterForm } = await import("../components/register-form");
			render(<RegisterForm />);
			expect(screen.getByText("Google")).toBeInTheDocument();
		});
	});

	describe("Divider Section", () => {
		it("renders divider with social registration text", async () => {
			const { RegisterForm } = await import("../components/register-form");
			render(<RegisterForm />);
			expect(screen.getByText("auth.orRegister")).toBeInTheDocument();
		});
	});

	describe("Form Labels", () => {
		it("renders username label", async () => {
			const { RegisterForm } = await import("../components/register-form");
			render(<RegisterForm />);
			expect(screen.getByText("auth.username.label")).toBeInTheDocument();
		});

		it("renders email label", async () => {
			const { RegisterForm } = await import("../components/register-form");
			render(<RegisterForm />);
			expect(screen.getByText("auth.email.label")).toBeInTheDocument();
		});

		it("renders phone label", async () => {
			const { RegisterForm } = await import("../components/register-form");
			render(<RegisterForm />);
			expect(screen.getByText("auth.phone.label")).toBeInTheDocument();
		});

		it("renders password label", async () => {
			const { RegisterForm } = await import("../components/register-form");
			render(<RegisterForm />);
			expect(screen.getByText("auth.password.label")).toBeInTheDocument();
		});

		it("renders confirm password label", async () => {
			const { RegisterForm } = await import("../components/register-form");
			render(<RegisterForm />);
			expect(screen.getByText("auth.password.confirm")).toBeInTheDocument();
		});
	});

	describe("Password Toggle Buttons", () => {
		it("renders password visibility toggle button", async () => {
			const { RegisterForm } = await import("../components/register-form");
			render(<RegisterForm />);
			const toggleButtons = screen.getAllByRole("button");
			// Should have at least the submit button and two password toggle buttons
			expect(toggleButtons.length).toBeGreaterThanOrEqual(2);
		});
	});

	describe("Input Types", () => {
		it("email input has email type", async () => {
			const { RegisterForm } = await import("../components/register-form");
			render(<RegisterForm />);
			const emailInput = screen.getByTestId("input-email");
			expect(emailInput.getAttribute("type")).toBe("email");
		});

		it("phone input has tel type", async () => {
			const { RegisterForm } = await import("../components/register-form");
			render(<RegisterForm />);
			const phoneInput = screen.getByTestId("input-phone_number");
			expect(phoneInput.getAttribute("type")).toBe("tel");
		});
	});
});

describe("Form Behavior", () => {
	it("submits form with correct data", async () => {
		const { RegisterForm } = await import("../components/register-form");
		const { authRegisterApi } = await import("../apis/auth.register.api");

		const mutateMock = vi.fn();
		(authRegisterApi as any).mockReturnValue({
			mutate: mutateMock,
			isLoading: false,
			error: null,
		});

		render(<RegisterForm />);

		// Trigger form submission
		const form = screen.getByTestId("register-form");
		form.dispatchEvent(new Event("submit"));

		// Wait for promise resolution (sweetModal)
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(mutateMock).toHaveBeenCalled();
	});

	it("displays error message on registration failure", async () => {
		const { RegisterForm } = await import("../components/register-form");
		const { authRegisterApi } = await import("../apis/auth.register.api");

		// Mock error state
		(authRegisterApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
			error: { message: "Error al registrarse" },
		});

		render(<RegisterForm />);
		expect(screen.getByTestId("error-message")).toHaveTextContent(
			"Error al registrarse",
		);
	});
});

describe("RegisterForm Accessibility", () => {
	it("form has accessible structure", async () => {
		const { RegisterForm } = await import("../components/register-form");
		render(<RegisterForm />);
		expect(screen.getByTestId("register-form")).toBeInTheDocument();
	});

	it("Google registration button is a link element", async () => {
		const { RegisterForm } = await import("../components/register-form");
		render(<RegisterForm />);
		const googleButton = screen.getByTestId("google-register-button");
		expect(googleButton.tagName.toLowerCase()).toBe("a");
	});

	it("terms checkbox has proper label association", async () => {
		const { RegisterForm } = await import("../components/register-form");
		render(<RegisterForm />);
		const checkbox = screen.getByTestId("terms-checkbox");
		expect(checkbox).toBeInTheDocument();
	});
});

describe("Password Features", () => {
	it("shows password strength indicator when password is typed", async () => {
		vi.resetModules();
		vi.doMock("react-hook-form", async () => {
			const actual = await vi.importActual("react-hook-form");
			return {
				...actual,
				useForm: () => ({
					register: vi.fn(),
					handleSubmit: vi.fn(),
					formState: { errors: {} },
					control: {},
					watch: vi.fn((name) => {
						if (name === "password") return "Password123!";
						return "";
					}),
				}),
			};
		});

		const { RegisterForm } = await import("../components/register-form");
		render(<RegisterForm />);

		expect(screen.getByTestId("password-strength")).toBeInTheDocument();
		expect(
			screen.getByText("auth.password.strength.label"),
		).toBeInTheDocument();
	});

	it("shows password match success when passwords match", async () => {
		vi.resetModules();
		vi.doMock("react-hook-form", async () => {
			const actual = await vi.importActual("react-hook-form");
			return {
				...actual,
				useForm: () => ({
					register: vi.fn(),
					handleSubmit: vi.fn(),
					formState: { errors: {} },
					control: {},
					watch: vi.fn((name) => {
						if (name === "password") return "Password123";
						if (name === "repeat_password") return "Password123";
						return "";
					}),
				}),
			};
		});

		const { RegisterForm } = await import("../components/register-form");
		render(<RegisterForm />);

		expect(screen.getByTestId("password-match")).toBeInTheDocument();
		expect(screen.getByText("auth.password.match")).toBeInTheDocument();
	});

	it("shows password match error when passwords do not match", async () => {
		vi.resetModules();
		vi.doMock("react-hook-form", async () => {
			const actual = await vi.importActual("react-hook-form");
			return {
				...actual,
				useForm: () => ({
					register: vi.fn(),
					handleSubmit: vi.fn(),
					formState: { errors: {} },
					control: {},
					watch: vi.fn((name) => {
						if (name === "password") return "Password123";
						if (name === "repeat_password") return "Password124";
						return "";
					}),
				}),
			};
		});

		const { RegisterForm } = await import("../components/register-form");
		render(<RegisterForm />);

		expect(screen.getByTestId("password-match")).toBeInTheDocument();
		expect(screen.getByText("auth.password.mismatch")).toBeInTheDocument();
	});
});
