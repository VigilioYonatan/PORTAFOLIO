import type { FilesSchema } from "@modules/uploads/schemas/upload.schema";

/**
 * Verifica si un archivo es una imagen basándose en su mimetype
 */
export function isImageFile(mimetype: string): boolean {
	return mimetype.startsWith("image/");
}
