/**
 * Genera una firma HMAC para una solicitud
 * @param method El método HTTP (GET, POST, etc.)
 * @param path La ruta de la solicitud
 * @returns Un objeto con la firma y el timestamp
 */
export async function generateSignature(method: string, path: string) {
	const timestamp = Date.now();
	const dataToSign = `${timestamp}:${method}:${path}`;
	return {
		signature: (await generateHMAC(dataToSign, "SECRET_KEY")).toString(),
		timestamp: timestamp.toString(),
	};
}

/**
 * Genera una firma HMAC para una solicitud
 * @param method El método HTTP (GET, POST, etc.)
 * @param path La ruta de la solicitud
 * @returns Un objeto con la firma y el timestamp
 */
async function generateHMAC(message: string, secretKey: string) {
	const encoder = new TextEncoder();
	const keyData = encoder.encode(secretKey);
	const messageData = encoder.encode(message);
	const key = await crypto.subtle.importKey(
		"raw",
		keyData,
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign("HMAC", key, messageData);
	const hex = Array.from(new Uint8Array(signature))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	return hex;
}
