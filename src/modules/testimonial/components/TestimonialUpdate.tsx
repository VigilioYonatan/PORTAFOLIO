import Form, { formSelectNumber } from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { testimonialUpdateApi } from "@modules/testimonial/apis/testimonial.update.api";
import { testimonialUpdateDto, type TestimonialUpdateDto } from "@modules/testimonial/dtos/testimonial.update.dto";
import type { TestimonialSchema } from "@modules/testimonial/schemas/testimonial.schema";
import { sweetModal } from "@vigilio/sweet";
import { useForm } from "react-hook-form";
import type { Refetch } from "@infrastructure/types/client";
import type { TestimonialIndexResponseDto } from "../dtos/testimonial.response.dto";

interface TestimonialUpdateProps {
	testimonial: TestimonialSchema;
	refetch: (data: Refetch<TestimonialIndexResponseDto["results"]>) => void;
	onClose: () => void;
}

export default function TestimonialUpdate({
	testimonial,
	refetch,
	onClose,
}: TestimonialUpdateProps) {
	const updateMut = testimonialUpdateApi(testimonial.id);

	const form = useForm<TestimonialUpdateDto>({
		resolver: zodResolver(testimonialUpdateDto) as any,
		mode: "all",
		defaultValues: { ...testimonial } as any,
	});

	const onSubmit = (data: any) => {
		updateMut.mutate(data as unknown as any, {
			onSuccess(result) {
				sweetModal({
					title: "Testimonio Actualizado",
					icon: "success",
				});
				refetch(result.testimonial);
				onClose();
			},
			onError(err: any) {
				handlerError(form, err, "Error");
			},
		});
	};

	return (
		<Form {...form} onSubmit={onSubmit}>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Form.control<any>
					name="author_name"
					title="Nombre del Autor"
					placeholder="Ej. John Doe"
					required
				/>
				<Form.control<any>
					name="author_role"
					title="Cargo / Rol"
					placeholder="Ej. CEO / CTO"
					required
				/>
			</div>

			<Form.control<any>
				name="author_company"
				title="Empresa"
				placeholder="Ej. Tech Corp"
			/>

			<Form.control.area<any>
				name="content"
				title="Contenido del Testimonio"
				placeholder="Describe la experiencia de trabajo..."
				required
				rows={4}
			/>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4 mt-4">
				<Form.control.toggle<any>
					name="is_visible"
					title="Visible"
				/>
				<Form.control<any>
					name="sort_order"
					title="Orden"
					type="number"
					options={{ setValueAs: formSelectNumber }}
				/>
			</div>

			<div className="mt-4">
				<Form.control.file<any>
					name="avatar"
					title="Avatar del Autor"
					entity="testimonial"
					property="avatar"
					accept="image/*"
				/>
			</div>

			<Form.button.submit
				title="Actualizar Testimonio"
				loading_title="Procesando..."
				isLoading={updateMut.isLoading || false}
				disabled={updateMut.isLoading || false}
				className="w-full mt-6"
			/>
		</Form>
	);
}
