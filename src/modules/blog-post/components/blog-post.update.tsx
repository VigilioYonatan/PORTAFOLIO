import Form, { formSelectNumber } from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Refetch } from "@infrastructure/types/client";
import { handlerError } from "@infrastructure/utils/client/handler-error";
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
import { sweetModal } from "@vigilio/sweet";
import { FileText, Image as ImageIcon, Link, Tag } from "lucide-preact";
import { useEffect, useMemo } from "preact/hooks";
import { useForm } from "react-hook-form";
import type { BlogPostIndexResponseDto } from "../dtos/blog-post.response.dto";
import type { BlogPostSchema } from "../schemas/blog-post.schema";

interface BlogPostUpdateProps {
	post: BlogPostSchema;
	refetch: (data: Refetch<BlogPostIndexResponseDto["results"]>) => void;
	onClose: () => void;
}

export default function BlogPostUpdate({
	post,
	refetch,
	onClose,
}: BlogPostUpdateProps) {
	const blogPostUpdateMutation = blogPostUpdateApi(post.id);
	const categoriesQuery = blogCategoryIndexApi(null);

	const blogPostUpdateForm = useForm<BlogPostUpdateDto>({
		resolver: zodResolver(blogPostUpdateDto),
		mode: "all",
		defaultValues: { ...post },
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
					title: "Publicación Actualizada",
					text: `"${body.title}" ha sido sincronizada.`,
				});
				refetch(data.post);
				onClose();
			},
			onError(error) {
				handlerError(
					blogPostUpdateForm,
					error,
					"Error al actualizar la publicación",
				);
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
					REVISING_STORED_CONTENT
				</span>
				<h2 class="text-xl font-black tracking-tight text-foreground uppercase">
					Update Blog Post
				</h2>
			</div>

			<Form {...blogPostUpdateForm} onSubmit={onBlogPostUpdate}>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control<BlogPostUpdateDto>
						name="title"
						title="POST_TITLE"
						ico={<FileText size={18} />}
						placeholder="The Future of Web Dev"
					/>
					<Form.control<BlogPostUpdateDto>
						name="slug"
						title="URL_SLUG"
						ico={<Link size={18} />}
						placeholder="the-future-of-web-dev"
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control.select<BlogPostUpdateDto>
						name="category_id"
						title="CONTENT_CATEGORY"
						ico={<Tag size={18} />}
						array={categoryOptions}
						placeholder="Select category"
						options={{ setValueAs: formSelectNumber }}
						isLoading={categoriesQuery.isLoading ?? false}
					/>
					<Form.control.toggle<BlogPostUpdateDto>
						name="is_published"
						title="PUBLISH_STATUS"
						placeholder="Visible to public"
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control.area<BlogPostUpdateDto>
						name="extract"
						title="CONTENT_EXTRACT"
						placeholder="Brief summary for indexing..."
						rows={2}
					/>
					<Form.control<BlogPostUpdateDto>
						name="reading_time_minutes"
						title="ESTIMATED_TIME (MINUTES)"
						type="number"
						placeholder="5"
						options={{ setValueAs: formSelectNumber }}
					/>
				</div>

				<Form.control.area<BlogPostUpdateDto>
					name="content"
					title="MARKDOWN_CONTENT"
					placeholder="# Your story begins here..."
					rows={8}
				/>

				<div class="space-y-4 pt-4 border-t border-white/5">
					<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
						<Tag size={14} class="text-primary" /> Meta Optimization (SEO)
					</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Form.control<BlogPostUpdateDto>
							name="seo.title"
							title="SEO_TITLE"
							placeholder="Post title for search engines"
						/>
						<Form.control.area<BlogPostUpdateDto>
							name="seo.description"
							title="SEO_DESCRIPTION"
							placeholder="Meta description (150-160 chars recommended)"
							rows={2}
						/>
					</div>
				</div>

				<Form.control.file<BlogPostUpdateDto>
					name="cover"
					title="COVER_IMAGE"
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
					title="COMMIT_CONTENT_CHANGE"
					loading_title="SYNCING..."
					isLoading={blogPostUpdateMutation.isLoading || false}
					disabled={blogPostUpdateMutation.isLoading || false}
					className="w-full mt-6 bg-primary text-primary-foreground font-black py-4 uppercase tracking-widest rounded-xl hover:brightness-110 transition-all border-none"
				/>
			</Form>
		</div>
	);
}
