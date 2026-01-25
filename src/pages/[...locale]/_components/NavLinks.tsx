import { cn } from "@infrastructure/utils/client/cn";
import {
	HomeIcon,
	GridIcon,
	RssIcon,
	DatabaseIcon,
	MailIcon,
	type LucideIcon,
} from "lucide-preact";
import { sizeIcon } from "@infrastructure/utils/client";

interface NavLinksProps {
	lang: string;
	vertical?: boolean;
	className?: string;
}

export default function NavLinks({ lang, vertical, className }: NavLinksProps) {
	const links: { href: string; label: string; icon: LucideIcon }[] = [
		{ href: `/${lang}`, label: "HOME", icon: HomeIcon },
		{ href: `/${lang}/projects`, label: "PROJECTS", icon: GridIcon },
		{ href: `/${lang}/blog`, label: "BLOG_LOG", icon: RssIcon },
		{ href: `/${lang}/experience`, label: "EXP_TREE", icon: DatabaseIcon },
		{ href: `/${lang}/contact`, label: "CONTACT", icon: MailIcon },
	];

	return (
		<nav
			className={cn(
				"flex items-center gap-6",
				vertical && "flex-col items-start gap-1 w-full",
				className,
			)}
		>
			{links.map((link) => (
				<a
					key={link.href}
					href={link.href}
					className={cn(
						"relative font-mono text-sm tracking-widest text-muted-foreground hover:text-primary transition-all py-2 group flex items-center gap-4 w-full px-4 border-l-2 border-transparent hover:border-primary hover:bg-primary/5",
						!vertical && "border-none px-0 hover:bg-transparent",
					)}
				>
					{vertical && (
						<link.icon
							{...sizeIcon.small}
							className="group-hover:scale-110 transition-transform"
						/>
					)}
					<span className="relative z-10">{link.label}</span>
					{!vertical && (
						<span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full" />
					)}
				</a>
			))}
		</nav>
	);
}
