/// <reference types="astro/client" />
import type { Global } from "@infrastructure/types/request";

declare global {
	namespace App {
		interface Locals extends Global {
			props: Record<string, unknown>;
		}
	}
	interface Window {
		env: {
			STORAGE_URL: string;
			NAME_APP: string;
		};
	}
}
