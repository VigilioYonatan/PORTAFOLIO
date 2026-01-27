import Modal from "@components/extras/modal";
import VigilioTable from "@components/tables";
import { formatDateTz } from "@infrastructure/utils/hybrid/date.utils";
import { blogCategoryDestroyApi } from "@modules/blog-category/apis/blog-category.destroy.api";
import { blogCategoryIndexApi } from "@modules/blog-category/apis/blog-category.index.api";
import { type BlogCategorySchema } from "@modules/blog-category/schemas/blog-category.schema";
import { useSignal } from "@preact/signals";
import { useTable } from "@vigilio/preact-table";
import { sweetModal } from "@vigilio/sweet";
import { Edit, Plus, Trash } from "lucide-preact";
import { useEffect } from "preact/hooks";
import {
	type BlogCategoryIndexMethods,
	type BlogCategoryIndexSecondaryPaginator,
} from "../apis/blog-category.index.api";
import CategoryStore from "./category.store";
import CategoryUpdate from "./category.update";

export default function CategoryManager() {
	const isStoreModalOpen = useSignal<boolean>(false);
	const categoryEdit = useSignal<BlogCategorySchema | null>(null);
	const destroyMut = blogCategoryDestroyApi();

	const table = useTable<
		BlogCategorySchema,
		BlogCategoryIndexSecondaryPaginator,
		BlogCategoryIndexMethods
	>({
		columns: [
			{ key: "id", header: "ID", isSort: true },
			{
				key: "name",
				header: "Name",
				cell: (item) => (
					<span class="font-bold text-white uppercase text-xs tracking-tighter italic">
						{item.name}
					</span>
				),
				isSort: true,
			},
			{
				key: "created_at",
				header: "Created",
				cell: (item) => (
					<span class="text-[10px] text-muted-foreground font-mono">
						{formatDateTz(item.created_at)}
					</span>
				),
				isSort: true,
			},
			{
				key: "action",
				header: "Actions",
				cell: (item) => (
					<div class="flex gap-2">
						<button
							type="button"
							onClick={() => {
								categoryEdit.value = item;
							}}
							class="p-2 hover:bg-white/10 rounded text-primary transition-colors"
							aria-label="Edit category"
						>
							<Edit size={16} />
						</button>
						<button
							type="button"
							onClick={() => {
								sweetModal({
									title: "Delete category?",
									text: "This action cannot be undone.",
									icon: "danger",
									showCancelButton: true,
								}).then((res) => {
									if (res.isConfirmed) {
										destroyMut.mutate(item.id, {
											onSuccess: () => query.refetch(false),
										});
									}
								});
							}}
							class="p-2 hover:bg-destructive/10 rounded text-destructive transition-colors"
							aria-label="Delete category"
						>
							<Trash size={16} />
						</button>
					</div>
				),
			},
		],
		pagination: { limit: 10 },
	});

	const query = blogCategoryIndexApi(table);

	useEffect(() => {
		query.refetch(false);
	}, [
		table.pagination.page,
		table.pagination.value.limit,
		table.search.debounceTerm,
		table.sort.value,
		table.filters.value,
	]);

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
					Categories
				</h3>
				<button
					onClick={() => {
						isStoreModalOpen.value = true;
					}}
					type="button"
					className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-90"
				>
					<Plus size={16} />
					New
				</button>
			</div>

			<VigilioTable query={query} table={table}>
				<VigilioTable.table>
					<VigilioTable.thead>
						<VigilioTable.thead.row>
							<VigilioTable.thead.th />
						</VigilioTable.thead.row>
					</VigilioTable.thead>
					<VigilioTable.tbody>
						<VigilioTable.tbody.row title="No categories found">
							{(data) => <VigilioTable.tbody.td data={data} />}
						</VigilioTable.tbody.row>
					</VigilioTable.tbody>
				</VigilioTable.table>
				<VigilioTable.footer>
					<div className="flex justify-between items-center p-4">
						<VigilioTable.footer.show />
						<VigilioTable.footer.paginator />
					</div>
				</VigilioTable.footer>
			</VigilioTable>

			<Modal
				isOpen={isStoreModalOpen.value}
				onClose={() => {
					isStoreModalOpen.value = false;
				}}
				contentClassName="max-w-md w-full p-6 bg-zinc-950 border border-white/10"
			>
				<CategoryStore
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

			<Modal
				isOpen={!!categoryEdit.value}
				onClose={() => {
					categoryEdit.value = null;
				}}
				contentClassName="max-w-md w-full p-6 bg-zinc-950 border border-white/10"
			>
				{categoryEdit.value && (
					<CategoryUpdate
						category={categoryEdit.value}
						refetch={(data) => {
							table.updateData((old, count) => ({
								result: old.map((item) =>
									item.id === categoryEdit.value?.id
										? { ...item, ...data }
										: item,
								),
								count,
							}));
							categoryEdit.value = null;
						}}
						onClose={() => {
							categoryEdit.value = null;
						}}
					/>
				)}
			</Modal>

		</div>
	);
}
