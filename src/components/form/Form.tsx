import { createContext, type JSX } from "preact";
import type { FieldValues, UseFormReturn } from "react-hook-form";

export const FormControlContext = createContext<
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	UseFormReturn<any, unknown, FieldValues>
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
>({} as UseFormReturn<any, unknown, FieldValues>);

interface FormProps<T extends object> extends UseFormReturn<T> {
	children:
		| JSX.Element
		| JSX.Element[]
		| (JSX.Element | JSX.Element[] | string | null | boolean)[]
		| null
		| boolean;
	onSubmit: (data: T) => void;
	className?: string;
	id?: string;
}
export function Form<T extends object>({
	children,
	onSubmit,
	className = "w-full flex flex-col gap-4",
	id,
	...rest
}: FormProps<T>) {
	return (
		<FormControlContext.Provider value={rest}>
			<form
				noValidate
				onSubmit={rest.handleSubmit(onSubmit)}
				class={className}
				id={id}
				autoComplete="off"
			>
				{children}
			</form>
		</FormControlContext.Provider>
	);
}

export default Form;
