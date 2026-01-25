import type {
	PaginatorResult,
	PaginatorResultError,
} from "@infrastructure/types/client";
import { cn, sizeIcon } from "@infrastructure/utils/client";
import type { UseQuery } from "@vigilio/preact-fetching";
import type { UsePaginator } from "@vigilio/preact-paginator";
import { Search } from "lucide-preact";
import type { JSX } from "preact";
import type { Path } from "react-hook-form";
import Loader from "../../../extras/Loader";
import {
	type SavedSearchItem,
	useFormArray,
} from "../hooks/use-form-array.hook";

export interface FormArrayProps<X extends object, T extends object> {
	title: string;
	name: Path<X>;
	paginator: UsePaginator;
	query: UseQuery<PaginatorResult<T>, PaginatorResultError>;
	onValue: (value: T) => SavedSearchItem;
	onChange?: (value: string) => void;
	placeholder?: string;
	max?: number;
	isUnique?: boolean;
	disabled?: boolean;
	defaultValue?: string;
	className?: string;
	ico?: JSX.Element | JSX.Element[];
	required?: boolean;
}

// biome-ignore lint/complexity/noBannedTypes: Legacy support
export function FormArray<X extends object, T extends object = {}>({
	name,
	title,
	paginator,
	query,
	onValue,
	onChange,
	placeholder,
	max,
	isUnique,
	disabled,
	defaultValue,
	className,
	ico,
	required,
}: FormArrayProps<X, T>) {
	const {
		isFocused,
		savedSearches,
		showSuggestions,
		handleSearchChange,
		handleSelectSuggestion,
		handleRemoveItem,
		hasSearches,
		data,
		err,
		valueFormated,
		searchValue,
	} = useFormArray({
		name,
		paginator,
		query,
		isUnique,
		max,
		onValue,
		onChange,
		defaultValue,
	});

	const nameId = `${name}-${Math.random().toString(32)}`;

	return (
		<div class={cn("space-y-2 w-full", className)}>
			{title && (
				<label
					class="block text-sm font-light text-foreground"
					htmlFor={`${nameId}-search`}
				>
					{title} {required ? <span class="text-primary">*</span> : ""}
				</label>
			)}

			<div class="relative">
				<div class="flex relative items-center gap-2">
					{ico ? (
						<div
							class={cn(
								"absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-muted-foreground  rounded-l-[var(--radius-lg)] bg-primary z-1 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:fill-white",
							)}
						>
							{ico}
						</div>
					) : (
						<button
							type="button"
							class={cn(
								"absolute left-2 text-muted-foreground hover:text-primary transition-colors",
								disabled && "opacity-50 cursor-not-allowed",
							)}
							disabled={disabled}
						>
							<Search {...sizeIcon.medium} />
						</button>
					)}

					{/** biome-ignore lint/a11y/useAriaPropsSupportedByRole: Legacy support */}
					<input
						id={`${nameId}-search`}
						type="text"
						value={searchValue}
						onChange={handleSearchChange}
						onFocus={() => {
							showSuggestions.value = true;
							isFocused.value = true;
						}}
						onBlur={() =>
							setTimeout(() => {
								showSuggestions.value = false;
							}, 200)
						}
						placeholder={placeholder || ""}
						class={cn(
							"flex-1 py-2 border border-input rounded-[var(--radius-lg)] text-foreground placeholder-muted-foreground",
							"focus:outline-none focus:ring-2 focus:ring-primary focus:border-ring/30",
							"transition-all duration-200",
							"backdrop-blur-sm pl-10",
							isFocused.value && "bg-accent/50",
							!!Object.keys(err).length &&
								"border-destructive! focus:ring-destructive/20! focus:border-destructive!",
							disabled && "opacity-50 cursor-not-allowed bg-muted/30",
							ico ? "pr-6 pl-14" : "px-4",
						)}
						aria-haspopup="listbox"
						aria-expanded={showSuggestions.value}
						disabled={
							query.isFetching ||
							query.isLoading ||
							(max && valueFormated.length >= max) ||
							disabled ||
							false
						}
					/>
					{query.isFetching || query.isLoading ? <Loader /> : null}
				</div>

				{/* Lista de sugerencias */}
				{showSuggestions.value && data && data?.length > 0 && (
					<div class="absolute z-20 mt-1 w-full border border-input rounded-[var(--radius-lg)] shadow-lg max-h-60 overflow-y-auto bg-background">
						<ul class="divide-y divide-input">
							{data?.map((props: SavedSearchItem) => (
								<li key={String(props.id)}>
									<button
										onClick={() => handleSelectSuggestion(props)}
										type="button"
										class={cn(
											"px-4 py-2 w-full text-left text-foreground text-sm",
											"hover:bg-accent focus:bg-accent transition-colors duration-150",
											"flex items-center gap-2",
										)}
									>
										{props.value}
									</button>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>

			{/* Búsquedas guardadas */}
			{hasSearches.value && (
				<div class="mt-2">
					<div class="max-h-[200px] overflow-y-auto p-1">
						<ul class="flex flex-wrap gap-2">
							{savedSearches.value.map((item) => (
								<li
									key={String(item.id)}
									class={cn(
										"py-1.5 px-3 rounded-[var(--radius-lg)] shadow-sm flex items-center gap-2",
										"bg-background text-foreground border border-input",
										"relative pr-6 group",
									)}
								>
									<span
										class="text-sm line-clamp-1 max-w-[200px]"
										title={item.value}
									>
										{item.value}
									</span>
									<button
										type="button"
										onClick={() => handleRemoveItem(item.id)}
										class={cn(
											"absolute -top-1.5 -right-1.5 rounded-[var(--radius-lg)] w-5 h-5 flex justify-center items-center shadow-sm",
											"bg-destructive text-white text-xs",
											"opacity-0 group-hover:opacity-100 transition-opacity",
											"hover:bg-destructive/90",
										)}
										aria-label="Remove item"
									>
										<span class="mb-0.5">×</span>
									</button>
								</li>
							))}
						</ul>
					</div>
				</div>
			)}

			{Object.keys(err).length ? (
				<p class="text-xs text-destructive flex items-center gap-1 mt-1">
					{err?.message}
				</p>
			) : (
				<span class="h-3 block w-full" />
			)}
		</div>
	);
}

// export default FormArray;
