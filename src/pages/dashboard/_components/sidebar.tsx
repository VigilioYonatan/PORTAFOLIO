import TerminalLogo from "@components/extras/terminal-logo";
import { cn } from "@infrastructure/utils/client";
import {
	Bot,
	Cpu,
	FileText,
	FolderKanban,
	GraduationCap,
	LayoutDashboard,
	MessageSquare,
	Music,
	PenTool,
	Settings,
	ShieldCheckIcon,
	User,
} from "lucide-preact";
import { Link, useLocation } from "wouter-preact";
import { type Lang, useTranslations } from "@src/i18n";
import { useMemo } from "preact/hooks";

interface SidebarProps {
    mobileOpen?: boolean;
    onClose?: () => void;
    lang?: Lang;
}

export default function Sidebar({ mobileOpen, onClose, lang = "es" }: SidebarProps) {
	const [location] = useLocation();
    const t = useTranslations(lang);

    const MENU_ITEMS = useMemo(() => [
        {
            category: t("dashboard.sidebar.main"),
            items: [
                { label: t("dashboard.sidebar.panel"), href: "/dashboard", icon: LayoutDashboard },
                { label: t("dashboard.sidebar.documents"), href: "/dashboard/documents", icon: FileText },
                { label: t("dashboard.sidebar.ai"), href: "/dashboard/ai", icon: Bot },
            ],
        },
        {
            category: t("dashboard.sidebar.content"),
            items: [
                { label: t("dashboard.sidebar.projects"), href: "/dashboard/projects", icon: FolderKanban },
                { label: t("dashboard.sidebar.blog"), href: "/dashboard/blog", icon: PenTool },
                { label: t("dashboard.sidebar.experience"), href: "/dashboard/hr", icon: GraduationCap },
                { label: t("dashboard.sidebar.music"), href: "/dashboard/shared", icon: Music },
                { label: t("dashboard.sidebar.technologies"), href: "/dashboard/tech", icon: Cpu },
                { label: t("dashboard.sidebar.inbox"), href: "/dashboard/inbox", icon: MessageSquare },
            ],
        },
        {
            category: t("dashboard.sidebar.system"),
            items: [
                { label: t("dashboard.sidebar.settings"), href: "/dashboard/settings", icon: Settings },
                { label: t("dashboard.sidebar.profile"), href: "/dashboard/profile", icon: User },
            ],
        },
    ], [lang]);

	return (
        <>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div 
                    class="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-in fade-in"
                    onClick={onClose}
                />
            )}
		    <aside class={cn(
                "w-64 h-screen bg-zinc-950/80 border-r border-white/5 flex-col fixed left-0 top-0 z-40 transition-transform duration-300 backdrop-blur-md",
                mobileOpen ? "flex translate-x-0" : "hidden md:flex"
            )}>
			{/* Ambient Background Artifact */}
			<div class="absolute inset-0 bg-scanline opacity-[0.02] pointer-events-none" />

			<div class="p-6 border-b border-white/5 flex items-center gap-3 relative group">
				<div class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
				<Link href="/">
					<TerminalLogo className="w-8 h-8 text-primary animate-glitch-sm cursor-pointer" />
				</Link>
				<div class="flex flex-col">
					<span class="font-black text-sm tracking-[0.3em] text-white">
						{t("dashboard.sidebar.pulse")}
					</span>
					<span class="text-[8px] text-primary font-bold tracking-widest opacity-60 uppercase">
						{t("dashboard.sidebar.core")}
					</span>
				</div>
			</div>

			<div class="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-8 custom-scrollbar relative z-10">
				{MENU_ITEMS.map((section) => (
					<div key={section.category} class="flex flex-col gap-2">
						<h4 class="text-[9px] font-black text-primary/40 uppercase tracking-[0.4em] px-3 mb-2 flex items-center gap-2">
							<span class="w-1 h-1 bg-primary/20 rounded-full" />
							{section.category}
						</h4>
						<div class="flex flex-col gap-1">
							{section.items.map((item) => {
								const isActive =
									location === item.href ||
									(item.href !== "/dashboard" &&
										location.startsWith(item.href));
								const Icon = item.icon;
								return (
									<Link
										key={item.href}
										href={item.href}
										class={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-[10px] font-mono transition-all duration-300 group relative border border-transparent ${
											isActive
												? "bg-primary/10 text-primary border-primary/20 shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]"
												: "text-muted-foreground/60 hover:bg-white/5 hover:text-white hover:border-white/5"
										}`}
									>
										<Icon
											size={14}
											class={cn(
												"transition-all duration-300",
												isActive
													? "text-primary filter drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]"
													: "group-hover:text-primary/80",
											)}
										/>
										<span class="tracking-[0.15em] uppercase font-bold">
											{item.label}
										</span>
										{isActive && (
											<div class="absolute right-3 w-1 h-3 bg-primary rounded-full animate-pulse shadow-glow" />
										)}

										{/* Hover Indicator */}
										<div class="absolute left-0 top-0 bottom-0 w-[2px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-center" />
									</Link>
								);
							})}
						</div>
					</div>
				))}
			</div>

			<div class="p-6 border-t border-white/5 bg-zinc-950/40 relative">
				<div class="absolute inset-0 bg-primary/5 opacity-5" />
				<div class="flex items-center gap-4 p-3 rounded-sm border border-white/5 bg-black/40 group hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden">
					{/* Security Badge */}
					<div class="absolute -top-1 -right-1 opacity-20 group-hover:opacity-40 transition-opacity">
						<ShieldCheckIcon size={24} class="text-primary" />
					</div>

					<div class="w-10 h-10 rounded-sm bg-linear-to-br from-primary/30 to-black/60 flex items-center justify-center border border-primary/20 group-hover:border-primary/60 transition-colors relative overflow-hidden">
						<div class="absolute inset-0 bg-scanline opacity-20" />
						<User size={18} class="text-primary relative z-10" />
					</div>
					<div class="flex flex-col overflow-hidden relative z-10">
						<span class="text-[10px] font-black truncate tracking-[0.2em] text-white uppercase group-hover:text-primary transition-colors">
							{t("dashboard.sidebar.root")}
						</span>
						<div class="flex items-center gap-1.5 mt-0.5">
							<span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
							<span class="text-[8px] text-primary/60 font-bold tracking-widest uppercase">
								{t("dashboard.sidebar.level")}
							</span>
						</div>
					</div>
				</div>
			</div>
		</aside>
        </>
	);
}
