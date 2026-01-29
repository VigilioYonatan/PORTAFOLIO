import Modal from "@components/extras/modal";
import { formatDateTz } from "@infrastructure/utils/hybrid/date.utils";
import { workMilestoneDestroyApi } from "@modules/work-milestone/apis/work-milestone.destroy.api";
import { workMilestoneIndexApi } from "@modules/work-milestone/apis/work-milestone.index.api";
import type { WorkMilestoneSchema } from "@modules/work-milestone/schemas/work-milestone.schema";
import { useSignal } from "@preact/signals";
import usePaginator from "@vigilio/preact-paginator";
import { sweetModal } from "@vigilio/sweet";
import { Edit, Flag, Plus, Trash } from "lucide-preact";
import MilestoneStore from "./milestone-store";
import MilestoneUpdate from "./milestone-update";

interface MilestoneListProps {
	experienceId: number;
}

export default function MilestoneList({ experienceId }: MilestoneListProps) {
	const isModalOpen = useSignal(false);
	const editMilestone = useSignal<WorkMilestoneSchema | null>(null);
	const destroyMut = workMilestoneDestroyApi();
	const paginator = usePaginator({ limit: 5 });

	const query = workMilestoneIndexApi(experienceId, null, paginator);

	if (query.isLoading)
		return <div className="text-xs animate-pulse">Loading milestones...</div>;

	return (
		<div className="space-y-3 mt-4 border-t border-white/10 pt-4">
			<div className="flex justify-between items-center">
				<h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
					<Flag size={12} /> Milestones
				</h4>
				<button
					type="button"
					aria-label="Add Milestone"
					onClick={() => {
						editMilestone.value = null;
						isModalOpen.value = true;
					}}
					className="p-1 hover:bg-primary/20 rounded text-primary"
					title="Add Milestone"
				>
					<Plus size={14} />
				</button>
			</div>

			<div className="space-y-2">
				{query.data?.results.map((milestone) => (
					<div
						key={milestone.id}
						className="bg-zinc-900/50 p-3 rounded-lg border border-white/5 flex justify-between items-start group"
					>
						<div>
							<div className="font-bold text-sm text-foreground">
								{milestone.title}
							</div>
							<div className="text-[10px] text-muted-foreground">
								{formatDateTz(milestone.milestone_date)}
							</div>
							<p className="text-xs text-zinc-500 mt-1">
								{milestone.description}
							</p>
						</div>
						<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
							<button
								type="button"
								aria-label="Edit milestone"
								onClick={() => {
									editMilestone.value = milestone;
									isModalOpen.value = true;
								}}
								className="p-1.5 hover:bg-white/10 rounded text-primary"
							>
								<Edit size={12} />
							</button>
							<button
								type="button"
								aria-label="Delete milestone"
								onClick={() => {
									sweetModal({
										title: "Delete milestone?",
										showCancelButton: true,
									}).then((res) => {
										if (res.isConfirmed) {
											destroyMut.mutate(milestone.id, {
												onSuccess: () => {
													query.transformData((prev) => ({
														...prev,
														results: prev.results.filter(
															(item) => item.id !== milestone.id,
														),
														count: prev.count - 1,
													}));
												},
											});
										}
									});
								}}
								className="p-1.5 hover:bg-destructive/10 rounded text-destructive"
							>
								<Trash size={12} />
							</button>
						</div>
					</div>
				))}
				{query.data?.results.length === 0 && (
					<div className="text-center text-[10px] text-muted-foreground py-2 italic">
						No milestones recorded.
					</div>
				)}

				{/* Pagination Controls */}
				<div class="flex justify-between items-center px-1 pt-2">
					<button
						type="button"
						onClick={() => paginator.pagination.onBackPage()}
						disabled={paginator.pagination.page <= 1}
						class="text-[10px] uppercase font-mono hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
					>
						&lt; Prev
					</button>
					<span class="text-[9px] text-muted-foreground font-mono">
						Page {paginator.pagination.page}
					</span>
					<button
						type="button"
						onClick={() => paginator.pagination.onNextPage()}
						disabled={
							!paginator.pagination.value.total ||
							paginator.pagination.page >=
								Math.ceil(
									paginator.pagination.value.total /
										paginator.pagination.value.limit,
								)
						}
						class="text-[10px] uppercase font-mono hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
					>
						Next &gt;
					</button>
				</div>
			</div>

			{/* Store Modal */}
			<Modal
				isOpen={isModalOpen.value && !editMilestone.value}
				onClose={() => {
					isModalOpen.value = false;
				}}
				contentClassName="max-w-md w-full p-6 bg-zinc-950 border border-white/10"
			>
				<MilestoneStore
					experienceId={experienceId}
					refetch={(data) => {
						query.transformData((prev) => ({
							...prev,
							results: [data, ...prev.results],
							count: prev.count + 1,
						}));
						isModalOpen.value = false;
					}}
					onClose={() => {
						isModalOpen.value = false;
					}}
				/>
			</Modal>

			{/* Update Modal */}
			<Modal
				isOpen={!!editMilestone.value}
				onClose={() => {
					editMilestone.value = null;
				}}
				contentClassName="max-w-md w-full p-6 bg-zinc-950 border border-white/10"
			>
				<MilestoneUpdate
					experienceId={experienceId}
					milestone={editMilestone.value!}
					refetch={(data: WorkMilestoneSchema) => {
						query.transformData((prev) => ({
							...prev,
							results: prev.results.map((item) =>
								item.id === data.id ? data : item,
							),
						}));
						editMilestone.value = null;
					}}
					onClose={() => {
						editMilestone.value = null;
					}}
				/>
			</Modal>
		</div>
	);
}
