import { cn, sizeIcon } from "@infrastructure/utils/client";
import { useSignal } from "@preact/signals";
import { ChevronDown, CircleHelp } from "lucide-preact";
import { useEffect, useRef } from "preact/hooks";
import type { JSX } from "preact/jsx-runtime";
import type { Path } from "react-hook-form";

interface FormSelectNoFormProps<T extends object>
	extends Omit<JSX.IntrinsicElements["div"], "name" | "value" | "onChange"> {
	title: string;
	name: Path<T>;
	value: string | number | undefined;
	question?: JSX.Element | JSX.Element[] | string;
	placeholder: string;
	ico?: JSX.Element | JSX.Element[];
	isLoading?: boolean;
	array: { value: string | JSX.Element | JSX.Element[]; key: unknown }[];
	className?: string;
	disabled?: boolean;
	onChange?: (value: string | number | undefined) => void;
	required?: boolean;
}

export function FormSelectNoForm<T extends object>({
	name,
	title,
	array,
	placeholder,
	isLoading = false,
	ico,
	question,
	className,
	disabled,
	value,
	required = false,
	onChange,
	...rest
}: FormSelectNoFormProps<T>) {
	const arraySelect = useSignal<{ value: string; key: unknown }[]>([]);
	const isOpen = useSignal<boolean>(false);
	const selectedOption = useSignal<{
		value: string;
		key: unknown;
	} | null>(null);
	const selectRef = useRef<HTMLDivElement>(null);
	const isFocused = useSignal<boolean>(false);
	const searchTerm = useSignal<string>("");

	useEffect(() => {
		arraySelect.value = array as { value: string; key: unknown }[];
	}, [array]);

	// Initialize selected option
	useEffect(() => {
		if (value !== undefined && value !== null) {
			const option = arraySelect.value.find((item) => item.key === value);
			if (option) selectedOption.value = option;
		} else {
			selectedOption.value = null;
		}
	}, [value, arraySelect.value]);

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
		if (onChange) {
			onChange(option.key as string | number | undefined);
		}
		isOpen.value = false;
	};
	const nameId = `${name}-${Math.random().toString(32)}`;

	return (
		<div class="space-y-2 w-full" ref={selectRef} {...rest}>
			{title && (
				<label
					htmlFor={nameId as string}
					class="block text-sm font-light text-foreground"
				>
					{title}
					{required ? <span class="text-primary">*</span> : ""}
				</label>
			)}

			<div class="relative">
				{/* Input trigger */}
				<div
					class={cn(
						"w-full py-2 border border-input rounded-[var(--radius-lg)] text-foreground min-w-[150px] text-sm",
						disabled ? "bg-muted/30 cursor-not-allowed" : "",
						"focus:outline-none focus:ring-2 focus:ring-primary focus:border-ring/30",
						"transition-all duration-200 cursor-pointer",
						"backdrop-blur-sm",
						isFocused.value && "bg-accent/50",
						isLoading && "opacity-50 cursor-not-allowed bg-muted/30",
						ico ? "pl-12 pr-2" : "px-4",
						className,
					)}
					onClick={() => {
						if (!isLoading && !disabled) {
							isOpen.value = !isOpen.value;
							searchTerm.value = ""; // Reset search on toggle
						}
					}}
					onFocus={() => {
						isFocused.value = true;
					}}
					onBlur={() => {
						isFocused.value = false;
					}}
				>
					{ico && (
						<div class="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-muted-foreground rounded-l-[var(--radius-lg)] fill-primary z-1 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:fill-primary">
							{ico}
						</div>
					)}

					<div class="flex justify-between items-center py-0.5">
						<span
							class={cn(
								"text-sm line-clamp-1 flex items-center gap-2",
								selectedOption.value ? "" : "text-muted-foreground",
							)}
						>
							{selectedOption.value ? selectedOption.value.value : placeholder}
						</span>

						<ChevronDown
							class={cn(
								"w-3 h-3 transition-transform duration-200",
								isOpen.value && !disabled ? "rotate-180" : "",
							)}
						/>
					</div>
				</div>

				{/* Dropdown menu */}
				{isOpen.value && !disabled && (
					<div class="absolute z-10 w-full min-w-[200px] mt-1 bg-background border border-input rounded-[var(--radius-lg)] shadow-lg max-h-60 overflow-auto">
						{/* Search Input */}
						<div class="p-2 sticky top-0 bg-background z-10 border-b border-input">
							<input
								type="text"
								class="w-full px-2 py-1 text-sm border border-input rounded-[var(--radius-lg)] focus:outline-none focus:ring-1 focus:ring-primary"
								placeholder="Buscar..."
								value={searchTerm.value}
								onInput={(e) => {
									searchTerm.value = e.currentTarget.value;
								}}
								onClick={(e) => e.stopPropagation()}
							/>
						</div>
						{/* Options list */}
						{arraySelect.value.filter(
							(item) =>
								typeof item.value === "string" &&
								item.value
									.toLowerCase()
									.includes(searchTerm.value.toLowerCase()),
						).length > 0 ? (
							<ul>
								{arraySelect.value
									.filter((option) =>
										typeof option.value === "string"
											? option.value
													.toLowerCase()
													.includes(searchTerm.value.toLowerCase())
											: // If value is JSX (e.g. icon + text), we might need a text equivalent or ignore filtering for now if complex.
												// Assuming mostly strings for now based on usage.
												// If it is JSX, we might fallback to not filtering or try to extract text.
												// For now, let's assume if it is NOT string, include it (or handle gracefully).
												true,
									)
									.map((option) => (
										<li
											key={String(option.key)}
											class={`px-4 py-2 cursor-pointer ${
												selectedOption.value?.key === option.key
													? "bg-primary text-white [&>div>svg]:fill-white!"
													: "hover:text-primary  hover:fill-primary"
											} flex items-center gap-2 `}
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
						<CircleHelp {...sizeIcon.small} class="text-muted-foreground" />
						<div class="text-xs min-w-[100px] hidden group-hover:block -top-[35px] right-1 p-1 shadow text-center absolute rounded-[var(--radius-lg)] bg-background text-foreground z-10 font-semibold">
							{question}
						</div>
					</div>
				)}
			</div>

			{isLoading && (
				<div class="w-full h-[2px] relative overflow-hidden">
					<div class="absolute top-0 left-0 h-full w-full bg-primary/20">
						<div class="absolute h-full bg-primary animate-[loading_2s_infinite] w-full" />
					</div>
				</div>
			)}
		</div>
	);
}

// export default FormSelectNoForm;
