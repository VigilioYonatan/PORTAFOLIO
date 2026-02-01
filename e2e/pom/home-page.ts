import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base-page";

export class HomePage extends BasePage {
	readonly explorerButton: Locator;
	readonly cvButton: Locator;
	readonly experienceSection: Locator;
	readonly heroSection: Locator;

	constructor(page: Page) {
		super(page);
		this.explorerButton = page
			.getByRole("link", { name: /Explurar|Explorer|Explorar/i })
			.first();
		this.cvButton = page.getByRole("link", { name: /CV/i }).first();
		this.experienceSection = page.locator("#experience-section");
		this.heroSection = page.locator("section").first();
	}

	async goto(locale: string = "es") {
		await super.goto(`/${locale}`);
	}

	async verifyTitle() {
		await this.verifyTitleIncludes(/Vigilio|Portfolio|Desarrollador/i);
	}

	async navigateToProjects() {
		await this.explorerButton.click();
	}

	async verifySectionsVisible() {
		await expect(this.heroSection).toBeVisible();
		await expect(this.experienceSection).toBeVisible();
		// Check for other sections by their common titles or structure if specific IDs aren't there
		// Based on index.astro: Recent Projects, Open Source, Blog have SectionTitle
		await expect(
			this.page.getByText("Ultimos Proyectos", { exact: false }),
		).toBeVisible();
		// Logic for exact text might vary by locale, but 'Proyectos' is likely safe enough or rely on base class text checks.
	}
}
