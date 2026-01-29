import Form, { formSelectNumber } from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Refetch } from "@infrastructure/types/client";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { slugify } from "@infrastructure/utils/hybrid";
import { blogCategoryIndexApi } from "@modules/blog-category/apis/blog-category.index.api";
import { blogPostStoreApi } from "@modules/blog-post/apis/blog-post.store.api";
import {
	type BlogPostStoreDto,
	blogPostStoreDto,
} from "@modules/blog-post/dtos/blog-post.store.dto";
import {
	typeTextExtensions,
	UPLOAD_CONFIG,
} from "@modules/uploads/const/upload.const";
import { type Lang, useTranslations } from "@src/i18n";
import { sweetModal } from "@vigilio/sweet";
import { FileText, Image as ImageIcon, Link, Tag } from "lucide-preact";
import { useEffect, useMemo } from "preact/hooks";
import { type Resolver, useForm } from "react-hook-form";
import type { BlogPostIndexResponseDto } from "../dtos/blog-post.response.dto";

interface BlogPostStoreProps {
	refetch: (data: Refetch<BlogPostIndexResponseDto["results"]>) => void;
	onClose: () => void;
	lang?: Lang;
}

export default function BlogPostStore({
	refetch,
	onClose,
	lang = "es",
}: BlogPostStoreProps) {
	const t = useTranslations(lang);
	const blogPostStoreMutation = blogPostStoreApi();
	const categoriesQuery = blogCategoryIndexApi(null);

	const blogPostStoreForm = useForm<BlogPostStoreDto>({
		resolver: zodResolver(blogPostStoreDto) as Resolver<BlogPostStoreDto>,
		mode: "all",
		defaultValues: {
			seo: {
				title: "",
				description: "",
				keywords: null,
				og_image: null,
			},
		},
	});

	const title = blogPostStoreForm.watch("title");
	console.log(blogPostStoreForm.formState.errors);

	useEffect(() => {
		if (title) {
			blogPostStoreForm.setValue("slug", slugify(title));
		}
	}, [title]);

	function onBlogPostStore(body: BlogPostStoreDto) {
		blogPostStoreMutation.mutate(body, {
			onSuccess(data) {
				sweetModal({
					icon: "success",
					title: t("dashboard.blog.form.success_create"),
					text: `"${body.title}" - ${t("common.success")}`,
				});
				refetch(data.post);
				onClose();
			},
			onError(error) {
				handlerError(blogPostStoreForm, error, t("common.error"));
			},
		});
	}

	const categoryOptions = useMemo(() => {
		return (
			categoriesQuery.data?.results.map((c) => ({
				key: c.id,
				value: c.name,
			})) ?? []
		);
	}, [categoriesQuery.data]);

	return (
		<div class="px-1 space-y-4">
			<div class="flex flex-col gap-1 border-b border-white/5 pb-4 mb-4">
				<span class="text-[9px] font-black tracking-[0.5em] text-primary uppercase animate-pulse">
					{t("dashboard.blog.form.init_create")}
				</span>
				<h2 class="text-xl font-black tracking-tight text-foreground uppercase">
					{t("dashboard.blog.form.create_title")}
				</h2>
			</div>

			<Form {...blogPostStoreForm} onSubmit={onBlogPostStore}>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control<BlogPostStoreDto>
						name="title"
						title={t("dashboard.blog.form.title")}
						ico={<FileText size={18} />}
						placeholder="Ej: El Futuro del Desarrollo Web"
					/>
					<Form.control<BlogPostStoreDto>
						name="slug"
						title={t("dashboard.blog.form.slug")}
						ico={<Link size={18} />}
						placeholder="el-futuro-del-desarrollo-web"
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control.select<BlogPostStoreDto>
						name="category_id"
						title={t("dashboard.blog.form.category")}
						ico={<Tag size={18} />}
						array={categoryOptions}
						placeholder="Seleccionar categoría"
						options={{ setValueAs: formSelectNumber }}
						isLoading={categoriesQuery.isLoading ?? false}
					/>
					<Form.control.toggle<BlogPostStoreDto>
						name="is_published"
						title={t("dashboard.blog.form.published")}
						placeholder="Visible al público"
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control.area<BlogPostStoreDto>
						name="extract"
						title={t("dashboard.blog.form.extract")}
						placeholder="Breve resumen para indexación..."
						rows={2}
					/>
					<Form.control<BlogPostStoreDto>
						name="reading_time_minutes"
						title={t("dashboard.blog.form.reading_time")}
						type="number"
						placeholder="5"
						options={{ setValueAs: formSelectNumber }}
					/>
					<Form.control<BlogPostStoreDto>
						name="published_at"
						title={t("dashboard.blog.form.published_at")}
						type="date"
						placeholder="Seleccionar fecha"
					/>
				</div>

				<Form.control.area<BlogPostStoreDto>
					name="content"
					title={t("dashboard.blog.form.content")}
					placeholder="# Tu historia comienza aquí..."
					rows={8}
				/>

				<div class="space-y-4 pt-4 border-t border-white/5">
					<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
						<Tag size={14} class="text-primary" />{" "}
						{t("dashboard.blog.form.seo_opt")}
					</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Form.control<BlogPostStoreDto>
							name="seo.title"
							title={t("dashboard.blog.form.seo_title")}
							placeholder="Título para buscadores"
						/>
						<Form.control.area<BlogPostStoreDto>
							name="seo.description"
							title={t("dashboard.blog.form.seo_desc")}
							placeholder="Meta descripción (150-160 caracteres)"
							rows={2}
						/>
					</div>
				</div>

				<Form.control.file<BlogPostStoreDto>
					name="cover"
					title={t("dashboard.blog.form.cover")}
					ico={<ImageIcon size={18} />}
					entity="blog_post"
					property="cover"
					typeFile="image"
					typesText={typeTextExtensions(
						UPLOAD_CONFIG.blog_post.cover!.mime_types,
					)}
					accept={UPLOAD_CONFIG.blog_post.cover!.mime_types.join(", ")}
				/>

				<Form.button.submit
					title={t("dashboard.blog.form.submit")}
					loading_title={t("dashboard.blog.form.loading")}
					isLoading={blogPostStoreMutation.isLoading || false}
					disabled={blogPostStoreMutation.isLoading || false}
					className="w-full mt-6 bg-primary text-primary-foreground font-black py-4 uppercase tracking-widest rounded-xl hover:brightness-110 transition-all border-none"
				/>
			</Form>
		</div>
	);
}
