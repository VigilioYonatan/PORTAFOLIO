import Badge from "@components/extras/badge";
import Modal from "@components/extras/modal";
import VigilioTable from "@components/tables";
import { cn } from "@infrastructure/utils/client/cn";
import { useSignal } from "@preact/signals";
import { useTable } from "@vigilio/preact-table";
import { sweetModal } from "@vigilio/sweet";
import {
	Clock,
	Edit,
	Music,
	PlayCircle,
	Plus,
	Trash2,
	Volume2,
} from "lucide-preact";
import { useEffect } from "preact/hooks";
import { musicTrackDestroyApi } from "../apis/music.destroy.api";
import {
	type MusicIndexMethods,
	type MusicIndexSecondaryPaginator,
	musicIndexApi,
} from "../apis/music.index.api";
import { type MusicTrackSchema } from "../schemas/music.schema";
import AudioStore from "./audio-store";
import AudioUpdate from "./audio-update";

export default function AudioList() {
	const destroyMutation = musicTrackDestroyApi();
	const editingMusic = useSignal<MusicTrackSchema | null>(null);
	const isStoreModalOpen = useSignal<boolean>(false);

	const table = useTable<
		MusicTrackSchema,
		MusicIndexSecondaryPaginator,
		MusicIndexMethods
	>({
		columns: [
			{
				key: "id",
				header: "SEQ_ID",
				isSort: true,
				cell: (row) => (
					<span class="text-[10px] font-mono text-muted-foreground/40 font-bold">
						#{row.id.toString().padStart(3, "0")}
					</span>
				),
			},
			{
				key: "title",
				header: "SIGNAL_NODE",
				isSort: true,
				cell: (row) => (
					<div class="flex items-center gap-3 min-w-[200px]">
						<div class="relative group cursor-pointer">
							<div class="absolute inset-0 bg-primary/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
							<PlayCircle
								size={32}
								class="text-primary relative group-hover:scale-110 transition-transform"
							/>
						</div>
						<div class="flex flex-col gap-0.5">
							<span class="font-black text-xs tracking-tight text-foreground uppercase leading-none">
								{row.title}
							</span>
							<span class="text-[9px] font-mono text-muted-foreground/60 uppercase">
								BY::{row.artist}
							</span>
						</div>
					</div>
				),
			},
			{
				key: "duration_seconds",
				header: "SPECTRUM_TIME",
				isSort: true,
				cell: (row) => {
					const mins = Math.floor(row.duration_seconds / 60);
					const secs = row.duration_seconds % 60;
					return (
						<div class="flex items-center gap-2 font-mono text-[10px] text-muted-foreground/80">
							<Clock size={12} class="text-primary/40" />
							{mins}:{secs.toString().padStart(2, "0")}
						</div>
					);
				},
			},
			{
				key: "is_public",
				header: "BROADCAST_STATUS",
				cell: (row) => (
					<Badge
						variant={row.is_public ? "default" : "secondary"}
						className={cn(
							"text-[9px] font-black uppercase tracking-widest",
							row.is_public
								? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
								: "bg-zinc-800 text-zinc-500 border-white/5",
						)}
					>
						{row.is_public ? "LIVE_SIGNAL" : "ENCRYPTED"}
					</Badge>
				),
			},
			{
				key: "is_featured",
				header: "PRIORITY",
				cell: (row) => (
					<div class="flex items-center justify-center">
						{row.is_featured ? (
							<div class="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)] animate-pulse" />
						) : (
							<div class="w-1.5 h-1.5 rounded-full bg-zinc-800" />
						)}
					</div>
				),
			},
			{
				key: "action",
				header: "OPS",
				cell: (row) => {
					return (
						<div class="flex items-center gap-1">
							<button
								type="button"
								class="p-2 text-muted-foreground hover:text-amber-400 rounded-lg hover:bg-amber-400/10 transition-all"
								title="Modify Spectrum"
								aria-label={`Modify spectrum for ${row.title}`}
								onClick={() => {
									editingMusic.value = row;
								}}
							>
								<Edit size={14} />
							</button>

							<button
								type="button"
								class="p-2 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-all"
								title="Terminate Signal"
								aria-label={`Terminate signal for ${row.title}`}
								onClick={() => {
									sweetModal({
										title: "TERMINATE_SIGNAL?",
										text: `Purge neural archive "${row.title}"?`,
										icon: "danger",
										showCancelButton: true,
										confirmButtonText: "TERMINATE",
									}).then(({ isConfirmed }) => {
										if (isConfirmed) {
											destroyMutation.mutate(row.id, {
												onSuccess() {
													table.updateData((results, count) => ({
														result: results.filter(
															(item) => item.id !== row.id,
														),
														count: count - 1,
													}));
													sweetModal({
														icon: "success",
														title: "Archive Purged",
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
	});

	const query = musicIndexApi(table);

	useEffect(() => {
		query.refetch(false);
	}, [
		table.pagination.value.limit,
		table.pagination.value.offset,
		table.search.debounceTerm,
		table.sort.value,
		table.filters.value,
	]);

	return (
		<VigilioTable table={table} query={query}>
			<div class="space-y-6">
				{/* Stats */}
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div class="bg-zinc-950/40 border border-white/5 p-4 rounded-2xl backdrop-blur-xl group overflow-hidden relative">
						<div class="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<div class="flex items-center gap-3 relative">
							<div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
								<Music size={20} />
							</div>
							<div>
								<span class="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 block">
									TOTAL_SIGNALS
								</span>
								<span class="text-xl font-black text-foreground leading-none">
									{query.data?.count ?? 0}
								</span>
							</div>
						</div>
					</div>
					<div class="bg-zinc-950/40 border border-white/5 p-4 rounded-2xl backdrop-blur-xl group overflow-hidden relative">
						<div class="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<div class="flex items-center gap-3 relative">
							<div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
								<Volume2 size={20} />
							</div>
							<div>
								<span class="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 block">
									BROADCAST_LOAD
								</span>
								<span class="text-xl font-black text-foreground leading-none">
									OPTIMAL
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Action Bar */}
				<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-950/60 border border-white/5 p-4 rounded-3xl backdrop-blur-2xl shadow-2xl relative overflow-hidden">
					<div class="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent pointer-events-none" />

					{/* Search */}
					<div class="relative group w-full lg:w-96 z-10">
						<div class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors flex items-center gap-2">
							<span class="text-[8px] font-black tracking-widest uppercase">
								NODE_SCAN:
							</span>
						</div>
						<input
							type="text"
							placeholder="INITIATE_SEARCH..."
							class="bg-black/40 border border-white/10 text-[10px] font-mono tracking-widest rounded-xl pl-24 pr-4 py-3.5 w-full focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/20 transition-all placeholder:text-muted-foreground/20"
							value={table.search.value}
							onInput={(e) =>
								table.search.onSearchByName(e.currentTarget.value)
							}
						/>
					</div>

					<button
						type="button"
						onClick={() => {
							isStoreModalOpen.value = true;
						}}
						aria-label="Initialize Signal Encoder (Add new audio)"
						class="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:brightness-110 transition-all shadow-(0_0_25px_rgba(var(--primary-rgb),0.3)) z-10 active:scale-95"
					>
						<Plus size={16} strokeWidth={3} />
						INIT_SIGNAL_ENCODER
					</button>
				</div>

				<VigilioTable.table>
					<VigilioTable.thead>
						<VigilioTable.thead.th />
					</VigilioTable.thead>
					<VigilioTable.tbody>
						<VigilioTable.tbody.row title="No audio signals detected">
							{(data) => <VigilioTable.tbody.td data={data} />}
						</VigilioTable.tbody.row>
					</VigilioTable.tbody>
				</VigilioTable.table>

				<VigilioTable.footer>
					<div class="flex flex-col sm:flex-row justify-between gap-4 w-full items-center p-6 bg-zinc-950/20 border-t border-white/5 rounded-b-3xl">
						<VigilioTable.footer.show />
						<VigilioTable.footer.paginator />
					</div>
				</VigilioTable.footer>

				{/* Modals */}
				<Modal
					isOpen={!!editingMusic.value}
					onClose={() => {
						editingMusic.value = null;
					}}
					className="items-center"
					contentClassName="max-w-2xl bg-zinc-950 border border-white/10 shadow-3xl rounded-[2.5rem] overflow-hidden"
				>
					<AudioUpdate
						music={editingMusic.value!}
						refetch={(data) => {
							table.updateData((old, count) => ({
								result: old.map((item) =>
									item.id === data.id ? { ...item, ...data } : item,
								),
								count,
							}));
							editingMusic.value = null;
						}}
						onClose={() => {
							editingMusic.value = null;
						}}
					/>
				</Modal>

				<Modal
					isOpen={isStoreModalOpen.value}
					onClose={() => {
						isStoreModalOpen.value = false;
					}}
					contentClassName="max-w-2xl bg-zinc-950 border border-white/10 shadow-3xl rounded-[2.5rem] overflow-hidden"
				>
					<AudioStore
						refetch={(data) => {
							table.updateData((old, count) => ({
								result: [data, ...old],
								count: count + 1,
							}));
							isStoreModalOpen.value = false;
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
