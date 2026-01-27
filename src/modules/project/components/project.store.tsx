import Form, { formSelectNumber } from "@components/form";
import { FormMKDEditor } from "@components/form/form.mkd-editor";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Refetch } from "@infrastructure/types/client";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { projectStoreApi } from "@modules/project/apis/project.store.api";
import { PROJECT_STATUS_OPTIONS } from "@modules/project/const/project.const";
import {
	type ProjectStoreDto,
	projectStoreDto,
} from "@modules/project/dtos/project.store.dto";
import { technologyIndexApi } from "@modules/technology/apis/technology.index.api";
import { sweetModal } from "@vigilio/sweet";
import {
	Calendar,
	Image as ImageIcon,
	Info,
	Layers,
	Link as LinkIcon,
	Search,
	Type,
} from "lucide-preact";
import { useEffect } from "preact/hooks";
import { type Resolver, useForm } from "react-hook-form";
import type { ProjectIndexResponseDto } from "../dtos/project.response.dto";
import { slugify } from "@infrastructure/utils/hybrid";

interface ProjectStoreProps {
	refetch: (data: Refetch<ProjectIndexResponseDto["results"]>) => void;
	onClose: () => void;
}

export default function ProjectStore({ refetch, onClose }: ProjectStoreProps) {
	const projectStoreMutation = projectStoreApi();
	const technologiesQuery = technologyIndexApi(null, null, { limit: 100 });

	const projectStoreForm = useForm<ProjectStoreDto>({
		resolver: zodResolver(
			projectStoreDto,
		) as Resolver<ProjectStoreDto>,
		mode: "all",
		defaultValues: {
			techeables: [],
			seo: {
				title: null,
				description: null,
				keywords: [],
				og_image: [],
			},
		},
	});
	

	function onProjectStore(body: ProjectStoreDto) {
		
		projectStoreMutation.mutate(body, {
			onSuccess(response) {
				sweetModal({
					icon: "success",
					title: "PROYECTO INICIALIZADO",
					text: "Nuevo proyecto creado correctamente.",
				});
				projectStoreForm.reset();
				refetch({...response.project,techeables: body.techeables as any});
				onClose();
			},
			onError(error) {
				handlerError(projectStoreForm, error, "Error de Sincronización");
			},
		});
	}

	const title = projectStoreForm.watch("title");
	useEffect(() => {
		if (title) {
			projectStoreForm.setValue(
				"slug",slugify(title),
				{ shouldValidate: true },
			);
		}
	}, [title, projectStoreForm.setValue]);

	return (
		<div class="p-1">
			<div class="flex flex-col gap-1 border-b border-white/5 pb-6 mb-6">
				<span class="text-[9px] font-black tracking-[0.5em] text-primary uppercase animate-pulse">
					INICIALIZANDO NUEVO NODO
				</span>
				<h2 class="text-2xl font-black tracking-tight text-foreground uppercase flex items-center gap-3">
					<Layers size={24} class="text-primary" />
					Crear Nuevo Proyecto
				</h2>
			</div>
			<Form {...projectStoreForm} onSubmit={onProjectStore}>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control<ProjectStoreDto>
						name="title"
						title="TÍTULO PROYECTO"
						ico={<Type size={18} />}
						placeholder="Ej: Neural Link Interface"
					/>
					<Form.control<ProjectStoreDto>
						name="slug"
						title="SLUG SISTEMA"
						ico={<LinkIcon size={18} />}
						placeholder="neural-link-interface"
					/>
				</div>

				<Form.control.area<ProjectStoreDto>
					name="description"
					title="DESCRIPCIÓN CORTA"
					placeholder="Breve resumen del proyecto..."
					rows={2}
				/>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control.area<ProjectStoreDto>
						name="impact_summary"
						title="IMPACTO Y RESULTADOS"
						placeholder="Ej: Rendimiento mejorado en 40%..."
						rows={2}
					/>
					<Form.control<ProjectStoreDto>
						name="sort_order"
						title="ORDEN DE PRIORIDAD"
						type="number"
						placeholder="0"
						options={{ setValueAs: formSelectNumber }}
					/>
				</div>

				<div class="space-y-1">
					<FormMKDEditor<ProjectStoreDto>
						name="content"
						title="DOCUMENTACIÓN PRINCIPAL (MDX)"
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control<ProjectStoreDto>
						name="repo_url"
						title="REPOSITORIO (GitHub)"
						ico={<LinkIcon size={18} />}
						placeholder="https://github.com/..."
					/>
					<Form.control<ProjectStoreDto>
						name="website_url"
						title="SITIO WEB (Deploy)"
						ico={<LinkIcon size={18} />}
						placeholder="https://..."
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control<ProjectStoreDto>
						name="start_date"
						title="FECHA INICIO"
						type="date"
						ico={<Calendar size={18} />}
					/>
					<Form.control<ProjectStoreDto>
						name="end_date"
						title="FECHA FIN"
						type="date"
						ico={<Calendar size={18} />}
					/>
				</div>

				<Form.control.select<ProjectStoreDto>
					name="status"
					title="ESTADO"
					ico={<Info size={18} />}
					array={PROJECT_STATUS_OPTIONS}
					placeholder="Seleccionar estado..."
				/>

				<div class="flex flex-wrap gap-6 py-2">
					<div class="flex items-center gap-8 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
						<Form.control.toggle<ProjectStoreDto>
							name="is_visible"
							title="VISIBILIDAD PÚBLICA"
						/>
						<Form.control.toggle<ProjectStoreDto>
							name="is_featured"
							title="DESTACAR EN HERO"
						/>
					</div>
				</div>

				<div class="space-y-4 pt-4 border-t border-white/5">
					<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
						<Layers size={14} class="text-primary" /> Stack Tecnológico
					</h3>
					<Form.control.multiSelect<ProjectStoreDto>
						name="techeables"
						title="TECNOLOGÍAS"
						placeholder="Añadir tecnologías..."
						ico={<Search size={18} />}
						array={
							technologiesQuery.data?.results.map((t) => ({
								key: t.id,
								value: t.name,
							})) ||[]
						}
						isLoading={technologiesQuery.isLoading || false}
						
					/>
				</div>

				<div class="space-y-4 pt-4 border-t border-white/5">
					<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
						<Info size={14} class="text-primary" /> Optimización Meta (SEO)
					</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Form.control<ProjectStoreDto>
							name="seo.title"
							title="TÍTULO SEO"
							placeholder="Título del proyecto para buscadores"
						/>
						<Form.control.area<ProjectStoreDto>
							name="seo.description"
							title="DESCRIPCIÓN SEO"
							placeholder="Meta descripción (150-160 caracteres recomendado)"
							rows={2}
						/>
					</div>
				</div>

				<Form.control.file<ProjectStoreDto>
					name="images"
					title="IMÁGENES"
					ico={<ImageIcon size={18} />}
					entity="project"
					property="images"
					typeFile="image"
					multiple
					accept="image/*"
				/>

				<Form.button.submit
					title="CREAR PROYECTO"
					loading_title="CREANDO..."
					isLoading={projectStoreMutation.isLoading ?? false}
					disabled={projectStoreMutation.isLoading ?? false}
					className="w-full mt-4 bg-primary text-primary-foreground font-black py-4 tracking-widest uppercase rounded-lg hover:opacity-90 transition-opacity"
				/>
			</Form>
		</div>
	);
}
