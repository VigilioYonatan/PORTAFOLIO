import Form from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { workMilestoneStoreApi } from "@modules/work-milestone/apis/work-milestone.store.api";
import { workMilestoneUpdateApi } from "@modules/work-milestone/apis/work-milestone.update.api";
import {
	type WorkMilestoneStoreDto,
	workMilestoneStoreDto,
} from "@modules/work-milestone/dtos/work-milestone.store.dto";
import { workMilestoneUpdateDto } from "@modules/work-milestone/dtos/work-milestone.update.dto";
import type { WorkMilestoneSchema } from "@modules/work-milestone/schemas/work-milestone.schema";
import { sweetModal } from "@vigilio/sweet";
import { AlignLeft, Calendar, Flag } from "lucide-preact";
import { useForm } from "react-hook-form";

interface MilestoneFormProps {
	experienceId: number;
	milestone?: WorkMilestoneSchema | null;
	onSuccess: () => void;
	onClose: () => void;
}

export default function MilestoneForm({
	experienceId,
	milestone,
	onSuccess,
	onClose,
}: MilestoneFormProps) {
	const isEdit = !!milestone;
	const storeMut = workMilestoneStoreApi();
	const updateMut = workMilestoneUpdateApi(milestone?.id ?? 0);
	const mutation = isEdit ? updateMut : storeMut;

	const form = useForm<WorkMilestoneStoreDto>({
		resolver: zodResolver(
			isEdit ? workMilestoneUpdateDto : workMilestoneStoreDto,
		) as any,
		defaultValues: milestone
			? {
					...milestone,
					milestone_date: new Date(milestone.milestone_date),
				}
			: {
					work_experience_id: experienceId,
					sort_order: 0,
					milestone_date: new Date(),
				},
	});

	const onSubmit = (data: WorkMilestoneStoreDto) => {
		const payload = { ...data, work_experience_id: experienceId };
		mutation.mutate(payload as any, {
			onSuccess() {
				sweetModal({
					title: isEdit ? "Milestone Updated" : "Milestone Added",
					icon: "success",
				});
				onSuccess();
				onClose();
			},
			onError(err: any) {
				handlerError(form as any, err, "Error");
			},
		});
	};

	return (
		<div class="space-y-4">
			<div class="flex flex-col gap-1 border-b border-white/5 pb-4 mb-4">
				<span class="text-[10px] font-black font-mono tracking-[0.5em] text-primary uppercase animate-pulse">
					{isEdit ? "MILESTONE_UPDATE" : "MILESTONE_ENTRY"}
				</span>
				<h2 class="text-xl font-black tracking-tight text-foreground uppercase">
					{isEdit ? "Manage Milestone" : "Add New Milestone"}
				</h2>
			</div>
			<Form {...form} onSubmit={onSubmit}>
			<Form.control
				name="title"
				title="Milestone Title"
				ico={<Flag size={16} />}
				placeholder="Released v1.0"
			/>

			<Form.control
				name="description"
				title="Description"
				ico={<AlignLeft size={16} />}
				placeholder="Impact details..."
			/>

			<Form.control
				name="milestone_date"
				title="Date"
				type="date"
				ico={<Calendar size={16} />}
			/>

			<Form.control name="sort_order" title="Sort Order" type="number" />

			<Form.button.submit
				title={isEdit ? "Update" : "Add"}
				isLoading={mutation.isLoading || false}
				loading_title={isEdit ? "Updating..." : "Adding..."}
				className="w-full mt-4 bg-primary text-primary-foreground font-bold py-3 rounded-lg"
			/>
			</Form>
		</div>
	);
}
