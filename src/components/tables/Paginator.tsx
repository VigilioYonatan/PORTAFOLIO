import Loader from "@components/extras/Loader";
import { useContext } from "preact/hooks";
import { VigilioTableContext } from "./VigilioTable";

function Paginator() {
	const table = useContext(VigilioTableContext);
	if (table.pagination.totalPages < 2) return null;
	return (
		<div class="flex flex-col gap-2 items-center">
			<div class="flex space-x-2">
				<button
					onClick={() => table.pagination.onBackPage()}
					class="text-2xl text-primary"
					type="button"
					aria-label="button previous table"
				>
					&laquo;
				</button>
				{table.pagination.paginator.pages.map((page) => (
					<div class="flex items-center" key={page}>
						{table.pagination.paginator.currentPage === page ? (
							<span class="px-3 py-1 border border-primary rounded bg-primary text-primary-foreground">
								{page}
							</span>
						) : (
							<button
								type="button"
								class="px-3 py-1 text-primary bg-background border border-primary rounded hover:bg-primary hover:text-primary-foreground"
								aria-label="button change page table"
								onClick={() => table.pagination.onChangePage(page)}
							>
								{page}
							</button>
						)}
					</div>
				))}

				<button
					onClick={() => table.pagination.onNextPage()}
					class="text-2xl text-primary"
					type="button"
					aria-label="button next page table"
				>
					&raquo;
				</button>
			</div>
			{table.query.isFetching ? (
				<div class="flex items-center justify-center gap-2 text-xs text-muted-foreground">
					<Loader />
					Cargando...
				</div>
			) : (
				<div class="h-[3px]" />
			)}
		</div>
	);
}

export default Paginator;
