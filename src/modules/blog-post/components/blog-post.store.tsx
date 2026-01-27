import Form, { formSelectNumber } from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Refetch } from "@infrastructure/types/client";
import { handlerError } from "@infrastructure/utils/client/handler-error";
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
import { sweetModal } from "@vigilio/sweet";
import { FileText, Image as ImageIcon, Link, Tag } from "lucide-preact";
import { useEffect, useMemo } from "preact/hooks";
import { useForm, type Resolver } from "react-hook-form";
import type { BlogPostIndexResponseDto } from "../dtos/blog-post.response.dto";
import { slugify } from "@infrastructure/utils/hybrid";

interface BlogPostStoreProps {
	refetch: (data: Refetch<BlogPostIndexResponseDto["results"]>) => void;
	onClose: () => void;
}

export default function BlogPostStore({
	refetch,
	onClose,
}: BlogPostStoreProps) {
	const blogPostStoreMutation = blogPostStoreApi();
	const categoriesQuery = blogCategoryIndexApi(null);

	const blogPostStoreForm = useForm<BlogPostStoreDto>({
		resolver: zodResolver(blogPostStoreDto) as Resolver<BlogPostStoreDto>,
		mode: "all",defaultValues:{
			seo:{
				title:"",
				description:"",keywords:null,og_image:null
			}
		}
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
					title: "Publicación Creada",
					text: `"${body.title}" ha sido registrada en el sistema.`,
				});
				refetch(data.post);
				onClose();
			},
			onError(error) {
				handlerError(blogPostStoreForm, error, "Error al crear la publicación");
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
					AUTHORING_NEW_CONTENT
				</span>
				<h2 class="text-xl font-black tracking-tight text-foreground uppercase">
					Create Blog Post
				</h2>
			</div>

			<Form {...blogPostStoreForm} onSubmit={onBlogPostStore}>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control<BlogPostStoreDto>
						name="title"
						title="POST_TITLE"
						ico={<FileText size={18} />}
						placeholder="The Future of Web Dev"
					/>
					<Form.control<BlogPostStoreDto>
						name="slug"
						title="URL_SLUG"
						ico={<Link size={18} />}
						placeholder="the-future-of-web-dev"
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control.select<BlogPostStoreDto>
						name="category_id"
						title="CONTENT_CATEGORY"
						ico={<Tag size={18} />}
						array={categoryOptions}
						placeholder="Select category"
						options={{ setValueAs: formSelectNumber }}
						isLoading={categoriesQuery.isLoading ?? false}
					/>
					<Form.control.toggle<BlogPostStoreDto>
						name="is_published"
						title="PUBLISH_STATUS"
						placeholder="Visible to public"
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control.area<BlogPostStoreDto>
						name="extract"
						title="CONTENT_EXTRACT"
						placeholder="Brief summary for indexing..."
						rows={2}
					/>
					<Form.control<BlogPostStoreDto>
						name="reading_time_minutes"
						title="ESTIMATED_TIME (MINUTES)"
						type="number"
						placeholder="5"
						options={{ setValueAs: formSelectNumber }}
					/>
					<Form.control<BlogPostStoreDto>
						name="published_at"
						title="PUBLISH_DATE"
						type="date"
						placeholder="Select date"
					/>
				</div>

				<Form.control.area<BlogPostStoreDto>
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
						<Form.control<BlogPostStoreDto>
							name="seo.title"
							title="SEO_TITLE"
							placeholder="Post title for search engines"
						/>
						<Form.control.area<BlogPostStoreDto>
							name="seo.description"
							title="SEO_DESCRIPTION"
							placeholder="Meta description (150-160 chars recommended)"
							rows={2}
						/>
					</div>
				</div>

				<Form.control.file<BlogPostStoreDto>
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
					title="EXECUTE_PUBLICATION"
					loading_title="PUBLISHING..."
					isLoading={blogPostStoreMutation.isLoading || false}
					disabled={blogPostStoreMutation.isLoading || false}
					className="w-full mt-6 bg-primary text-primary-foreground font-black py-4 uppercase tracking-widest rounded-xl hover:brightness-110 transition-all border-none"
				/>
			</Form>
		</div>
	);
}
