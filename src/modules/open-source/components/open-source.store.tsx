import Form, { formSelectNumber } from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Refetch } from "@infrastructure/types/client";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { slugify } from "@infrastructure/utils/hybrid/slug.utils";
import { openSourceStoreApi } from "@modules/open-source/apis/open-source.store.api";
import {
	type OpenSourceStoreDto,
	openSourceStoreDto,
} from "@modules/open-source/dtos/open-source.store.dto";
import { type Lang, useTranslations } from "@src/i18n";
import { sweetModal } from "@vigilio/sweet";
import { useEffect } from "preact/hooks";
import { type Resolver, useForm } from "react-hook-form";
import type { OpenSourceIndexResponseDto } from "../dtos/open-source.response.dto";

interface OpenSourceStoreProps {
	refetch: (data: Refetch<OpenSourceIndexResponseDto["results"]>) => void;
	onClose: () => void;
	lang?: Lang;
}

export default function OpenSourceStore({
	refetch,
	onClose,
	lang = "es",
}: OpenSourceStoreProps) {
	const t = useTranslations(lang);
	const openSourceStoreMutation = openSourceStoreApi();

	const openSourceStoreForm = useForm<OpenSourceStoreDto>({
		resolver: zodResolver(openSourceStoreDto) as Resolver<OpenSourceStoreDto>,
		mode: "all",
		defaultValues: {
			version: "v1.0.0",
			is_visible: true,
		},
	});

	const name = openSourceStoreForm.watch("name");

	useEffect(() => {
		if (name) {
			openSourceStoreForm.setValue("slug", slugify(name));
		}
	}, [name]);

	function onOpenSourceStore(body: OpenSourceStoreDto) {
		openSourceStoreMutation.mutate(body, {
			onSuccess(data) {
				sweetModal({
					icon: "success",
					title: "Proyecto Open Source añadido",
				});
				refetch(data.open_source);
				onClose();
			},
			onError(error) {
				handlerError(openSourceStoreForm, error, t("common.error"));
			},
		});
	}

	return (
		<Form {...openSourceStoreForm} onSubmit={onOpenSourceStore}>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Form.control<OpenSourceStoreDto>
					name="name"
					title="Nombre del Paquete"
					placeholder="Ej. @vigilio/sweet"
					required
				/>
				<Form.control<OpenSourceStoreDto>
					name="slug"
					title="Slug"
					placeholder="ej-vigilio-sweet"
					required
				/>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Form.control<OpenSourceStoreDto>
					name="category"
					title="Categoría"
					placeholder="Ej. Framework / UI Library"
				/>
				<Form.control<OpenSourceStoreDto>
					name="version"
					title="Versión Inicial"
					placeholder="v1.0.0"
				/>
			</div>

			<Form.control.area<OpenSourceStoreDto>
				name="description"
				title="Resumen Ejecutivo"
				placeholder="Breve resumen del impacto..."
				required
			/>

			<Form.control.area<OpenSourceStoreDto>
				name="content"
				title="Documentación Detallada (Markdown)"
				placeholder="Desarrollo completo de la bitácora..."
				rows={10}
			/>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Form.control<OpenSourceStoreDto>
					name="npm_url"
					title="NPM URL"
					placeholder="https://www.npmjs.com/package/..."
				/>
				<Form.control<OpenSourceStoreDto>
					name="repo_url"
					title="Repository URL"
					placeholder="https://github.com/..."
				/>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<Form.control<OpenSourceStoreDto>
					name="stars"
					title="Estrellas"
					type="number"
					options={{ setValueAs: formSelectNumber }}
				/>
				<Form.control<OpenSourceStoreDto>
					name="downloads"
					title="Descargas"
					type="number"
					options={{ setValueAs: formSelectNumber }}
				/>
			</div>

			<div class="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 mt-4">
				<Form.control.toggle<OpenSourceStoreDto>
					name="is_visible"
					title="Habilitar en Portafolio"
				/>
				<Form.control<OpenSourceStoreDto>
					name="sort_order"
					title="Orden"
					type="number"
					options={{ setValueAs: formSelectNumber }}
				/>
			</div>

			<Form.button.submit
				title="Crear Proyecto"
				loading_title={t("common.loading")}
				isLoading={openSourceStoreMutation.isLoading || false}
				disabled={openSourceStoreMutation.isLoading || false}
				className="w-full mt-6"
			/>
		</Form>
	);
}
