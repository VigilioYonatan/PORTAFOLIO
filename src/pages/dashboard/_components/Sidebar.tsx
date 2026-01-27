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

const MENU_ITEMS = [
	{
		category: "Principal",
		items: [
			{ label: "Panel", href: "/dashboard", icon: LayoutDashboard },
			{ label: "Documentos", href: "/dashboard/documents", icon: FileText },
			{ label: "Entrenamiento IA", href: "/dashboard/ai", icon: Bot },
		],
	},
	{
		category: "Contenido",
		items: [
			{ label: "Proyectos", href: "/dashboard/projects", icon: FolderKanban },
			{ label: "Blog", href: "/dashboard/blog", icon: PenTool },
			{ label: "Experiencia", href: "/dashboard/hr", icon: GraduationCap },
			{ label: "Música", href: "/dashboard/shared", icon: Music },
			{ label: "Tecnologías", href: "/dashboard/tech", icon: Cpu },
			{ label: "Bandeja", href: "/dashboard/inbox", icon: MessageSquare },
		],
	},
	{
		category: "Sistema",
		items: [
			{ label: "Configuración", href: "/dashboard/settings", icon: Settings },
			{ label: "Perfil Admin", href: "/dashboard/profile", icon: User },
		],
	},
];

export default function Sidebar() {
	const [location] = useLocation();

	return (
		<aside class="hidden md:flex w-64 h-screen bg-zinc-950/80 border-r border-white/5 flex-col fixed left-0 top-0 z-40 transition-all duration-300 backdrop-blur-md">
			{/* Ambient Background Artifact */}
			<div class="absolute inset-0 bg-scanline opacity-[0.02] pointer-events-none" />

			<div class="p-6 border-b border-white/5 flex items-center gap-3 relative group">
				<div class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
				<TerminalLogo className="w-8 h-8 text-primary animate-glitch-sm" />
				<div class="flex flex-col">
					<span class="font-black text-sm tracking-[0.3em] text-white">
						PULSO_ADMIN
					</span>
					<span class="text-[8px] text-primary font-bold tracking-widest opacity-60 uppercase">
						Núcleo Sistema v4.0
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
							ADMIN_RAÍZ
						</span>
						<div class="flex items-center gap-1.5 mt-0.5">
							<span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
							<span class="text-[8px] text-primary/60 font-bold tracking-widest uppercase">
								NIVEL_04_AUTH
							</span>
						</div>
					</div>
				</div>
			</div>
		</aside>
	);
}
