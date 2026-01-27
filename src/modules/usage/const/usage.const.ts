/**
 * Usage Module Constants
 * Color thresholds, chart colors, and formatting helpers
 */

// Quota types with their display properties
export const QUOTA_TYPES = {
	documents: {
		key: "documents_count" as const,
		label: "Documents",
		unit: "docs",
		color: "cyan",
		icon: "File",
	},
	messages: {
		key: "messages_count" as const,
		label: "Messages",
		unit: "msgs",
		color: "blue",
		icon: "MessageSquare",
	},
	storage: {
		key: "storage_bytes" as const,
		label: "Storage",
		unit: "GB",
		color: "orange",
		icon: "HardDrive",
	},
} as const;

export type QuotaType = keyof typeof QUOTA_TYPES;

// Color thresholds for usage percentage
export const USAGE_THRESHOLDS = {
	safe: 70, // <70% = green
	warning: 90, // 70-90% = yellow
	// >90% = red
} as const;

// Chart colors matching the design
export const CHART_COLORS = {
	documents: "hsl(180, 100%, 50%)", // cyan
	messages: "hsl(220, 100%, 60%)", // blue
	storage: "hsl(30, 100%, 50%)", // orange
} as const;

// Date range filter options
export const DATE_RANGES = [
	{ key: "7d", value: "Last 7 Days", days: 7 },
	{ key: "30d", value: "Last 30 Days", days: 30 },
	{ key: "90d", value: "Last 90 Days", days: 90 },
] as const;

export type DateRangeKey = (typeof DATE_RANGES)[number]["key"];

/**
 * Get color class based on usage percentage
 */
export function getUsageColor(
	current: number,
	limit: number,
): "green" | "yellow" | "red" {
	const percentage = (current / limit) * 100;

	if (percentage >= USAGE_THRESHOLDS.warning) return "red";
	if (percentage >= USAGE_THRESHOLDS.safe) return "yellow";
	return "green";
}

/**
 * Get Tailwind classes for usage color
 */
export function getUsageColorClasses(
	current: number,
	limit: number,
): {
	bg: string;
	text: string;
	border: string;
} {
	const color = getUsageColor(current, limit);

	const colorMap = {
		green: {
			bg: "bg-green-500/10",
			text: "text-green-500",
			border: "border-green-500/20",
		},
		yellow: {
			bg: "bg-yellow-500/10",
			text: "text-yellow-500",
			border: "border-yellow-500/20",
		},
		red: {
			bg: "bg-red-500/10",
			text: "text-red-500",
			border: "border-red-500/20",
		},
	};

	return colorMap[color];
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";

	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
	return new Intl.NumberFormat("en-US").format(num);
}

/**
 * Calculate percentage with 1 decimal
 */
export function calculatePercentage(current: number, limit: number): number {
	if (limit === 0) return 0;
	return Math.min(100, Math.round((current / limit) * 1000) / 10);
}

/**
 * Get status badge info
 */
export function getStatusInfo(status: "processing" | "completed"): {
	label: string;
	className: string;
} {
	const statusMap = {
		processing: {
			label: "Processing",
			className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
		},
		completed: {
			label: "Completed",
			className: "bg-green-500/10 text-green-500 border-green-500/20",
		},
	};

	return statusMap[status];
}
