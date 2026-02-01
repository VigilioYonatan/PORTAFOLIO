import { expect, type Locator, type Page } from "@playwright/test";

export class BasePage {
	readonly page: Page;
	readonly navLinks: Locator;
	readonly languageSwitcher: Locator;
	readonly themeSwitcher: Locator;

	constructor(page: Page) {
		this.page = page;
		this.navLinks = page.locator("nav").first();
		// Assuming there are buttons/links for these in the layout
		this.languageSwitcher = page.locator(
			'button[aria-label="Change language"]',
		);
		// Or generic selector if specific aria-label isn't present, but aria-label is best practice
		this.themeSwitcher = page.locator('button[aria-label="Toggle theme"]');
	}

	async goto(path: string) {
		await this.page.goto(path);
		await this.waitForHydration();
	}

	async waitForHydration() {
		// Wait for network to be idle to ensure hydration is mostly done
		await this.page
			.waitForLoadState("networkidle", { timeout: 10000 })
			.catch(() => {});
		// In case of Vite error overlay, we let it fail on interaction
	}

	async clickSafe(locator: Locator) {
		await locator.scrollIntoViewIfNeeded();
		// Force click if intercepted, but senior approach is to wait for stability
		await locator.click({ force: true, delay: 100 });
	}

	async switchLanguage(lang: string) {
		await this.page.goto(`/${lang}`);
		await this.waitForHydration();
	}

	async verifyTitleIncludes(text: string | RegExp) {
		await expect(this.page).toHaveTitle(text);
	}
}
