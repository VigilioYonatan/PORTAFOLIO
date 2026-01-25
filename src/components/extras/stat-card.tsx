import { cn } from "@infrastructure/utils/client";
import type { LucideIcon } from "lucide-preact";
import { TrendingDown, TrendingUp } from "lucide-preact";

interface StatCardProps {
	title: string;
	value: string | number;
	description?: string;
	icon: LucideIcon;
	iconBgColor?: string;
	className?: string;
	trend?: {
		value: number;
		isPositive: boolean;
	};
}

interface StorageStatCardProps {
	title: string;
	used: number;
	total: number;
	unit: string;
	icon: LucideIcon;
	iconBgColor?: string;
	className?: string;
}

export function StatCard({
	title,
	value,
	description,
	icon: Icon,
	iconBgColor = "bg-primary/10",
	className,
	trend,
}: StatCardProps) {
	return (
		<div
			class={cn(
				"bg-card rounded-xl border border-border p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/20",
				className,
			)}
		>
			<div class="flex items-start justify-between">
				<div class="space-y-3">
					<p class="text-sm font-medium text-muted-foreground">{title}</p>
					<p class="text-4xl font-bold tracking-tight text-foreground">
						{value}
					</p>
					{(description || trend) && (
						<div class="flex items-center gap-2 text-sm">
							{trend && (
								<span
									class={cn(
										"inline-flex items-center gap-1 font-medium",
										trend.isPositive ? "text-green-600" : "text-red-500",
									)}
								>
									{trend.isPositive ? (
										<TrendingUp class="w-4 h-4" />
									) : (
										<TrendingDown class="w-4 h-4" />
									)}
									{trend.isPositive ? "+" : ""}
									{trend.value}%
								</span>
							)}
							{description && (
								<span class="text-muted-foreground">{description}</span>
							)}
						</div>
					)}
				</div>
				<div class={cn("p-3 rounded-lg", iconBgColor)}>
					<Icon class="w-5 h-5 text-primary" />
				</div>
			</div>
		</div>
	);
}

export function StorageStatCard({
	title,
	used,
	total,
	unit,
	icon: Icon,
	iconBgColor = "bg-amber-100",
	className,
}: StorageStatCardProps) {
	const percentage = Math.round((used / total) * 100);
	const remaining = total - used;

	return (
		<div
			class={cn(
				"bg-card rounded-xl border border-border p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/20",
				className,
			)}
		>
			<div class="flex items-start justify-between">
				<div class="space-y-3 flex-1">
					<p class="text-sm font-medium text-muted-foreground">{title}</p>
					<p class="text-4xl font-bold tracking-tight text-foreground">
						{used} {unit}
						<span class="text-xl text-muted-foreground font-normal">
							{" "}
							/ {total} {unit}
						</span>
					</p>
					<div class="space-y-2">
						{/* Progress Bar */}
						<div class="h-2 w-full bg-muted rounded-full overflow-hidden">
							<div
								class={cn(
									"h-full rounded-full transition-all duration-500",
									percentage >= 90
										? "bg-red-500"
										: percentage >= 70
											? "bg-amber-500"
											: "bg-green-500",
								)}
								style={{ width: `${percentage}%` }}
							/>
						</div>
						{/* Labels */}
						<div class="flex items-center justify-between text-xs">
							<span class="font-semibold text-foreground uppercase tracking-wider">
								{percentage}% Capacity
							</span>
							<span class="text-muted-foreground font-medium uppercase tracking-wider">
								{remaining} {unit} Left
							</span>
						</div>
					</div>
				</div>
				<div class={cn("p-3 rounded-lg ml-4", iconBgColor)}>
					<Icon class="w-5 h-5 text-amber-600" />
				</div>
			</div>
		</div>
	);
}
