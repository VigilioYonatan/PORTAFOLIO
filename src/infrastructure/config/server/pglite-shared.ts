import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite/vector";

let instance: any = null;
let readyPromise: Promise<any> | null = null;
const instanceId = Math.random().toString(36).substring(7);

export async function getSharedPGlite(pathName?: string) {
	if (readyPromise) return readyPromise;

	readyPromise = (async () => {
		console.log(
			`🚀 [PGlite Shared] Creating NEW instance ${instanceId} (${pathName || "in-memory"})`,
		);
		instance = new PGlite(pathName || undefined, {
			extensions: { vector },
		});

		// Wait for the instance to be ready
		if (instance.ready) {
			await instance.ready;
		}

		console.log(
			`🛠️ [PGlite Shared] Enabling vector extension on ${instanceId}...`,
		);
		try {
			await instance.exec("CREATE EXTENSION IF NOT EXISTS vector;");
			console.log(
				`✅ [PGlite Shared] Vector extension enabled on ${instanceId}.`,
			);
		} catch (err) {
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
