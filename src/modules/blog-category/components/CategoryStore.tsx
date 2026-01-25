import WebForm from "@components/web_form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { blogCategoryStoreApi } from "@modules/blog-category/apis/blog-category.store.api";
import {
	type BlogCategoryStoreDto,
	blogCategoryStoreSchema,
} from "@modules/blog-category/dtos/blog-category.store.dto";
import { sweetModal } from "@vigilio/sweet";
import { Tag } from "lucide-preact";
import { useEffect } from "preact/hooks";
import { useForm } from "react-hook-form";

interface CategoryStoreProps {
	onSuccess: () => void;
	onClose: () => void;
}

export default function CategoryStore({
	onSuccess,
	onClose,
}: CategoryStoreProps) {
	const storeMut = blogCategoryStoreApi();

	const form = useForm<BlogCategoryStoreDto>({
		resolver: zodResolver(blogCategoryStoreSchema),
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
			onSuccess() {
				sweetModal({
					title: "Category Created",
					icon: "success",
				});
				onSuccess();
				onClose();
			},
			onError(err) {
				handlerError(form, err, "Action Failed");
			},
		});
	};

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-bold mb-4 text-white">New Category</h2>
			<WebForm {...form} onSubmit={onSubmit}>
				<WebForm.control
					name="name"
					title="Category Name"
					placeholder="DevOps"
					ico={<Tag size={16} />}
				/>
				<WebForm.control
					name="slug"
					title="Category Slug"
					placeholder="devops"
					ico={<Tag size={16} />}
				/>
				<WebForm.control.area
					name="description"
					title="Description"
					placeholder="Articles related to infrastructure..."
				/>
				<WebForm.button.submit
					title="Create"
					loading_title="Creating..."
					isLoading={storeMut.isLoading || false}
					disabled={storeMut.isLoading || false}
					className="w-full mt-4 bg-primary text-primary-foreground font-bold py-3 rounded-lg"
				/>
			</WebForm>
		</div>
	);
}
