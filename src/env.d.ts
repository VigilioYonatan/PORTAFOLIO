/// <reference types="astro/client" />
import { Environments } from "@infrastructure/config/server";
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
			VAPID_PUBLIC_KEY: string;
			NODE_ENV: Environments["NODE_ENV"];
		};
	}
}
