import type { FilesSchema } from "@modules/uploads/schemas/upload.schema";

/**
 * Converts bytes to human-readable file size string
 *
 * @param bytes - The file size in bytes
 * @param decimals - Number of decimal places to show (default: 2)
 * @returns Formatted file size string with appropriate unit
 */
export function formatFileSize(bytes: number, decimals = 2): string {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	// Handle Bytes case differently (no decimals)
	if (i === 0) return `${bytes} ${sizes[i]}`;

	return `${Number.parseFloat((bytes / k ** i).toFixed(decimals))} ${sizes[i]}`;
}

// dimension solo es valido para imagenes
export function printFileWithDimension(
	files: FilesSchema[] | null,
	dimension: number | null = null,
	custom_file_no_found: string | null = null,
) {
	if (!files) {
		return [custom_file_no_found || "noimagefound"];
	}
	const filterImages = dimension
		? files.filter(
				(img) => img.key?.startsWith("https://") || img.dimension === dimension,
			)
		: files;

	return filterImages.map((file) =>
		file.key!.startsWith("https://") ? file.key : `/${file.key}`,
	);
}

/**
 * Maps common mimetypes to their file extensions.
 */
export function getExtensionFromMime(mime: string): string | null {
	const map: Record<string, string> = {
		// Audio
		"audio/mpeg": "mp3",
		"audio/mp3": "mp3",
		"audio/wav": "wav",
		"audio/ogg": "ogg",
		"audio/mp4": "m4a",
		"audio/aac": "aac",
		"audio/opus": "opus",
		"audio/flac": "flac",
		"audio/webm": "webm",
		// Image
		"image/jpeg": "jpg",
		"image/png": "png",
		"image/webp": "webp",
		"image/gif": "gif",
		"image/svg+xml": "svg",
		"image/avif": "avif",
		"image/bmp": "bmp",
		"image/tiff": "tiff",
		// Video
		"video/mp4": "mp4",
		"video/webm": "webm",
		"video/quicktime": "mov",
		"video/x-msvideo": "avi",
		"video/mpeg": "mpeg",
		"video/ogg": "ogv",
		// Documents
		"application/pdf": "pdf",
		"application/msword": "doc",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document":
			"docx",
		"application/vnd.ms-excel": "xls",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
		"application/vnd.ms-powerpoint": "ppt",
		"application/vnd.openxmlformats-officedocument.presentationml.presentation":
			"pptx",
		"application/rtf": "rtf",
		"application/vnd.oasis.opendocument.text": "odt",
		"application/vnd.oasis.opendocument.spreadsheet": "ods",
		// Archives
		"application/zip": "zip",
		"application/x-rar-compressed": "rar",
		"application/x-7z-compressed": "7z",
		"application/x-tar": "tar",
		"application/gzip": "gz",
		"application/x-bzip2": "bz2",
		// Data / Text / Dev
		"application/json": "json",
		"application/ld+json": "jsonld",
		"application/xml": "xml",
		"application/sql": "sql",
		"text/plain": "txt",
		"text/html": "html",
		"text/css": "css",
		"text/javascript": "js",
		"text/csv": "csv",
		"text/markdown": "md",
		"text/calendar": "ics",
		"text/yaml": "yaml",
		"application/x-yaml": "yaml",
		"application/x-typescript": "ts",
	};
	return map[mime] || null;
}
