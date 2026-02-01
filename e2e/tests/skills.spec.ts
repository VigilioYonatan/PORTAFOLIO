import { test } from "@playwright/test";
import { SkillsPage } from "../pom/skills-page";

test.describe("Skills Page E2E", () => {
	test("should load skills page successfully", async ({ page }) => {
		const skillsPage = new SkillsPage(page);
		await skillsPage.goto("es/skills");

		await skillsPage.verifyTitleIncludes(/Skills|Habilidades|Tecnologías/i); // Depending on translation
		await skillsPage.verifyBentoGridVisible();

		// Check for some known categories and techs
		// Note: These strings depend on the "es" locale translations.
		// Based on skill-bento-grid.tsx, keys are like "skills.cat.frontend.title"
		// If we don't know the exact translation, we might need to rely on English or generic checks if possible,
		// but let's assume we can match some known tech names which are hardcoded in the component (e.g. React / Preact).

		await skillsPage.verifyTechVisible("React / Preact");
		await skillsPage.verifyTechVisible("Node.js");
		await skillsPage.verifyTechVisible("Docker");
	});
});
