import { useContext } from "preact/hooks";
import type { JSX } from "preact/jsx-runtime";
import { VigilioTableContext } from "./vigilio-table";

interface TbodyRowProps<T extends object> {
	className?: string;
	handleClick?: (data: T) => void;
	children: (data: T) => JSX.Element | JSX.Element[];
	title: string | JSX.Element | JSX.Element[];
}
function TbodyRow<T extends object>({
	className = "hover:bg-primary/5 transition-colors h-[60px] border-border border-b text-foreground",
	handleClick,
	children,
	title,
}: TbodyRowProps<T>) {
	const tableContext = useContext(VigilioTableContext);

	if (!tableContext) {
		return null;
	}

	const table = tableContext;

	function onClick(data: T) {
		if (handleClick) {
			handleClick(data);
		}
	}

	return (
		<>
			{table.pagination.value.total === 0 ? (
				<tr class="w-full h-[300px]">
					<td
						colspan={table.table.Thead()[0].length}
						class="dark:text-white w-full text-center align-middle"
					>
						<div class="flex items-center justify-center">{title}</div>
					</td>
				</tr>
			) : (
				table.table.TBody.Row().map(({ ...data }) => (
					<tr
						class={className}
						onClick={() => onClick(data as T)}
						key={data.index}
					>
						{children(data as T)}
					</tr>
				))
			)}
		</>
	);
}

export default TbodyRow;
