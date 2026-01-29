import { cn } from "@infrastructure/utils/client";
import { notificationDestroyAllApi } from "@modules/notification/apis/notification.destroy-all.api";
import { notificationIndexApi } from "@modules/notification/apis/notification.index.api";
import { notificationUpdateApi } from "@modules/notification/apis/notification.update.api";
import { sweetModal } from "@vigilio/sweet";
import { Bell, Check, Trash2 } from "lucide-preact";

export function NotificationCenter() {
	const query = notificationIndexApi(null, null, { limit: 5 });
	const updateMutation = notificationUpdateApi();
	const destroyAllMutation = notificationDestroyAllApi();

	function handleMarkAsRead(id: number) {
		updateMutation.mutate(
			{ id, body: { is_read: true } },
			{
				onSuccess() {
					query.transformData((prev) => ({
						...prev,
						results: prev.results.map((n) =>
							n.id === id ? { ...n, is_read: true } : n,
						),
					}));
				},
			},
		);
	}

	function handleDeleteAll() {
		sweetModal({
			title: "¿Limpiar todas las notificaciones?",
			text: "Esta acción no se puede deshacer.",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Sí, limpiar todas",
		}).then(({ isConfirmed }) => {
			if (isConfirmed) {
				destroyAllMutation.mutate(undefined, {
					onSuccess() {
						query.transformData((prev) => ({
							...prev,
							results: [],
							count: 0,
						}));
						sweetModal({ icon: "success", title: "¡Limpiado!" });
					},
				});
			}
		});
	}

	if (query.isLoading)
		return (
			<div class="p-4 animate-pulse text-xs font-mono">
				CARGANDO_NOTIFICACIONES...
			</div>
		);
	if (query.isError)
		return (
			<div class="p-4 text-xs font-mono text-red-500">ERROR_CARGANDO_FLUJO</div>
		);

	const notifications = query.data?.results || [];
	const unreadCount = notifications.filter((n) => !n.is_read).length;

	return (
		<div class="flex flex-col h-full bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden backdrop-blur-sm">
			<div class="flex items-center justify-between p-4 border-b border-white/5">
				<div class="flex items-center gap-2">
					<Bell size={14} class="text-primary" />
					<h3 class="text-sm font-black tracking-widest uppercase">
						Notificaciones_Sistema
					</h3>
					{unreadCount > 0 && (
						<span class="text-[10px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded-full font-bold">
							{unreadCount}
						</span>
					)}
				</div>
				{notifications.length > 0 && (
					<button
						type="button"
						onClick={handleDeleteAll}
						class="text-zinc-500 hover:text-red-400 transition-colors"
						aria-label="Limpiar Todas las Notificaciones"
						title="Limpiar Todas"
					>
						<Trash2 size={14} />
					</button>
				)}
			</div>

			<div class="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
				{notifications.length === 0 ? (
					<div class="h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
						<Bell size={24} class="opacity-20" />
						<span class="text-xs font-mono">SIN_NUEVAS_SEÑALES</span>
					</div>
				) : (
					notifications.map((notif) => (
						<div
							key={notif.id}
							class={cn(
								"group flex gap-3 p-3 rounded-lg border border-transparent transition-all hover:bg-white/5",
								!notif.is_read
									? "bg-primary/5 border-primary/10"
									: "opacity-60",
							)}
						>
							<div class="mt-1">
								{notif.type === "LIKE" ? ( // Check type logic based on schema enum
									<div class="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
								) : notif.type === "COMMENT" ? (
									<div class="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
								) : (
									<div class="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
								)}
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-start justify-between gap-2">
									<p
										class={cn(
											"text-xs font-medium leading-none truncate",
											!notif.is_read ? "text-white" : "text-zinc-400",
										)}
									>
										{notif.title}
									</p>
									<span class="text-[9px] text-zinc-600 whitespace-nowrap">
										{new Date(notif.created_at).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</div>
								<p class="text-[10px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
									{notif.content}
								</p>
								{!notif.is_read && (
									<button
										type="button"
										onClick={() => handleMarkAsRead(notif.id)}
										aria-label="Mark notification as read"
										class="mt-2 text-[9px] flex items-center gap-1 text-primary/70 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
									>
										<Check size={10} />
										MARCAR_LEÍDO
									</button>
								)}
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}
export default NotificationCenter;
