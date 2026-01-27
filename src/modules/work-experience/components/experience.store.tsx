import Form, { formSelectNumber } from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Refetch } from "@infrastructure/types/client";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { workExperienceStoreApi } from "@modules/work-experience/apis/work-experience.store.api";
import {
	type WorkExperienceStoreDto,
	workExperienceStoreDto,
} from "@modules/work-experience/dtos/work-experience.store.dto";
import { sweetModal } from "@vigilio/sweet";
import { useForm } from "react-hook-form";
import type { WorkExperienceIndexResponseDto } from "../dtos/work-experience.response.dto";

interface ExperienceStoreProps {
	refetch: (data: Refetch<WorkExperienceIndexResponseDto["results"]>) => void;
	onClose: () => void;
}

export default function ExperienceStore({
	refetch,
	onClose,
}: ExperienceStoreProps) {
	const workExperienceStoreMutation = workExperienceStoreApi();

	const workExperienceStoreForm = useForm<WorkExperienceStoreDto>({
		resolver: zodResolver(workExperienceStoreDto),
		mode: "all",
	});

	function onWorkExperienceStore(body: WorkExperienceStoreDto) {
		workExperienceStoreMutation.mutate(body, {
			onSuccess(data) {
				sweetModal({
					icon: "success",
					title: "Registrado",
				});
				refetch(data.experience);
				onClose();
			},
			onError(error) {
				handlerError(
					workExperienceStoreForm,
					error,
					"Error al procesar la solicitud",
				);
			},
		});
	}

	return (
		<Form {...workExperienceStoreForm} onSubmit={onWorkExperienceStore}>
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
					disabled={workExperienceStoreForm.watch("is_current")}
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
				title="Inyectar Experiencia"
				loading_title="Procesando..."
				isLoading={workExperienceStoreMutation.isLoading || false}
				disabled={workExperienceStoreMutation.isLoading || false}
				className="w-full mt-6"
			/>
		</Form>
	);
}
