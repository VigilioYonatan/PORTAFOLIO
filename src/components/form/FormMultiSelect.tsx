import { cn, sizeIcon } from "@infrastructure/utils/client";
import { useSignal } from "@preact/signals";
import { Check, ChevronDown, CircleHelp, X } from "lucide-preact";
import type { HTMLAttributes } from "preact";
import { useContext, useEffect, useRef } from "preact/hooks";
import type { JSX } from "preact/jsx-runtime";
import type {
	FieldValues,
	Path,
	RegisterOptions,
	UseFormReturn,
} from "react-hook-form";
import { anidarPropiedades } from ".";
import { FormControlContext } from "./Form";

export interface FormMultiSelectProps<T extends object>
	extends Omit<HTMLAttributes<HTMLDivElement>, "name"> {
	title: string;
	name: Path<T>;
	question?: JSX.Element | JSX.Element[] | string;
	options?: RegisterOptions<T, Path<T>>;
	placeholder: string;
	ico?: JSX.Element | JSX.Element[];
	isLoading?: boolean;
	array: { value: string; key: unknown }[];
	className?: string;
	disabled?: boolean;
	required?: boolean;
}

export function FormMultiSelect<T extends object>({
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
}: FormMultiSelectProps<T>) {
	const {
		register,
		setValue,
		getValues,
		formState: { errors },
	} = useContext<UseFormReturn<T, unknown, FieldValues>>(FormControlContext);
	const isOpen = useSignal(false);
	// Store selected keys
	const selectedKeys = useSignal<unknown[]>([]);

	// Derived state for display
	const selectedOptions = array.filter((item) =>
		selectedKeys.value.includes(item.key),
	);

	const selectRef = useRef<HTMLDivElement>(null);
	const isFocused = useSignal(false);

	const err = anidarPropiedades(errors, (name as string).split("."));

	// Initialize selected options
	useEffect(() => {
		const currentValue = getValues(name as unknown as Path<T>);
		if (Array.isArray(currentValue)) {
			selectedKeys.value = currentValue;
		}
	}, [getValues, name]);

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

	const handleSelect = (key: unknown) => {
		let newKeys = [...selectedKeys.value];
		if (newKeys.includes(key)) {
			newKeys = newKeys.filter((k) => k !== key);
		} else {
			newKeys.push(key);
		}
		selectedKeys.value = newKeys;

		// biome-ignore lint/suspicious/noExplicitAny: library type mismatch workaround
		setValue(name as unknown as Path<T>, newKeys as any, {
			shouldValidate: true,
		});
		// Keep open for multiple selection comfort? Or close? Users usually expect it to stay open or have checkmarks.
		// Let's keep it open.
	};

	const removeOption = (e: MouseEvent, key: unknown) => {
		e.stopPropagation();
		const newKeys = selectedKeys.value.filter((k) => k !== key);
		selectedKeys.value = newKeys;
		// biome-ignore lint/suspicious/noExplicitAny: library type mismatch workaround
		setValue(name as unknown as Path<T>, newKeys as any, {
			shouldValidate: true,
		});
	};

	const nameCustom = `${name as string}-${Math.random().toString(32)}`;

	return (
		<div class="space-y-2 w-full" ref={selectRef} {...rest}>
			{title && (
				<label
					htmlFor={nameCustom as string}
					class="block text-sm font-semibold text-foreground capitalize"
				>
					{title}
					{rest.required ? <span class="text-primary">*</span> : ""}
				</label>
			)}

			<div class="relative">
				{/* Input trigger */}
				<div
					class={cn(
						"w-full py-2 border border-input rounded-[var(--radius-lg)] text-foreground",
						"focus:outline-none focus:ring-2 focus:ring-primary focus:border-ring/30",
						"transition-all duration-200 cursor-pointer text-sm",
						"backdrop-blur-sm",
						isFocused.value && "bg-accent/50",
						!!Object.keys(err).length &&
							"border-destructive! focus:ring-destructive/20! focus:border-destructive!",
						isLoading && "opacity-50 cursor-not-allowed bg-muted/30",
						ico ? "pl-12 pr-2" : "px-4",
						className,
						"min-h-[42px] h-auto flex flex-wrap gap-1",
					)}
					onClick={() => {
						if (!isLoading && !disabled) isOpen.value = !isOpen.value;
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
								"absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-muted-foreground  rounded-l-[var(--radius-lg)]  z-1 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:fill-foreground",
							)}
						>
							{ico}
						</div>
					)}

					<div
						class={`flex justify-between items-center w-full py-0.5 ${
							ico ? "pl-4" : ""
						} ${disabled ? "bg-muted cursor-not-allowed " : ""}`}
					>
						{/* Selected Tags */}
						<div class="flex flex-wrap gap-1 flex-1">
							{selectedOptions.length > 0 ? (
								selectedOptions.map((option) => (
									<span
										key={String(option.key)}
										class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
									>
										{option.value}
										<button
											type="button"
											onClick={(e) => removeOption(e, option.key)}
											class="ml-1 hover:text-destructive focus:outline-none"
										>
											<X class="w-3 h-3" />
										</button>
									</span>
								))
							) : (
								<span class="text-muted-foreground">{placeholder}</span>
							)}
						</div>

						<ChevronDown
							class={cn(
								"w-3 h-3 transition-transform duration-200 ml-2 shrink-0",
								isOpen.value && !disabled ? "rotate-180" : "",
							)}
						/>
					</div>
				</div>

				{/* Dropdown menu */}
				{isOpen.value && !disabled && (
					<div class="absolute z-10 w-full mt-1 border border-input rounded-[var(--radius-lg)] shadow-lg max-h-60 overflow-auto bg-popover animate-in fade-in zoom-in-95 duration-100">
						{/* Options list */}
						{array.length > 0 ? (
							<ul>
								{array.map((option) => {
									const isSelected = selectedKeys.value.includes(option.key);
									return (
										<li
											key={String(option.key)}
											class={cn(
												"px-4 py-2 cursor-pointer transition-colors text-sm flex items-center justify-between group",
												isSelected
													? "bg-primary/5 text-primary font-medium"
													: "text-foreground hover:bg-accent dark:hover:bg-accent/50",
											)}
											onClick={() => handleSelect(option.key)}
										>
											<span>{option.value}</span>
											{isSelected && <Check class="w-4 h-4 text-primary" />}
										</li>
									);
								})}
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
						<CircleHelp {...sizeIcon.small} class="text-muted-foreground" />
						<div class="text-xs min-w-[100px] hidden group-hover:block -top-[35px] right-1 p-1 shadow text-center absolute rounded-[var(--radius-lg)] text-popover-foreground z-10 font-semibold bg-popover border border-input">
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
			{Object.keys(err).length ? (
				<p class="text-xs text-destructive flex items-center gap-1 mt-1">
					{err?.message}
				</p>
			) : null}
		</div>
	);
}

export default FormMultiSelect;
