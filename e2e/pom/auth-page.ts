import { type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base-page";

export class AuthPage extends BasePage {
	// Login Selectors
	readonly loginEmailInput: Locator;
	readonly loginPasswordInput: Locator;
	readonly loginSubmitButton: Locator;
	readonly googleLoginButton: Locator;
	readonly forgotPasswordLink: Locator;
	readonly loginErrorAlert: Locator;
	readonly lockoutAlert: Locator;

	// Register Selectors
	readonly registerTenantNameInput: Locator;
	readonly registerUsernameInput: Locator;
	readonly registerEmailInput: Locator;
	readonly registerPhoneInput: Locator;
	readonly registerPasswordInput: Locator;
	readonly registerRepeatPasswordInput: Locator;
	readonly registerTermsCheckbox: Locator;
	readonly registerSubmitButton: Locator;
	readonly googleRegisterButton: Locator;
	readonly registerErrorAlert: Locator;

	// Forgot Password Selectors
	readonly forgotPasswordEmailInput: Locator;
	readonly forgotPasswordSubmitButton: Locator;
	readonly forgotPasswordSuccessState: Locator;
	readonly backToLoginLink: Locator;

	constructor(page: Page) {
		super(page);

		// Login
		this.loginEmailInput = page.locator('input[name="email"]');
		this.loginPasswordInput = page.locator('input[name="password"]');
		this.loginSubmitButton = page.getByTestId("submit-button");
		this.googleLoginButton = page.getByTestId("google-login-button");
		this.forgotPasswordLink = page.getByTestId("forgot-password-link");
		this.loginErrorAlert = page.getByTestId("error-message");
		this.lockoutAlert = page.getByTestId("lockout-alert");

		// Register
		this.registerTenantNameInput = page.locator('input[name="tenant_name"]'); // Changed from testid just in case, or keep if unique. Let's use name.
		this.registerUsernameInput = page.locator('input[name="username"]');
		this.registerEmailInput = page.locator('input[name="email"]');
		this.registerPhoneInput = page.locator('input[name="phone_number"]');
		this.registerPasswordInput = page.locator('input[name="password"]');
		this.registerRepeatPasswordInput = page.locator(
			'input[name="repeat_password"]',
		);
		this.registerTermsCheckbox = page.locator('input[name="terms_accepted"]'); // checkbox name
		// Register submit might be generic submit button or specific
		this.registerSubmitButton = page
			.getByRole("button", { name: /registran|register|cuenta/i })
			.first(); // regex to cover translation "Crear cuenta" or similar
		this.googleRegisterButton = page.getByTestId("google-register-button");
		this.registerErrorAlert = page.getByTestId("error-message");

		// Forgot Password
		this.forgotPasswordEmailInput = page.locator('input[name="email"]');
		this.forgotPasswordSubmitButton = page.getByRole("button", {
			name: /recuperar|send|enviar/i,
		});
		this.forgotPasswordSuccessState = page.getByTestId("success-state");
		this.backToLoginLink = page.getByTestId("back-to-login-link");
		this.registerSubmitButton = page.locator('button[type="submit"]'); // More direct
	}

	async gotoLogin() {
		await this.page.goto("/es/auth/login");
	}

	async gotoRegister() {
		await this.page.goto("/es/auth/register");
	}

	async gotoForgotPassword() {
		await this.page.goto("/es/auth/forgot-password");
	}

	async login(email: string, pass: string) {
		await this.loginEmailInput.fill(email);
		await this.loginPasswordInput.fill(pass);
		await this.clickSafe(this.loginSubmitButton);
	}

	async register(user: {
		tenant: string;
		username: string;
		email: string;
		pass: string;
		phone?: string;
	}) {
		await this.registerTenantNameInput.fill(user.tenant);
		await this.registerUsernameInput.fill(user.username);
		await this.registerEmailInput.fill(user.email);
		if (user.phone) await this.registerPhoneInput.fill(user.phone);
		await this.registerPasswordInput.fill(user.pass);
		await this.registerRepeatPasswordInput.fill(user.pass);
		await this.registerTermsCheckbox.check();
		await this.clickSafe(this.registerSubmitButton);
	}

	async initiateForgotPassword(email: string) {
		await this.forgotPasswordEmailInput.fill(email);
		await this.clickSafe(this.forgotPasswordSubmitButton);
	}
}
