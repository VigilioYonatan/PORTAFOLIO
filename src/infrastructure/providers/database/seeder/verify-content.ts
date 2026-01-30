/** biome-ignore-all lint/suspicious/noConsole: <explanation> */
import { NestFactory } from "@nestjs/core";
import { sql } from "drizzle-orm";
import { schema } from "../database.schema";
import { DRIZZLE } from "../database.service";
import { SeederModule } from "./seeder.module";

async function verify() {
	const app = await NestFactory.createApplicationContext(SeederModule);
	const db = app.get(DRIZZLE);

	try {
		const results = await db
			.select({
				slug: schema.blogPostEntity.slug,
				language: schema.blogPostEntity.language,
				length: sql<number>`length(${schema.blogPostEntity.content})`,
				content: schema.blogPostEntity.content,
			})
			.from(schema.blogPostEntity);

		console.log(
			`\n--- Verification Report (${results.length} total entries) ---`,
		);
		let failCount = 0;
		let titleCount = 0;

		for (const row of results) {
			if (row.length < 5000) {
				console.warn(
					`❌ FAIL: [${row.language}] ${row.slug} - Length: ${row.length}`,
				);
				failCount++;
			} else {
				console.log(
					`✅ PASS: [${row.language}] ${row.slug} - Length: ${row.length}`,
				);
			}

			// Check for markdown titles (lines starting with #)
			if (
				row.content.split("\n").some((line: string) => line.startsWith("# "))
			) {
				console.warn(
					`⚠️ WARNING: [${row.language}] ${row.slug} contains internal # titles`,
				);
				titleCount++;
			}
		}

		if (failCount === 0 && titleCount === 0) {
			console.log("\n🚀 ALL POSTS MEET REQUIREMENTS!");
		} else {
			console.log(
				`\nSummary: ${failCount} posts below 5000 chars, ${titleCount} posts with internal titles.`,
			);
		}
	} catch (error) {
		console.error("Verification failed:", error);
	} finally {
		await app.close();
	}
}

verify();
