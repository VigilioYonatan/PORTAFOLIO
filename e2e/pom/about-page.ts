import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base-page";

export class AboutPage extends BasePage {
	readonly heroTitle: Locator;
	readonly statsContainer: Locator;
	readonly servicesSection: Locator;
	readonly techStackSection: Locator;

	constructor(page: Page) {
		super(page);
		this.heroTitle = page.locator("h1").first();
		// Stats are in a grid-cols-3 container in the hero section
		this.statsContainer = page
			.locator("section")
			.first()
			.locator(".grid.grid-cols-3");
		// Services section has "Servicios" or similar title
		this.servicesSection = page.locator("section").nth(1);
		this.techStackSection = page.locator("section").nth(2);
	}

	async verifyStatsVisible() {
		await expect(this.statsContainer).toBeVisible();
		// Verify we have 3 stats
		await expect(this.statsContainer.locator("> div")).toHaveCount(3);
	}

	async verifyServicesVisible() {
		await expect(this.servicesSection).toBeVisible();
	}
}
