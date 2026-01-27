import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite/vector";

let instance: PGlite | null = null;
let readyPromise: Promise<PGlite> | null = null;
const instanceId = Math.random().toString(36).substring(7);

export async function getSharedPGlite(pathName?: string) {
	if (readyPromise) return readyPromise;

	readyPromise = (async () => {
		// biome-ignore lint/suspicious/noConsole: <explanation>
		console.log(
			`🚀 [PGlite Shared] Creating NEW instance ${instanceId} (${pathName || "in-memory"})`,
		);
		instance = new PGlite(pathName || undefined, {
			extensions: { vector },
		});

		// Wait for the instance to be ready
		if (instance.ready) {
			instance.ready;
		}

		try {
			await instance.exec("CREATE EXTENSION IF NOT EXISTS vector;");
			// biome-ignore lint/suspicious/noConsole: <explanation>
			console.log(
				`✅ [PGlite Shared] Vector extension enabled on ${instanceId}.`,
			);
		} catch (err) {
			// biome-ignore lint/suspicious/noConsole: <explanation>
			console.warn(`⚠️ [PGlite Shared] Error enabling vector extension:`, err);
		}

		return instance;
	})();

	return readyPromise;
}

export function clearSharedPGlite() {
	instance = null;
	readyPromise = null;
}
