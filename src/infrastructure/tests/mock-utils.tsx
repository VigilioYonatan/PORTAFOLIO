import { vi } from "vitest";

export function mockReactHookForm() {
	return {
		useForm: vi.fn(() => ({
			register: vi.fn(() => ({})),
			handleSubmit: vi.fn((fn: any) => (e: any) => {
				e?.preventDefault?.();
				fn({});
			}),
			formState: { errors: {} },
			reset: vi.fn(),
			setError: vi.fn(),
			control: {},
			watch: vi.fn(),
		})),
		useWatch: vi.fn(() => ""),
		Controller: ({ render }: any) => render({ field: {} }),
	};
}

export function mockLucidePreact() {
	return {
		Check: () => <span data-testid="check-icon">Check</span>,
		X: () => <span data-testid="x-icon">X</span>,
		Eye: () => <span data-testid="eye-icon">Eye</span>,
		EyeOff: () => <span data-testid="eyeoff-icon">EyeOff</span>,
		User: () => <span data-testid="user-icon">User</span>,
		Mail: () => <span data-testid="mail-icon">Mail</span>,
		Phone: () => <span data-testid="phone-icon">Phone</span>,
		Lock: () => <span data-testid="lock-icon">Lock</span>,
		ShieldCheck: () => <span data-testid="shield-icon">Shield</span>,
		ArrowRight: () => <span data-testid="arrow-right-icon">ArrowRight</span>,
		AlertTriangle: () => <span data-testid="alert-icon">Alert</span>,
		Shield: () => <span data-testid="shield-icon">Shield</span>,
		Timer: () => <span data-testid="timer-icon">Timer</span>,
		Download: () => <span data-testid="download-icon">Download</span>,
		Plus: () => <span data-testid="plus-icon">Plus</span>,
		Search: () => <span data-testid="search-icon">Search</span>,
		ChevronDown: () => <span data-testid="chevron-down-icon">ChevronDown</span>,
		MoreVertical: () => (
			<span data-testid="more-vertical-icon">MoreVertical</span>
		),
		Trash: () => <span data-testid="trash-icon">Trash</span>,
		Edit: () => <span data-testid="edit-icon">Edit</span>,
		QrCode: () => <span data-testid="qrcode-icon">QrCode</span>,
		Users: () => <span data-testid="users-icon">Users</span>,
		UserX: () => <span data-testid="userx-icon">UserX</span>,
		Zap: () => <span data-testid="zap-icon">Zap</span>,
		Gift: () => <span data-testid="gift-icon">Gift</span>,
		Upload: () => <span data-testid="upload-icon">Upload</span>,
		FileText: () => <span data-testid="file-text-icon">FileText</span>,
		Loader2: () => <span data-testid="loader2-icon">Loader2</span>,
		CheckCircle: () => <span data-testid="check-circle-icon">CheckCircle</span>,
		CheckCircle2: () => (
			<span data-testid="check-circle2-icon">CheckCircle2</span>
		),
		AlertCircle: () => <span data-testid="alert-circle-icon">AlertCircle</span>,
		Building: () => <span data-testid="building-icon">Building</span>,
		Terminal: () => <span data-testid="terminal-icon">Terminal</span>,
		ArrowLeft: () => <span data-testid="arrow-left-icon">ArrowLeft</span>,
	};
}

export function mockVigilioSweet() {
	return {
		sweetModal: vi.fn(() => Promise.resolve({ isConfirmed: true })),
	};
}

export function mockI18n(translations: Record<string, string> = {}) {
	return {
		useTranslations: vi.fn(() => (key: string) => translations[key] || key),
		getTranslatedPath: vi.fn((path: string) => path),
	};
}

export function mockWouter() {
	return {
		Link: ({ children, href }: any) => <a href={href}>{children}</a>,
		useLocation: vi.fn(() => ["/", vi.fn()]),
		useRoute: vi.fn(() => [false, null]),
	};
}
