import Modal from "@components/extras/modal";
import VigilioTable from "@components/tables";
import { formatDateTz } from "@infrastructure/utils/hybrid/date.utils";
import {
	type ContactIndexMethods,
	type ContactIndexSecondaryPaginator,
	contactIndexApi,
} from "@modules/contact/apis/contact.index.api";
import MessageDetail from "@modules/contact/components/message-detail";
import type { ContactMessageSchema } from "@modules/contact/schemas/contact-message.schema";
import { useSignal } from "@preact/signals";
import { useTable } from "@vigilio/preact-table";
import { Eye, Mail, MailOpen, MessageSquare, Search } from "lucide-preact";
import { useEffect } from "preact/hooks";
import { type Lang, useTranslations } from "@src/i18n";

interface MessageListProps {
    lang?: Lang;
}

export default function MessageList({ lang = "es" }: MessageListProps) {
    const t = useTranslations(lang);
	const selectedMessage = useSignal<ContactMessageSchema | null>(null);

	const table = useTable<
		ContactMessageSchema,
		ContactIndexSecondaryPaginator,
		ContactIndexMethods
	>({
		columns: [
			{
				key: "is_read",
				header: t("dashboard.table.status"),
				cell: (item) => (
					<div class="flex items-center justify-center">
						{item.is_read ? (
							<MailOpen size={14} class="text-muted-foreground/40" />
						) : (
							<div class="relative">
								<Mail size={14} class="text-primary" />
								<span class="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
							</div>
						)}
					</div>
				),
			},
			{
				key: "name",
				header: t("dashboard.message.sender"),
				cell: (item) => (
					<div class="flex flex-col">
						<span class="text-xs font-bold text-foreground">{item.name}</span>
						<span class="text-[10px] text-muted-foreground font-mono">
							{item.email}
						</span>
					</div>
				),
			},
			{
				key: "subject",
				header: t("dashboard.message.subject"),
				cell: (item) => (
					<span class="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
						{item.subject || "(Sin Asunto)"}
					</span>
				),
			},
			{
				key: "created_at",
				header: t("dashboard.message.date"),
				cell: (item) => (
					<span class="text-[10px] text-muted-foreground/60 font-mono">
						{formatDateTz(item.created_at)}
					</span>
				),
			},
			{
				key: "action",
				header: t("common.actions"),
				cell: (item) => (
					<div class="flex items-center gap-2">
						<button
							type="button"
							onClick={() => {
								selectedMessage.value = item;
							}}
							class="p-2 hover:bg-white/5 rounded-lg text-primary transition-colors"
						>
							<Eye size={14} />
						</button>
					</div>
				),
			},
		],
		pagination: { limit: 10 },
	});

	const query = contactIndexApi(table);

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
		<VigilioTable  table={table} query={query}>
			<div class="flex flex-col gap-4 mb-6">
				<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div class="flex flex-col">
						<span class="text-[9px] font-black tracking-[0.3em] text-primary/40 uppercase">
							{t("dashboard.inbox.title")}
						</span>
						<h3 class="text-xl font-black tracking-tight uppercase flex items-center gap-3">
							<MessageSquare size={20} class="text-primary" />
							{t("dashboard.inbox.received")}
						</h3>
					</div>
					<div class="relative group w-full lg:w-96">
						<Search
							size={16}
							class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors"
						/>
						<input
							type="text"
							placeholder={t("dashboard.inbox.search")}
							class="bg-black/60 border border-white/10 text-[10px] font-mono tracking-widest rounded-xl pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/30 transition-all placeholder:text-muted-foreground/20"
							value={table.search.value}
							onInput={(e) =>
								table.search.onSearchByName(e.currentTarget.value)
							}
						/>
					</div>
				</div>
			</div>

			<VigilioTable.table>
				<VigilioTable.thead>
					<VigilioTable.thead.th />
				</VigilioTable.thead>
				<VigilioTable.tbody>
					<VigilioTable.tbody.row title={t("dashboard.inbox.empty")}>
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
				isOpen={!!selectedMessage.value}
				onClose={() => {
					selectedMessage.value = null;
				}}
				contentClassName="max-w-2xl w-full"
			>
				<MessageDetail
					message={selectedMessage.value!}
                    lang={lang}
					onUpdate={(data) => {
						table.updateData((old, count) => ({
							result: old.map((m) =>
								m.id === selectedMessage.value?.id ? { ...m, ...data } : m,
							),
							count,
						}));
					}}
				/>
			</Modal>

		</VigilioTable>
	);
}
