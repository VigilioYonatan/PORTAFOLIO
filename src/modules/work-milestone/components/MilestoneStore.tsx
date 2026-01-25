import Form, { formSelectNumber } from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { workMilestoneStoreApi } from "@modules/work-milestone/apis/work-milestone.store.api";
import {
	type WorkMilestoneStoreDto,
	workMilestoneStoreDto,
} from "@modules/work-milestone/dtos/work-milestone.store.dto";
import { sweetModal } from "@vigilio/sweet";
import { useForm } from "react-hook-form";
import type { Refetch } from "@infrastructure/types/client";
import type { WorkMilestoneIndexResponseDto } from "../dtos/work-milestone.response.dto";

interface MilestoneStoreProps {
	experienceId: number;
	refetch: (data: Refetch<WorkMilestoneIndexResponseDto["results"]>) => void;
	onClose: () => void;
}

export default function MilestoneStore({
	experienceId,
	refetch,
	onClose,
}: MilestoneStoreProps) {
	const workMilestoneStoreMutation = workMilestoneStoreApi();

	const workMilestoneStoreForm = useForm<WorkMilestoneStoreDto>({
		resolver: zodResolver(workMilestoneStoreDto),
		mode: "all",
	});

	function onWorkMilestoneStore(body: WorkMilestoneStoreDto) {
		workMilestoneStoreMutation.mutate(
			{ ...body, work_experience_id: experienceId },
			{
				onSuccess(data) {
				sweetModal({
					icon: "success",
					title: "Hito Registrado",
				});
				refetch(data.milestone);
				onClose();
			},
			onError(error) {
				handlerError(
					workMilestoneStoreForm,
					error,
					"Error al procesar la solicitud",
				);
			},
		});
	}

	return (
		<Form {...workMilestoneStoreForm} onSubmit={onWorkMilestoneStore}>
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
					title="Orden de Clasificación"
					type="number"
					placeholder="Ej. 0"
					options={{ setValueAs: formSelectNumber }}
				/>
			</div>
			<Form.control<WorkMilestoneStoreDto>
				name="icon"
				title="Icono (Clase Lucide/CSS)"
				placeholder="Ej. rocket"
			/>
			<Form.button.submit
				title="Registrar Hito"
				loading_title="Procesando..."
				isLoading={workMilestoneStoreMutation.isLoading || false}
				disabled={workMilestoneStoreMutation.isLoading || false}
				className="w-full mt-6"
			/>
		</Form>
	);
}
