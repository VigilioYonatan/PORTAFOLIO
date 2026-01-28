import Form, { formSelectNumber } from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Refetch } from "@infrastructure/types/client";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { testimonialStoreApi } from "@modules/testimonial/apis/testimonial.store.api";
import {
	type TestimonialStoreDto,
	testimonialStoreDto,
} from "@modules/testimonial/dtos/testimonial.store.dto";
import { sweetModal } from "@vigilio/sweet";
import { useForm, type Resolver } from "react-hook-form";
import type { TestimonialIndexResponseDto } from "../dtos/testimonial.response.dto";
import { type Lang, useTranslations } from "@src/i18n";

interface TestimonialStoreProps {
	refetch: (data: Refetch<TestimonialIndexResponseDto["results"]>) => void;
	onClose: () => void;
    lang?: Lang;
}

export default function TestimonialStore({
	refetch,
	onClose,
    lang = "es"
}: TestimonialStoreProps) {
    const t = useTranslations(lang);
	const storeMut = testimonialStoreApi();

	const form = useForm<TestimonialStoreDto>({
		resolver: zodResolver(testimonialStoreDto) as Resolver<TestimonialStoreDto>,
		mode: "all",
	});

	const onSubmit = (body: TestimonialStoreDto) => {
		storeMut.mutate(body, {
			onSuccess(result) {
				sweetModal({
					title: t("dashboard.testimonial.form.success_create"),
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
					{t("dashboard.testimonial.form.create_title")}
				</h2>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Form.control<TestimonialStoreDto>
					name="author_name"
					title={t("dashboard.testimonial.form.author_name")}
					placeholder="Ej. John Doe"
					required
				/>
				<Form.control<TestimonialStoreDto>
					name="author_role"
					title={t("dashboard.testimonial.form.author_role")}
					placeholder="Ej. CEO / CTO"
					required
				/>
			</div>

			<Form.control<TestimonialStoreDto>
				name="author_company"
				title={t("dashboard.testimonial.form.author_company")}
				placeholder="Ej. Tech Corp"
			/>

			<Form.control.area<TestimonialStoreDto>
				name="content"
				title={t("dashboard.testimonial.form.content")}
				placeholder="Describe la experiencia de trabajo..."
				required
				rows={4}
			/>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4 mt-4">
				<Form.control.toggle<TestimonialStoreDto>
					name="is_visible"
					title={t("dashboard.testimonial.form.visible")}
				/>
				<Form.control<TestimonialStoreDto>
					name="sort_order"
					title={t("dashboard.testimonial.form.sort_order")}
					type="number"
					options={{ setValueAs: formSelectNumber }}
				/>
			</div>

			<div className="mt-4">
				<Form.control.file<TestimonialStoreDto>
					name="avatar"
					title={t("dashboard.testimonial.form.avatar")}
					entity="testimonial"
					property="avatar"
					accept="image/*"
				/>
			</div>

			<Form.button.submit
				title={t("dashboard.testimonial.form.submit_create")}
				loading_title={t("common.loading")}
				isLoading={storeMut.isLoading || false}
				disabled={storeMut.isLoading || false}
				className="w-full mt-6"
			/>
		</Form>
	);
}
