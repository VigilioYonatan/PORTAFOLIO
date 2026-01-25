import { cn } from "@infrastructure/utils/client";
import {
	AlertTriangle,
	CheckCircle,
	Info,
	XCircle,
	XIcon,
} from "lucide-preact";
import type { IconType, TypeComponent } from "./types";

interface AlertProps {
	type: TypeComponent;
	title?: string;
	message: string;
	onClose?: () => void;
	className?: string;
}

function Alert({ type, title, message, onClose, className }: AlertProps) {
	const icons: Record<TypeComponent, IconType> = {
		success: CheckCircle,
		error: XCircle,
		warning: AlertTriangle,
		info: Info,
	};

	const styles: Record<
		TypeComponent,
		{ container: string; icon: string; title: string }
	> = {
		success: {
			container: "bg-primary/10 border-primary/30 text-primary",
			icon: "fill-primary",
			title: "text-primary font-bold",
		},
		error: {
			container: "bg-destructive/10 border-destructive/30 text-destructive",
			icon: "fill-destructive",
			title: "text-destructive font-bold",
		},
		warning: {
			container: "bg-accent/20 border-accent/40 text-accent-foreground",
			icon: "fill-accent-foreground",
			title: "text-accent-foreground font-bold",
		},
		info: {
			container:
				"bg-secondary/10 border-secondary/30 text-secondary-foreground",
			icon: "fill-secondary",
			title: "text-secondary font-bold",
		},
	};

	const Icon = icons[type];
	const style = styles[type];

	return (
		<div
			class={cn(
				"p-4 rounded-[var(--radius-lg)] border backdrop-blur-sm shadow-sm",
				style.container,
				className,
			)}
		>
			<div class="flex items-start gap-3">
				<Icon
					class={cn("mt-0.5 shrink-0", style.icon)}
					width={20}
					height={20}
				/>

				<div class="flex flex-col">
					{title && <h4 class={cn("font-medium", style.title)}>{title}</h4>}
					<p class="text-sm leading-relaxed opacity-90">{message}</p>
				</div>

				{onClose && (
					<button
						type="button"
						onClick={onClose}
						class="shrink-0 p-1 hover:bg-hover rounded-[var(--radius-lg)] transition-colors"
					>
						<XIcon
							width={20}
							height={20}
							className="text-current opacity-70 hover:opacity-100"
						/>
					</button>
				)}
			</div>
		</div>
	);
}

export default Alert;
