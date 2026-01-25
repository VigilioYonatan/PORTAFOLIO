import { Card } from "@components/extras/card";
import { formatDateTz } from "@infrastructure/utils/hybrid";
import { Activity, FileText, Lock, Mail, Trash, User } from "lucide-preact";

// Mock data for audit log - in a real app this would come from an API
const MOCK_AUDIT_LOGS = [
	{
		id: 1,
		action: "USER_INVITE",
		actor: "Admin User",
		target: "newuser@example.com",
		details: "Invited new user with role USER",
		timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
		icon: Mail,
		color: "text-blue-500",
		bg: "bg-blue-500/10",
	},
	{
		id: 2,
		action: "USER_UPDATE",
		actor: "Owner User",
		target: "Admin User",
		details: "Updated role from USER to ADMIN",
		timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
		icon: User,
		color: "text-orange-500",
		bg: "bg-orange-500/10",
	},
	{
		id: 3,
		action: "DOCUMENT_DELETE",
		actor: "Admin User",
		target: "Project_Specs.pdf",
		details: "Permanently deleted document",
		timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
		icon: Trash,
		color: "text-red-500",
		bg: "bg-red-500/10",
	},
	{
		id: 4,
		action: "TENANT_UPDATE",
		actor: "Owner User",
		target: "My Company",
		details: "Updated branding colors settings",
		timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
		icon: FileText,
		color: "text-purple-500",
		bg: "bg-purple-500/10",
	},
	{
		id: 5,
		action: "SECURITY_UPDATE",
		actor: "System",
		target: "User #123",
		details: "Account locked due to failed attempts",
		timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
		icon: Lock,
		color: "text-yellow-500",
		bg: "bg-yellow-500/10",
	},
];

export function AuditLog() {
	return (
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h3 class="font-bold flex items-center gap-2">
					<Activity size={18} class="text-primary" />
					Recent Activity Log
				</h3>
				<span class="text-xs text-muted-foreground">Last 7 days</span>
			</div>

			<div class="space-y-3">
				{MOCK_AUDIT_LOGS.map((log) => (
					<Card
						key={log.id}
						className="p-4 flex items-start gap-4 hover:bg-muted/30 transition-colors"
					>
						<div class={`p-2.5 rounded-lg shrink-0 ${log.bg} ${log.color}`}>
							<log.icon size={18} />
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between gap-2 mb-1">
								<span class="font-semibold text-sm truncate">
									{log.action.replace("_", " ")}
								</span>
								<span class="text-xs text-muted-foreground whitespace-nowrap">
									{formatDateTz(log.timestamp)}
								</span>
							</div>
							<p class="text-sm text-foreground/80 mb-1">
								<span class="font-medium text-foreground">{log.actor}</span>{" "}
								{log.details}
							</p>
							<p class="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded w-fit">
								Target: {log.target}
							</p>
						</div>
					</Card>
				))}
			</div>

			<button
				type="button"
				class="w-full py-2 text-sm text-center text-muted-foreground hover:text-foreground transition-colors border-t border-border mt-2"
			>
				View Full Audit Log History
			</button>
		</div>
	);
}
