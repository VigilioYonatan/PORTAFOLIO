import { test } from "@playwright/test";
import { OpenSourcePage } from "../pom/open-source-page";

test.describe("Open Source Page E2E", () => {
	test("should load open source page successfully", async ({ page }) => {
		const openSourcePage = new OpenSourcePage(page);
		await openSourcePage.goto("es/open-source");

		await openSourcePage.verifyTitleIncludes(/Open Source/i);
		await openSourcePage.verifyProjectsVisible();
	});
});
