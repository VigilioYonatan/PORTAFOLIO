import { cn } from "@infrastructure/utils/client";

export function SimpleIcon({
	icon,
	className,
	size = 24,
}: {
	icon: { title: string; path: string };
	className?: string;
	size?: number;
}) {
	return (
		<svg
			role="img"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			className={cn("fill-current", className)}
			width={size}
			height={size}
		>
			<title>{icon.title}</title>
			<path d={icon.path} />
		</svg>
	);
}
