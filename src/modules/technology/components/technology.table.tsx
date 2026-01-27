import Modal from "@components/extras/Modal";
import VigilioTable from "@components/tables";
import { cn } from "@infrastructure/utils/client";
import { printFileWithDimension } from "@infrastructure/utils/hybrid/file.utils";
import { technologyDestroyApi } from "@modules/technology/apis/technology.destroy.api";
import { technologyIndexApi } from "@modules/technology/apis/technology.index.api";
import TechnologyStore from "@modules/technology/components/technology.store";
import TechnologyUpdate from "@modules/technology/components/technology.update";
import type { TechnologySchema } from "@modules/technology/schemas/technology.schema";
import { DIMENSION_IMAGE } from "@modules/uploads/const/upload.const";
import { useSignal } from "@preact/signals";
import { useTable } from "@vigilio/preact-table";
import { sweetModal } from "@vigilio/sweet";
import { Edit, Image as ImageIcon, Plus, Trash2 } from "lucide-preact";
import { useEffect } from "preact/hooks";
import type {
	TechnologyIndexMethods,
	TechnologyIndexSecondaryPaginator,
} from "../apis/technology.index.api";

export default function TechnologyTable() {
	const destroyMutation = technologyDestroyApi();
	const editingTech = useSignal<TechnologySchema | null>(null);
	const isStoreModalOpen = useSignal<boolean>(false);
	const table = useTable<
		TechnologySchema,
		TechnologyIndexSecondaryPaginator,
		TechnologyIndexMethods
	>({
		columns: [
			{
				key: "icon",
				header: "Visual",
				cell: (row) => (
					<div class="w-10 h-10 rounded-lg bg-zinc-900 border border-white/5 overflow-hidden flex items-center justify-center p-1.5">
						{row.icon && row.icon.length > 0 ? (
							<img
								src={printFileWithDimension(row.icon, DIMENSION_IMAGE.xs)[0]}
								alt={row.name}
								title={row.name}
								width={DIMENSION_IMAGE.xs}
								height={DIMENSION_IMAGE.xs}
								class="w-full h-full object-contain"
							/>
						) : (
							<ImageIcon size={16} class="text-zinc-800" />
						)}
					</div>
				),
			},
			{
				key: "name",
				header: "Component_ID",
				cell: (row) => (
					<div class="flex flex-col">
						<span class="text-xs font-black uppercase text-foreground">
							{row.name}
						</span>
						<span class="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">
							SYS::{row.id}
						</span>
					</div>
				),
			},
			{
				key: "category",
				header: "Module_Class",
				cell: (row) => (
					<span
						class={cn(
							"px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest",
							row.category === "FRONTEND"
								? "bg-blue-500/10 text-blue-400 border-blue-500/20"
								: row.category === "BACKEND"
									? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
									: "bg-zinc-800 text-zinc-500 border-white/5",
						)}
					>
						{row.category}
					</span>
				),
			},
			{
				key: "action",
				header: "Ops",
				cell: (row) => (
					<div class="flex items-center gap-1">
						<button
							type="button"
							onClick={() => {
								editingTech.value = row;
							}}
							class="p-2 text-muted-foreground hover:text-amber-400 rounded-lg transition-all"
						>
							<Edit size={14} />
						</button>
						<button
							type="button"
							onClick={() => {
								sweetModal({
									title: "PURGE_COMPONENT?",
									text: `Remove neural record for "${row.name}"?`,
									icon: "danger",
									showCancelButton: true,
									confirmButtonText: "TERMINATE",
								}).then(({ isConfirmed }) => {
									if (isConfirmed) {
										destroyMutation.mutate(row.id, {
											onSuccess() {
												table.updateData((old, count) => ({
													result: old.filter((item) => item.id !== row.id),
													count: count - 1,
												}));
												sweetModal({
													icon: "success",
													title: "Record Deleted",
												});
											},
										});
									}
								});
							}}
							class="p-2 text-muted-foreground hover:text-red-500 rounded-lg transition-all"
						>
							<Trash2 size={14} />
						</button>
					</div>
				),
			},
		],
		pagination: { limit: 12 },
	});

	const query = technologyIndexApi(table);

	useEffect(() => {
		query.refetch(false);
	}, [
		table.pagination.value.limit,
		table.pagination.value.offset,
		table.search.debounceTerm,
		table.sort.value,
		table.filters.value,
	]);

	return (
		<VigilioTable table={table} query={query}>
			<div class="flex flex-col gap-6 mb-6">
				<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
					<div class="flex flex-col">
						<span class="text-[9px] font-black tracking-[0.3em] text-primary/40 uppercase">
							Tech_Inventory
						</span>
						<h3 class="text-xl font-black tracking-tight uppercase">
							Neural Core Stack
						</h3>
					</div>
					<button
						type="button"
						onClick={() => {
							isStoreModalOpen.value = true;
						}}
						class="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
					>
						<Plus size={14} />
						Initialise Node
					</button>
				</div>
			</div>

			<VigilioTable.table>
				<VigilioTable.thead>
					<VigilioTable.thead.row>
						<VigilioTable.thead.th />
					</VigilioTable.thead.row>
				</VigilioTable.thead>
				<VigilioTable.tbody>
					<VigilioTable.tbody.row title="No tech nodes found">
						{(data) => <VigilioTable.tbody.td data={data} />}
					</VigilioTable.tbody.row>
				</VigilioTable.tbody>
			</VigilioTable.table>

			<VigilioTable.footer>
				<div class="flex flex-col sm:flex-row justify-between gap-4 w-full items-center p-6 bg-zinc-900/20 border-t border-white/5 rounded-b-2xl">
					<VigilioTable.footer.show />
					<VigilioTable.footer.paginator />
				</div>
			</VigilioTable.footer>

			<Modal
				isOpen={!!editingTech.value}
				onClose={() => {
					editingTech.value = null;
				}}
				contentClassName="max-w-2xl bg-zinc-950 border border-white/10"
			>
				<TechnologyUpdate
					technology={editingTech.value!}
					refetch={(data) => {
						table.updateData((old, count) => ({
							result: old.map((item) =>
								item.id === (data as TechnologySchema).id
									? { ...item, ...data }
									: item,
							),
							count,
						}));
						editingTech.value = null;
					}}
					onClose={() => {
						editingTech.value = null;
					}}
				/>
			</Modal>
			<Modal
				isOpen={isStoreModalOpen.value}
				onClose={() => {
					isStoreModalOpen.value = false;
				}}
				contentClassName="max-w-2xl bg-zinc-950 border border-white/10"
			>
				<TechnologyStore
					refetch={(data) => {
						table.updateData((old, count) => ({
							result: [data, ...old],
							count: count + 1,
						}));
						isStoreModalOpen.value = false;
					}}
					onClose={() => {
						isStoreModalOpen.value = false;
					}}
				/>
			</Modal>
		</VigilioTable>
	);
}
