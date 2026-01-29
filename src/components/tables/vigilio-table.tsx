import type { UseQuery } from "@vigilio/preact-fetching";
import type { UseTable } from "@vigilio/preact-table";
import { createContext } from "preact";
import type { JSX } from "preact/jsx-runtime";

export type TableContext<
	T extends object,
	K extends string,
	Y extends object,
> = UseTable<T, K, Y> & {
	refetch: (clean?: boolean) => void;
	isFetching: boolean | null;
	query: UseQuery<
		// biome-ignore lint/suspicious/noExplicitAny: Variance issue with generic queries
		any,
		unknown
	>;
};
export const vigilioTableContext = <
	T extends Record<string, any>,
	K extends string,
	Y extends object = object,
>() => {
	return createContext<TableContext<T, K, Y> | null>(null);
};
export const VigilioTableContext = vigilioTableContext();
export type FilterTable = {
	search: {
		value: string;
		debounce: string;
	};
	filters: Record<string, unknown>;
};
interface VigilioTableProps<
	T extends Record<string, any>,
	K extends string,
	Y extends object,
> {
	query: UseQuery<
		// biome-ignore lint/suspicious/noExplicitAny: Variance issue with generic queries
		any,
		unknown
	>;
	table: UseTable<T, K, Y>;
	children: JSX.Element | JSX.Element[];
	className?: string;
}
function VigilioTable<
	T extends Record<string, any>,
	K extends string,
	Y extends object,
>({ query, table, children }: VigilioTableProps<T, K, Y>) {
	return (
		<VigilioTableContext.Provider
			value={{
				// biome-ignore lint/suspicious/noExplicitAny: Library type mismatch for keyof T
				...(table as any),
				refetch: query.refetch,
				isFetching: query.isLoading,
				query,
			}}
		>
			<div class="rounded-xl overflow-hidden bg-card text-card-foreground border border-border shadow-sm w-full p-6">
				{children}
			</div>
		</VigilioTableContext.Provider>
	);
}

export default VigilioTable;
