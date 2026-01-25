import Form, { formSelectNumber } from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { workExperienceUpdateApi } from "@modules/work-experience/apis/work-experience.update.api";
import { workExperienceStoreDto } from "@modules/work-experience/dtos/work-experience.store.dto";
import type { WorkExperienceSchema } from "@modules/work-experience/schemas/work-experience.schema";
import { sweetModal } from "@vigilio/sweet";
import { useForm } from "react-hook-form";
import type { Refetch } from "@infrastructure/types/client";
import type { WorkExperienceIndexResponseDto } from "../dtos/work-experience.response.dto";
import type { WorkExperienceStoreDto } from "@modules/work-experience/dtos/work-experience.store.dto";

interface ExperienceUpdateProps {
	experience: WorkExperienceSchema;
	refetch: (data: Refetch<WorkExperienceIndexResponseDto["results"]>) => void;
	onClose: () => void;
}

export default function ExperienceUpdate({
	experience,
	refetch,
	onClose,
}: ExperienceUpdateProps) {
	const workExperienceUpdateMutation = workExperienceUpdateApi(experience.id);

	const workExperienceUpdateForm = useForm<WorkExperienceStoreDto>({
		resolver: zodResolver(workExperienceStoreDto),
		mode: "all",
		defaultValues: { ...experience } as any,
	});

	function onWorkExperienceUpdate(body: WorkExperienceStoreDto) {
		workExperienceUpdateMutation.mutate(body, {
			onSuccess(data) {
				sweetModal({
					icon: "success",
					title: "Actualizado",
				});
				refetch(data.experience);
				onClose();
			},
			onError(error) {
				handlerError(
					workExperienceUpdateForm,
					error,
					"Error al procesar la solicitud",
				);
			},
		});
	}

	return (
		<Form {...workExperienceUpdateForm} onSubmit={onWorkExperienceUpdate}>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Form.control<WorkExperienceStoreDto>
					name="company"
					title="Empresa"
					placeholder="Ej. Google"
					required
				/>
				<Form.control<WorkExperienceStoreDto>
					name="position"
					title="Cargo"
					placeholder="Ej. Senior Full Stack"
					required
				/>
			</div>
			<Form.control<WorkExperienceStoreDto>
				name="location"
				title="Ubicación"
				placeholder="Ej. Mountain View, CA (Remote)"
			/>
			<Form.control.area<WorkExperienceStoreDto>
				name="description"
				title="Descripción"
				placeholder="Describe tus responsabilidades y logros..."
				required
			/>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Form.control<WorkExperienceStoreDto>
					name="start_date"
					title="Fecha de Inicio"
					type="date"
					required
				/>
				<Form.control<WorkExperienceStoreDto>
					name="end_date"
					title="Fecha de Fin"
					type="date"
					disabled={workExperienceUpdateForm.watch("is_current")}
				/>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4 mt-4">
				<Form.control.toggle<WorkExperienceStoreDto>
					name="is_current"
					title="Trabajo Actual"
				/>
				<Form.control.toggle<WorkExperienceStoreDto>
					name="is_visible"
					title="Visible"
				/>
				<Form.control<WorkExperienceStoreDto>
					name="sort_order"
					title="Orden"
					type="number"
					options={{ setValueAs: formSelectNumber }}
				/>
			</div>
			<Form.button.submit
				title="Actualizar Nodo"
				loading_title="Procesando..."
				isLoading={workExperienceUpdateMutation.isLoading || false}
				disabled={workExperienceUpdateMutation.isLoading || false}
				className="w-full mt-6"
			/>
		</Form>
	);
}
