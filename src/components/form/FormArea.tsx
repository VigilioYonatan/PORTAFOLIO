import { cn, sizeIcon } from "@infrastructure/utils/client";
import { useSignal } from "@preact/signals";
import { CircleHelp } from "lucide-preact";
import { useContext } from "preact/hooks";
import type { JSX } from "preact/jsx-runtime";
import type {
	FieldValues,
	Path,
	RegisterOptions,
	UseFormReturn,
} from "react-hook-form";
import { anidarPropiedades } from ".";
import { FormControlContext } from "./Form";

export interface FormAreaProps<T extends object>
	extends Omit<JSX.IntrinsicElements["textarea"], "name"> {
	title: string;
	name: Path<T>;
	question?: JSX.Element | JSX.Element[] | string;
	options?: RegisterOptions<T, Path<T>>;
	contentMaxLength?: number;
	isFloating?: boolean;
	ico?: JSX.Element | JSX.Element[];
}

export function FormArea<T extends object>({
	name,
	title,
	question,
	options = {},
	isFloating = false,
	contentMaxLength,
	ico,
	...rest
}: FormAreaProps<T>) {
	const isFocused = useSignal<boolean>(false);
	const {
		register,
		formState: { errors },
		watch,
	} = useContext<UseFormReturn<T, unknown, FieldValues>>(FormControlContext);

	const err = anidarPropiedades(errors, (name as string).split("."));
	const nameId = `${name}-${Math.random().toString(32)}`;
	return (
		<div class="space-y-2 w-full">
			{title && (
				<label
					htmlFor={nameId as string}
					class={`block text-sm font-semibold text-foreground ${
						isFloating ? "absolute -mt-3 ml-3 px-1 bg-background z-10" : ""
					}`}
				>
					{title}
					{rest.required ? <span class="text-primary">*</span> : ""}
				</label>
			)}

			<div class="relative flex gap-2">
				{ico && (
					<div
						class={cn(
							"absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-muted-foreground  rounded-l-[var(--radius-lg)]  z-1 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:fill-foreground",
						)}
					>
						{ico}
					</div>
				)}
				<textarea
					class={cn(
						"w-full py-2 bg-background border border-input rounded-[var(--radius-lg)] text-foreground placeholder-muted-foreground",
						"focus:outline-none focus:ring-2 focus:ring-primary focus:border-ring/30",
						"transition-all duration-200",
						isFocused.value && "bg-accent/50",
						!!Object.keys(err).length &&
							"border-destructive! focus:ring-destructive/20! focus:border-destructive!",
						rest.disabled && "opacity-50 cursor-not-allowed bg-muted/30",
						"px-4",
						ico && "pl-12",
						isFloating && "pt-3",
						rest.className as string,
					)}
					id={nameId as string}
					rows={rest.rows}
					{...{
						rest,
						onBlur: (event) => {
							isFocused.value = false;
							rest.onBlur?.(event);
						},
						onFocus: (event) => {
							isFocused.value = true;
							rest.onFocus?.(event);
						},
					}}
					{...register(name as unknown as Path<T>, options)}
					autoComplete="off"
					placeholder={rest.placeholder}
				>
					{watch(name as unknown as Path<T>)}
				</textarea>

				{question && (
					<div class="relative group self-center">
						<div class="rounded-full shadow-lg p-1 bg-primary fill-white">
							<CircleHelp {...sizeIcon.small} class="text-white" />
						</div>
						<div class="shadow-xl text-xs min-w-[100px] hidden group-hover:block -top-[35px] right-1 p-1 text-center absolute rounded-[var(--radius-lg)] bg-white z-10 font-semibold text-black">
							{question}
						</div>
					</div>
				)}
			</div>

			<div class="flex justify-between">
				{Object.keys(err).length ? (
					<p class="text-sm text-destructive flex items-center gap-1">
						{err?.message}
					</p>
				) : (
					<div class="" />
				)}
				{contentMaxLength && (
					<p class="text-xs text-muted-foreground ">
						{(watch(name as unknown as Path<T>) as string)?.length || 0}/
						{contentMaxLength}
					</p>
				)}
			</div>
		</div>
	);
}

// export default FormArea;
