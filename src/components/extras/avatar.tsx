import environments from "@infrastructure/config/client/environments.config";
import { cn } from "@infrastructure/utils/client";
import { printFileWithDimension } from "@infrastructure/utils/hybrid";
import { DIMENSION_IMAGE } from "@modules/uploads/const/upload.const";
import type { UserSchema } from "@modules/user/schemas/user.schema";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
type AvatarStatus = "online" | "offline" | "away" | "busy";

interface AvatarProps {
	user: Pick<UserSchema, "avatar" | "username">;
	size?: AvatarSize;
	status?: AvatarStatus;
	className?: string;
}

function Avatar({ user, size = "md", status, className }: AvatarProps) {
	const sizes: Record<AvatarSize, string> = {
		xs: "w-6 h-6 text-xs",
		sm: "w-8 h-8 text-sm",
		md: "w-10 h-10 text-base",
		lg: "w-14 h-14 text-lg",
		xl: "w-20 h-20 text-xl",
	};

	const statusColors: Record<AvatarStatus, string> = {
		online: "bg-primary",
		offline: "bg-muted-foreground",
		away: "bg-accent",
		busy: "bg-destructive",
	};

	const statusSizes: Record<AvatarSize, string> = {
		xs: "w-2 h-2",
		sm: "w-2.5 h-2.5",
		md: "w-3 h-3",
		lg: "w-4 h-4",
		xl: "w-5 h-5",
	};

	return (
		<div class={cn("relative inline-block", className)}>
			<div
				class={cn(
					"rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden shadow-sm",
					sizes[size],
				)}
			>
				{user?.avatar ? (
					<img
						src={
							printFileWithDimension(
								user.avatar,
								DIMENSION_IMAGE.xs,
								environments.STORAGE_URL,
							)[0]
						}
						alt={user.username || ""}
						title={user.username || ""}
						width={DIMENSION_IMAGE.xs}
						height={DIMENSION_IMAGE.xs}
						class="w-full h-full object-cover"
					/>
				) : (
					<span class="font-medium text-muted-foreground">
						{`${user?.username}` || "?"}
					</span>
				)}
			</div>

			{status && (
				<div
					class={cn(
						"absolute -bottom-1 -right-1 rounded-sm border border-background shadow-sm",
						statusColors[status],
						statusSizes[size],
					)}
				/>
			)}
		</div>
	);
}

export default Avatar;
