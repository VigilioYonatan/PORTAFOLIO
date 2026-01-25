import Badge from "@components/extras/Badge";
import Loader from "@components/extras/Loader";
import Modal from "@components/extras/Modal";
import VigilioTable from "@components/tables";
import { cn } from "@infrastructure/utils/client";
import { testimonialDestroyApi } from "@modules/testimonial/apis/testimonial.destroy.api";
import {
	type TestimonialIndexMethods,
	type TestimonialIndexSecondaryPaginator,
	testimonialIndexApi,
} from "@modules/testimonial/apis/testimonial.index.api";
import type { TestimonialSchema } from "@modules/testimonial/schemas/testimonial.schema";
import { useSignal } from "@preact/signals";
import type { Columns } from "@vigilio/preact-table";
import { useTable } from "@vigilio/preact-table";
import { sweetModal } from "@vigilio/sweet";
import { Edit, MessageSquareQuote, Plus, Search, Trash2 } from "lucide-preact";
import { useEffect } from "preact/hooks";
import TestimonialStore from "./TestimonialStore";
import TestimonialUpdate from "./TestimonialUpdate";

export default function TestimonialTable() {
	const testimonialEdit = useSignal<TestimonialSchema | null>(null);
	const isStoreModalOpen = useSignal<boolean>(false);
	const destroyMutation = testimonialDestroyApi();

	const columns: Columns<
		TestimonialSchema,
		TestimonialIndexSecondaryPaginator,
		TestimonialIndexMethods
	> = [
		{
			key: "id",
			header: "ID",
			isSort: true,
		},
		{
			key: "author_name",
			header: "AUTHOR_IDENTITY",
			isSort: true,
			cell: (row) => (
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 overflow-hidden flex items-center justify-center shrink-0">
						{row.avatar ? (
							<img
								src={row.avatar.key}
								alt={row.author_name}
								class="w-full h-full object-cover"
							/>
						) : (
							<span class="text-xs font-black text-primary">
								{row.author_name.charAt(0)}
							</span>
						)}
					</div>
					<div class="flex flex-col gap-0.5">
						<span class="font-black text-xs tracking-tight text-foreground uppercase">
							{row.author_name}
						</span>
						<span class="text-[9px] font-mono text-muted-foreground/60">
							{row.author_role}{" "}
							{row.author_company ? `@ ${row.author_company}` : ""}
						</span>
					</div>
				</div>
			),
		},
		{
			key: "content",
			header: "TRANSMISSION_DATA",
			cell: (row) => (
				<span class="text-[11px] text-muted-foreground/80 italic line-clamp-2 leading-relaxed">
					"{row.content}"
				</span>
			),
		},
		{
			key: "is_visible",
			header: "UPLINK_STATUS",
			cell: (row) => (
				<Badge
					variant={row.is_visible ? "matrix" : "secondary"}
					className={cn(
						"text-[9px] font-black uppercase tracking-widest",
						!row.is_visible && "bg-zinc-800 text-zinc-500 border-white/5",
					)}
				>
					{row.is_visible ? "ONLINE" : "OFFLINE"}
				</Badge>
			),
		},
		{
			key: "action",
			header: "OPS",
			cell: (row, _index, methods) => (
				<div class="flex items-center gap-1">
					<button
						type="button"
						onClick={() => (testimonialEdit.value = row)}
						class="p-2 text-muted-foreground hover:text-amber-400 rounded-lg hover:bg-amber-400/10 transition-all"
						title="Modify Node"
					>
						<Edit size={14} />
					</button>
					<button
						type="button"
						onClick={() => {
							sweetModal({
								title: "TERMINATE_TESTIMONIAL?",
								text: `Execute terminal command to remove testimonial from "${row.author_name}"?`,
								icon: "danger",
								showCancelButton: true,
								confirmButtonText: "TERMINATE",
							}).then(({ isConfirmed }) => {
								if (isConfirmed) {
									destroyMutation.mutate(row.id, {
										onSuccess() {
											table.updateData((results, count) => ({
												result: results.filter((item) => item.id !== row.id),
												count: count - 1,
											}));
											sweetModal({ icon: "success", title: "Record Purged" });
										},
									});
								}
							});
						}}
						class="p-2 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-all"
						title="Deactivate Sequence"
					>
						<Trash2 size={14} />
					</button>
				</div>
			),
		},
	];

	const table = useTable({
		columns,
		pagination: { limit: 10 },
	});

	const query = testimonialIndexApi(table);

	useEffect(() => {
		query.refetch(false);
	}, [
		table.pagination.value.limit,
		table.pagination.value.offset,
		table.search.debounceTerm,
		table.sort.value,
	]);

	return (
		<VigilioTable table={table} query={query}>
			<div class="space-y-6">
				{/* Toolbar */}
				<div class="flex flex-col md:flex-row justify-between items-center gap-4 bg-zinc-900/30 border border-white/5 p-4 rounded-xl backdrop-blur-md">
					<div class="relative group w-full md:w-80">
						<div class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors">
							<Search size={14} />
						</div>
						<input
							type="text"
							placeholder="FILTER_BY_AUTHOR..."
							class="bg-black/40 border border-white/5 text-[11px] font-mono tracking-widest rounded-lg pl-10 pr-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all"
							value={table.search.value}
							onInput={(e) =>
								table.search.onSearchByName(e.currentTarget.value)
							}
						/>
					</div>

					<div class="flex items-center gap-4 w-full md:w-auto">
						<div class="hidden md:flex flex-col items-end">
							<span class="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
								Signal_Count
							</span>
							<span class="text-sm font-black font-mono text-primary">
								{query.data?.count ?? 0}
							</span>
						</div>
						<button
							type="button"
							onClick={() => (isStoreModalOpen.value = true)}
							class="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
						>
							<Plus size={14} strokeWidth={3} />
							New Testimonial
						</button>
					</div>
				</div>

				{/* Standard Table View */}
				<VigilioTable.table>
					<VigilioTable.thead>
						<VigilioTable.thead.row>
							<VigilioTable.thead.th />
						</VigilioTable.thead.row>
					</VigilioTable.thead>
					<VigilioTable.tbody>
						<VigilioTable.tbody.row title="No testimonial nodes detected">
							{(data) => <VigilioTable.tbody.td data={data} />}
						</VigilioTable.tbody.row>
					</VigilioTable.tbody>
				</VigilioTable.table>

				{/* Pagination */}
				<VigilioTable.footer>
					<div class="flex flex-col sm:flex-row justify-between gap-4 w-full items-center p-6 bg-zinc-900/20 border-t border-white/5 rounded-b-2xl">
						<VigilioTable.footer.show />
						<VigilioTable.footer.paginator />
					</div>
				</VigilioTable.footer>

				{/* Form Modals */}
				<Modal
					isOpen={isStoreModalOpen.value}
					onClose={() => (isStoreModalOpen.value = false)}
				>
					<TestimonialStore
						refetch={(data) => {
							isStoreModalOpen.value = false;
							table.updateData((results, count) => ({
								result: [data, ...results],
								count: count + 1,
							}));
						}}
						onClose={() => (isStoreModalOpen.value = false)}
					/>
				</Modal>

				<Modal
					isOpen={!!testimonialEdit.value}
					onClose={() => (testimonialEdit.value = null)}
				>
					<TestimonialUpdate
						testimonial={testimonialEdit.value!}
						refetch={(data) => {
							table.updateData((results, count) => ({
								result: results.map((item) =>
									item.id === data.id ? { ...item, ...data } : item,
								),
								count,
							}));
							testimonialEdit.value = null;
						}}
						onClose={() => (testimonialEdit.value = null)}
					/>
				</Modal>
			</div>
		</VigilioTable>
	);
}
