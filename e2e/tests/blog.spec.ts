import { test } from "@playwright/test";
import { BlogPage } from "../pom/blog-page";

test.describe("Blog Page E2E", () => {
	test("should load blog page successfully", async ({ page }) => {
		const blogPage = new BlogPage(page);
		await blogPage.goto("es/blog");

		await blogPage.verifyTitleIncludes(/Blog/i);
		await blogPage.verifyPostsPresent();
	});
});
