import Form, { formSelectNumber } from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Refetch } from "@infrastructure/types/client";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { workExperienceStoreApi } from "@modules/work-experience/apis/work-experience.store.api";
import {
	type WorkExperienceStoreDto,
	workExperienceStoreDto,
} from "@modules/work-experience/dtos/work-experience.store.dto";
import { type Lang, useTranslations } from "@src/i18n";
import { sweetModal } from "@vigilio/sweet";
import { type Resolver, useForm } from "react-hook-form";
import type { WorkExperienceIndexResponseDto } from "../dtos/work-experience.response.dto";

interface ExperienceStoreProps {
	refetch: (data: Refetch<WorkExperienceIndexResponseDto["results"]>) => void;
	onClose: () => void;
	lang?: Lang;
}

export default function ExperienceStore({
	refetch,
	onClose,
	lang = "es",
}: ExperienceStoreProps) {
	const t = useTranslations(lang);
	const workExperienceStoreMutation = workExperienceStoreApi();

	const workExperienceStoreForm = useForm<WorkExperienceStoreDto>({
		resolver: zodResolver(
			workExperienceStoreDto,
		) as Resolver<WorkExperienceStoreDto>,
		mode: "all",
	});

	function onWorkExperienceStore(body: WorkExperienceStoreDto) {
		workExperienceStoreMutation.mutate(body, {
			onSuccess(data) {
				sweetModal({
					icon: "success",
					title: t("dashboard.experience.form.success_create"),
				});
				refetch(data.experience);
				onClose();
			},
			onError(error) {
				handlerError(workExperienceStoreForm, error, t("common.error"));
			},
		});
	}

	return (
		<Form {...workExperienceStoreForm} onSubmit={onWorkExperienceStore}>
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
					disabled={workExperienceStoreForm.watch("is_current")}
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
				title={t("dashboard.experience.form.submit_create")}
				loading_title={t("common.loading")}
				isLoading={workExperienceStoreMutation.isLoading || false}
				disabled={workExperienceStoreMutation.isLoading || false}
				className="w-full mt-6"
			/>
		</Form>
	);
}
