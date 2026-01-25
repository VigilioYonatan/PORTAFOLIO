export const IP_CEAR = "170.0.234.103";

export const TIMEZONE_DEFAULT =
	typeof window !== "undefined"
		? window.locals?.tenant?.setting?.time_zone
		: null;

export const NO_PROFILE_SMALLIMG: string =
	"/images/settings/no-profile-small.webp";
export const NO_PROFILE_BIGIMG: string = "/images/settings/no-profile-big.webp";
export const NO_IMAGE_COURSE_NO_FOUND = "/images/settings/curso_no_found.webp";
export const NO_IMAGE_FOUND: string = "/images/settings/no-image-found.webp";
export const CEAR_WEB_URL: string = "https://cearlatinoamericano.pe";
export const TINYMCE_URL: string = "/images/settings/js/langs/es.js";

export const EXTENSIONS: Record<
	"video" | "image" | "document" | "compressed" | "audio",
	string[]
> = {
	video: [
		"video/mp4",
		"video/webm",
		"video/mpeg",
		"video/3gpp",
		"video/x-msvideo",
	],
	audio: ["audio/mpeg", "audio/wav", "audio/aac", "audio/flac", "audio/ogg"],
	image: [
		"image/jpeg",
		"image/png",
		"image/gif",
		"image/svg+xml",
		"image/webp",
	],
	document: [
		"application/pdf",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"application/vnd.ms-excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		"application/vnd.ms-powerpoint",
		"application/vnd.openxmlformats-officedocument.presentationml.presentation",
		"text/plain",
		"application/rtf",
		"application/vnd.oasis.opendocument.text",
		"application/vnd.oasis.opendocument.spreadsheet",
		"application/vnd.oasis.opendocument.presentation",
		"text/csv",
	],
	compressed: [
		"application/zip",
		"application/x-rar-compressed",
		"application/x-7z-compressed",
		"application/x-tar",
		"application/gzip",
		"application/x-bzip2",
		"application/x-xz",
		"application/x-iso9660-image",
		"application/java-archive",
	],
};

export const EXTENSIONS_MIME: [string, string][] = [
	["video/mp4", "mp4"],
	["video/webm", "webm"],
	["video/mpeg", "mpeg"],
	["video/3gpp", "3gpp"],

	["audio/mpeg", "mp3"],
	["audio/wav", "wav"],
	["audio/aac", "aac"],
	["audio/flac", "flac"],
	["audio/ogg", "ogg"],

	["image/jpeg", "jpeg"],
	["image/png", "png"],
	["image/gif", "gif"],
	["image/svg+xml", "svg"],
	["image/webp", "webp"],

	["application/pdf", "pdf"],
	["application/msword", "doc"],
	[
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"docx",
	],
	["application/vnd.ms-excel", "xls"],
	["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"],
	["application/vnd.ms-powerpoint", "ppt"],
	[
		"application/vnd.openxmlformats-officedocument.presentationml.presentation",
		"pptx",
	],
	["text/plain", "txt"],
	["application/rtf", "rtf"],
	["application/vnd.oasis.opendocument.text", "odt"],
	["application/vnd.oasis.opendocument.spreadsheet", "ods"],
	["application/vnd.oasis.opendocument.presentation", "odp"],
	["text/csv", "csv"],

	["application/zip", "zip"],
	["application/x-rar-compressed", "rar"],
	["application/x-7z-compressed", "7z"],
	["application/x-tar", "tar"],
	["application/gzip", "gz"],
	["application/x-bzip2", "bz2"],
	["application/x-xz", "xz"],
	["application/x-iso9660-image", "iso"],
	["application/java-archive", "jar"],
];
