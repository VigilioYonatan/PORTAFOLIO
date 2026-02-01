import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base-page";

export class OpenSourcePage extends BasePage {
	readonly title: Locator;
	readonly projectsGrid: Locator;

	constructor(page: Page) {
		super(page);
		this.title = page.locator("h1").first();
		// Grid with gap-10 in open-source/index.astro
		this.projectsGrid = page.locator(".grid.gap-10");
	}

	async verifyProjectsVisible() {
		await expect(this.title).toBeVisible();
		await expect(this.projectsGrid).toBeVisible();
		// Check for project cards
		await expect(this.projectsGrid.locator("a")).not.toHaveCount(0);
	}
}
