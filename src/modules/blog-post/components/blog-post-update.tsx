import Form, { formSelectNumber } from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Refetch } from "@infrastructure/types/client";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { formatDate } from "@infrastructure/utils/hybrid/date.utils";
import { blogCategoryIndexApi } from "@modules/blog-category/apis/blog-category.index.api";
import { blogPostUpdateApi } from "@modules/blog-post/apis/blog-post.update.api";
import {
	type BlogPostUpdateDto,
	blogPostUpdateDto,
} from "@modules/blog-post/dtos/blog-post.update.dto";
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
import type { BlogPostSchema } from "../schemas/blog-post.schema";

interface BlogPostUpdateProps {
	post: BlogPostSchema;
	refetch: (data: Refetch<BlogPostIndexResponseDto["results"]>) => void;
	onClose: () => void;
	lang?: Lang;
}

export default function BlogPostUpdate({
	post,
	refetch,
	onClose,
	lang = "es",
}: BlogPostUpdateProps) {
	const t = useTranslations(lang);
	const blogPostUpdateMutation = blogPostUpdateApi(post.id);
	const categoriesQuery = blogCategoryIndexApi(null);

	const blogPostUpdateForm = useForm<BlogPostUpdateDto>({
		resolver: zodResolver(blogPostUpdateDto) as Resolver<BlogPostUpdateDto>,
		mode: "all",
		defaultValues: {
			...post,
			published_at: post.published_at
				? (formatDate(post.published_at, "YYYY-MM-DD") as Date)
				: undefined,
		},
	});

	const title = blogPostUpdateForm.watch("title");

	useEffect(() => {
		if (title && title !== post.title) {
			const slug = title
				.toLowerCase()
				.replace(/ /g, "-")
				.replace(/[^\w-]+/g, "");
			blogPostUpdateForm.setValue("slug", slug);
		}
	}, [title]);

	function onBlogPostUpdate(body: BlogPostUpdateDto) {
		blogPostUpdateMutation.mutate(body, {
			onSuccess(data) {
				sweetModal({
					icon: "success",
					title: t("dashboard.blog.form.success_update"),
					text: `"${body.title}" - ${t("common.success")}`,
				});
				refetch(data.post);
				onClose();
			},
			onError(error) {
				handlerError(blogPostUpdateForm, error, t("common.error"));
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
					{t("dashboard.blog.form.init_edit")}
				</span>
				<h2 class="text-xl font-black tracking-tight text-foreground uppercase">
					{t("dashboard.blog.form.edit_title")}
				</h2>
			</div>

			<Form {...blogPostUpdateForm} onSubmit={onBlogPostUpdate}>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control<BlogPostUpdateDto>
						name="title"
						title={t("dashboard.blog.form.title")}
						ico={<FileText size={18} />}
						placeholder="Ej: El Futuro del Desarrollo Web"
					/>
					<Form.control<BlogPostUpdateDto>
						name="slug"
						title={t("dashboard.blog.form.slug")}
						ico={<Link size={18} />}
						placeholder="el-futuro-del-desarrollo-web"
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control.select<BlogPostUpdateDto>
						name="category_id"
						title={t("dashboard.blog.form.category")}
						ico={<Tag size={18} />}
						array={categoryOptions}
						placeholder="Seleccionar categoría"
						options={{ setValueAs: formSelectNumber }}
						isLoading={categoriesQuery.isLoading ?? false}
					/>
					<Form.control.toggle<BlogPostUpdateDto>
						name="is_published"
						title={t("dashboard.blog.form.published")}
						placeholder="Visible al público"
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control.area<BlogPostUpdateDto>
						name="extract"
						title={t("dashboard.blog.form.extract")}
						placeholder="Breve resumen para indexación..."
						rows={2}
					/>
					<Form.control<BlogPostUpdateDto>
						name="reading_time_minutes"
						title={t("dashboard.blog.form.reading_time")}
						type="number"
						placeholder="5"
						options={{ setValueAs: formSelectNumber }}
					/>
				</div>

				<Form.control.area<BlogPostUpdateDto>
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
				</div>

				<Form.control.file<BlogPostUpdateDto>
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
					title={t("dashboard.blog.form.save")}
					loading_title={t("dashboard.blog.form.loading")}
					isLoading={blogPostUpdateMutation.isLoading || false}
					disabled={blogPostUpdateMutation.isLoading || false}
					className="w-full mt-6 bg-primary text-primary-foreground font-black py-4 uppercase tracking-widest rounded-xl hover:brightness-110 transition-all border-none"
				/>
			</Form>
		</div>
	);
}
