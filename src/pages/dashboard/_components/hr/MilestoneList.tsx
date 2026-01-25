import Modal from "@components/extras/Modal";
import { formatDateTz } from "@infrastructure/utils/hybrid/date.utils";
import { workMilestoneDestroyApi } from "@modules/work-milestone/apis/work-milestone.destroy.api";
import { workMilestoneIndexApi } from "@modules/work-milestone/apis/work-milestone.index.api";
import type { WorkMilestoneSchema } from "@modules/work-milestone/schemas/work-milestone.schema";
import { useSignal } from "@preact/signals";
import { sweetModal } from "@vigilio/sweet";
import { Edit, Flag, Plus, Trash } from "lucide-preact";
import MilestoneForm from "./MilestoneForm";

export default function MilestoneList({
	experienceId,
}: {
	experienceId: number;
}) {
	const isModalOpen = useSignal(false);
	const editMilestone = useSignal<WorkMilestoneSchema | null>(null);
	const destroyMut = workMilestoneDestroyApi();

	// Assuming API supports filtering by work_experience_id
	// If not, we might need to fetch all and filter client side (not ideal) or update API.
	// For now assuming: api(experienceId)
	const query = workMilestoneIndexApi(experienceId);

	if (query.isLoading)
		return <div className="text-xs animate-pulse">Loading milestones...</div>;

	return (
		<div className="space-y-3 mt-4 border-t border-white/10 pt-4">
			<div className="flex justify-between items-center">
				<h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
					<Flag size={12} /> Milestones
				</h4>
				<button
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
								onClick={() => {
									editMilestone.value = milestone;
									isModalOpen.value = true;
								}}
								className="p-1.5 hover:bg-white/10 rounded text-primary"
							>
								<Edit size={12} />
							</button>
							<button
								onClick={() => {
									sweetModal({
										title: "Delete milestone?",
										showCancelButton: true,
									}).then((res) => {
										if (res.isConfirmed) {
											destroyMut.mutate(milestone.id, {
												onSuccess: () => query.refetch(false),
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
			</div>

			<Modal
				isOpen={isModalOpen.value}
				onClose={() => (isModalOpen.value = false)}
				contentClassName="max-w-md w-full p-6 bg-zinc-950 border border-white/10"
			>
				<MilestoneForm
					experienceId={experienceId}
					milestone={editMilestone.value}
					onSuccess={() => query.refetch(false)}
					onClose={() => (isModalOpen.value = false)}
				/>
			</Modal>
		</div>
	);
}
