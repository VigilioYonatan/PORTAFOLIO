import Form, { formSelectNumber } from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Refetch } from "@infrastructure/types/client";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { formatDate } from "@infrastructure/utils/hybrid";
import { workExperienceUpdateApi } from "@modules/work-experience/apis/work-experience.update.api";
import type { WorkExperienceStoreDto } from "@modules/work-experience/dtos/work-experience.store.dto";
import { workExperienceUpdateDto } from "@modules/work-experience/dtos/work-experience.update.dto";
import type { WorkExperienceSchema } from "@modules/work-experience/schemas/work-experience.schema";
import { type Lang, useTranslations } from "@src/i18n";
import { sweetModal } from "@vigilio/sweet";
import { type Resolver, useForm } from "react-hook-form";
import type { WorkExperienceIndexResponseDto } from "../dtos/work-experience.response.dto";

interface ExperienceUpdateProps {
	experience: WorkExperienceSchema;
	refetch: (data: Refetch<WorkExperienceIndexResponseDto["results"]>) => void;
	onClose: () => void;
	lang?: Lang;
}

export default function ExperienceUpdate({
	experience,
	refetch,
	onClose,
	lang = "es",
}: ExperienceUpdateProps) {
	const t = useTranslations(lang);
	const workExperienceUpdateMutation = workExperienceUpdateApi(experience.id);

	const workExperienceUpdateForm = useForm<WorkExperienceStoreDto>({
		resolver: zodResolver(
			workExperienceUpdateDto,
		) as Resolver<WorkExperienceStoreDto>,
		mode: "all",
		defaultValues: {
			...experience,
			start_date: experience.start_date
				? (formatDate(experience.start_date, "YYYY-MM-DD") as Date)
				: undefined,
			end_date: experience.end_date
				? (formatDate(experience.end_date, "YYYY-MM-DD") as Date)
				: undefined,
		},
	});

	function onWorkExperienceUpdate(body: WorkExperienceStoreDto) {
		workExperienceUpdateMutation.mutate(body, {
			onSuccess(data) {
				sweetModal({
					icon: "success",
					title: t("dashboard.experience.form.success_update"),
				});
				refetch(data.experience);
				onClose();
			},
			onError(error) {
				handlerError(workExperienceUpdateForm, error, t("common.error"));
			},
		});
	}

	return (
		<Form {...workExperienceUpdateForm} onSubmit={onWorkExperienceUpdate}>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Form.control<WorkExperienceStoreDto>
					name="company"
					title={t("dashboard.experience.form.company")}
					placeholder="Ej. Google"
					required
				/>
				<Form.control<WorkExperienceStoreDto>
					name="position"
					title={t("dashboard.experience.form.position")}
					placeholder="Ej. Senior Full Stack"
					required
				/>
			</div>
			<Form.control<WorkExperienceStoreDto>
				name="location"
				title={t("dashboard.experience.form.location")}
				placeholder="Ej. Mountain View, CA (Remote)"
			/>
			<Form.control.area<WorkExperienceStoreDto>
				name="description"
				title={t("dashboard.experience.form.description")}
				placeholder="Describe tus responsabilidades y logros..."
				required
			/>
			<Form.control.area<WorkExperienceStoreDto>
				name="content"
				title={t("dashboard.experience.form.content")}
				placeholder="Contenido detallado en formato Markdown..."
			/>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Form.control<WorkExperienceStoreDto>
					name="start_date"
					title={t("dashboard.experience.form.start_date")}
					type="date"
					required
				/>
				<Form.control<WorkExperienceStoreDto>
					name="end_date"
					title={t("dashboard.experience.form.end_date")}
					type="date"
					disabled={workExperienceUpdateForm.watch("is_current")}
				/>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4 mt-4">
				<Form.control.toggle<WorkExperienceStoreDto>
					name="is_current"
					title={t("dashboard.experience.form.current")}
				/>
				<Form.control.toggle<WorkExperienceStoreDto>
					name="is_visible"
					title={t("dashboard.experience.form.visible")}
				/>
				<Form.control<WorkExperienceStoreDto>
					name="sort_order"
					title={t("dashboard.experience.form.sort_order")}
					type="number"
					options={{ setValueAs: formSelectNumber }}
				/>
			</div>
			<Form.button.submit
				title={t("dashboard.experience.form.submit_update")}
				loading_title={t("common.loading")}
				isLoading={workExperienceUpdateMutation.isLoading || false}
				disabled={workExperienceUpdateMutation.isLoading || false}
				className="w-full mt-6"
			/>
		</Form>
	);
}
