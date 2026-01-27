import { useSignal } from "@preact/signals";
import { useCallback } from "preact/hooks";

type CopiedValue = string | null;
type CopyFn = (text: string) => Promise<boolean>;

// HOOK para copiar y pegar
function useCopyToClipboard(): [CopyFn, CopiedValue] {
	const copiedText = useSignal<CopiedValue>(null);

	const copy: CopyFn = useCallback(async (text) => {
		if (!navigator?.clipboard) {
			// biome-ignore lint/suspicious/noConsole: Legacy support
			console.warn("Clipboard not supported");
			return false;
		}

		// Try to save to clipboard then save it in the state if worked
		try {
			await navigator.clipboard.writeText(text);
			copiedText.value = text;
			return true;
		} catch (error) {
			// biome-ignore lint/suspicious/noConsole: Legacy support
			console.warn("Copy failed", error);
			copiedText.value = null;
			return false;
		}
	}, []);

	return [copy, copiedText.value];
}
export default useCopyToClipboard;
