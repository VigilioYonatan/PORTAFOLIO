import Form, { formSelectNumber } from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Refetch } from "@infrastructure/types/client";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { testimonialUpdateApi } from "@modules/testimonial/apis/testimonial.update.api";
import {
	type TestimonialUpdateDto,
	testimonialUpdateDto,
} from "@modules/testimonial/dtos/testimonial.update.dto";
import type { TestimonialSchema } from "@modules/testimonial/schemas/testimonial.schema";
import { sweetModal } from "@vigilio/sweet";
import { useForm, type Resolver } from "react-hook-form";
import type { TestimonialIndexResponseDto } from "../dtos/testimonial.response.dto";
import { type Lang, useTranslations } from "@src/i18n";

interface TestimonialUpdateProps {
	testimonial: TestimonialSchema;
	refetch: (data: Refetch<TestimonialIndexResponseDto["results"]>) => void;
	onClose: () => void;
    lang?: Lang;
}

export default function TestimonialUpdate({
	testimonial,
	refetch,
	onClose,
    lang = "es"
}: TestimonialUpdateProps) {
	const updateMut = testimonialUpdateApi(testimonial.id);
    const t = useTranslations(lang);

	const form = useForm<TestimonialUpdateDto>({
		resolver: zodResolver(testimonialUpdateDto) as Resolver<TestimonialUpdateDto>,
		mode: "all",
		defaultValues: { ...testimonial },
	});

	const onSubmit = (body: TestimonialUpdateDto) => {
		updateMut.mutate(body, {
			onSuccess(result) {
				sweetModal({
					title: t("dashboard.testimonial.form.success_update"),
					icon: "success",
				});
				refetch(result.testimonial);
				onClose();
			},
			onError(err) {
				handlerError(form, err, t("common.error"));
			},
		});
	};

	return (
		<Form {...form} onSubmit={onSubmit}>
            <div class="flex flex-col gap-1 border-b border-white/5 pb-4 mb-4">
				<h2 class="text-xl font-black tracking-tight text-foreground uppercase">
					{t("dashboard.testimonial.form.edit_title")}
				</h2>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Form.control<TestimonialUpdateDto>
					name="author_name"
					title={t("dashboard.testimonial.form.author_name")}
					placeholder="Ej. John Doe"
					required
				/>
				<Form.control<TestimonialUpdateDto>
					name="author_role"
					title={t("dashboard.testimonial.form.author_role")}
					placeholder="Ej. CEO / CTO"
					required
				/>
			</div>

			<Form.control<TestimonialUpdateDto>
				name="author_company"
				title={t("dashboard.testimonial.form.author_company")}
				placeholder="Ej. Tech Corp"
			/>

			<Form.control.area<TestimonialUpdateDto>
				name="content"
				title={t("dashboard.testimonial.form.content")}
				placeholder="Describe la experiencia de trabajo..."
				required
				rows={4}
			/>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4 mt-4">
				<Form.control.toggle<TestimonialUpdateDto>
					name="is_visible"
					title={t("dashboard.testimonial.form.visible")}
				/>
				<Form.control<TestimonialUpdateDto>
					name="sort_order"
					title={t("dashboard.testimonial.form.sort_order")}
					type="number"
					options={{ setValueAs: formSelectNumber }}
				/>
			</div>

			<div className="mt-4">
				<Form.control.file<TestimonialUpdateDto>
					name="avatar"
					title={t("dashboard.testimonial.form.avatar")}
					entity="testimonial"
					property="avatar"
					accept="image/*"
				/>
			</div>

			<Form.button.submit
				title={t("dashboard.testimonial.form.submit_update")}
				loading_title={t("common.loading")}
				isLoading={updateMut.isLoading || false}
				disabled={updateMut.isLoading || false}
				className="w-full mt-6"
			/>
		</Form>
	);
}
