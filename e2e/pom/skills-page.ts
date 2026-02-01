import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base-page";

export class SkillsPage extends BasePage {
	readonly title: Locator;
	readonly bentoGrid: Locator;

	constructor(page: Page) {
		super(page);
		this.title = page.locator("h1").first();
		this.bentoGrid = page.locator(".grid.grid-cols-12"); // The main grid container
	}

	async verifyBentoGridVisible() {
		await expect(this.bentoGrid).toBeVisible();
	}

	async verifyCategoryPresent(categoryTitle: string) {
		await expect(
			this.bentoGrid.getByRole("heading", { name: categoryTitle }),
		).toBeVisible();
	}

	async verifyTechVisible(techName: string) {
		await expect(
			this.bentoGrid.getByText(techName, { exact: true }),
		).toBeVisible();
	}
}
