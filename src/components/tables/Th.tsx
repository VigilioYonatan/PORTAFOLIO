import { ArrowUpDown } from "lucide-preact";
import { useContext } from "preact/hooks";
import { VigilioTableContext } from "./VigilioTable";

interface ThProps {
	className?: string;
}
function Th({
	className = "px-2 py-4 font-medium tracking-wider cursor-pointer text-muted-foreground hover:text-foreground transition-colors",
}: ThProps) {
	const table = useContext(VigilioTableContext);

	return (
		<>
			{table.table.Thead().map((row, rowIndex) => (
				<tr key={rowIndex} className="border-b border-border">
					{row.map(
						// biome-ignore lint/suspicious/noExplicitAny: <explanation>
						({ isSort, key, value, methods, colSpan, rowSpan }: any) => (
							<th
								scope="col"
								class={className}
								key={key}
								colSpan={colSpan ?? 1}
								rowSpan={rowSpan ?? 1}
							>
								<div
									className="flex items-center justify-center h-full"
									onClick={() => {
										if (isSort) {
											if (typeof isSort === "string") {
												methods.sorting(isSort);
												return;
											}
											methods.sorting(key);
										}
									}}
								>
									<button
										type="button"
										aria-label="button to sort"
										class="flex gap-2 items-center px-2 sort-button mx-auto justify-center"
									>
										{isSort ? (
											<ArrowUpDown
												className={
													(() => {
														const activeSortKey = Object.keys(
															table.sort.value,
														)[0];
														return (
															activeSortKey === key ||
															(typeof isSort === "string" &&
																activeSortKey === isSort)
														);
													})()
														? "text-primary"
														: ""
												}
												size={12}
											/>
										) : null}
										{value}
									</button>
								</div>
							</th>
						),
					)}
				</tr>
			))}
		</>
	);
}

export default Th;
