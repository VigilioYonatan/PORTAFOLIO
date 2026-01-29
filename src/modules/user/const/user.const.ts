import type { UserSchema } from "../schemas/user.schema";

/**
 * User status options for filtering
 */
export const USER_STATUS_OPTIONS: {
	key: UserSchema["status"] | "all";
	value: string;
	color: string;
}[] = [
	{ key: "all", value: "All Status", color: "" },
	{ key: "ACTIVE", value: "Active", color: "bg-green-500/10 text-green-600" },
	{ key: "BANNED", value: "Banned", color: "bg-red-500/10 text-red-600" },
	{
		key: "PENDING",
		value: "Pending",
		color: "bg-yellow-500/10 text-yellow-600",
	},
];

/**
 * User role options for filtering
 * Role IDs: 1=ADMIN, 2=USER, 3=OWNER
 */
export const USER_ROLE_OPTIONS: {
	key: number | "all";
	value: string;
}[] = [
	{ key: "all", value: "All Roles" },
	{ key: 3, value: "Owner" },
	{ key: 1, value: "Admin" },
	{ key: 2, value: "User" },
];

/**
 * Role badge styling based on role_id
 * Matches the design reference
 */
export const ROLE_BADGE_STYLES: Record<
	number,
	{
		label: string;
		className: string;
		variant:
			| "outline"
			| "primary"
			| "secondary"
			| "success"
			| "default"
			| "warning"
			| "destructive"
			| "matrix";
	}
> = {
	1: {
		label: "ADMIN",
		className: "bg-muted text-muted-foreground",
		variant: "outline",
	},
	2: {
		label: "USER",
		className: "bg-muted/50 text-muted-foreground",
		variant: "outline",
	},
	3: {
		label: "OWNER",
		className: "bg-primary text-primary-foreground",
		variant: "primary",
	},
};

/**
 * Get role display info by role_id
 */
export function getRoleBadgeInfo(roleId: number): {
	label: string;
	className: string;
	variant:
		| "outline"
		| "primary"
		| "secondary"
		| "success"
		| "default"
		| "warning"
		| "destructive"
		| "matrix";
} {
	return (
		ROLE_BADGE_STYLES[roleId] || {
			label: "USER",
			className: "bg-muted/50 text-muted-foreground",
			variant: "outline",
		}
	);
}

/**
 * Get status display info
 */
export function getUserStatusInfo(status: UserSchema["status"]): {
	label: string;
	className: string;
	dotColor: string;
	variant:
		| "outline"
		| "primary"
		| "secondary"
		| "success"
		| "default"
		| "warning"
		| "destructive"
		| "matrix";
} {
	const statusMap: Record<
		string,
		{
			label: string;
			className: string;
			dotColor: string;
			variant:
				| "outline"
				| "primary"
				| "secondary"
				| "success"
				| "default"
				| "warning"
				| "destructive"
				| "matrix";
		}
	> = {
		ACTIVE: {
			label: "ACTIVE",
			className: "text-green-600",
			dotColor: "bg-green-500",
			variant: "success",
		},
		BANNED: {
			label: "BANNED",
			className: "text-red-600",
			dotColor: "bg-red-500",
			variant: "destructive",
		},
		PENDING: {
			label: "PENDING",
			className: "text-yellow-600",
			dotColor: "bg-yellow-500",
			variant: "warning",
		},
	};
	return statusMap[status || "PENDING"];
}
