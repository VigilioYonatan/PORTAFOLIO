import WebForm from "@components/web_form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { blogCategoryUpdateApi } from "@modules/blog-category/apis/blog-category.update.api";
import {
	type BlogCategoryUpdateDto,
	blogCategoryUpdateDto,
} from "@modules/blog-category/dtos/blog-category.update.dto";
import type { BlogCategorySchema } from "@modules/blog-category/schemas/blog-category.schema";
import { sweetModal } from "@vigilio/sweet";
import { Tag } from "lucide-preact";
import type { Refetch } from "@infrastructure/types/client";
import { useEffect } from "preact/hooks";
import { useForm } from "react-hook-form";
import type { BlogCategoryIndexResponseDto } from "../dtos/blog-category.response.dto";

interface CategoryUpdateProps {
	category: BlogCategorySchema;
	refetch: (data: Refetch<BlogCategoryIndexResponseDto["results"]>) => void;
	onClose: () => void;
}

export default function CategoryUpdate({
	category,
	refetch,
	onClose,
}: CategoryUpdateProps) {
	const updateMut = blogCategoryUpdateApi(category.id);

	const form = useForm<BlogCategoryUpdateDto>({
		resolver: zodResolver(blogCategoryUpdateDto),
		defaultValues: { ...category },
	});

	const name = form.watch("name");
	useEffect(() => {
		if (name && name !== category.name) {
			form.setValue(
				"slug",
				name
					.toLowerCase()
					.replace(/ /g, "-")
					.replace(/[^\w-]+/g, ""),
			);
		}
	}, [name]);

	const onSubmit = (body: BlogCategoryUpdateDto) => {
		updateMut.mutate(body, {
			onSuccess({ category: updated }) {
				sweetModal({
					title: "Categoría Actualizada",
					icon: "success",
				});
				refetch(updated);
				onClose();
			},
			onError(err) {
				handlerError(form, err, "Error al actualizar");
			},
		});
	};


	return (
		<div className="space-y-4">
			<h2 className="text-xl font-bold mb-4 text-white">Editar Categoría</h2>
			<WebForm {...form} onSubmit={onSubmit}>
				<WebForm.control
					name="name"
					title="Nombre"
					placeholder="DevOps"
					ico={<Tag size={16} />}
				/>
				<WebForm.control
					name="slug"
					title="Slug"
					placeholder="devops"
					ico={<Tag size={16} />}
				/>
				<WebForm.control.area
					name="description"
					title="Descripción"
					placeholder="Artículos relacionados con infraestructura..."
				/>
				<WebForm.button.submit
					title="Actualizar"
					loading_title="Actualizando..."
					isLoading={updateMut.isLoading || false}
					disabled={updateMut.isLoading || false}
					className="w-full mt-4 bg-primary text-primary-foreground font-bold py-3 rounded-lg"
				/>
			</WebForm>
		</div>
	);
}
