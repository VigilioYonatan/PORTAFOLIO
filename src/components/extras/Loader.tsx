import { cn } from "@infrastructure/utils/client/cn";

interface LoaderProps {
	className?: string;
	size?: "sm" | "md" | "lg";
}

export default function Loader({ className, size = "md" }: LoaderProps) {
	const sizes = {
		sm: "h-4 w-4 border-2",
		md: "h-8 w-8 border-2",
		lg: "h-16 w-16 border-4",
	};

	return (
		<div className={cn("flex items-center justify-center", className)}>
			<div
				className={cn(
					"animate-spin rounded-full border-t-primary border-r-transparent border-b-primary border-l-transparent",
					sizes[size],
				)}
			/>
		</div>
	);
}
