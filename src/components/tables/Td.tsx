import { useContext } from "preact/hooks";
import { VigilioTableContext } from "./VigilioTable";

interface TdProps<T extends object> {
	data: T;
	className?: string;
}
function Td<T extends object>({
	data,
	className = "px-2 lg:py-2 whitespace-nowrap font-medium text-sm text-foreground align-middle",
}: TdProps<T>) {
	const table = useContext(VigilioTableContext);

	return (
		<>
			{table.table.TBody.Cell(data).map(({ key, value }) => {
				return (
					<td class={className} key={key}>
						{value ?? "No se ingresó"}
					</td>
				);
			})}
		</>
	);
}

export default Td;
