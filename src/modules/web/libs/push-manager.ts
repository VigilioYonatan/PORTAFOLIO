const VAPID_PUBLIC_KEY =
	"BNHhKhWwwUQXbFqbSmHAuIXBfFIzfAPOxrImmxkih8rPZ_TK7ftRUj5iuyMLK3nLTvN2huaTXCAPTq5C8yZ227Q";

function urlBase64ToUint8Array(base64String: string) {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

export async function subscribeUserToPush() {
	if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
		// biome-ignore lint/suspicious/noConsole: <explanation>
		console.warn("Push messaging is not supported");
		return;
	}

	try {
		const registration = await navigator.serviceWorker.ready;
		const subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
		});

		// Send subscription to backend
		await fetch("/api/notification/subscribe", {
			method: "POST",
			body: JSON.stringify({
				endpoint: subscription.endpoint,
				keys: subscription.toJSON().keys,
				user_agent: navigator.userAgent,
			}),
			headers: {
				"Content-Type": "application/json",
			},
		});

		// biome-ignore lint/suspicious/noConsole: <explanation>
		console.log("Web Push Subscribed!");
		return subscription;
	} catch (error) {
		// biome-ignore lint/suspicious/noConsole: <explanation>
		console.error("Failed to subscribe the user: ", error);
	}
}
