import type {
	EntityFile,
	EntityFileProperty,
} from "@modules/uploads/const/upload.const";
import type { JSX } from "preact";
import type { Path, RegisterOptions } from "react-hook-form";

export interface FormFileProps<T extends object> {
	title: string | JSX.Element | JSX.Element[];
	name: Path<T>;
	multiple?: boolean;
	accept?: string;
	entity: EntityFile;
	property: EntityFileProperty;
	typeFile?: "image" | "file" | "video" | "image-video" | { value: string };
	typesText?: string;
	options?: RegisterOptions<T, Path<T>>;
	showButonCopy?: boolean;
	showButtonClean?: boolean;
	fileNormal?: "big" | "normal" | "small";
	height?: number;
	smallContent?: JSX.Element | JSX.Element[];
	required?: boolean;
	placeholder?: string;
	id?: string;
	ico?: JSX.Element | JSX.Element[];
}

export interface FileInfoProps {
	file: File;
}

export interface ImageMetadata {
	width?: number;
	height?: number;
	aspectRatio?: string;
	colorDepth?: string;
}
