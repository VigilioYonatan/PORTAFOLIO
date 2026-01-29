// @vitest-environment happy-dom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { authMfaLoginApi } from "../../apis/auth.mfa-login.api";
import MfaVerify from "../mfa-verify";

// Mock the API
vi.mock("../../apis/auth.mfa-login.api", () => ({
	authMfaLoginApi: vi.fn(),
}));

// Mock i18n
vi.mock("@src/i18n", () => ({
	useTranslations: () => (key: string) => {
		const translations: Record<string, string> = {
			"auth.mfa.verify.title": "Verificación 2FA",
			"auth.mfa.verify.code": "Código",
			"auth.mfa.verify.verifying": "Verificando...",
			"auth.mfa.verify.submit": "Verificar y Continuar",
			"auth.mfa.verify.back": "Volver a Login",
			"auth.mfa.verify.subtitle": "Ingresa el código de 6 dígitos",
		};
		return translations[key] || key;
	},
}));

describe("MfaVerify", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("renders verify form correctly", () => {
		(authMfaLoginApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
		});

		render(<MfaVerify temp_token="temp-123" />);

		expect(screen.getByText("Verificación 2FA")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("000000")).toBeInTheDocument();
	});

	it("submits verification code with temp token", async () => {
		const mutateMock = vi.fn();
		(authMfaLoginApi as any).mockReturnValue({
			mutate: mutateMock,
			isLoading: false,
		});

		render(<MfaVerify temp_token="temp-123" />);

		const tokenInput = screen.getByPlaceholderText("000000");
		fireEvent.input(tokenInput, { target: { value: "654321" } });

		const submitButton = screen.getByRole("button", {
			name: /Verificar y Continuar/i,
		});
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(mutateMock).toHaveBeenCalledWith(
				{ mfa_code: "654321", temp_token: "temp-123" },
				expect.any(Object),
			);
		});
	});

	it("shows loading state when submitting", () => {
		(authMfaLoginApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: true,
			error: null,
		});

		render(<MfaVerify temp_token="temp-123" />);

		expect(
			screen.getByRole("button", { name: /Verificando.../i }),
		).toBeInTheDocument();
	});
});
