import Badge from "@components/extras/badge";
import environments from "@infrastructure/config/client/environments.config";
import { cn } from "@infrastructure/utils/client";
import { formatDateTz } from "@infrastructure/utils/hybrid";
import { printFileWithDimension } from "@infrastructure/utils/hybrid/file.utils";
import { DIMENSION_IMAGE } from "@modules/uploads/const/upload.const";
import { Calendar, Globe, Mail, Phone, Shield, User } from "lucide-preact";
import { getRoleBadgeInfo } from "../const/user.const";
import type { UserIndexSchema } from "../schemas/user.schema";

interface UserShowProps {
	user: UserIndexSchema;
}

export function UserShow({ user }: UserShowProps) {
	const roleInfo = getRoleBadgeInfo(user.role_id);
	const avatarUrl = user.avatar
		? printFileWithDimension(
				user.avatar,
				DIMENSION_IMAGE.md,
				environments.STORAGE_URL,
			)[0]
		: null;

	return (
		<div class="flex flex-col gap-0 bg-background rounded-lg overflow-hidden">
			{/* Cover / Header */}
			<div class="h-32 bg-zinc-900 border-b border-border relative">
				<div class="absolute inset-0 bg-linear-to-r from-primary/10 to-transparent opacity-50" />
				<div class="absolute bottom-0 left-0 p-6 flex items-end translate-y-1/2 gap-4">
					<div class="w-24 h-24 rounded-full border-4 border-background bg-zinc-800 flex items-center justify-center overflow-hidden shadow-xl">
						{avatarUrl ? (
							<img
								src={avatarUrl}
								alt={user.username}
								width={DIMENSION_IMAGE.md}
								height={DIMENSION_IMAGE.md}
								class="w-full h-full object-cover"
							/>
						) : (
							<span class="text-3xl font-bold text-muted-foreground">
								{user.username.slice(0, 2).toUpperCase()}
							</span>
						)}
					</div>
				</div>
			</div>

			<div class="pt-16 pb-6 px-6">
				<div class="flex justify-between items-start mb-6">
					<div>
						<h2 class="text-2xl font-bold flex items-center gap-2">
							{user.username}
							<div
								class={cn(
									"inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider",
									roleInfo.className,
								)}
							>
								{roleInfo.label}
							</div>
						</h2>
						<p class="text-muted-foreground">{user.email}</p>
					</div>
					<div class="flex flex-col items-end gap-1">
						<span class="text-xs text-muted-foreground uppercase tracking-widest font-mono">
							MEMBER_ID
						</span>
						<span class="text-sm font-mono">
							#{String(user.id).padStart(4, "0")}
						</span>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="space-y-4">
						<h3 class="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
							<User size={12} />
							Personal Info
						</h3>
						<div class="space-y-3">
							<div class="flex items-center gap-3 text-sm p-3 bg-muted/30 rounded-lg border border-border/50">
								<Mail size={16} class="text-muted-foreground shrink-0" />
								<span class="truncate">{user.email}</span>
							</div>
							<div class="flex items-center gap-3 text-sm p-3 bg-muted/30 rounded-lg border border-border/50">
								<Phone size={16} class="text-muted-foreground shrink-0" />
								<span>{user.phone_number || "No phone number"}</span>
							</div>
							<div class="flex items-center gap-3 text-sm p-3 bg-muted/30 rounded-lg border border-border/50">
								<Globe size={16} class="text-muted-foreground shrink-0" />
								<span>Lima, Peru (ip-based)</span>
							</div>
						</div>
					</div>

					<div class="space-y-4">
						<h3 class="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
							<Shield size={12} />
							Security & Activity
						</h3>
						<div class="space-y-3">
							<div class="flex items-center justify-between text-sm p-3 bg-muted/30 rounded-lg border border-border/50">
								<span class="text-muted-foreground">Account Status</span>
								<div class="flex items-center gap-2">
									<span
										class={`w-2 h-2 rounded-full ${user.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"}`}
									/>
									<span class="font-medium">
										{user.status === "ACTIVE" ? "ACTIVE" : "Disabled"}
									</span>
								</div>
							</div>
							<div class="flex items-center justify-between text-sm p-3 bg-muted/30 rounded-lg border border-border/50">
								<span class="text-muted-foreground">MFA Enabled</span>
								<span
									class={cn(
										"font-medium",
										user.is_mfa_enabled ? "text-green-500" : "text-zinc-500",
									)}
								>
									{user.is_mfa_enabled ? "Yes" : "Disabled"}
								</span>
							</div>
							{user.is_superuser && (
								<div class="flex items-center justify-between text-sm p-3 bg-primary/10 rounded-lg border border-primary/20">
									<span class="text-primary font-bold">Privileges</span>
									<Badge variant="default" className="text-[10px] uppercase">
										Superuser
									</Badge>
								</div>
							)}

							<div class="flex items-center justify-between text-sm p-3 bg-muted/30 rounded-lg border border-border/50">
								<span class="text-muted-foreground flex items-center gap-2">
									<Calendar size={14} />
									Joined
								</span>
								<span class="font-mono text-xs">
									{formatDateTz(user.created_at)}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
