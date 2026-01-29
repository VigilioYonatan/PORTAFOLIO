import { sizeIcon } from "@infrastructure/utils/client";
import { RefreshCw } from "lucide-preact";
import { useContext } from "preact/hooks";
import Button from "../extras/button";
import { VigilioTableContext } from "./vigilio-table";

function Refetch() {
	const tableContext = useContext(VigilioTableContext);

	if (!tableContext) {
		return null;
	}

	const table = tableContext;

	if (table.pagination.value.total === 0) return null;
	return (
		<Button
			aria-label="refetch"
			type="button"
			className="bg-primary md:w-[190px] flex justify-center items-center rounded-xl cursor-pointer gap-2"
			onClick={async () => {
				await table.query.refetch(true);
			}}
		>
			<RefreshCw
				className={`text-white ${table.query.isFetching ? "animate-spin" : ""}`}
				{...sizeIcon.medium}
			/>{" "}
			<span class="hidden md:block text-white text-sm">
				{table.query.isFetching ? "Refrescando..." : "Refrescar"}
			</span>
		</Button>
	);
}

export default Refetch;
