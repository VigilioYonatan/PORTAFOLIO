import { sizeIcon } from "@infrastructure/utils/client";
import { CircleHelp, File as FileIcon, ImageIcon, Video } from "lucide-preact";
import type { JSX } from "preact";

export const formatFileSize = (bytes: number) => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

export const formatDate = (timestamp: number) => {
	return new Date(timestamp).toLocaleString("es-ES", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

export const getFileTypeColor = (type: string) => {
	if (type.startsWith("image/"))
		return "bg-green-100 text-green-800 border-green-200";
	if (type.startsWith("video/"))
		return "bg-blue-100 text-blue-800 border-blue-200";
	return "bg-gray-100 text-gray-800 border-gray-200";
};

export const getIcon = (type: string): JSX.Element => {
	if (type.startsWith("image/"))
		return <ImageIcon {...sizeIcon.xlarge} class="text-green-500" />;
	if (type.startsWith("video/"))
		return <Video {...sizeIcon.xlarge} class="text-blue-500" />;
	return <FileIcon {...sizeIcon.xlarge} class="text-gray-400" />;
};

export const getFileTypeInfo = (type: string) => {
	if (type.startsWith("image/")) {
		return {
			category: "Imagen",
			icon: <ImageIcon {...sizeIcon.medium} />,
			color: "bg-green-100 text-green-800",
		};
	}
	if (type.startsWith("video/")) {
		return {
			category: "Video",
			icon: <Video {...sizeIcon.medium} />,
			color: "bg-blue-100 text-blue-800",
		};
	}
	return {
		category: "Archivo",
		icon: <CircleHelp {...sizeIcon.medium} />,
		color: "bg-gray-100 text-gray-800",
	};
};
