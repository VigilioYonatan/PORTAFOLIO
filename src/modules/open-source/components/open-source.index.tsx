import Badge from "@components/extras/badge";
import Modal from "@components/extras/modal";
import VigilioTable from "@components/tables";
import { cn } from "@infrastructure/utils/client";
import { openSourceDestroyApi } from "@modules/open-source/apis/open-source.destroy.api";
import { openSourceIndexApi } from "@modules/open-source/apis/open-source.index.api";
import OpenSourceStore from "@modules/open-source/components/open-source.store";
import OpenSourceUpdate from "@modules/open-source/components/open-source.update";
import type { OpenSourceSchema } from "@modules/open-source/schemas/open-source.schema";
import { useSignal } from "@preact/signals";
import { type Lang, useTranslations } from "@src/i18n";
import { useTable } from "@vigilio/preact-table";
import { sweetModal } from "@vigilio/sweet";
import { Edit, Package, Plus, Search, Trash2 } from "lucide-preact";
import { useEffect } from "preact/hooks";

interface OpenSourceIndexProps {
	lang?: Lang;
}

export default function OpenSourceIndex({ lang = "es" }: OpenSourceIndexProps) {
	const openSourceEdit = useSignal<OpenSourceSchema | null>(null);
	const isStoreModalOpen = useSignal<boolean>(false);
	const destroyMutation = openSourceDestroyApi();
	const t = useTranslations(lang);

	const table = useTable<OpenSourceSchema, any, any>({
		columns: [
			{
				key: "id",
				header: "ID",
				isSort: true,
			},
			{
				key: "name",
				header: "Nombre / Versión",
				isSort: true,
				cell: (row) => (
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
							<Package size={14} class="text-primary" />
						</div>
						<div class="flex flex-col gap-0.5">
							<span class="font-black text-xs tracking-tight text-foreground uppercase">
								{row.name}
							</span>
							<div class="flex gap-2 items-center">
								<span class="text-[9px] font-mono text-muted-foreground/60">
									{row.version || "v0.0.0"}
								</span>
								<span class="text-[9px] font-mono text-primary/40 uppercase tracking-tighter">
									/{row.slug}
								</span>
							</div>
						</div>
					</div>
				),
			},
			{
				key: "stars",
				header: "Impacto",
				cell: (row) => (
					<div class="flex gap-4 font-mono text-[10px]">
						<span class="text-primary font-bold">★ {row.stars}</span>
						<span class="text-green-500 font-bold">📥 {row.downloads}</span>
					</div>
				),
			},
			{
				key: "is_visible",
				header: t("dashboard.table.status"),
				cell: (row) => (
					<Badge
						variant={row.is_visible ? "matrix" : "secondary"}
						className={cn(
							"text-[9px] font-black uppercase tracking-widest",
							!row.is_visible && "bg-zinc-800 text-zinc-500 border-white/5",
						)}
					>
						{row.is_visible ? "LIVE" : "HIDDEN"}
					</Badge>
				),
			},
			{
				key: "action",
				header: t("common.actions"),
				cell: (row) => (
					<div class="flex items-center gap-1">
						<button
							type="button"
							onClick={() => {
								openSourceEdit.value = row;
							}}
							class="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 transition-all"
						>
							<Edit size={14} />
						</button>
						<button
							type="button"
							onClick={() => {
								sweetModal({
									title: "¿Eliminar proyecto?",
									text: `¿Estás seguro de eliminar "${row.name}"?`,
									icon: "danger",
									showCancelButton: true,
									confirmButtonText: "Eliminar",
								}).then(({ isConfirmed }) => {
									if (isConfirmed) {
										destroyMutation.mutate(row.id, {
											onSuccess() {
												table.updateData((results, count) => ({
													result: results.filter((item) => item.id !== row.id),
													count: count - 1,
												}));
												sweetModal({
													icon: "success",
													title: "Eliminado con éxito",
												});
											},
										});
									}
								});
							}}
							class="p-2 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-all"
						>
							<Trash2 size={14} />
						</button>
					</div>
				),
			},
		],
		pagination: { limit: 10 },
	});

	const query = openSourceIndexApi(table);

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
			<div class="space-y-6">
				<div class="flex flex-col md:flex-row justify-between items-center gap-4 bg-zinc-900/30 border border-white/5 p-4 rounded-xl backdrop-blur-md">
					<div class="relative group w-full md:w-80">
						<div class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors">
							<Search size={14} />
						</div>
						<input
							type="text"
							placeholder="BUSCAR PROYECTO..."
							class="bg-black/40 border border-white/5 text-[11px] font-mono tracking-widest rounded-lg pl-10 pr-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all"
							value={table.search.value}
							onInput={(e) =>
								table.search.onSearchByName(e.currentTarget.value)
							}
						/>
					</div>

					<div class="flex items-center gap-4 w-full md:w-auto">
						<button
							type="button"
							onClick={() => {
								isStoreModalOpen.value = true;
							}}
							class="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
						>
							<Plus size={14} strokeWidth={3} />
							NUEVO PROYECTO
						</button>
					</div>
				</div>

				<VigilioTable.table>
					<VigilioTable.thead>
						<VigilioTable.thead.th />
					</VigilioTable.thead>
					<VigilioTable.tbody>
						<VigilioTable.tbody.row title={"No se encontraron proyectos."}>
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
					isOpen={isStoreModalOpen.value}
					onClose={() => {
						isStoreModalOpen.value = false;
					}}
				>
					<OpenSourceStore
						refetch={(data: OpenSourceSchema) => {
							isStoreModalOpen.value = false;
							table.updateData((results, count) => ({
								result: [data, ...results],
								count: count + 1,
							}));
						}}
						onClose={() => {
							isStoreModalOpen.value = false;
						}}
					/>
				</Modal>

				<Modal
					isOpen={!!openSourceEdit.value}
					onClose={() => {
						openSourceEdit.value = null;
					}}
				>
					<OpenSourceUpdate
						openSource={openSourceEdit.value!}
						refetch={(data: OpenSourceSchema) => {
							table.updateData((results, count) => ({
								result: results.map((item) =>
									item.id === data.id ? { ...item, ...data } : item,
								),
								count,
							}));
							openSourceEdit.value = null;
						}}
						onClose={() => {
							openSourceEdit.value = null;
						}}
					/>
				</Modal>
			</div>
		</VigilioTable>
	);
}
