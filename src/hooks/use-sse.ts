import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

interface UseSSEUserProps {
	url: string;
	userId: number;
}

export function useSSEUser({ url, userId }: UseSSEUserProps) {
	const data = useSignal<{
		id: number;
		message: string;
		type: string;
		timestamp: string;
	} | null>(null);
	const error = useSignal<string | null>(null);
	const isConnected = useSignal<boolean>(false);

	useEffect(() => {
		if (!userId) return;

		const eventSource = new EventSource(`${url}`);

		eventSource.onopen = () => {
			isConnected.value = true;
			error.value = null;
		};

		eventSource.onmessage = (event) => {
			try {
				if (event.data.trim() === ": heartbeat") return;

				const parsedData = JSON.parse(event.data);
				data.value = parsedData;
			} catch (err) {
				// biome-ignore lint/suspicious/noConsole: Legacy support
				console.error("Error parsing SSE data:", err);
			}
		};

		eventSource.onerror = (err) => {
			// biome-ignore lint/suspicious/noConsole: Legacy support
			console.error("SSE connection error:", err);
			error.value = "Error de conexión";
			isConnected.value = false;
			eventSource.close();
		};

		return () => {
			eventSource.close();
			isConnected.value = false;
		};
	}, [url, userId]);

	return { data, error, isConnected };
}
