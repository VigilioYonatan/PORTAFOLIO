// @vitest-environment happy-dom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/preact";

import { afterEach, describe, expect, it, vi } from "vitest";
import { authMfaSetupApi } from "../../apis/auth.mfa-setup.api";
import { authMfaVerifyApi } from "../../apis/auth.mfa-verify.api";
import MfaSetup from "../mfa-setup";

// Mock the APIs
vi.mock("../../apis/auth.mfa-setup.api", () => ({
	authMfaSetupApi: vi.fn(),
}));
vi.mock("../../apis/auth.mfa-verify.api", () => ({
	authMfaVerifyApi: vi.fn(),
}));

vi.mock("@vigilio/sweet", () => ({
	sweetModal: vi.fn(() => Promise.resolve({ isConfirmed: true })),
}));

describe("MfaSetup", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("renders loading state initially", () => {
		(authMfaSetupApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: true,
			data: null,
		});
		(authMfaVerifyApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
		});

		render(<MfaSetup />);

		expect(
			screen.getByText("Generating secure credentials..."),
		).toBeInTheDocument();
	});

	it("renders QR code and secret when loaded", async () => {
		(authMfaSetupApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
			data: {
				qr_code: "data:image/png;base64,fake-qr",
				secret: "ABCDEF123456",
				uri: "otpauth://totp/...",
			},
		});
		(authMfaVerifyApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
		});

		render(<MfaSetup />);

		expect(screen.getByText("Enable 2FA")).toBeInTheDocument();
		expect(screen.getByAltText("MFA QR Code")).toBeInTheDocument();
		expect(screen.getByText("ABCDEF123456")).toBeInTheDocument();
	});

	it("allows copying secret", async () => {
		(authMfaSetupApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
			data: {
				qr_code: "data:image/png;base64,fake-qr",
				secret: "ABCDEF123456",
			},
		});
		(authMfaVerifyApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
		});

		// Mock clipboard
		Object.defineProperty(navigator, "clipboard", {
			value: {
				writeText: vi.fn(),
			},
			writable: true,
		});

		render(<MfaSetup />);

		const copyButton = screen.getByTitle("Copy secret");
		await fireEvent.click(copyButton);

		expect(navigator.clipboard.writeText).toHaveBeenCalledWith("ABCDEF123456");
	});

	it("submits verification code", async () => {
		const verifyMutateMock = vi.fn();
		(authMfaSetupApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
			data: { secret: "ABC" },
		});
		(authMfaVerifyApi as any).mockReturnValue({
			mutate: verifyMutateMock,
			isLoading: false,
		});

		render(<MfaSetup />);

		const tokenInput = screen.getByPlaceholderText("000 000");
		await fireEvent.input(tokenInput, { target: { value: "123456" } });

		const submitButton = screen.getByRole("button", {
			name: /verify and activate/i,
		});
		await fireEvent.click(submitButton);

		await waitFor(() => {
			expect(verifyMutateMock).toHaveBeenCalledWith(
				{ token: "123456" },
				expect.any(Object),
			);
		});
	});
});
