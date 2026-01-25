import { cn } from "@infrastructure/utils/client";
import type { HTMLAttributes } from "preact/compat";

interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
	orientation?: "horizontal" | "vertical";
	text?: string;
}

export function Separator({
	className,
	orientation = "horizontal",
	text,
	...props
}: SeparatorProps) {
	if (text) {
		return (
			<div className={cn("relative flex items-center py-4", className)}>
				<div className="flex-grow border-t border-border"></div>
				<span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase tracking-wider font-medium">
					{text}
				</span>
				<div className="flex-grow border-t border-border"></div>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"shrink-0 bg-border",
				orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
				className,
			)}
			{...props}
		/>
	);
}
// Alias for compatibility if imported as 'hr'
export { Separator as Hr };
export default Separator;
