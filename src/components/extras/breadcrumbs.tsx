import { cn } from "@infrastructure/utils/client";
import { ChevronRight, Home } from "lucide-preact";
import { Link } from "wouter-preact";

interface BreadcrumbItem {
	label: string;
	href: string;
}

interface BreadcrumbsProps {
	items: BreadcrumbItem[];
	className?: string;
}

export default function Breadcrumbs({ items, className }: BreadcrumbsProps) {
	return (
		<nav
			class={cn(
				"flex items-center space-x-2 text-sm text-muted-foreground",
				className,
			)}
			aria-label="Breadcrumb"
		>
			<Link
				href="/"
				class="hover:text-foreground transition-colors flex items-center"
			>
				<Home class="w-3.5 h-3.5" />
			</Link>
			{items.map((item, index) => (
				<div key={item.href} class="flex items-center space-x-2">
					<ChevronRight class="w-3.5 h-3.5" />
					<Link
						href={item.href}
						class={cn(
							"hover:text-foreground transition-colors truncate max-w-[120px] md:max-w-none",
							index === items.length - 1 &&
								"text-foreground font-medium pointer-events-none",
						)}
					>
						{item.label}
					</Link>
				</div>
			))}
		</nav>
	);
}
