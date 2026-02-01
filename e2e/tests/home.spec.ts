import { expect, test } from "@playwright/test";
import { HomePage } from "../pom/home-page";

test.describe("Home Page E2E", () => {
	test("should load home page successfully", async ({ page }) => {
		const homePage = new HomePage(page);
		await homePage.goto("es");

		// Verify basic elements
		await homePage.verifyTitle();
		await expect(homePage.heroSection).toBeVisible();
		await expect(homePage.cvButton).toBeVisible();
		await homePage.verifySectionsVisible();
	});

	// Direct navigation check for stability
	test("should load projects page directly", async ({ page }) => {
		// Navigate directly to ensure page loads correctly independent of client-side transitions
		await page.goto("/es/projects");

		await expect(page).toHaveURL(/\/es\/projects/);
		await expect(page).toHaveTitle(/Proyectos|Projects/i);
	});
});
