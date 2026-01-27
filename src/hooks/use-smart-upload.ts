import type { FilesSchema } from "@modules/uploads/schemas/upload.schema";
import { useSignal } from "@preact/signals";
import pLimit from "p-limit";
import type {
	EntityFile,
	EntityFileProperty,
} from "../modules/uploads/const/upload.const";

// =========================================================================
// INTERFACES
// =========================================================================
// =========================================================================
// INTERFACES
// =========================================================================
export type UploadStatus = "PENDING" | "UPLOADING" | "COMPLETED" | "ERROR";

export interface FileState {
	id: string;
	file: File;
	status: UploadStatus;
	progress: number; // Porcentaje de carga (0-100)
	key?: string; // Clave de S3/MinIO para la primera variante (legacy/display)
	result?: FilesSchema[]; // Todos los archivos generados (original + variantes)
	abortController?: AbortController; // Para cancelar la subida en curso
}

// =========================================================================
// CONSTANTES
// =========================================================================
const CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_PARALLEL_CHUNKS = 4;
const MAX_RETRIES = 3;
const CHUNK_THRESHOLD = 90 * 1024 * 1024; // 90 MB - Umbral para usar Multipart

// =========================================================================
// HOOK PRINCIPAL
// =========================================================================
export function useSmartUpload(
	entity: EntityFile,
	property: EntityFileProperty,
) {
	const isUploading = useSignal(false);
	const fileList = useSignal<FileState[]>([]);
	const provider = useSignal<"LOCAL" | "S3" | "CLOUDINARY" | null>(null);

	// Fetch provider type on mount
	const fetchProvider = async () => {
		try {
			const res = await fetch("/api/v1/upload/provider");
			if (res.ok) {
				const data = await res.json();
				provider.value = data.provider;
			}
		} catch (error) {
			// biome-ignore lint/suspicious/noConsole: Log error
			console.error("Error fetching storage provider:", error);
		}
	};

	if (provider.value === null) {
		fetchProvider();
	}

	// Helper para actualizar estado de un archivo específico
	const updateFile = (id: string, updates: Partial<FileState>) => {
		fileList.value = fileList.value.map((f) =>
			f.id === id ? { ...f, ...updates } : f,
		);
	};

	// --- ESTRATEGIA 0: FORMIDABLE (Para Imágenes - Convierte a WebP) ---
	const uploadFormidable = async (
		fileState: FileState,
		signal: AbortSignal,
	) => {
		const file = fileState.file;
		const fileId = fileState.id;

		// Crear FormData
		const formData = new FormData();
		formData.append("file", file);

		// Actualizar progreso
		updateFile(fileId, { progress: 50 });

		// Subir vía formidable (Direct Upload)
		const res = await fetch(`/api/v1/upload/${entity}/${property}`, {
			method: "POST",
			body: formData,
			signal,
		});

		if (!res.ok) throw new Error("Error uploading image");

		// La API retorna { success: boolean, data: FilesSchema[] }
		const resJson: { success: boolean; data: FilesSchema[] } = await res.json();

		return resJson;
	};

	// --- ESTRATEGIA 1: SIMPLE ---
	const uploadSimple = async (fileState: FileState, signal: AbortSignal) => {
		const file = fileState.file;
		const fileId = fileState.id;

		// Paso 1: Obtener URL
		const res = await fetch(
			`/api/v1/upload/${entity}/${property}/presigned-simple`,
			{
				method: "POST",
				body: JSON.stringify({
					fileName: file.name,
					fileType: file.type,
				}),
				headers: { "Content-Type": "application/json" },
				signal,
			},
		);
		if (!res.ok) throw new Error("Error obteniendo URL");
		const {
			data: { uploadUrl, key },
		} = await res.json();

		// Actualizamos el progreso al 50% para indicar que se está subiendo
		updateFile(fileId, { progress: 50 });

		// Paso 2: Subir a MinIO/S3
		await fetch(uploadUrl, {
			method: "PUT",
			body: file,
			headers: { "Content-Type": file.type },
			signal,
		});

		// Retornar FilesSchema completo
		return {
			key,
			name: file.name,
			size: file.size,
			mimetype: file.type,
			original_name: file.name,
			created_at: new Date(),
		};
	};

	// --- ESTRATEGIA 2: MULTIPART ---
	const uploadMultipart = async (
		file: File,
		fileId: string,
		signal: AbortSignal,
	) => {
		const totalParts = Math.ceil(file.size / CHUNK_SIZE);
		let uploadedPartsCount = 0;

		// 1. Iniciar
		const initRes = await fetch(
			`/api/v1/upload/${entity}/${property}/multipart-create`,
			{
				method: "POST",
				body: JSON.stringify({ filename: file.name, type: file.type }),
				headers: { "Content-Type": "application/json" },
				signal,
			},
		);
		if (!initRes.ok) throw new Error("Falló init multipart");
		const {
			data: { uploadId, key },
		} = await initRes.json();

		// 2. Subir partes con concurrencia
		const chunkLimit = pLimit(MAX_PARALLEL_CHUNKS);
		const partPromises: Promise<
			{ PartNumber: number; ETag: string } | undefined
		>[] = [];

		for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
			const start = (partNumber - 1) * CHUNK_SIZE;
			const end = Math.min(start + CHUNK_SIZE, file.size);
			const chunkBlob = file.slice(start, end);

			partPromises.push(
				chunkLimit(async () => {
					if (signal.aborted) throw new Error("Aborted");
					let attempt = 0;
					while (attempt < MAX_RETRIES) {
						try {
							// a. Firmar parte
							const signRes = await fetch(
								"/api/v1/upload/multipart-sign-part",
								{
									method: "POST",
									body: JSON.stringify({
										key,
										uploadId,
										partNumber,
									}),
									headers: {
										"Content-Type": "application/json",
									},
									signal,
								},
							);
							const {
								data: { url },
							} = await signRes.json();

							// b. Subir bytes
							const uploadRes = await fetch(url, {
								method: "PUT",
								body: chunkBlob,
								signal,
							});
							if (!uploadRes.ok) throw new Error("S3 Error");

							const eTag = uploadRes.headers.get("ETag");
							if (!eTag) throw new Error("No ETag");

							// c. Actualizar Progreso (Actualización por cada chunk)
							uploadedPartsCount++;
							const percent = Math.round(
								(uploadedPartsCount / totalParts) * 100,
							);
							updateFile(fileId, { progress: percent });

							return {
								PartNumber: partNumber,
								ETag: eTag.replaceAll('"', ""),
							};
						} catch (e) {
							if (signal.aborted) throw e; // No reintentar si se canceló
							attempt++;
							if (attempt >= MAX_RETRIES) throw e;
							await new Promise((r) => setTimeout(r, 1000 * attempt));
						}
					}
				}),
			);
		}

		const partsResults = await Promise.all(partPromises);

		const sortedParts = partsResults.sort(
			(a, b) => a!.PartNumber - b!.PartNumber,
		);

		// 3. Completar
		await fetch("/api/v1/upload/multipart-complete", {
			method: "POST",
			body: JSON.stringify({ key, uploadId, parts: sortedParts }),
			headers: { "Content-Type": "application/json" },
			signal,
		});

		// Retornar FilesSchema completo
		return {
			key,
			name: file.name,
			size: file.size,
			mimetype: file.type,
			original_name: file.name,
			created_at: new Date(),
		};
	};

	// =========================================================================
	// NUEVA FUNCIÓN: Eliminar archivo del servidor (Endpoint necesario)
	// =========================================================================
	const deleteFile = async (key: string) => {
		try {
			const res = await fetch("/api/v1/upload/file", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ key }),
			});
			if (!res.ok) {
				// biome-ignore lint/suspicious/noConsole: Legacy support
				console.error(
					`Error al eliminar archivo Key: ${key}. Status: ${res.status}`,
				);
			} else {
				// biome-ignore lint/suspicious/noConsole: Legacy support
				console.log(`Archivo Key: ${key} eliminado de S3/MinIO.`);
			}
		} catch (error) {
			// biome-ignore lint/suspicious/noConsole: Legacy support
			console.error(`Fallo de red al intentar eliminar Key: ${key}:`, error);
		}
	};

	// --- ORQUESTADOR ---
	const uploadFiles = async (
		files: File[],
		onComplete?: (
			filesSchemas: Array<{
				key: string;
				name: string;
				size: number;
				mimetype: string;
			}>,
		) => void,
	) => {
		isUploading.value = true;
		const limit = pLimit(3);

		const newStates = files.map((f) => ({
			id: f.name + Date.now(),
			file: f,
			status: "PENDING" as UploadStatus,
			progress: 0,
			abortController: new AbortController(),
		}));

		fileList.value = [...fileList.value, ...newStates];

		const promises = newStates.map((fileState) => {
			return limit(async () => {
				const currentFile = fileList.value.find((f) => f.id === fileState.id);
				// Si el usuario eliminó el archivo de la lista antes de que comenzara, retornamos
				if (!currentFile) return null;

				updateFile(fileState.id, { status: "UPLOADING", progress: 0 });

				try {
					let fileSchemas: Array<{
						key: string;
						name: string;
						original_name: string;
						size: number;
						mimetype: string;
						dimension?: number;
					}>;
					const signal = fileState.abortController!.signal;

					// Estrategia de subida basada en el Proveedor y tipo de archivo
					// Detectar si es modo LOCAL → usar formidable para todo
					if (
						provider.value === "LOCAL" ||
						fileState.file.type.startsWith("image/")
					) {
						const res = await uploadFormidable(fileState, signal);
						fileSchemas = res.data.map((f) => ({
							...f,
							original_name: f.original_name || fileState.file.name,
						}));
					}
					// Modo S3/Cloudinary → Archivo pesado → multipart
					else if (fileState.file.size > CHUNK_THRESHOLD) {
						const f = await uploadMultipart(
							fileState.file,
							fileState.id,
							signal,
						);
						fileSchemas = [
							{
								...f,
								original_name: f.original_name || fileState.file.name,
							},
						];
					}
					// Modo S3/Cloudinary → Archivo pequeño → simple
					else {
						const f = await uploadSimple(fileState, signal);
						fileSchemas = [
							{
								...f,
								original_name: f.original_name || fileState.file.name,
							},
						];
					}

					// Se completa al 100% y se actualiza el estado al final
					updateFile(fileState.id, {
						status: "COMPLETED",
						key: fileSchemas[0].key,
						result: fileSchemas, // Guardamos TODOS los resultados
						progress: 100,
					});

					return fileSchemas;
				} catch (error: unknown) {
					// Manejo de Cancelación (AbortError)
					const err = error as Error;

					if (err.name === "AbortError" || err.message === "Aborted") {
						// El archivo ya se habrá quitado de la lista en removeFileState
						return null;
					}
					updateFile(fileState.id, { status: "ERROR", progress: 0 });
					return null;
				}
			});
		});

		const results = await Promise.all(promises);
		isUploading.value = false;
		// Formidable retorna arrays de FilesSchema (múltiples dimensiones)
		// Necesitamos aplanar los resultados
		const successFiles = results.filter((f) => f !== null).flat() as Array<{
			key: string;
			name: string;
			original_name: string;
			size: number;
			mimetype: string;
			dimension?: number;
		}>;

		if (onComplete && successFiles.length > 0) onComplete(successFiles);
	};

	// =========================================================================
	// FUNCIÓN MODIFICADA: Eliminar de la lista local + Lógica de Abort/Delete S3
	// =========================================================================
	const removeFileState = (id: string) => {
		const file = fileList.value.find((f) => f.id === id);

		if (!file) return;

		// 1. Si se está subiendo, ABORTAMOS las peticiones.
		if (file.status === "UPLOADING" || file.status === "PENDING") {
			file.abortController?.abort();
		}

		// 2. Si ya se subió...
		// a. Intentamos borrar TODOS los archivos generados (variantes)
		if (file.result && file.result.length > 0) {
			for (const f of file.result) {
				deleteFile(f.key);
			}
		}
		// b. Fallback: borrar solo la key principal si no hay result
		else if (file.key) {
			deleteFile(file.key);
		}

		// 3. Quitar de la lista local inmediatamente.
		fileList.value = fileList.value.filter((f) => f.id !== id);
	};

	const clearFiles = () => {
		for (const element of fileList.value) {
			// Abortamos subidas en curso
			element.abortController?.abort();
			// Eliminamos del servidor si ya estaba subido
			if (element.key) {
				deleteFile(element.key);
			}
		}
		fileList.value = [];
	};

	return {
		isUploading,
		fileList,
		uploadFiles,
		removeFileState,
		clearFiles,
	};
}
