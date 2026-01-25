import Button from "@components/extras/Button";
import { sizeIcon } from "@infrastructure/utils/client";
import { sweetAlert } from "@vigilio/sweet";
import { Search, Trash2 } from "lucide-preact";
import { useContext } from "preact/hooks";
import { VigilioTableContext } from "./VigilioTable";

interface ToolsProps {
	onRemoveAll?: (props: number[]) => void;
	hiddenInput?: boolean;
	hiddenDelete?: boolean;
	hiddenFetching?: boolean;
	placeholderSearch?: string;
}
function Tools({
	onRemoveAll,
	hiddenInput = false,
	hiddenDelete = false,
	hiddenFetching = false,
	placeholderSearch = "Buscar...",
}: ToolsProps) {
	const table = useContext(VigilioTableContext);

	function onRemove() {
		if (table.checks.isEmptyCheck()) {
			sweetAlert({
				icon: "info",
				title: "Seleccione que deseas borrar",
				timer: 10,
			});
			return;
		}
		if (onRemoveAll) {
			onRemoveAll(table.checks.value);
		}
	}
	return (
		<div class="flex ">
			{!hiddenInput ? (
				<div class="flex  gap-2 w-full md:w-[300px]">
					<search class="flex items-center border border-input gap-2 text-xs rounded-xl overflow-hidden text-foreground bg-background shadow-sm w-full focus-within:ring-2 focus-within:ring-ring focus-within:border-primary transition-all">
						<input
							class="outline-none bg-transparent w-full px-3 py-2 sm:text-sm font-normal placeholder:text-muted-foreground"
							onChange={(e) =>
								table.search.onSearchByName(e.currentTarget.value)
							}
							value={table.search.value}
							id="table-search-users"
							placeholder={placeholderSearch}
						/>
						<button
							class="bg-primary px-3 text-primary-foreground h-full flex items-center justify-center hover:bg-primary/90 transition-colors"
							type="button"
						>
							<Search width={18} height={18} />
						</button>
					</search>
				</div>
			) : null}
			{!hiddenDelete ? (
				<div class="flex gap-4 items-center mx-2">
					{table.pagination.value.total !== 0 ? (
						<Button
							class="text-destructive hover:bg-destructive/10"
							type="button"
							variant="outline"
							aria-label="delete many"
							onClick={onRemove}
						>
							<Trash2 {...sizeIcon.small} />
						</Button>
					) : null}
				</div>
			) : null}
			{!hiddenFetching ? (
				<div class="flex gap-4 items-center mx-2">
					{table.isFetching ? <span>Cargando...</span> : null}
				</div>
			) : null}
		</div>
	);
}

export default Tools;
