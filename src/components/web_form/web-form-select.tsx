import { cn } from "@infrastructure/utils/client";
import { useSignal } from "@preact/signals";
import { ChevronDown } from "lucide-preact";
import { useContext, useEffect, useRef } from "preact/hooks";
import type { JSX } from "preact/jsx-runtime";
import type {
	FieldValues,
	Path,
	RegisterOptions,
	UseFormReturn,
} from "react-hook-form";
import { anidarPropiedades } from "./utils";
import { FormControlContext } from "./web-form";

export interface WebFormSelectProps<T extends object>
	extends Omit<JSX.IntrinsicElements["div"], "name"> {
	title: string;
	name: Path<T>;
	question?: JSX.Element | JSX.Element[] | string;
	options?: RegisterOptions<T, Path<T>>;
	placeholder?: string;
	ico?: JSX.Element | JSX.Element[];
	isLoading?: boolean;
	array: { value: string; key: unknown }[];
	className?: string;
	disabled?: boolean;
	required?: boolean;
}

function WebFormSelect<T extends object>({
	name,
	title,
	question,
	options = {},
	array,
	placeholder,
	isLoading = false,
	ico,
	className,
	disabled,
	...rest
}: WebFormSelectProps<T>) {
	const {
		register,
		setValue,
		getValues,
		watch,
		formState: { errors },
	} = useContext<UseFormReturn<T, unknown, FieldValues>>(FormControlContext);
	const isOpen = useSignal<boolean>(false);
	const value = watch(name);
	const selectedOption = useSignal<{
		value: string;
		key: unknown;
	} | null>(null);
	const selectRef = useRef<HTMLDivElement>(null);
	const isFocused = useSignal<boolean>(false);

	const err = anidarPropiedades(errors, (name as string).split("."));

	// Initialize selected option
	useEffect(() => {
		const currentValue = getValues(name as unknown as Path<T>);
		if (currentValue) {
			const option = array.find((item) => item.key === currentValue);
			if (option) selectedOption.value = option;
		}
	}, [array, getValues, name, value]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				selectRef.current &&
				!selectRef.current.contains(event.target as Node)
			) {
				isOpen.value = false;
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSelect = (option: { value: string; key: unknown }) => {
		selectedOption.value = option;
		// biome-ignore lint/suspicious/noExplicitAny: false positive
		setValue(name as unknown as Path<T>, option.key as any, {
			shouldValidate: true,
		});
		isOpen.value = false;
	};
	const nameCustom = `${name as string}-${Math.random().toString(32)}`;

	return (
		<div class="flex flex-col  gap-1" ref={selectRef} {...rest}>
			{title && (
				<label
					htmlFor={nameCustom as string}
					class="block text-sm font-bold text-foreground text-secondary-dark! capitalize"
				>
					{title}
					{rest.required ? <span class="text-primary">*</span> : ""}
				</label>
			)}

			<div class="relative">
				{/* Input trigger */}
				<div
					class={cn(
						"w-full py-1 px-2 rounded-lg border border-gray-400 text-foreground",
						disabled ? "bg-muted/30 cursor-not-allowed" : "bg-background",
						"focus:outline-none focus:ring-2 focus:ring-primary focus:border-ring/30",
						"transition-all duration-200 cursor-pointer",
						isFocused.value && "bg-accent/50",
						!!Object.keys(err).length &&
							"border-destructive! focus:ring-destructive/20! focus:border-destructive!",
						isLoading && "opacity-50 cursor-not-allowed bg-muted/30",
						className,
					)}
					onClick={() => {
						if (!isLoading) isOpen.value = !isOpen.value;
					}}
					onFocus={() => {
						isFocused.value = true;
					}}
					onBlur={() => {
						isFocused.value = false;
					}}
				>
					{ico && (
						<div
							class={cn(
								"absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-muted-foreground  rounded-l-lg bg-primary z-1 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:fill-white",
							)}
						>
							{ico}
						</div>
					)}

					<div
						class={`flex justify-between items-center py-0.5 ${
							ico ? "pl-4" : ""
						}`}
					>
						<span
							class={cn(
								"text-sm line-clamp-1 text-start!",
								selectedOption.value ? "" : "text-muted-foreground",
							)}
						>
							{selectedOption.value ? selectedOption.value.value : placeholder}
						</span>

						<ChevronDown
							className={cn(
								"w-3 h-3 transition-transform duration-200",
								isOpen.value && !disabled ? "rotate-180" : "",
							)}
						/>
					</div>
				</div>

				{/* Dropdown menu */}
				{isOpen.value && !disabled && (
					<div class="absolute z-10 w-full mt-1 bg-background border border-input rounded-lg shadow-lg max-h-60 overflow-auto">
						{/* Options list */}
						{array.length > 0 ? (
							<ul>
								{array.map((option) => (
									<li
										key={String(option.key)}
										class={`px-4 py-1 cursor-pointer   ${
											selectedOption.value?.key === option.key
												? "bg-primary text-white"
												: "hover:text-primary"
										}`}
										onClick={() => handleSelect(option)}
									>
										{option.value}
									</li>
								))}
							</ul>
						) : (
							<div class="px-4 py-2 text-muted-foreground text-sm">
								No se encontraron resultados
							</div>
						)}
					</div>
				)}

				{question && (
					<div class="absolute right-10 top-1/2 -translate-y-1/2 group">
						<i class="fa-solid fa-circle-question text-xs text-muted-foreground" />
						<div class="text-xs min-w-[100px] hidden group-hover:block -top-[35px] right-1 p-1 shadow text-center absolute rounded-md bg-background text-foreground z-10 font-semibold">
							{question}
						</div>
					</div>
				)}

				{/* Hidden input for form registration */}
				<input
					type="hidden"
					{...register(name as unknown as Path<T>, options)}
				/>
			</div>

			{isLoading && (
				<div class="w-full h-[2px] relative overflow-hidden">
					<div class="absolute top-0 left-0 h-full w-full bg-primary/20">
						<div class="absolute h-full bg-primary animate-[loading_2s_infinite] w-full" />
					</div>
				</div>
			)}
			{
				Object.keys(err).length ? (
					<p className="text-sm text-destructive flex items-center gap-1">
						{err?.message}
					</p>
				) : null
				// <span class="h-5 w-full block" />
			}
		</div>
	);
}
export function formSelectNumber(value: string) {
	return Number(value) > 0 ? Number(value) : null;
}
export default WebFormSelect;
