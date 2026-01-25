import Form, { formSelectNumber } from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { workMilestoneUpdateApi } from "@modules/work-milestone/apis/work-milestone.update.api";
import { workMilestoneStoreDto } from "@modules/work-milestone/dtos/work-milestone.store.dto";
import type { WorkMilestoneSchema } from "@modules/work-milestone/schemas/work-milestone.schema";
import { sweetModal } from "@vigilio/sweet";
import { useForm } from "react-hook-form";
import type { Refetch } from "@infrastructure/types/client";
import type { WorkMilestoneIndexResponseDto } from "../dtos/work-milestone.response.dto";
import type { WorkMilestoneStoreDto } from "@modules/work-milestone/dtos/work-milestone.store.dto";

interface MilestoneUpdateProps {
	experienceId: number;
	milestone: WorkMilestoneSchema;
	refetch: (data: Refetch<WorkMilestoneIndexResponseDto["results"]>) => void;
	onClose: () => void;
}

export default function MilestoneUpdate({
	experienceId,
	milestone,
	refetch,
	onClose,
}: MilestoneUpdateProps) {
	const workMilestoneUpdateMutation = workMilestoneUpdateApi(milestone.id);

	const workMilestoneUpdateForm = useForm<WorkMilestoneStoreDto>({
		resolver: zodResolver(workMilestoneStoreDto),
		mode: "all",
		defaultValues: { ...milestone },
	});

	function onWorkMilestoneUpdate(body: WorkMilestoneStoreDto) {
		workMilestoneUpdateMutation.mutate(body, {
			onSuccess(data) {
				sweetModal({
					icon: "success",
					title: "Hito Actualizado",
				});
				refetch(data.milestone);
				onClose();
			},
			onError(error) {
				handlerError(
					workMilestoneUpdateForm,
					error,
					"Error al procesar la solicitud",
				);
			},
		});
	}

	return (
		<Form {...workMilestoneUpdateForm} onSubmit={onWorkMilestoneUpdate}>
			<Form.control<WorkMilestoneStoreDto>
				name="title"
				title="Título del Hito"
				placeholder="Ej. Lanzamiento de MVP"
				required
			/>
			<Form.control.area<WorkMilestoneStoreDto>
				name="description"
				title="Descripción"
				placeholder="Describe el hito logrado..."
				required
			/>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Form.control<WorkMilestoneStoreDto>
					name="milestone_date"
					title="Fecha"
					type="date"
					required
				/>
				<Form.control<WorkMilestoneStoreDto>
					name="sort_order"
					title="Orden"
					type="number"
					placeholder="0"
					options={{ setValueAs: formSelectNumber }}
				/>
			</div>

			<Form.control<WorkMilestoneStoreDto>
				name="icon"
				title="Icono (Lucide name)"
				placeholder="Ej. rocket"
			/>
			<Form.button.submit
				title="Actualizar Hito"
				loading_title="Procesando..."
				isLoading={workMilestoneUpdateMutation.isLoading || false}
				disabled={workMilestoneUpdateMutation.isLoading || false}
				className="w-full mt-6"
			/>
		</Form>
	);
}
