import type {
	PaginatorResult,
	PaginatorResultError,
} from "@infrastructure/types/client";
import { useComputed, useSignal } from "@preact/signals";
import type { UseQuery } from "@vigilio/preact-fetching";
import type { UsePaginator } from "@vigilio/preact-paginator";
import type { TargetedEvent } from "preact";
import { useContext, useEffect } from "preact/hooks";
import {
	type FieldValues,
	type Path,
	type PathValue,
	type UseFormReturn,
} from "react-hook-form";
import { anidarPropiedades, FormControlContext } from "../..";

export type SavedSearchItem = {
	id: unknown;
	value: string;
};

export interface UseFormArrayProps<X extends object, T extends object> {
	name: Path<X>;
	paginator: UsePaginator;
	query: UseQuery<PaginatorResult<T>, PaginatorResultError>;
	isUnique?: boolean;
	onValue: (value: T) => SavedSearchItem;
	max?: number;
	onChange?: (value: string) => void;
	defaultValue?: string;
}

export function useFormArray<X extends object, T extends object>({
	name,
	paginator,
	query,
	isUnique,
	max,
	onValue,
	onChange,
	defaultValue,
}: UseFormArrayProps<X, T>) {
	const isFocused = useSignal<boolean>(false);
	const savedSearches = useSignal<SavedSearchItem[]>([]);
	const showSuggestions = useSignal<boolean>(false);

	const {
		formState: { errors },
		setValue,
		watch,
	} = useContext<UseFormReturn<T, unknown, FieldValues>>(
		// biome-ignore lint/suspicious/noExplicitAny: Legacy support
		FormControlContext as any,
	);

	const err = anidarPropiedades(errors, (name as string).split("."));
	const value = watch(name as unknown as Path<T>);

	const valueFormated = (isUnique ? [value] : value || []).filter(Boolean);

	const handleSearchChange = (e: TargetedEvent<HTMLInputElement>) => {
		const val = (e.target as HTMLInputElement).value;
		paginator.search.onSearchByName(val);
		showSuggestions.value = true;
	};

	const addToSavedSearches = (props: SavedSearchItem) => {
		if (max && valueFormated.length >= max) {
			return;
		}
		setValue(
			name as unknown as Path<T>,
			isUnique
				? (props.id as PathValue<T, Path<T>>)
				: ([...(value || []), props.id] as PathValue<T, Path<T>>),
		);
		savedSearches.value = [...savedSearches.value, props];
		paginator.search.onSearchByName("");
	};

	const handleSelectSuggestion = (props: SavedSearchItem) => {
		paginator.search.onSearchByName("");
		showSuggestions.value = false;
		onChange?.(props.id as string);
		addToSavedSearches(props);
	};

	const handleRemoveItem = (id: unknown) => {
		savedSearches.value = savedSearches.value.filter((item) => item.id !== id);

		setValue(
			name as unknown as Path<T>,
			(isUnique
				? null
				: (valueFormated as number[]).filter(
						(item) => item !== id,
					)) as PathValue<T, Path<T>>,
		);
	};

	const hasSearches = useComputed(() => savedSearches.value.length > 0);

	useEffect(() => {
		if (max && valueFormated.length >= max) {
			return;
		}
		if (paginator.search.debounceTerm.length) {
			query.refetch(false);
		}
	}, [value, paginator.search.debounceTerm]);

	const data = query.data?.results
		.map(onValue)
		// biome-ignore lint/suspicious/noExplicitAny: Legacy support
		.filter((val: any) => !valueFormated.includes(val.id as never));

	const searchValue =
		defaultValue ||
		(isUnique && valueFormated.length
			? savedSearches.value.find((item) => item.id === value)?.value
			: paginator.search.value);

	return {
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
	};
}
