import { cn } from "@infrastructure/utils/client";
import type { JSX, ComponentChildren } from "preact";

interface CardProps {
	children?: ComponentChildren;
	className?: string;
	class?: string;
}

export function Card({ children, className, class: className2 }: CardProps) {
	return (
		<div
			class={cn(
				"bg-zinc-950/40 border border-white/5 rounded-sm shadow-xl",
				className,
				className2
			)}
		>
			{children}
		</div>
	);
}

export function CardHeader({ children, className, class: className2 }: CardProps) {
	return (
		<div class={cn("flex flex-col space-y-1.5 p-6", className, className2)}>{children}</div>
	);
}

export function CardTitle({ children, className, class: className2 }: CardProps) {
	return (
		<h3
			class={cn(
				"text-[10px] font-black font-mono tracking-[0.3em] uppercase transition-colors text-white",
				className,
				className2
			)}
		>
			{children}
		</h3>
	);
}

export function CardContent({ children, className, class: className2 }: CardProps) {
	return <div class={cn("p-6 pt-0", className, className2)}>{children}</div>;
}

export function CardFooter({ children, className, class: className2 }: CardProps) {
	return (
		<div class={cn("flex items-center p-6 pt-0", className, className2)}>{children}</div>
	);
}
