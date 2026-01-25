import { cn } from "@infrastructure/utils/client";
import { useContext } from "preact/hooks";
import type { JSX } from "preact/jsx-runtime";
import { type TableContext, VigilioTableContext } from "./VigilioTable";

interface TableProps {
	className?: string;
	children: JSX.Element | JSX.Element[];
	minHeight?: string;
}

function Table({
	className = "text-sm text-left  w-full",
	children,
	minHeight = "0px",
}: TableProps) {
	const table = useContext(VigilioTableContext);
	if (table.query.isSuccess) {
		return (
			<div
				class="w-full overflow-x-auto rounded-none rounded-t-xl"
				style={{ minHeight }}
			>
				<table class={className}>{children}</table>
			</div>
		);
	}
	return <TableLoading table={table} />;
}
interface TableLoadingProps<
	T extends object,
	K extends string,
	Y extends object,
> {
	table: TableContext<T, K, Y>;
}
export function TableLoading<
	T extends object,
	K extends string,
	Y extends object,
>({ table }: TableLoadingProps<T, K, Y>) {
	return (
		<div class="w-full ">
			<div class=" animate-pulse flex flex-col gap-6 w-full ">
				<table class="w-full ">
					<thead>
						<tr class="border-b border-border">
							{Array.from({
								length: table.table.Thead().length,
							}).map((_, index) => (
								<th class="px-4 py-3 text-left" key={index}>
									<div class="h-6 min-w-[60px] bg-muted rounded" />
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{Array.from({
							length: table.pagination.value.limit,
						}).map((_, index) => (
							<tr class="border-b border-border" key={index}>
								{Array.from({
									length: table.table.Thead().length,
								}).map((_, index) => (
									<td class="px-4 py-4" key={index}>
										<div class="h-6 min-w-[60px] bg-muted rounded w-full animate-pulse" />
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
export default Table;
