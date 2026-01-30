import Form, { formSelectNumber } from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Refetch } from "@infrastructure/types/client";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { openSourceUpdateApi } from "@modules/open-source/apis/open-source.update.api";
import {
	type OpenSourceUpdateDto,
	openSourceUpdateDto,
} from "@modules/open-source/dtos/open-source.update.dto";
import { type Lang, useTranslations } from "@src/i18n";
import { sweetModal } from "@vigilio/sweet";
import { type Resolver, useForm } from "react-hook-form";
import type { OpenSourceIndexResponseDto } from "../dtos/open-source.response.dto";
import { type OpenSourceSchema } from "../schemas/open-source.schema";

interface OpenSourceUpdateProps {
	refetch: (data: Refetch<OpenSourceIndexResponseDto["results"]>) => void;
	onClose: () => void;
	lang?: Lang;
	openSource: OpenSourceSchema;
}

export default function OpenSourceUpdate({
	refetch,
	onClose,
	openSource,
	lang = "es",
}: OpenSourceUpdateProps) {
	const t = useTranslations(lang);
	const openSourceUpdateMutation = openSourceUpdateApi(openSource.id);

	const openSourceUpdateForm = useForm<OpenSourceUpdateDto>({
		resolver: zodResolver(openSourceUpdateDto) as Resolver<OpenSourceUpdateDto>,
		mode: "all",
		defaultValues: {
			name: openSource.name,
			slug: openSource.slug,
			description: openSource.description,
			content: openSource.content || "",
			npm_url: openSource.npm_url || "",
			repo_url: openSource.repo_url || "",
			category: openSource.category || "",
			stars: openSource.stars,
			downloads: openSource.downloads,
			version: openSource.version || "",
			is_visible: openSource.is_visible,
			sort_order: openSource.sort_order,
		},
	});

	function onOpenSourceUpdate(body: OpenSourceUpdateDto) {
		openSourceUpdateMutation.mutate(body, {
			onSuccess(data) {
				sweetModal({
					icon: "success",
					title: "Proyecto Open Source actualizado",
				});
				refetch(data.open_source);
				onClose();
			},
			onError(error) {
				handlerError(openSourceUpdateForm, error, t("common.error"));
			},
		});
	}

	return (
		<Form {...openSourceUpdateForm} onSubmit={onOpenSourceUpdate}>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Form.control<OpenSourceUpdateDto>
					name="name"
					title="Nombre del Paquete"
					placeholder="Ej. @vigilio/sweet"
					required
				/>
				<Form.control<OpenSourceUpdateDto>
					name="slug"
					title="Slug"
					placeholder="ej-vigilio-sweet"
					required
				/>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Form.control<OpenSourceUpdateDto>
					name="category"
					title="Categoría"
					placeholder="Ej. Framework / UI Library"
				/>
				<Form.control<OpenSourceUpdateDto>
					name="version"
					title="Versión Actual"
					placeholder="v1.0.0"
				/>
			</div>

			<Form.control.area<OpenSourceUpdateDto>
				name="description"
				title="Resumen Ejecutivo"
				placeholder="Breve resumen del impacto..."
				required
			/>

			<Form.control.area<OpenSourceUpdateDto>
				name="content"
				title="Documentación Detallada (Markdown)"
				placeholder="Desarrollo completo de la bitácora..."
				rows={10}
			/>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Form.control<OpenSourceUpdateDto>
					name="npm_url"
					title="NPM URL"
					placeholder="https://www.npmjs.com/package/..."
				/>
				<Form.control<OpenSourceUpdateDto>
					name="repo_url"
					title="Repository URL"
					placeholder="https://github.com/..."
				/>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<Form.control<OpenSourceUpdateDto>
					name="stars"
					title="Estrellas"
					type="number"
					options={{ setValueAs: formSelectNumber }}
				/>
				<Form.control<OpenSourceUpdateDto>
					name="downloads"
					title="Descargas"
					type="number"
					options={{ setValueAs: formSelectNumber }}
				/>
			</div>

			<div class="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 mt-4">
				<Form.control.toggle<OpenSourceUpdateDto>
					name="is_visible"
					title="Habilitar en Portafolio"
				/>
				<Form.control<OpenSourceUpdateDto>
					name="sort_order"
					title="Orden"
					type="number"
					options={{ setValueAs: formSelectNumber }}
				/>
			</div>

			<Form.button.submit
				title="Actualizar Proyecto"
				loading_title={t("common.loading")}
				isLoading={openSourceUpdateMutation.isLoading || false}
				disabled={openSourceUpdateMutation.isLoading || false}
				className="w-full mt-6"
			/>
		</Form>
	);
}
