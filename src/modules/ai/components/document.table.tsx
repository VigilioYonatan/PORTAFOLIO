import Badge from "@components/extras/badge";
import { Card } from "@components/extras/card";
import VigilioTable from "@components/tables";
import { cn } from "@infrastructure/utils/client";
import { formatTimeAgo } from "@infrastructure/utils/hybrid/date.utils";
import {
	type DocumentIndexMethods,
	type DocumentIndexSecondaryPaginator,
	documentsIndexApi,
} from "@modules/documents/apis/documents.index.api";
import { documentsProcessApi } from "@modules/documents/apis/documents.process.api";
import type { DocumentSchema } from "@modules/documents/schemas/document.schema";
import { useTable } from "@vigilio/preact-table";
import { sweetModal } from "@vigilio/sweet";
import {
	AlertCircle,
	CheckCircle2,
	FileText,
	Loader2,
	Play,
} from "lucide-preact";
import { useEffect } from "preact/hooks";

export default function DocumentTable() {
	const processMutation = documentsProcessApi();

	const table = useTable<
		DocumentSchema,
		DocumentIndexSecondaryPaginator,
		DocumentIndexMethods
	>({
		columns: [
			{
				key: "id",
				header: "ID",
				isSort: true,
			},
			{
				key: "title",
				header: "KNOWLEDGE_NODE",
				cell: (row) => (
					<div class="flex items-center gap-3">
						<div class="p-2 bg-white/5 rounded-lg">
							<FileText size={18} class="text-primary/60" />
						</div>
						<div class="flex flex-col text-xs font-black uppercase tracking-tight">
							<span>{row.title}</span>
							<span class="text-[9px] font-mono text-muted-foreground/40 lowercase">
								{row.chunk_count} chunks_detected
							</span>
						</div>
					</div>
				),
			},
			{
				key: "status",
				header: "INDEX_STATUS",
				cell: (row) => {
					const configs = {
						PENDING: {
							color: "text-zinc-500 bg-zinc-500/10",
							icon: AlertCircle,
							label: "PENDING",
						},
						PROCESSING: {
							color: "text-amber-500 bg-amber-500/10",
							icon: Loader2,
							label: "OPTIMIZING",
						},
						READY: {
							color: "text-primary bg-primary/10",
							icon: CheckCircle2,
							label: "SYNCED",
						},
						FAILED: {
							color: "text-red-500 bg-red-500/10",
							icon: AlertCircle,
							label: "FAULT",
						},
					};
					const config = configs[row.status];
					const Icon = config.icon;

					return (
						<Badge
							className={cn(
								"gap-1.5 px-3 py-1 text-[9px] font-black tracking-widest",
								config.color,
							)}
						>
							<Icon
								size={10}
								className={row.status === "PROCESSING" ? "animate-spin" : ""}
							/>
							{config.label}
						</Badge>
					);
				},
			},
			{
				key: "created_at",
				header: "INGESTION_TIME",
				cell: (row) => (
					<span class="text-[10px] font-mono text-muted-foreground/40 uppercase">
						{formatTimeAgo(row.created_at)}
					</span>
				),
			},
			{
				key: "action",
				header: "OPS",
				cell: (row) => (
					<button
						type="button"
						disabled={row.status === "PROCESSING" || row.status === "READY"}
						onClick={() => {
							processMutation.mutate(row.id, {
								onSuccess() {
									sweetModal({
										icon: "success",
										title: "RAG Optimization Started",
									});
									query.refetch(false);
								},
							});
						}}
						class="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-[9px] font-black tracking-[0.2em] rounded-md transition-all disabled:opacity-20"
					>
						<Play size={10} stroke-width={3} />
						EXEC_RAG
					</button>
				),
			},
		],
		pagination: { limit: 10 },
	});
	const query = documentsIndexApi(table);

	// Polling for processing status
	useEffect(() => {
		const hasProcessing = query.data?.results.some(
			(r: DocumentSchema) => r.status === "PROCESSING",
		);
		if (hasProcessing) {
			const interval = setInterval(() => query.refetch(false), 5000);
			return () => clearInterval(interval);
		}
	}, [query.data]);

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
		<VigilioTable query={query} table={table}>
			<Card className="p-4 bg-zinc-950/40 border border-white/5">
				<div class="flex items-center justify-between">
					<h3 class="text-[10px] font-black tracking-[0.4em] text-muted-foreground/60 uppercase">
						Active_Knowledge_Base
					</h3>
					<div class="relative group">
						<input
							type="text"
							placeholder="FILTER_DOCS..."
							class="bg-transparent border-none text-[10px] font-mono focus:ring-0 placeholder:text-muted-foreground/20 text-right uppercase"
							value={table.search.value}
							onInput={(e) =>
								table.search.onSearchByName(e.currentTarget.value)
							}
						/>
					</div>
				</div>
			</Card>

			<VigilioTable.table>
				<VigilioTable.thead>
					<VigilioTable.thead.row>
						<VigilioTable.thead.th />
					</VigilioTable.thead.row>
				</VigilioTable.thead>
				<VigilioTable.tbody>
					<VigilioTable.tbody.row title="SCANNING_ARCHIVES...">
						{(data) => <VigilioTable.tbody.td data={data} />}
					</VigilioTable.tbody.row>
				</VigilioTable.tbody>
			</VigilioTable.table>

			<VigilioTable.footer>
				<div className="flex justify-between items-center p-4 bg-zinc-900/10 border-t border-white/5 rounded-b-sm">
					<VigilioTable.footer.show />
					<VigilioTable.footer.paginator />
				</div>
			</VigilioTable.footer>
		</VigilioTable>
	);
}
