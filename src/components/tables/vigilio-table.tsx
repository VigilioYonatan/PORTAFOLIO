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
		// biome-ignore lint/suspicious/noExplicitAny: Legacy support
		any,
		unknown
	>;
};
export const vigilioTableContext = <
	T extends object,
	K extends string,
	// biome-ignore lint/suspicious/noExplicitAny: Legacy support
	Y extends object = any,
>() => {
	return createContext({} as TableContext<T, K, Y>);
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
	T extends object,
	K extends string,
	Y extends object,
> {
	query: UseQuery<
		// biome-ignore lint/suspicious/noExplicitAny: Legacy support
		any,
		unknown
	>;
	table: UseTable<T, K, Y>;
	children: JSX.Element | JSX.Element[];
	className?: string;
}
function VigilioTable<T extends object, K extends string, Y extends object>({
	query,
	table,
	children,
}: VigilioTableProps<T, K, Y>) {
	return (
		<VigilioTableContext.Provider
			value={{
				// biome-ignore lint/suspicious/noExplicitAny: Legacy support
				...(table as any),
				refetch: query.refetch,
				query,
			}}
		>
			<div class="rounded-xl overflow-hidden bg-card text-card-foreground border border-border shadow-sm w-full">
				{children}
			</div>
		</VigilioTableContext.Provider>
	);
}

export default VigilioTable;
