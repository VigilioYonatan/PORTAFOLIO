import { Card, CardContent, CardHeader, CardTitle } from "@components/Card";
import { formatTimeAgo } from "@infrastructure/utils/hybrid/date.utils";
import { notificationIndexApi } from "@modules/notification/apis/notification.api";
import { Bell, Heart, Mail, MessageSquare, ShieldCheck } from "lucide-preact";

export function NotificationCenter() {
	// Polling every 30 seconds
	const notificationsQuery = notificationIndexApi(
		{
			limit: 10,
		},
		{ refetchInterval: 30000 },
	);

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case "CONTACT":
				return <Mail className="h-4 w-4 text-blue-500" />;
			case "COMMENT":
				return <MessageSquare className="h-4 w-4 text-purple-500" />;
			case "LIKE":
				return <Heart className="h-4 w-4 text-red-500" />;
			case "SYSTEM":
				return <ShieldCheck className="h-4 w-4 text-green-500" />;
			default:
				return <Bell className="h-4 w-4 text-zinc-500" />;
		}
	};

	return (
		<Card className="bg-zinc-900/50 border-white/5">
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="text-sm font-black font-mono tracking-widest uppercase">
					Neural_Feed
				</CardTitle>
				<div class="flex items-center gap-2">
					<div class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
					<span class="text-[10px] font-mono text-muted-foreground uppercase">
						LIVE_STREAM
					</span>
				</div>
			</CardHeader>
			<CardContent>
				<div class="space-y-6">
					{notificationsQuery.isLoading ? (
						[1, 2, 3].map((i) => (
							<div key={i} class="flex items-center gap-4 animate-pulse">
								<div class="h-8 w-8 bg-white/5 rounded-full" />
								<div class="flex-1 space-y-2">
									<div class="h-3 w-3/4 bg-white/5 rounded" />
									<div class="h-2 w-1/4 bg-white/5 rounded" />
								</div>
							</div>
						))
					) : notificationsQuery.data?.results?.length ? (
						notificationsQuery.data.results.map((notification) => (
							<div
								key={notification.id}
								class="flex items-start gap-4 p-2 rounded-lg hover:bg-white/5 transition-colors group"
							>
								<div class="mt-1 p-2 bg-white/[0.03] border border-white/5 rounded-full group-hover:scale-110 transition-transform">
									{getNotificationIcon(notification.type)}
								</div>
								<div class="flex-1 space-y-1">
									<p class="text-xs font-bold leading-none tracking-tight">
										{notification.title}
									</p>
									<p class="text-[10px] text-muted-foreground line-clamp-1">
										{notification.content}
									</p>
									<p class="text-[9px] font-mono text-primary/40 uppercase tracking-widest pt-1">
										{formatTimeAgo(notification.created_at)}
									</p>
								</div>
							</div>
						))
					) : (
						<div class="py-8 text-center bg-white/[0.02] border border-dashed border-white/5 rounded-xl">
							<p class="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
								ALL_QUIET_ON_THE_GRID
							</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
export default NotificationCenter;
