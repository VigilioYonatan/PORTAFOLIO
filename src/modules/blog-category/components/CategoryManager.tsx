import Modal from "@components/extras/Modal";
import WebForm from "@components/web_form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { formatDateTz } from "@infrastructure/utils/hybrid/date.utils";
import { blogCategoryDestroyApi } from "@modules/blog-category/apis/blog-category.destroy.api";
import {
	type BlogCategoryIndexTable,
	blogCategoryIndexApi,
} from "@modules/blog-category/apis/blog-category.index.api";
import { blogCategoryStoreApi } from "@modules/blog-category/apis/blog-category.store.api";
import { blogCategoryUpdateApi } from "@modules/blog-category/apis/blog-category.update.api";
import {
	type BlogCategoryStoreDto,
	blogCategoryStoreSchema,
} from "@modules/blog-category/dtos/blog-category.store.dto";
import { type BlogCategoryUpdateDto, blogCategoryUpdateSchema } from "@modules/blog-category/dtos/blog-category.update.dto";
import { type BlogCategorySchema } from "@modules/blog-category/schemas/blog-category.schema";
import CategoryStore from "./CategoryStore";
import CategoryUpdate from "./CategoryUpdate";
import { useSignal } from "@preact/signals";
import { useTable } from "@vigilio/preact-table";
import { sweetModal } from "@vigilio/sweet";
import { Edit, Plus, Tag, Trash } from "lucide-preact";
import VigilioTable from "@components/tables";
import { useForm } from "react-hook-form";

// --- Components ---



export default function CategoryManager() {
	const isStoreModalOpen = useSignal(false);
	const categoryEdit = useSignal<BlogCategorySchema | null>(null);
	const destroyMut = blogCategoryDestroyApi();

	const table = useTable({
		columns: [
			{ key: "id", header: "ID", isSort: true },
			{
				key: "name",
				header: "Name",
				cell: (item) => (
					<span className="font-bold text-white">{item.name}</span>
				),
			},
			{
				key: "created_at",
				header: "Created",
				cell: (item) => (
					<span className="text-xs text-muted-foreground">
						{formatDateTz(item.created_at)}
					</span>
				),
			},
			{
				key: "action",
				header: "Actions",
				cell: (item: any) => (
					<div className="flex gap-2">
						<button
							onClick={() => {
								categoryEdit.value = item;
							}}
							className="p-2 hover:bg-white/10 rounded text-primary"
						>
							<Edit size={16} />
						</button>
						<button
							onClick={() => {
								sweetModal({
									title: "Delete category?",
									text: "This action cannot be undone.",
									showCancelButton: true,
								}).then((res) => {
									if (res.isConfirmed) {
										destroyMut.mutate(item.id, {
											onSuccess: () => query.refetch(false),
										});
									}
								});
							}}
							className="p-2 hover:bg-destructive/10 rounded text-destructive"
						>
							<Trash size={16} />
						</button>
					</div>
				),
			},
		],
		pagination: { limit: 10 },
	});

	const query = blogCategoryIndexApi(table as any);

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
					className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-90"
				>
					<Plus size={16} />
					New
				</button>
			</div>

			<VigilioTable query={query} table={table as any}>
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
				onClose={() => (isStoreModalOpen.value = false)}
				contentClassName="max-w-md w-full p-6 bg-zinc-950 border border-white/10"
			>
				<CategoryStore
					onSuccess={() => {
						query.refetch(false);
						isStoreModalOpen.value = false;
					}}
					onClose={() => (isStoreModalOpen.value = false)}
				/>
			</Modal>

			<Modal
				isOpen={!!categoryEdit.value}
				onClose={() => (categoryEdit.value = null)}
				contentClassName="max-w-md w-full p-6 bg-zinc-950 border border-white/10"
			>
				{categoryEdit.value && (
					<CategoryUpdate
						category={categoryEdit.value}
						onSuccess={() => {
							query.refetch(false);
							categoryEdit.value = null;
						}}
						onClose={() => (categoryEdit.value = null)}
					/>
				)}
			</Modal>
		</div>
	);
}
