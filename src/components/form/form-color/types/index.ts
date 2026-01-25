import type { JSX } from "preact";
import type { Path, RegisterOptions } from "react-hook-form";

export interface FormColorProps<T extends object> {
	title: string;
	name: Path<T>;
	question?: JSX.Element | JSX.Element[] | string;
	options?: RegisterOptions<T, Path<T>>;
	presetColors?: string[];
	popupPosition?: "bottom" | "right";
	placeholder?: string;
	required?: boolean;
}
