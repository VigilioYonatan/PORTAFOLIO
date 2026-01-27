import Form, { formSelectNumber } from "@components/form";
import { FormMKDEditor } from "@components/form/form.mkd-editor";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Refetch } from "@infrastructure/types/client";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import dayjs, { formatDate, formatInput, now } from "@infrastructure/utils/hybrid/date.utils";
import { slugify } from "@infrastructure/utils/hybrid";
import { PROJECT_STATUS_OPTIONS } from "@modules/project/const/project.const";
import type { ProjectIndexResponseDto } from "@modules/project/dtos/project.response.dto";
import { technologyIndexApi } from "@modules/technology/apis/technology.index.api";
import { sweetModal } from "@vigilio/sweet";
import {
	Calendar,
	Info,
	Layers,
	Link as LinkIcon,
	Search,
	Smartphone,
	Type,
} from "lucide-preact";
import { useEffect } from "preact/hooks";
import { useForm, type Resolver } from "react-hook-form";
import { projectUpdateApi } from "../apis/project.update.api";
import {
	type ProjectUpdateDto,
	projectUpdateDto,
} from "../dtos/project.update.dto";
import type { ProjectWithRelations } from "../schemas/project.schema";

interface ProjectUpdateProps {
	project: ProjectWithRelations;
	refetch: (data: Refetch<ProjectIndexResponseDto["results"]>) => void;
	onClose: () => void;
}

export default function ProjectUpdate({
	project,
	refetch,
	onClose,
}: ProjectUpdateProps) {
	const projectUpdateMutation = projectUpdateApi(project.id);
	const technologiesQuery = technologyIndexApi(null, null, { limit: 100 });

	const projectUpdateForm = useForm<ProjectUpdateDto>({
		resolver: zodResolver(projectUpdateDto) as Resolver<ProjectUpdateDto>,
		mode: "all",
		defaultValues: {
			...project,
			start_date: project.start_date
				? formatDate(project.start_date,"YYYY-MM-DD") as Date
				: undefined,
			end_date: project.end_date
				? formatDate(project.end_date,"YYYY-MM-DD") as Date
				: undefined,
			techeables: project.techeables.map((t: any) => t.technology_id) as any,
			seo: {
				title: project.seo?.title || null,
				description: project.seo?.description || null,
				keywords: project.seo?.keywords || [],
				og_image: project.seo?.og_image || [],
			},
		},
	});

	function onProjectUpdate(body: ProjectUpdateDto) {
		sweetModal({
			title: "CONFIRM_UPDATE?",
			text: `Synchronize changes for "${project.title}"?`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "SYNC",
		}).then(({ isConfirmed }) => {
			if (isConfirmed) {
				projectUpdateMutation.mutate(body, {
					onSuccess(data) {
						sweetModal({
							icon: "success",
							title: "SYSTEM_UPDATED",
							text: "Project records synchronized.",
						});
						refetch({
							...project,
							...data.project,
							updated_at: now().toDate(),
						});
						onClose();
					},
					onError(error) {
						handlerError(projectUpdateForm, error, "Sync Error");
					},
				});
			}
		});
	}

	const title = projectUpdateForm.watch("title");
	useEffect(() => {
		if (title && title !== project.title) {
			projectUpdateForm.setValue(
				"slug",
				slugify(title),
				{ shouldValidate: true },
			);
		}
	}, [title, project.title, projectUpdateForm.setValue]);

	return (
		<div class="p-1">
			<div class="flex flex-col gap-1 border-b border-white/5 pb-6 mb-6">
				<span class="text-[9px] font-black tracking-[0.5em] text-primary uppercase animate-pulse">
					EDIT_RECORD_MODE_ACTIVE
				</span>
				<h2 class="text-2xl font-black tracking-tight text-foreground uppercase flex items-center gap-3">
					<Smartphone size={24} class="text-primary" />
					Update project node
				</h2>
			</div>
			<Form {...projectUpdateForm} onSubmit={onProjectUpdate}>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control<ProjectUpdateDto>
						name="title"
						title="PROJECT_TITLE"
						ico={<Type size={18} />}
						placeholder="E.g. Neural Link Interface"
					/>
					<Form.control<ProjectUpdateDto>
						name="slug"
						title="SYSTEM_SLUG"
						ico={<LinkIcon size={18} />}
						placeholder="neural-link-interface"
					/>
				</div>

				<Form.control.area<ProjectUpdateDto>
					name="description"
					title="SUMMARY_LOG"
					placeholder="High-level technical summary..."
					rows={2}
				/>

				<Form.control.area<ProjectUpdateDto>
					name="impact_summary"
					title="IMPACT_SUMMARY"
					placeholder="Senior results and impact metrics..."
					rows={2}
				/>

				<div class="space-y-1">
					<FormMKDEditor<ProjectUpdateDto>
						name="content"
						title="CORE_DOCUMENTATION (MDX)"
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control<ProjectUpdateDto>
						name="repo_url"
						title="SOURCE_UPLINK (GitHub)"
						ico={<LinkIcon size={18} />}
						placeholder="https://github.com/..."
					/>
					<Form.control<ProjectUpdateDto>
						name="website_url"
						title="LIVE_DEPLOYMENT"
						ico={<LinkIcon size={18} />}
						placeholder="https://..."
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control<ProjectUpdateDto>
						name="start_date"
						title="INIT_DATE"
						type="date"
						ico={<Calendar size={18} />}
					/>
					<Form.control<ProjectUpdateDto>
						name="end_date"
						title="COMPLETION_DATE"
						type="date"
						ico={<Calendar size={18} />}
					/>
				</div>

				<Form.control.select<ProjectUpdateDto>
					name="status"
					title="UPLINK_STATUS"
					ico={<Info size={18} />}
					array={PROJECT_STATUS_OPTIONS}
					placeholder="Select status..."
				/>

				<div class="flex flex-wrap gap-6 py-2">
					<div class="flex items-center gap-8 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
						<Form.control.toggle<ProjectUpdateDto>
							name="is_visible"
							title="PUBLIC_VISIBILITY"
						/>
						<Form.control.toggle<ProjectUpdateDto>
							name="is_featured"
							title="FEATURE_ON_HERO"
						/>
					</div>
				</div>

				<Form.control<ProjectUpdateDto>
					name="sort_order"
					title="SORT_ORDER"
					type="number"
					placeholder="0"
					ico={<Info size={18} />}
					options={{ setValueAs: formSelectNumber }}
				/>

				<div class="space-y-4 pt-4 border-t border-white/5">
					<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
						<Layers size={14} class="text-primary" /> Stack Module
					</h3>
					<Form.control.multiSelect<ProjectUpdateDto>
						name="techeables"
						title="TECHNOLOGY_STACK"
						placeholder="Add technologies..."
						ico={<Search size={18} />}
						array={
							technologiesQuery.data?.results.map((t) => ({
								key: t.id,
								value: t.name,
							})) ?? []
						}
						isLoading={technologiesQuery.isLoading || false}
					/>
				</div>

				<div class="space-y-4 pt-4 border-t border-white/5">
					<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
						<Info size={14} class="text-primary" /> Meta Optimization (SEO)
					</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Form.control<ProjectUpdateDto>
							name="seo.title"
							title="SEO_TITLE"
							placeholder="Project title for search engines"
						/>
						<Form.control.area<ProjectUpdateDto>
							name="seo.description"
							title="SEO_DESCRIPTION"
							placeholder="Meta description (150-160 chars recommended)"
							rows={2}
						/>
					</div>
				</div>

				<Form.button.submit
					title="SYNC_CHANGES"
					loading_title="SYNCING..."
					isLoading={projectUpdateMutation.isLoading || false}
					disabled={projectUpdateMutation.isLoading || false}
				/>
			</Form>
		</div>
	);
}
