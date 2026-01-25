import { Pool } from "pg";
import "dotenv/config";

async function run() {
	const pool = new Pool({
		connectionString: process.env.DATABASE_URL,
	});

	try {
		console.log("🔌 Connecting to database...");
		const client = await pool.connect();

		console.log("🛠️ Enabling 'vector' extension...");
		await client.query("CREATE EXTENSION IF NOT EXISTS vector;");

		console.log("✅ Extension 'vector' enabled successfully.");
		client.release();
	} catch (error) {
		console.error("❌ Error enabling vector extension:", error);
	} finally {
		await pool.end();
	}
}

run();
