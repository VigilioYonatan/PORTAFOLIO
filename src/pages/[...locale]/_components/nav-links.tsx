import { sizeIcon } from "@infrastructure/utils/client";
import { cn } from "@infrastructure/utils/client/cn";
import {
	DatabaseIcon,
	GridIcon,
	HomeIcon,
	type LucideIcon,
	MailIcon,
	RssIcon,
	UserIcon,
} from "lucide-preact";
import { type Lang, useTranslations } from "../../../i18n";

interface NavLinksProps {
	lang: Lang;
	vertical?: boolean;
	className?: string;
}

export default function NavLinks({ lang, vertical, className }: NavLinksProps) {
	const t = useTranslations(lang);

	const links: { href: string; label: string; icon: LucideIcon }[] = [
		{ href: `/${lang}`, label: t("header.home"), icon: HomeIcon },
		{ href: `/${lang}/about`, label: t("header.about"), icon: UserIcon },
		{
			href: `/${lang}/experience`,
			label: t("header.briefcase"),
			icon: DatabaseIcon,
		},
		{ href: `/${lang}/projects`, label: t("header.projects"), icon: GridIcon },
		{ href: `/${lang}/blog`, label: t("header.blog"), icon: RssIcon },
		
		{ href: `/${lang}/contact`, label: t("header.contact"), icon: MailIcon },
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
						<span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
					)}
				</a>
			))}
		</nav>
	);
}
