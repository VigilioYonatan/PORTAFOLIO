import WebForm from "@components/web_form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { blogCategoryStoreApi } from "@modules/blog-category/apis/blog-category.store.api";
import {
	type BlogCategoryStoreDto,
	blogCategoryStoreDto
} from "@modules/blog-category/dtos/blog-category.store.dto";
import { sweetModal } from "@vigilio/sweet";
import { Tag } from "lucide-preact";
import type { Refetch } from "@infrastructure/types/client";
import { useEffect } from "preact/hooks";
import { useForm } from "react-hook-form";
import type { BlogCategoryIndexResponseDto } from "../dtos/blog-category.response.dto";

interface CategoryStoreProps {
	refetch: (data: Refetch<BlogCategoryIndexResponseDto["results"]>) => void;
	onClose: () => void;
}

export default function CategoryStore({
	refetch,
	onClose,
}: CategoryStoreProps) {
	const storeMut = blogCategoryStoreApi();

	const form = useForm<BlogCategoryStoreDto>({
		resolver: zodResolver(blogCategoryStoreDto),
	});

	const name = form.watch("name");
	useEffect(() => {
		if (name) {
			form.setValue(
				"slug",
				name
					.toLowerCase()
					.replace(/ /g, "-")
					.replace(/[^\w-]+/g, ""),
			);
		}
	}, [name]);

	const onSubmit = (body: BlogCategoryStoreDto) => {
		storeMut.mutate(body, {
			onSuccess({ category }) {
				sweetModal({
					title: "Categoría Creada",
					icon: "success",
				});
				refetch(category);
				onClose();
			},
			onError(err) {
				handlerError(form, err, "Error al crear");
			},
		});
	};
	


	return (
		<div className="space-y-4">
			<h2 className="text-xl font-bold mb-4 text-white">Nueva Categoría</h2>
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
					title="Crear"
					loading_title="Creando..."
					isLoading={storeMut.isLoading || false}
					disabled={storeMut.isLoading || false}
					className="w-full mt-4 bg-primary text-primary-foreground font-bold py-3 rounded-lg"
				/>
			</WebForm>
		</div>
	);
}
