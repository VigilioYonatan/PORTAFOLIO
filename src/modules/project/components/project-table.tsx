import Badge from "@components/extras/badge";
import Modal from "@components/extras/modal";
import VigilioTable from "@components/tables";
import { format } from "@formkit/tempo";
import type { Refetch } from "@infrastructure/types/client";
import { LANGUAGES, type Language } from "@infrastructure/types/i18n";
import { cn } from "@infrastructure/utils/client/cn";
import { projectDestroyApi } from "@modules/project/apis/project.destroy.api";
import type {
	ProjectIndexMethods,
	ProjectIndexSecondaryPaginator,
} from "@modules/project/apis/project.index.api";
import { projectIndexApi } from "@modules/project/apis/project.index.api";
import { projectSyncApi } from "@modules/project/apis/project.sync.api";
import { projectUpdateApi } from "@modules/project/apis/project.update.api";
import ProjectStore from "@modules/project/components/project-store";
import ProjectUpdate from "@modules/project/components/project-update";
import TechStackIcons from "@modules/project/components/tech-stack-icons";
import type { ProjectWithRelations } from "@modules/project/schemas/project.schema";
import { useSignal } from "@preact/signals";
import { type Lang, useTranslations } from "@src/i18n";
import { useTable } from "@vigilio/preact-table";
import { sweetModal } from "@vigilio/sweet";
import {
	Edit,
	Eye,
	EyeOff,
	Languages,
	Layers,
	Plus,
	RefreshCw,
	Trash2,
} from "lucide-preact";
import { useEffect } from "preact/hooks";
import type { ProjectIndexResponseDto } from "../dtos/project.response.dto";
import type { ProjectUpdateDto } from "../dtos/project.update.dto";

interface ProjectTableProps {
	lang?: Lang;
}

export default function ProjectTable({ lang = "es" }: ProjectTableProps) {
	const t = useTranslations(lang);
	const projectDestroyMutation = projectDestroyApi();
	const projectSyncMutation = projectSyncApi();
	const editingProject = useSignal<ProjectWithRelations | null>(null);
	const isStoreModalOpen = useSignal<boolean>(false);

	const table = useTable<
		Refetch<ProjectIndexResponseDto["results"]>,
		ProjectIndexSecondaryPaginator,
		ProjectIndexMethods
	>({
		columns: [
			{
				key: "id",
				header: t("dashboard.table.id"),
				isSort: true,
				cell: (row) => (
					<span class="text-[10px]  text-muted-foreground/40 font-bold">
						#{row.id.toString().padStart(3, "0")}
					</span>
				),
			},
			{
				key: "title",
				header: t("dashboard.table.project"),
				isSort: true,
				cell: (row) => (
					<div class="flex flex-col gap-0.5 min-w-[200px]">
						<div class="flex items-center gap-2">
							<div
								class={cn(
									"w-1.5 h-1.5 rounded-full shadow-[0_0_8px]",
									row.status === "live"
										? "bg-green-500 shadow-green-500/50"
										: row.status === "in_dev"
											? "bg-amber-500 shadow-amber-500/50"
											: "bg-zinc-500 shadow-zinc-500/50",
								)}
							/>
							<span class="font-black text-xs tracking-tight text-foreground uppercase">
								{row.title}
							</span>
						</div>
						<span class="text-[10px] font-mono text-muted-foreground/60 truncate max-w-[200px] ml-3.5">
							/{row.slug}
						</span>
					</div>
				),
			},
			{
				key: "techeables",
				header: t("dashboard.table.stack"),
				cell: (row) => (
					<TechStackIcons
						technologyIds={row.techeables?.map((t) => t.technology_id) || []}
					/>
				),
			},
			{
				key: "status",
				header: t("dashboard.table.status"),
				isSort: true,
				cell: (row) => (
					<Badge
						variant={row.status === "live" ? "success" : "secondary"}
						className={cn(
							"text-[9px] font-black uppercase tracking-widest",
							row.status === "live"
								? "bg-green-500/10 text-green-500 border-green-500/20"
								: row.status === "in_dev"
									? "bg-amber-500/10 text-amber-500 border-amber-500/20"
									: "bg-zinc-800 text-zinc-500 border-white/5",
						)}
					>
						{row.status.replace("_", " ")}
					</Badge>
				),
			},
			{
				key: "github_stars",
				header: t("dashboard.table.reputation"),
				isSort: true,
				cell: (row) => (
					<div class="flex items-center gap-1.5 text-[10px] font-bold text-primary/80">
						<span class="opacity-40 whitespace-nowrap">
							{t("dashboard.project.stars")}
						</span>{" "}
						{row.github_stars ?? 0}
					</div>
				),
			},
			{
				key: "updated_at",
				header: t("dashboard.table.last_sync"),
				isSort: true,
				cell: (row) => (
					<span class="text-[10px] font-mono text-muted-foreground/50 uppercase">
						{row.updated_at
							? format(row.updated_at, "short")
							: t("dashboard.project.never")}
					</span>
				),
			},
			{
				key: "action",
				header: t("dashboard.table.actions"),
				cell: (row) => {
					return (
						<div class="flex items-center gap-1">
							<button
								type="button"
								onClick={() => {
									const mutation = projectUpdateApi(row.id);
									mutation.mutate(
										{ is_visible: !row.is_visible } as ProjectUpdateDto,
										{
											onSuccess(data) {
												table.updateData((old, count) => ({
													result: old.map((item) =>
														item.id === row.id
															? { ...item, ...data.project }
															: item,
													),
													count,
												}));
											},
										},
									);
								}}
								class="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 transition-all"
								title={row.is_visible ? t("common.hide") : t("common.show")}
							>
								{row.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
							</button>

							<button
								type="button"
								onClick={() => {
									projectSyncMutation.mutate(row.id, {
										onSuccess() {
											sweetModal({
												icon: "success",
												title: t("dashboard.project.sync_success"),
											});
											query.refetch(false);
										},
									});
								}}
								class={cn(
									"p-2 text-muted-foreground hover:text-blue-400 rounded-lg hover:bg-blue-400/10 transition-all",
									projectSyncMutation.isLoading && "animate-spin text-blue-400",
								)}
								title={t("dashboard.project.sync_github")}
							>
								<RefreshCw size={14} />
							</button>

							<button
								type="button"
								class="p-2 text-muted-foreground hover:text-amber-400 rounded-lg hover:bg-amber-400/10 transition-all"
								title={t("dashboard.project.edit")}
								onClick={() => {
									editingProject.value = row;
								}}
							>
								<Edit size={14} />
							</button>

							<button
								type="button"
								class="p-2 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-all"
								title={t("dashboard.project.delete")}
								onClick={() => {
									sweetModal({
										title: t("dashboard.project.delete_confirm_title"),
										text: `${t("dashboard.project.delete_confirm_text")} "${row.title}"?`,
										icon: "danger",
										showCancelButton: true,
										confirmButtonText: t(
											"dashboard.project.delete_confirm_btn",
										),
									}).then(({ isConfirmed }) => {
										if (isConfirmed) {
											projectDestroyMutation.mutate(row.id, {
												onSuccess() {
													table.updateData((results, count) => ({
														result: results.filter(
															(item) => item.id !== row.id,
														),
														count: count - 1,
													}));
													sweetModal({
														icon: "success",
														title: t("dashboard.project.delete_success"),
													});
												},
											});
										}
									});
								}}
							>
								<Trash2 size={14} />
							</button>
						</div>
					);
				},
			},
		],
		pagination: { limit: 10 },
		filters: {
			language: "es", // Default
		},
	});

	const query = projectIndexApi(table);

	useEffect(() => {
		query.refetch(false);
	}, [
		table.pagination.value.limit,
		table.pagination.value.offset,
		table.search.debounceTerm,
		table.sort.value,
		table.filters.value,
	]);

	const activeFilter = table.filters.value.status ?? null;
	const activeLanguage = table.filters.value.language ?? "es";

	return (
		<VigilioTable table={table} query={query}>
			<div class="space-y-6">
				{/* Header Stats */}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-1">
					<div class="bg-zinc-900/30 border border-white/5 p-4 rounded-2xl backdrop-blur-md relative overflow-hidden group">
						<div class="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<div class="flex items-center gap-3 relative">
							<div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
								<Layers size={20} />
							</div>
							<div>
								<span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 block">
									{t("dashboard.project.total")}
								</span>
								<span class="text-xl font-black  text-foreground">
									{query.data?.count ?? 0}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Action Bar */}
				<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-900/40 border border-white/5 p-4 rounded-2xl backdrop-blur-xl shadow-2xl relative overflow-hidden">
					<div class="absolute inset-0 bg-linear-to-r from-white/2 to-transparent pointer-events-none" />

					{/* Search */}
					<div class="relative group w-full lg:w-96 z-10">
						<div class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors flex items-center gap-2">
							<span class="text-[9px] font-black tracking-widest uppercase text-white">
								{t("dashboard.project.search")}
							</span>
						</div>
						<input
							type="text"
							placeholder={t("common.search")}
							class="bg-black/60 border border-white/10 text-[10px] font-mono tracking-widest rounded-xl pl-24 pr-4 py-3 w-full focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/30 transition-all placeholder:text-muted-foreground/20 text-white"
							value={table.search.value}
							onInput={(e) =>
								table.search.onSearchByName(e.currentTarget.value)
							}
						/>
					</div>

					{/* Language Filter */}
					<div class="relative group">
						<div class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none">
							<Languages size={14} />
						</div>
						<select
							class="bg-black/60 border border-white/10 text-[10px] font-mono tracking-widest rounded-xl pl-9 pr-8 py-3 appearance-none focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all cursor-pointer uppercase text-muted-foreground hover:text-white"
							value={activeLanguage as string}
							onChange={(e) => {
								table.filters.update(
									"language",
									e.currentTarget.value as Language,
								);
							}}
						>
							{LANGUAGES.map((lang) => (
								<option key={lang} value={lang} class="bg-zinc-950 text-white">
									{lang.toUpperCase()}
								</option>
							))}
						</select>
						<div class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="lucide lucide-chevron-down"
							>
								<path d="m6 9 6 6 6-6" />
							</svg>
						</div>
					</div>

					{/* Status Filters */}
					<div class="flex items-center gap-2 z-10 overflow-x-auto pb-1 lg:pb-0">
						{[
							{ key: null, label: t("dashboard.table.all") },
							{ key: "live", label: t("dashboard.table.live") },
							{ key: "in_dev", label: t("dashboard.table.in_dev") },
							{ key: "archived", label: t("dashboard.table.archived") },
						].map((f) => (
							<button
								key={f.key}
								type="button"
								onClick={() => table.filters.update("status", f.key)}
								class={cn(
									"px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap",
									activeFilter === f.key
										? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
										: "bg-white/5 text-muted-foreground hover:text-foreground border-white/5 hover:border-white/10",
								)}
							>
								{f.label}
							</button>
						))}
					</div>

					<button
						type="button"
						onClick={() => {
							isStoreModalOpen.value = true;
						}}
						class="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] z-10"
					>
						<Plus size={14} />
						{t("dashboard.project.create")}
					</button>
				</div>

				<VigilioTable.table>
					<VigilioTable.thead>
						<VigilioTable.thead.th />
					</VigilioTable.thead>
					<VigilioTable.tbody>
						<VigilioTable.tbody.row title={t("dashboard.project.empty")}>
							{(data) => <VigilioTable.tbody.td data={data} />}
						</VigilioTable.tbody.row>
					</VigilioTable.tbody>
				</VigilioTable.table>

				<VigilioTable.footer>
					<div class="flex flex-col sm:flex-row justify-between gap-4 w-full items-center p-6 bg-zinc-900/20 border-t border-white/5 rounded-b-2xl">
						<VigilioTable.footer.show />
						<VigilioTable.footer.paginator />
					</div>
				</VigilioTable.footer>

				<Modal
					isOpen={!!editingProject.value}
					onClose={() => {
						editingProject.value = null;
					}}
					contentClassName="max-w-4xl bg-zinc-950 border border-white/10 shadow-3xl rounded-3xl"
				>
					<ProjectUpdate
						project={editingProject.value!}
						refetch={(data) => {
							table.updateData((old, count) => ({
								result: old.map((item) =>
									item.id === data.id ? { ...item, ...data } : item,
								),
								count,
							}));
							editingProject.value = null;
						}}
						onClose={() => {
							editingProject.value = null;
						}}
					/>
				</Modal>

				<Modal
					isOpen={isStoreModalOpen.value}
					onClose={() => {
						isStoreModalOpen.value = false;
					}}
					contentClassName="max-w-4xl bg-zinc-950 border border-white/10"
				>
					<ProjectStore
						refetch={(data) => {
							isStoreModalOpen.value = false;
							table.updateData((results, count) => ({
								result: [data, ...results],
								count: count + 1,
							}));
						}}
						onClose={() => {
							isStoreModalOpen.value = false;
						}}
					/>
				</Modal>
			</div>
		</VigilioTable>
	);
}
