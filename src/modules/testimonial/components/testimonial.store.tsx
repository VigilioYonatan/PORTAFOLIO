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
import { useForm } from "react-hook-form";
import type { TestimonialIndexResponseDto } from "../dtos/testimonial.response.dto";

interface TestimonialStoreProps {
	refetch: (data: Refetch<TestimonialIndexResponseDto["results"]>) => void;
	onClose: () => void;
}

export default function TestimonialStore({
	refetch,
	onClose,
}: TestimonialStoreProps) {
	const storeMut = testimonialStoreApi();

	const form = useForm<TestimonialStoreDto>({
		resolver: zodResolver(testimonialStoreDto),
		mode: "all",
	});

	const onSubmit = (body: TestimonialStoreDto) => {
		storeMut.mutate(body, {
			onSuccess(result) {
				sweetModal({
					title: "Testimonio Inyectado",
					icon: "success",
				});
				refetch(result.testimonial);
				onClose();
			},
			onError(err) {
				handlerError(form, err, "Error al inyectar testimonio");
			},
		});
	};

	return (
		<Form {...form} onSubmit={onSubmit}>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Form.control<TestimonialStoreDto>
					name="author_name"
					title="Nombre del Autor"
					placeholder="Ej. John Doe"
					required
				/>
				<Form.control<TestimonialStoreDto>
					name="author_role"
					title="Cargo / Rol"
					placeholder="Ej. CEO / CTO"
					required
				/>
			</div>

			<Form.control<TestimonialStoreDto>
				name="author_company"
				title="Empresa"
				placeholder="Ej. Tech Corp"
			/>

			<Form.control.area<TestimonialStoreDto>
				name="content"
				title="Contenido del Testimonio"
				placeholder="Describe la experiencia de trabajo..."
				required
				rows={4}
			/>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4 mt-4">
				<Form.control.toggle<TestimonialStoreDto>
					name="is_visible"
					title="Visible"
				/>
				<Form.control<TestimonialStoreDto>
					name="sort_order"
					title="Orden"
					type="number"
					options={{ setValueAs: formSelectNumber }}
				/>
			</div>

			<div className="mt-4">
				<Form.control.file<TestimonialStoreDto>
					name="avatar"
					title="Avatar del Autor"
					entity="testimonial"
					property="avatar"
					accept="image/*"
				/>
			</div>

			<Form.button.submit
				title="Inyectar Testimonio"
				loading_title="Procesando..."
				isLoading={storeMut.isLoading || false}
				disabled={storeMut.isLoading || false}
				className="w-full mt-6"
			/>
		</Form>
	);
}
