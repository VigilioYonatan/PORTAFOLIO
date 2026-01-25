import Modal from "@components/extras/Modal";
import { cn } from "@infrastructure/utils/client";
import { workMilestoneDestroyApi } from "@modules/work-milestone/apis/work-milestone.destroy.api";
import type { WorkMilestoneIndexMethods } from "@modules/work-milestone/apis/work-milestone.index.api";
import { workMilestoneIndexApi } from "@modules/work-milestone/apis/work-milestone.index.api";
import type { WorkMilestoneSchema } from "@modules/work-milestone/schemas/work-milestone.schema";
import { useSignal } from "@preact/signals";
import { useTable } from "@vigilio/preact-table";
import { sweetModal } from "@vigilio/sweet";
import { Edit, Milestone, Plus, Trash2 } from "lucide-preact";
import MilestoneStore from "./MilestoneStore";
import MilestoneUpdate from "./MilestoneUpdate";

interface MilestoneListProps {
	experienceId: number;
}

export default function MilestoneList({ experienceId }: MilestoneListProps) {
	const table = useTable<
		WorkMilestoneSchema,
		"action",
		WorkMilestoneIndexMethods
	>({
		pagination: { limit: 100 },
	} as any);

	const query = workMilestoneIndexApi(experienceId, table);
	const destroyMutation = workMilestoneDestroyApi();
	const isStoreModalOpen = useSignal(false);
	const milestoneEdit = useSignal<WorkMilestoneSchema | null>(null);

	function onDelete(id: number) {
		sweetModal({
			title: "Remove Milestone?",
			icon: "danger",
			showCancelButton: true,
		}).then(({ isConfirmed }) => {
			if (isConfirmed) {
				destroyMutation.mutate(id, {
					onSuccess() {
						table.updateData((results, count) => ({
							result: results.filter((item) => item.id !== id),
							count: count - 1,
						}));
						sweetModal({ title: "Deleted", icon: "success", timer: 1000 });
					},
				});
			}
		});
	}

	const results = (table as any).table.TBody.Row() as WorkMilestoneSchema[];

	return (
		<div class="mt-6 space-y-4">
			<div class="flex items-center justify-between">
				<h5 class="text-[10px] font-black font-mono tracking-[0.2em] text-primary/60 uppercase flex items-center gap-2">
					<Milestone size={12} />
					Mission_Milestones
				</h5>
				<button
					type="button"
					onClick={() => {
						isStoreModalOpen.value = true;
					}}
					class="p-1.5 bg-white/5 hover:bg-primary/10 rounded-lg text-primary/60 hover:text-primary transition-all border border-white/5 hover:border-primary/20"
				>
					<Plus size={12} strokeWidth={3} />
				</button>
			</div>

			<div class="space-y-2">
				{query.isLoading ? (
					<div class="animate-pulse flex gap-2 items-center text-[10px] text-muted-foreground font-mono">
						SCANNING_BLOCK_DATA...
					</div>
				) : results.length === 0 ? (
					<div class="text-[10px] text-muted-foreground/30 font-mono italic">
						NO_MILESTONES_LOGGED_IN_SECTOR
					</div>
				) : (
					results.map((m) => (
						<div
							key={m.id}
							class="flex items-center justify-between group/ms bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 p-3 rounded-xl transition-all"
						>
							<div class="flex items-start gap-3">
								<div class="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover/ms:bg-primary mt-1.5 transition-colors" />
								<div class="flex flex-col">
									<span class="text-[11px] font-bold text-foreground">
										{m.title}
									</span>
									<span class="text-[10px] text-muted-foreground/80 leading-relaxed font-medium">
										{m.description}
									</span>
								</div>
							</div>
							<div class="flex items-center gap-1 opacity-0 group-hover/ms:opacity-100 transition-opacity">
								<button
									type="button"
									onClick={() => {
										milestoneEdit.value = m;
									}}
									class="p-1.5 text-muted-foreground hover:text-amber-400"
								>
									<Edit size={12} />
								</button>
								<button
									type="button"
									onClick={() => onDelete(m.id)}
									class="p-1.5 text-muted-foreground hover:text-red-500"
								>
									<Trash2 size={12} />
								</button>
							</div>
						</div>
					))
				)}
			</div>

			<Modal
				isOpen={isStoreModalOpen.value}
				onClose={() => (isStoreModalOpen.value = false)}
				contentClassName="max-w-xl w-full"
			>
				<MilestoneStore
					experienceId={experienceId}
					refetch={(data) => {
						table.updateData((results, count) => ({
							result: [data, ...results],
							count: count + 1,
						}));
						isStoreModalOpen.value = false;
					}}
					onClose={() => (isStoreModalOpen.value = false)}
				/>
			</Modal>

			<Modal
				isOpen={!!milestoneEdit.value}
				onClose={() => (milestoneEdit.value = null)}
				contentClassName="max-w-xl w-full"
			>
					<MilestoneUpdate
						milestone={milestoneEdit.value!}
						experienceId={experienceId}
						refetch={(data) => {
							table.updateData((results, count) => ({
								result: results.map((item) =>
									item.id === data.id ? { ...item, ...data } : item,
								),
								count,
							}));
							milestoneEdit.value = null;
						}}
						onClose={() => {
							milestoneEdit.value = null;
						}}
					/>
			</Modal>
		</div>
	);
}
