import { cn } from "@infrastructure/utils/client";

interface ProgressBarProps {
	value: number;
	max: number;
	className?: string;
	variant?: "default" | "success" | "warning" | "danger";
	label?: string;
	showValue?: boolean;
}

export default function ProgressBar({
	value,
	max,
	className,
	variant = "default",
	label,
	showValue,
}: ProgressBarProps) {
	const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

	const colorClass = {
		default: "bg-primary",
		success: "bg-green-500",
		warning: "bg-yellow-500",
		danger: "bg-red-500",
	}[variant];

	return (
		<div class={cn("w-full space-y-2", className)}>
			{(label || showValue) && (
				<div class="flex justify-between text-xs font-medium text-muted-foreground">
					{label && <span>{label}</span>}
					{showValue && <span>{Math.round(percentage)}%</span>}
				</div>
			)}
			<div class="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
				<div
					class={cn(
						"h-full rounded-full transition-all duration-500 ease-out",
						colorClass,
					)}
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	);
}
