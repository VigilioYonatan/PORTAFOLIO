import { cn } from "@infrastructure/utils/client/cn";
import type { JSX } from "preact/jsx-runtime";

interface BadgeProps extends JSX.HTMLAttributes<HTMLDivElement> {
	variant?:
		| "default"
		| "secondary"
		| "destructive"
		| "outline"
		| "matrix"
		| "success"
		| "warning";
}

export default function Badge({
	className,
	variant = "default",
	...props
}: BadgeProps) {
	const variants = {
		default:
			"border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
		secondary:
			"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
		destructive:
			"border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
		outline: "text-foreground",
		matrix:
			"border-primary/50 text-primary bg-primary/10 hover:bg-primary/20 animate-pulse",
		success:
			"border-transparent bg-emerald-500 text-white hover:bg-emerald-500/80",
		warning: "border-transparent bg-amber-500 text-white hover:bg-amber-500/80",
	};

	return (
		<div
			className={cn(
				"inline-flex font-mono items-center rounded-sm border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
				variants[variant],
				className,
			)}
			{...props}
		/>
	);
}
