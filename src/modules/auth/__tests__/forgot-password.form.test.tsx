// @vitest-environment happy-dom

import { render, screen } from "@testing-library/preact";
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

vi.mock("../apis/auth.forgot-password.api", () => ({
	authForgotPasswordApi: vi.fn(() => ({
		mutate: vi.fn(),
		isLoading: false,
		error: null,
		isSuccess: false,
	})),
}));

vi.mock("../dtos/forgot-password.dto", () => ({
	authForgotPasswordDto: {},
}));

vi.mock("lucide-preact", () => ({
	ArrowLeft: (props: any) => (
		<span data-testid="arrow-left-icon" {...props}>
			ArrowLeft
		</span>
	),
	ArrowRight: (props: any) => (
		<span data-testid="arrow-right-icon" {...props}>
			ArrowRight
		</span>
	),
	CheckCircle2: (props: any) => (
		<span data-testid="check-circle-icon" {...props}>
			CheckCircle2
		</span>
	),
	Mail: (props: any) => (
		<span data-testid="mail-icon" {...props}>
			Mail
		</span>
	),
	Shield: (props: any) => (
		<span data-testid="shield-icon" {...props}>
			Shield
		</span>
	),
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

describe("ForgotPasswordForm Component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Form Rendering", () => {
		it("renders form container", async () => {
			const { ForgotPasswordForm } = await import(
				"../components/forgot-password.form"
			);
			render(<ForgotPasswordForm />);
			expect(screen.getByTestId("web-form")).toBeInTheDocument();
		});

		it("renders email input", async () => {
			const { ForgotPasswordForm } = await import(
				"../components/forgot-password.form"
			);
			render(<ForgotPasswordForm />);
			expect(screen.getByTestId("email-input")).toBeInTheDocument();
		});

		it("renders submit button", async () => {
			const { ForgotPasswordForm } = await import(
				"../components/forgot-password.form"
			);
			render(<ForgotPasswordForm />);
			expect(screen.getByTestId("submit-button")).toBeInTheDocument();
		});

		it("renders back to login link", async () => {
			const { ForgotPasswordForm } = await import(
				"../components/forgot-password.form"
			);
			render(<ForgotPasswordForm />);
			expect(screen.getByTestId("back-to-login")).toBeInTheDocument();
		});
	});

	describe("Form Behavior", () => {
		it("submits form with correct data", async () => {
			const { ForgotPasswordForm } = await import(
				"../components/forgot-password.form"
			);
			const { authForgotPasswordApi } = await import(
				"../apis/auth.forgot-password.api"
			);

			const mutateMock = vi.fn();
			(authForgotPasswordApi as any).mockReturnValue({
				mutate: mutateMock,
				isLoading: false,
				error: null,
				isSuccess: false,
			});

			render(<ForgotPasswordForm />);

			const form = screen.getByTestId("web-form");
			form.dispatchEvent(new Event("submit"));

			expect(mutateMock).toHaveBeenCalled();
		});

		it("displays error message on failure", async () => {
			const { ForgotPasswordForm } = await import(
				"../components/forgot-password.form"
			);
			const { authForgotPasswordApi } = await import(
				"../apis/auth.forgot-password.api"
			);

			(authForgotPasswordApi as any).mockReturnValue({
				mutate: vi.fn(),
				isLoading: false,
				error: { message: "Invalid email" },
				isSuccess: false,
			});

			render(<ForgotPasswordForm />);
			expect(screen.getByTestId("error-message")).toHaveTextContent(
				"Invalid email",
			);
		});

		it("shows success state on success", async () => {
			const { ForgotPasswordForm } = await import(
				"../components/forgot-password.form"
			);
			const { authForgotPasswordApi } = await import(
				"../apis/auth.forgot-password.api"
			);

			(authForgotPasswordApi as any).mockReturnValue({
				mutate: vi.fn(),
				isLoading: false,
				error: null,
				isSuccess: true,
			});

			render(<ForgotPasswordForm />);
			expect(screen.getByTestId("success-state")).toBeInTheDocument();
			expect(screen.queryByTestId("web-form")).not.toBeInTheDocument();
		});
	});
});
