import Badge from "@components/extras/badge";
import Loader from "@components/extras/loader";
import {
	type PaginatorResult,
	type PaginatorResultError,
} from "@infrastructure/types/client";
import { cn } from "@infrastructure/utils/client";
import type { UseQuery } from "@vigilio/preact-fetching";
import type { UsePaginator } from "@vigilio/preact-paginator";
import { CheckCircle2, FileText, Search, X } from "lucide-preact";
import type { Path } from "react-hook-form";
import {
	type SavedSearchItem,
	useFormArray,
} from "../../form-array/hooks/use-form-array.hook";

export interface FormDocumentArrayProps<X extends object, T extends object> {
	title: string;
	name: Path<X>;
	paginator: UsePaginator;
	query: UseQuery<PaginatorResult<T>, PaginatorResultError>;
	onValue: (
		value: T,
	) => SavedSearchItem & { status?: string; file_size?: number };
	placeholder?: string;
	max?: number;
	disabled?: boolean;
	className?: string;
	required?: boolean;
}

/**
 * FormDocumentArray - Multi-select con diseño de cards de documentos
 * Usa useFormArray internamente para integración con react-hook-form
 */
export function FormDocumentArray<X extends object, T extends object>({
	name,
	title,
	paginator,
	query,
	onValue,
	placeholder = "Buscar documentos...",
	max,
	disabled,
	className,
	required,
}: FormDocumentArrayProps<X, T>) {
	const {
		isFocused,
		savedSearches,
		showSuggestions,
		handleSearchChange,
		handleSelectSuggestion,
		handleRemoveItem,
		err,
		valueFormated,
	} = useFormArray({
		name,
		paginator,
		query,
		isUnique: false,
		max,
		onValue,
	});

	const nameId = `${name}-${Math.random().toString(32)}`;

	// Map data with extra fields for cards
	const dataWithMeta =
		query.data?.results
			.map(onValue)
			.filter((val) => !valueFormated.includes(val.id as never)) ?? [];

	return (
		<div class={cn("space-y-3 w-full", className)}>
			{title && (
				<label
					class="block text-sm font-semibold text-foreground"
					htmlFor={`${nameId}-search`}
				>
					{title} {required ? <span class="text-primary">*</span> : ""}
				</label>
			)}

			{/* Search Input */}
			<div class="relative">
				<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
				<input
					id={`${nameId}-search`}
					type="text"
					value={paginator.search.value}
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
					placeholder={placeholder}
					class={cn(
						"w-full text-sm pl-9 pr-4 py-2 bg-background border border-input rounded-md",
						"focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
						isFocused.value && "bg-accent/50",
						!!Object.keys(err).length &&
							"border-destructive! focus:ring-destructive/20!",
						disabled && "opacity-50 cursor-not-allowed bg-muted/30",
					)}
					disabled={
						query.isFetching ||
						query.isLoading ||
						(max && valueFormated.length >= max) ||
						disabled ||
						false
					}
				/>
				{(query.isFetching || query.isLoading) && (
					<div class="absolute right-3 top-1/2 -translate-y-1/2">
						<Loader />
					</div>
				)}
			</div>

			{/* Suggestions Dropdown */}
			{showSuggestions.value && dataWithMeta.length > 0 && (
				<div class="border border-border rounded-lg bg-popover shadow-lg max-h-60 overflow-y-auto">
					{dataWithMeta.map((item) => (
						<button
							key={String(item.id)}
							type="button"
							onClick={() => handleSelectSuggestion(item)}
							class="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center justify-between"
						>
							<span class="truncate">{item.value}</span>
							{item.status && (
								<Badge
									variant={
										item.status === "READY"
											? "success"
											: item.status === "FAILED"
												? "destructive"
												: "secondary"
									}
									className="px-1.5 py-0.5 text-[10px] ml-2"
								>
									{item.status}
								</Badge>
							)}
						</button>
					))}
				</div>
			)}

			{/* Selected Documents Grid (Card Design) */}
			<div class="border border-border rounded-lg bg-muted/20 p-2 min-h-[100px] max-h-[300px] overflow-y-auto">
				{savedSearches.value.length === 0 ? (
					<div class="flex flex-col items-center justify-center py-8 text-muted-foreground text-center">
						<FileText class="w-8 h-8 opacity-50 mb-2" />
						<p class="text-sm">No hay documentos seleccionados</p>
						<p class="text-xs mt-1">Busca y selecciona documentos arriba</p>
					</div>
				) : (
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
						{savedSearches.value.map((item) => {
							const meta = query.data?.results
								.map(onValue)
								.find((d) => d.id === item.id);
							return (
								<div
									key={String(item.id)}
									class="group relative flex items-start gap-3 p-3 rounded-lg border bg-primary/5 border-primary shadow-sm"
								>
									<div class="mt-0.5 shrink-0 text-primary">
										<CheckCircle2 class="w-5 h-5" />
									</div>
									<div class="flex-1 min-w-0">
										<p class="text-sm font-medium truncate leading-tight mb-1 text-primary">
											{item.value}
										</p>
										<div class="flex items-center gap-2 text-xs text-muted-foreground">
											{meta?.status && (
												<Badge
													variant={
														meta.status === "READY"
															? "success"
															: meta.status === "FAILED"
																? "destructive"
																: "secondary"
													}
													className="px-1.5 py-0.5 text-[10px]"
												>
													{meta.status}
												</Badge>
											)}
											{meta?.file_size && (
												<>
													<span>•</span>
													<span>
														{(meta.file_size / 1024 / 1024).toFixed(1)} MB
													</span>
												</>
											)}
										</div>
									</div>
									{/* Remove button */}
									<button
										type="button"
										onClick={() => handleRemoveItem(item.id)}
										class="absolute -top-1.5 -right-1.5 rounded-full w-5 h-5 flex justify-center items-center bg-destructive text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
										aria-label="Eliminar"
									>
										<X class="w-3 h-3" />
									</button>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Error message */}
			{Object.keys(err).length ? (
				<p class="text-xs text-destructive flex items-center gap-1">
					{err?.message}
				</p>
			) : null}
		</div>
	);
}

export default FormDocumentArray;
