import Badge from "@components/extras/badge";
import { Card } from "@components/extras/card";
import { formatDateTz } from "@infrastructure/utils/hybrid";
import { sweetModal } from "@vigilio/sweet";
import { Globe, Laptop, LogOut, Shield, Smartphone } from "lucide-preact";

// Mock data for sessions
const MOCK_SESSIONS = [
	{
		id: "sess_1",
		device: "MacBook Pro",
		os: "macOS 14.2",
		browser: "Chrome 120.0",
		ip: "192.168.1.1",
		location: "Lima, Peru",
		last_active: new Date().toISOString(),
		is_current: true,
		type: "DESKTOP",
	},
	{
		id: "sess_2",
		device: "iPhone 15",
		os: "iOS 17.2",
		browser: "Safari",
		ip: "181.176.x.x",
		location: "Lima, Peru",
		last_active: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
		is_current: false,
		type: "MOBILE",
	},
	{
		id: "sess_3",
		device: "Windows PC",
		os: "Windows 11",
		browser: "Firefox",
		ip: "200.121.x.x",
		location: "Arequipa, Peru",
		last_active: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
		is_current: false,
		type: "DESKTOP",
	},
];

export function SessionManager() {
	const handleRevoke = (sessionId: string) => {
		sweetModal({
			title: "Revoke Session?",
			text: "The user will be logged out from that device immediately.",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Revoke",
		}).then(({ isConfirmed }) => {
			if (isConfirmed) {
				// In real app, call API here
				sweetModal({
					icon: "success",
					title: "Session Revoked",
					timer: 1500,
					showConfirmButton: false,
				});
			}
		});
	};

	return (
		<Card className="p-6 border-border/50 shadow-sm relative overflow-hidden">
			<div class="absolute top-0 right-0 p-4 opacity-5">
				<Shield size={120} />
			</div>

			<div class="relative">
				<div class="flex items-center gap-3 mb-6">
					<div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
						<Globe {...sizeIcon.small} class="text-blue-600" />
					</div>
					<div>
						<h3 class="text-lg font-bold">Active Sessions</h3>
						<p class="text-xs text-muted-foreground">
							Manage where you're logged in. Revoke any unrecognized sessions.
						</p>
					</div>
				</div>

				<div class="space-y-4">
					{MOCK_SESSIONS.map((session) => (
						<div
							key={session.id}
							class="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group"
						>
							<div class="flex items-center gap-4">
								<div
									class={`w-10 h-10 rounded-full flex items-center justify-center ${session.is_current ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}
								>
									{session.type === "MOBILE" ? (
										<Smartphone size={20} />
									) : (
										<Laptop size={20} />
									)}
								</div>
								<div>
									<div class="flex items-center gap-2">
										<p class="font-bold text-sm">{session.device}</p>
										{session.is_current && (
											<Badge
												variant="success"
												className="text-[10px] px-1.5 py-0"
											>
												Current
											</Badge>
										)}
									</div>
									<p class="text-xs text-muted-foreground">
										{session.browser} on {session.os} • {session.location}
									</p>
									<p class="text-[10px] text-muted-foreground mt-0.5">
										Last active: {formatDateTz(session.last_active)}
									</p>
								</div>
							</div>

							{!session.is_current && (
								<button
									type="button"
									onClick={() => handleRevoke(session.id)}
									class="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
									aria-label={`Revoke session for ${session.device}`}
									title="Revoke Session"
								>
									<LogOut size={18} />
								</button>
							)}
						</div>
					))}
				</div>
			</div>
		</Card>
	);
}

const sizeIcon = {
	small: { width: 16, height: 16 },
	medium: { width: 24, height: 24 },
} as const;
