// @vitest-environment happy-dom

import { authMfaDisableApi } from "@modules/auth/apis/auth.mfa-disable.api";
import { useAuthStore } from "@src/stores/auth.store";
import { fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { sweetModal } from "@vigilio/sweet";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { userPasswordChangeApi } from "../../apis/user.password-change.api";
import { userProfileUpdateApi } from "../../apis/user.profile-update.api";
import ProfileIndex from "../profile.index";

// Mock dependencies
vi.mock("@src/stores/auth.store");
vi.mock("../../apis/user.profile-update.api");
vi.mock("../../apis/user.password-change.api");
vi.mock("../../apis/user.avatar-update.api", () => ({
	userAvatarUpdateApi: () => ({ mutate: vi.fn(), isLoading: false }),
}));
vi.mock("@modules/auth/apis/auth.mfa-disable.api");
vi.mock("@vigilio/sweet", async () => {
	const { mockVigilioSweet } = await import(
		"@src/infrastructure/tests/mock-utils"
	);
	return mockVigilioSweet();
});

// Mock components that use complex hooks or global state not easily mocked
vi.mock("@components/form", () => {
	// ... MockForm implementation (kept as is, unless it's repeated elsewhere)
	const MockForm = ({ children, onSubmit }: any) => (
		<form
			data-testid="mock-form"
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit({});
			}}
		>
			{children}
		</form>
	);
	MockForm.control = ({ name, title, placeholder, defaultValue }: any) => (
		<div>
			<label htmlFor={name}>{title}</label>
			<input
				name={name}
				placeholder={placeholder}
				defaultValue={defaultValue}
				data-testid={`input-${name}`}
			/>
		</div>
	);
	(MockForm.control as any).file = ({ name, title }: any) => (
		<div>
			<label htmlFor={name}>{title}</label>
			<input type="file" data-testid={`input-${name}`} />
		</div>
	);
	MockForm.button = {
		submit: ({ title, isLoading }: any) => (
			<button type="submit" disabled={isLoading}>
				{isLoading ? "Cargando..." : title}
			</button>
		),
	};
	return { default: MockForm };
});

vi.mock("@modules/auth/components/mfa-setup", () => ({
	default: () => <div data-testid="mfa-setup">MFA Setup Component</div>,
}));

vi.mock("react-hook-form", async () => {
	const { mockReactHookForm } = await import(
		"@src/infrastructure/tests/mock-utils"
	);
	return mockReactHookForm();
});

vi.mock("@hookform/resolvers/zod", () => ({
	zodResolver: () => vi.fn(),
}));

describe("ProfileIndex Component", () => {
	const mockUser = {
		id: 1,
		username: "johndoe",
		email: "john@example.com",
		is_mfa_enabled: false,
		avatar: [],
		status: "ACTIVE",
		created_at: "2023-01-01T00:00:00Z",
		is_superuser: false,
	};

	const mockAuthStore = {
		state: { value: mockUser },
		methods: { onUserUpdate: vi.fn() },
	};

	beforeEach(() => {
		vi.clearAllMocks();
		(useAuthStore as any).mockReturnValue(mockAuthStore);
		(userProfileUpdateApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
		});
		(userPasswordChangeApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
		});
		(authMfaDisableApi as any).mockReturnValue({
			mutate: vi.fn(),
			isLoading: false,
		});
	});

	it("renders user information correctly", () => {
		render(<ProfileIndex />);

		expect(screen.getByText("Mi Perfil")).toBeInTheDocument();
		expect(screen.getByText("johndoe")).toBeInTheDocument();
		expect(screen.getAllByText("john@example.com")[0]).toBeInTheDocument();
		expect(screen.getByText("ID: #1")).toBeInTheDocument();
	});

	it("shows 'Configurar 2FA →' when MFA is disabled", () => {
		render(<ProfileIndex />);
		expect(screen.getByText("Configurar 2FA →")).toBeInTheDocument();
	});

	it("shows 'Desactivar 2FA' when MFA is enabled", () => {
		const mfaUser = { ...mockUser, is_mfa_enabled: true };
		(useAuthStore as any).mockReturnValue({
			...mockAuthStore,
			state: { value: mfaUser },
		});

		render(<ProfileIndex />);
		expect(screen.getByText(/Desactivar 2FA/)).toBeInTheDocument();
	});

	it("triggers profile update on form submission", async () => {
		const mutate = vi.fn();
		(userProfileUpdateApi as any).mockReturnValue({ mutate, isLoading: false });

		render(<ProfileIndex />);

		const submitButtons = screen.getAllByText("Guardar Cambios");
		fireEvent.click(submitButtons[0]);

		await waitFor(() => {
			expect(mutate).toHaveBeenCalled();
		});
	});

	it("calls disable MFA mutation after confirmation", async () => {
		const mfaUser = { ...mockUser, is_mfa_enabled: true };
		(useAuthStore as any).mockReturnValue({
			...mockAuthStore,
			state: { value: mfaUser },
		});

		const disableMutate = vi.fn();
		(authMfaDisableApi as any).mockReturnValue({
			mutate: disableMutate,
			isLoading: false,
		});

		render(<ProfileIndex />);

		const disableButton = screen.getByText(/Desactivar 2FA/);
		fireEvent.click(disableButton);

		expect(sweetModal).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "¿Desactivar MFA?",
			}),
		);

		await waitFor(() => {
			expect(disableMutate).toHaveBeenCalled();
		});
	});
});
