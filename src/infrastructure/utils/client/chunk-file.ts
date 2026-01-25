export const PART_SIZE = 5 * 1024 * 1024; // debe coincidir con el backend

export async function uploadFile(file: File) {
	// 1. Pedir presigned urls
	const response = await fetch("/api/start-upload", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ fileName: file.name, fileSize: file.size }),
	});
	const result = (await response.json()) as {
		uploadId: string;
		key: string;
		presignedUrls: string[];
	};

	const { uploadId, key, presignedUrls } = result;

	// 2. Subir cada parte
	const parts: { ETag: string; PartNumber: number }[] = [];

	for (let i = 0; i < presignedUrls.length; i++) {
		const startByte = i * PART_SIZE;
		const endByte = Math.min(startByte + PART_SIZE, file.size);
		const blob = file.slice(startByte, endByte);

		const response = await fetch(presignedUrls[i], {
			method: "PUT",
			body: blob,
		});

		if (!response.ok) {
			// body contiene el XML de S3 con el detalle
			const text = await response.text();
			throw new Error(`Part ${i + 1} failed: ${response.status} ${text}`);
		}

		const ETag = response.headers.get("ETag")!; // S3 lo devuelve siempre
		if (!ETag) throw new Error(`No ETag header in part ${i + 1}`);
		parts.push({ ETag, PartNumber: i + 1 });
	}

	// 3. Completar multipart
	await fetch("/api/finish-upload", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ uploadId, key, parts }),
	});
}
