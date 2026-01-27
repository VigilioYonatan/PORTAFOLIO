import { cn } from "@infrastructure/utils/client/cn";
import type { ButtonHTMLAttributes } from "preact";

interface ButtonProps extends ButtonHTMLAttributes {
	variant?: "primary" | "secondary" | "danger" | "outline" | "ghost" | "glitch";
	size?: "sm" | "md" | "lg" | "icon";
	isLoading?: boolean;
	loading_title?: string;
	disabled?: boolean;
	type?: "button" | "submit" | "reset";
	as?: "button" | "a";
	href?: string;
	target?: string;
}

export default function Button({
	className,
	variant = "primary",
	size = "md",
	isLoading,
	loading_title,
	children,
	disabled,
	...props
}: ButtonProps) {
	const variants = {
		primary:
			"bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_10px_rgba(6,182,212,0.5)] border border-primary/50",
		secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
		danger:
			"bg-destructive text-destructive-foreground hover:bg-destructive/90",
		outline:
			"border border-input bg-background hover:bg-accent hover:text-accent-foreground",
		ghost: "hover:bg-accent hover:text-accent-foreground",
		glitch:
			"relative overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(6,182,212,0.6)] before:content-[''] before:absolute before:inset-0 before:bg-white/20 before:translate-x-full hover:before:animate-[shimmer_0.5s_infinite] after:content-[''] after:absolute after:inset-0 after:bg-primary/30 after:translate-x-[-100%] hover:after:animate-[glitch_0.3s_infinite]",
	};

	const sizes = {
		sm: "h-9 px-3 rounded-md text-xs",
		md: "h-10 px-4 py-2 rounded-md",
		lg: "h-11 px-8 rounded-md",
		icon: "h-10 w-10 p-2 rounded-md",
	};
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const As = (props.as || "button") as any;

	return (
		<As
			className={cn(
				"inline-flex font-mono uppercase tracking-wider items-center justify-center whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
				variants[variant],
				sizes[size],
				typeof className === "string" ? className : "",
			)}
			disabled={isLoading || disabled}
			{...props}
		>
			{isLoading ? (
				<span className="flex items-center gap-2">
					<span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
					{loading_title || "Loading..."}
				</span>
			) : (
				children
			)}
		</As>
	);
}
