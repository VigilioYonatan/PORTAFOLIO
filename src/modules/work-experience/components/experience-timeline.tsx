import Badge from "@components/extras/badge";
import Loader from "@components/extras/loader";
import Modal from "@components/extras/modal";
import { cn } from "@infrastructure/utils/client";
import { formatDate } from "@infrastructure/utils/hybrid/date.utils";
import { workExperienceDestroyApi } from "@modules/work-experience/apis/work-experience.destroy.api";
import { workExperienceIndexApi } from "@modules/work-experience/apis/work-experience.index.api";
import type { WorkExperienceSchema } from "@modules/work-experience/schemas/work-experience.schema";
import MilestoneList from "@modules/work-milestone/components/milestone-list";
import { useSignal } from "@preact/signals";
import { type Lang, useTranslations } from "@src/i18n";
import usePaginator from "@vigilio/preact-paginator";
import { sweetModal } from "@vigilio/sweet";
import { Briefcase, Calendar, Edit, MapPin, Plus, Trash2 } from "lucide-preact";
import { useEffect } from "preact/hooks";
import ExperienceStore from "./experience-store";
import ExperienceUpdate from "./experience-update";

interface ExperienceTimelineProps {
	lang?: Lang;
}

export default function ExperienceTimeline({
	lang = "es",
}: ExperienceTimelineProps) {
	const experienceEdit = useSignal<WorkExperienceSchema | null>(null);
	const isStoreModalOpen = useSignal<boolean>(false);
	const destroyMutation = workExperienceDestroyApi();
	const t = useTranslations(lang);

	const pagination = usePaginator({ limit: 20 });
	const indexQuery = workExperienceIndexApi(null, pagination);

	useEffect(() => {
		indexQuery.refetch();
	}, [pagination.pagination.page, pagination.pagination.value.limit]);

	function onDelete(id: number) {
		sweetModal({
			title: t("common.delete") + "?",
			text: t("common.actions"),
			icon: "danger",
			showCancelButton: true,
			confirmButtonText: t("common.delete"),
		}).then(({ isConfirmed }) => {
			if (isConfirmed) {
				destroyMutation.mutate(id, {
					onSuccess() {
						sweetModal({ icon: "success", title: t("common.success") });
						indexQuery.refetch();
					},
					onError(err) {
						sweetModal({
							icon: "danger",
							title: "Error",
							text: err.message,
						});
					},
				});
			}
		});
	}

	if (indexQuery.isLoading) {
		return (
			<div class="flex flex-col items-center justify-center p-20 gap-4">
				<Loader />
				<span class="text-[10px] font-black tracking-[0.3em] text-primary/40">
					{t("common.loading").toUpperCase()}
				</span>
			</div>
		);
	}

	if (indexQuery.isError) {
		return (
			<div class="p-10 border border-destructive/20 bg-destructive/5 text-destructive rounded-xl text-center font-mono">
				<p class="text-sm font-bold uppercase tracking-widest">
					{t("common.error").toUpperCase()}
				</p>
				<p class="text-[10px] mt-2 opacity-60">
					{indexQuery.error?.message || "Error de comunicación desconocido."}
				</p>
			</div>
		);
	}

	const experiences = indexQuery.data?.results ?? [];

	return (
		<div class="space-y-8">
			<div class="flex justify-between items-center bg-zinc-900/40 p-4 border border-white/5 rounded-xl backdrop-blur-md">
				<div class="flex flex-col">
					<span class="text-[9px] font-black tracking-[0.3em] text-muted-foreground/40 uppercase">
						{t("dashboard.timeline.subtitle")}
					</span>
					<h3 class="text-lg font-black tracking-tight uppercase">
						{t("dashboard.timeline.title")}
					</h3>
				</div>
				<button
					type="button"
					onClick={() => {
						isStoreModalOpen.value = true;
					}}
					aria-label={t("dashboard.timeline.add")}
					class="flex items-center gap-2 bg-primary dark:text-primary-foreground px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg hover:brightness-110 transition-all shadow-(0_0_20px_rgba(6,182,212,0.3))"
				>
					<Plus size={14} strokeWidth={3} />
					{t("dashboard.timeline.add")}
				</button>
			</div>

			<div class="relative pl-8 md:pl-12 border-l-2 border-primary/20 space-y-12 ml-4">
				{experiences.length === 0 ? (
					<div class="p-10 text-center border border-dashed border-white/10 rounded-xl">
						<p class="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
							{t("dashboard.timeline.empty")}
						</p>
					</div>
				) : (
					experiences.map((exp) => (
						<div key={exp.id} class="relative group">
							{/* Timeline Dot */}
							<div
								class={cn(
									"absolute -left-[41px] md:-left-[49px] w-5 h-5 rounded-full bg-background border-4 transition-all duration-300 group-hover:scale-125 z-10",
									exp.is_current
										? "border-primary animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.5)]"
										: "border-zinc-700 group-hover:border-primary/50",
								)}
							/>

							{/* Card */}
							<div class="bg-zinc-900/40 border border-white/5 p-6 rounded-2xl backdrop-blur-md group-hover:border-primary/30 group-hover:bg-zinc-900/60 transition-all duration-300 relative overflow-hidden">
								{/* Subtle glow background */}
								<div class="absolute -right-20 -top-20 w-40 h-40 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />

								<div class="flex flex-col md:flex-row md:items-start justify-between gap-4 relative z-10">
									<div class="space-y-2">
										<div class="flex items-center gap-2">
											<Briefcase size={16} class="text-primary" />
											<h4 class="text-lg font-black tracking-tight text-foreground uppercase">
												{exp.position}
											</h4>
											{exp.is_current && (
												<Badge variant="matrix" className="text-[9px] h-4">
													{t("dashboard.timeline.current")}
												</Badge>
											)}
										</div>
										<p class="text-sm font-bold text-muted-foreground uppercase tracking-wider">
											{exp.company}
										</p>

										<div class="flex flex-wrap items-center gap-4 mt-4">
											<div class="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase">
												<Calendar size={12} class="text-primary/50" />
												{formatDate(exp.start_date)} —{" "}
												{exp.is_current
													? t("dashboard.timeline.present")
													: formatDate(exp.end_date)}
											</div>
											{exp.location && (
												<div class="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase">
													<MapPin size={12} class="text-primary/50" />
													{exp.location}
												</div>
											)}
										</div>

										<p class="text-xs text-muted-foreground/80 leading-relaxed max-w-2xl mt-4">
											{exp.description}
										</p>

										{/* Milestones */}
										<MilestoneList experienceId={exp.id} />
									</div>

									<div class="flex items-center gap-2 self-start md:self-auto">
										<button
											type="button"
											onClick={() => {
												experienceEdit.value = exp;
											}}
											class="p-2 text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 rounded-xl transition-all"
											title={t("common.edit")}
											aria-label={`Edit ${exp.position} at ${exp.company}`}
										>
											<Edit size={16} />
										</button>
										<button
											type="button"
											onClick={() => onDelete(exp.id)}
											class="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
											title={t("common.delete")}
											aria-label={`Delete ${exp.position} experience at ${exp.company}`}
										>
											<Trash2 size={16} />
										</button>
									</div>
								</div>
							</div>
						</div>
					))
				)}
			</div>

			{/* Store Modal */}
			<Modal
				isOpen={isStoreModalOpen.value}
				onClose={() => {
					isStoreModalOpen.value = false;
					experienceEdit.value = null;
				}}
				contentClassName="max-w-3xl w-full self-start"
			>
				<ExperienceStore
					refetch={() => {
						indexQuery.refetch();
						isStoreModalOpen.value = false;
					}}
					onClose={() => {
						isStoreModalOpen.value = false;
						experienceEdit.value = null;
					}}
				/>
			</Modal>

			{/* Update Modal */}
			<Modal
				isOpen={!!experienceEdit.value}
				onClose={() => {
					experienceEdit.value = null;
					isStoreModalOpen.value = false;
				}}
				contentClassName="max-w-3xl w-full self-start"
			>
				<ExperienceUpdate
					experience={experienceEdit.value!}
					refetch={() => {
						indexQuery.refetch();
						experienceEdit.value = null;
					}}
					onClose={() => {
						experienceEdit.value = null;
						isStoreModalOpen.value = false;
					}}
				/>
			</Modal>
		</div>
	);
}
