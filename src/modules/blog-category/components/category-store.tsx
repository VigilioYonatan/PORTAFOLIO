import WebForm from "@components/web_form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { blogCategoryStoreApi } from "@modules/blog-category/apis/blog-category.store.api";
import {
	type BlogCategoryStoreDto,
	blogCategoryStoreDto,
} from "@modules/blog-category/dtos/blog-category.store.dto";
import { sweetModal } from "@vigilio/sweet";
import { Tag } from "lucide-preact";
import type { Refetch } from "@infrastructure/types/client";
import { useEffect } from "preact/hooks";
import { type Resolver, useForm } from "react-hook-form";
import type { BlogCategoryIndexResponseDto } from "../dtos/blog-category.response.dto";
import { type Lang, useTranslations } from "@src/i18n";

interface CategoryStoreProps {
	refetch: (data: Refetch<BlogCategoryIndexResponseDto["results"]>) => void;
	onClose: () => void;
    lang?: Lang;
}

export default function CategoryStore({
	refetch,
	onClose,
    lang = "es"
}: CategoryStoreProps) {
    const t = useTranslations(lang);
	const storeMut = blogCategoryStoreApi();

	const form = useForm<BlogCategoryStoreDto>({
		resolver: zodResolver(blogCategoryStoreDto) as Resolver<BlogCategoryStoreDto>,
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
					title: t("dashboard.category.form.success_create"),
					icon: "success",
				});
				refetch(category);
				onClose();
			},
			onError(err) {
				handlerError(form, err, t("common.error"));
			},
		});
	};

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-bold mb-4 text-white">{t("dashboard.category.form.create_title")}</h2>
			<WebForm {...form} onSubmit={onSubmit}>
				<WebForm.control
					name="name"
					title={t("dashboard.category.form.name")}
					placeholder="DevOps"
					ico={<Tag size={16} />}
				/>
				<WebForm.control
					name="slug"
					title={t("dashboard.category.form.slug")}
					placeholder="devops"
					ico={<Tag size={16} />}
				/>
				<WebForm.control.area
					name="description"
					title={t("dashboard.category.form.description")}
					placeholder="Artículos relacionados con infraestructura..."
				/>
				<WebForm.button.submit
					title={t("dashboard.category.form.submit_create")}
					loading_title={t("common.loading")}
					isLoading={storeMut.isLoading || false}
					disabled={storeMut.isLoading || false}
					className="w-full mt-4 bg-primary text-primary-foreground font-bold py-3 rounded-lg"
				/>
			</WebForm>
		</div>
	);
}
