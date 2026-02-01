import { test } from "@playwright/test";
import { AboutPage } from "../pom/about-page";

test.describe("About Page E2E", () => {
	test("should load about page successfully", async ({ page }) => {
		const aboutPage = new AboutPage(page);
		await aboutPage.goto("es/about");

		await aboutPage.verifyTitleIncludes(/Sobre|About/i);
		await aboutPage.verifyStatsVisible();
		await aboutPage.verifyServicesVisible();
	});
});
