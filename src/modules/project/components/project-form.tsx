import Form, { formSelectNumber } from "@components/form";
import { slugify } from "@infrastructure/utils/hybrid";
import { PROJECT_STATUS_OPTIONS } from "@modules/project/const/project.const";
import type { ProjectUpdateDto } from "@modules/project/dtos/project.update.dto";
import type { TechnologyIndexResponseDto } from "@modules/technology/dtos/technology.response.dto";
import { useTranslations } from "@src/i18n";
import {
	Calendar,
	Image as ImageIcon,
	Info,
	Layers,
	Link as LinkIcon,
	Search,
	Smartphone,
	Type,
	Video,
} from "lucide-preact";
import { useEffect } from "preact/hooks";
import type { UseFormReturn } from "react-hook-form";

interface ProjectFormProps {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	form: UseFormReturn<any>;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	onSubmit: (data: any) => void;
	isLoading: boolean;
	technologies: TechnologyIndexResponseDto["results"];
	initialTitle?: string;
	isUpdate?: boolean;
}

export function ProjectForm({
	form,
	onSubmit,
	isLoading,
	technologies,
	initialTitle,
	isUpdate = false,
}: ProjectFormProps) {
	const t = useTranslations();
	const title = form.watch("title");

	useEffect(() => {
		if (title && title !== initialTitle) {
			form.setValue("slug", slugify(title), { shouldValidate: true });
		}
	}, [title, initialTitle, form.setValue]);

	return (
		<div class="p-1">
			<div class="flex flex-col gap-1 border-b border-white/5 pb-6 mb-6">
				<span class="text-[9px] font-black tracking-[0.5em] text-primary uppercase animate-pulse">
					{isUpdate
						? t("dashboard.project.form.edit_title")
						: t("dashboard.project.form.init")}
				</span>
				<h2 class="text-2xl font-black tracking-tight text-foreground uppercase flex items-center gap-3">
					{isUpdate ? (
						<Smartphone size={24} class="text-primary" />
					) : (
						<Layers size={24} class="text-primary" />
					)}
					{isUpdate
						? t("dashboard.project.form.update")
						: t("dashboard.project.form.create_title")}
				</h2>
			</div>
			<Form {...form} onSubmit={onSubmit}>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control<ProjectUpdateDto>
						name="title"
						title={t("dashboard.project.form.title")}
						ico={<Type size={18} />}
						placeholder="Ej: Neural Link Interface"
					/>
					<Form.control<ProjectUpdateDto>
						name="slug"
						title={t("dashboard.project.form.slug")}
						ico={<LinkIcon size={18} />}
						placeholder="neural-link-interface"
					/>
				</div>

				<Form.control.area<ProjectUpdateDto>
					name="description"
					title={t("dashboard.project.form.desc")}
					placeholder="Resumen técnico de alto nivel..."
					rows={2}
				/>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control.area<ProjectUpdateDto>
						name="impact_summary"
						title={t("dashboard.project.form.impact")}
						placeholder="Resultados senior y métricas de impacto..."
						rows={2}
					/>
					<Form.control<ProjectUpdateDto>
						name="sort_order"
						title={
							t("dashboard.project.form.sort_order") || "ORDEN DE PRIORIDAD"
						}
						type="number"
						placeholder="0"
						ico={<Info size={18} />}
						options={{ setValueAs: formSelectNumber }}
					/>
				</div>

				<div class="space-y-1">
					<Form.control.area<ProjectUpdateDto>
						name="content"
						title={t("dashboard.project.form.content")}
						rows={5}
						placeholder="Descripción detallada del proyecto..."
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control<ProjectUpdateDto>
						name="repo_url"
						title={t("dashboard.project.form.repo")}
						ico={<LinkIcon size={18} />}
						placeholder="https://github.com/..."
					/>
					<Form.control<ProjectUpdateDto>
						name="website_url"
						title={t("dashboard.project.form.website")}
						ico={<LinkIcon size={18} />}
						placeholder="https://..."
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control<ProjectUpdateDto>
						name="start_date"
						title={t("dashboard.project.form.start_date")}
						type="date"
						ico={<Calendar size={18} />}
					/>
					<Form.control<ProjectUpdateDto>
						name="end_date"
						title={t("dashboard.project.form.end_date")}
						type="date"
						ico={<Calendar size={18} />}
					/>
				</div>

				<Form.control.select<ProjectUpdateDto>
					name="status"
					title={t("dashboard.project.form.status")}
					ico={<Info size={18} />}
					array={PROJECT_STATUS_OPTIONS}
					placeholder="Seleccionar estado..."
				/>

				<div class="flex flex-wrap gap-6 py-2">
					<div class="flex items-center gap-8 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
						<Form.control.toggle<ProjectUpdateDto>
							name="is_visible"
							title={t("dashboard.project.form.visibility")}
						/>
						<Form.control.toggle<ProjectUpdateDto>
							name="is_featured"
							title={t("dashboard.project.form.featured")}
						/>
					</div>
				</div>

				<div class="space-y-4 pt-4 border-t border-white/5">
					<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
						<Layers size={14} class="text-primary" />{" "}
						{t("dashboard.project.form.tech_stack")}
					</h3>
					<Form.control.multiSelect<ProjectUpdateDto>
						name="techeables"
						title={t("dashboard.project.form.tech_stack")}
						placeholder="Añadir tecnologías..."
						ico={<Search size={18} />}
						array={
							technologies.map((t) => ({
								key: t.id,
								value: t.name,
							})) ?? []
						}
						isLoading={!technologies.length}
					/>
				</div>

				<div class="space-y-4 pt-4 border-t border-white/5">
					<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
						<Info size={14} class="text-primary" />{" "}
						{t("dashboard.project.form.seo_opt")}
					</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Form.control<ProjectUpdateDto>
							name="seo.title"
							title={t("dashboard.project.form.seo_title")}
							placeholder="Título del proyecto para buscadores"
						/>
						<Form.control.area<ProjectUpdateDto>
							name="seo.description"
							title={t("dashboard.project.form.seo_desc")}
							placeholder="Meta descripción (150-160 caracteres recomendado)"
							rows={2}
						/>
					</div>
				</div>

				<Form.control.file<ProjectUpdateDto>
					name="images"
					title={t("dashboard.project.form.images")}
					ico={<ImageIcon size={18} />}
					entity="project"
					property="images"
					typeFile="image"
					multiple
					accept="image/*"
				/>

				<Form.control.file<ProjectUpdateDto>
					name="videos"
					title={t("dashboard.project.form.videos")}
					ico={<Video size={18} />}
					entity="project"
					property="videos"
					typeFile="video"
					multiple
					accept="video/*"
				/>

				<Form.button.submit
					title={
						isUpdate
							? t("dashboard.project.form.update")
							: t("dashboard.project.form.submit")
					}
					loading_title={t("dashboard.project.form.loading")}
					isLoading={isLoading}
					disabled={isLoading}
					className="w-full mt-4 bg-primary text-primary-foreground font-black py-4 tracking-widest uppercase rounded-lg hover:opacity-90 transition-opacity"
				/>
			</Form>
		</div>
	);
}
