import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base-page";

export class BlogPage extends BasePage {
	readonly title: Locator;
	readonly postListContainer: Locator;
	readonly pagination: Locator;

	constructor(page: Page) {
		super(page);
		this.title = page.locator("h1").first();
		// The grid containing posts. Might need a more specific selector if multiple grids exist.
		// Based on blog/index.astro, it's the one with gap-8.
		this.postListContainer = page.locator(".grid.gap-8");
		this.pagination = page.locator('nav[aria-label="pagination"]'); // SsrPagination usually has a nav with aria-label
	}

	async verifyPostsPresent() {
		await expect(this.title).toBeVisible();
		// Check that at least one post card exists (either in the grid or the featured one)
		// The featured one is a direct child of the container div, outside the grid.
		// Let's check the grid has items.
		await expect(this.postListContainer).toBeVisible();
		await expect(this.postListContainer.locator("a")).not.toHaveCount(0);
	}
}
