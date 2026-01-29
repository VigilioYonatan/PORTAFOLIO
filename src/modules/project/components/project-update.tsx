import { zodResolver } from "@hookform/resolvers/zod";
import type { Refetch } from "@infrastructure/types/client";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { formatDate, now } from "@infrastructure/utils/hybrid/date.utils";
import type { ProjectIndexResponseDto } from "@modules/project/dtos/project.response.dto";
import { technologyIndexApi } from "@modules/technology/apis/technology.index.api";
import { type Lang, useTranslations } from "@src/i18n";
import { sweetModal } from "@vigilio/sweet";
import { type Resolver, useForm } from "react-hook-form";
import { projectUpdateApi } from "../apis/project.update.api";
import {
	type ProjectUpdateDto,
	projectUpdateDto,
} from "../dtos/project.update.dto";
import type { ProjectWithRelations } from "../schemas/project.schema";
import { ProjectForm } from "./project-form";

interface ProjectUpdateProps {
	project: ProjectWithRelations;
	refetch: (data: Refetch<ProjectIndexResponseDto["results"]>) => void;
	onClose: () => void;
	lang?: Lang;
}

export default function ProjectUpdate({
	project,
	refetch,
	onClose,
	lang = "es",
}: ProjectUpdateProps) {
	const t = useTranslations(lang);
	const projectUpdateMutation = projectUpdateApi(project.id);
	const technologiesQuery = technologyIndexApi(null, null, { limit: 100 });

	const projectUpdateForm = useForm<ProjectUpdateDto>({
		resolver: zodResolver(projectUpdateDto) as Resolver<ProjectUpdateDto>,
		mode: "all",
		defaultValues: {
			...project,
			start_date: project.start_date
				? (formatDate(project.start_date, "YYYY-MM-DD") as Date)
				: undefined,
			end_date: project.end_date
				? (formatDate(project.end_date, "YYYY-MM-DD") as Date)
				: undefined,
			techeables: project.techeables.map((t) => t.technology_id),
		},
	});

	console.log({ errors: projectUpdateForm.formState.errors });

	function onProjectUpdate(body: ProjectUpdateDto) {
		sweetModal({
			title:
				t("dashboard.project.delete_confirm_title")?.replace(
					"DELETE",
					"UPDATE",
				) || "¿CONFIRMAR ACTUALIZACIÓN?",
			text: `¿Guardar cambios para "${project.title}"?`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "GUARDAR",
		}).then(({ isConfirmed }) => {
			if (isConfirmed) {
				projectUpdateMutation.mutate(body, {
					onSuccess(data) {
						sweetModal({
							icon: "success",
							title: t("dashboard.project.form.success_update"),
							text: t("dashboard.project.form.success_update"),
						});
						refetch({
							...project,
							...data.project,
							updated_at: now().toDate(),
						});
						onClose();
					},
					onError(error) {
						handlerError(projectUpdateForm, error, "Error de actualización");
					},
				});
			}
		});
	}

	return (
		<ProjectForm
			form={projectUpdateForm}
			onSubmit={onProjectUpdate}
			isLoading={projectUpdateMutation.isLoading || false}
			technologies={technologiesQuery.data?.results || []}
			isUpdate
			initialTitle={project.title}
		/>
	);
}
