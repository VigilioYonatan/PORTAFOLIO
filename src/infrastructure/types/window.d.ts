import type { Global } from "./request";

declare global {
	interface Window {
		locals: Global;
	}
}
