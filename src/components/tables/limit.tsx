import { useContext } from "preact/hooks";
import { VigilioTableContext } from "./vigilio-table";

function Limit() {
	const tableContext = useContext(VigilioTableContext);

	if (!tableContext) {
		return null;
	}

	const table = tableContext;

	if (table.pagination.value.total === 0) return null;
	return (
		<div class="flex items-center gap-2">
			<span class="text-sm dark:text-secondary-light text-secondary-dark">
				Limite:
			</span>
			<input
				placeholder={String(table.pagination.value.limit)}
				class="w-[80px] outline-none rounded-lg dark:text-secondary-light text-secondary-dark dark:bg-admin-terciary bg-paper-light py-1  shadow-sm border border-gray-200 dark:border-gray-600"
				onChange={(e) => {
					const value = Number(e.currentTarget.value);
					if (value < 1 || value > 100) return;
					table.pagination.onchangeLimit(value);
				}}
				type="number"
			/>
		</div>
	);
}

export default Limit;

