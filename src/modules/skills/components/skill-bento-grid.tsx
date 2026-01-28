import { cn } from "@infrastructure/utils/client";
import {
	BrainCircuitIcon,
	CodeIcon,
	ContainerIcon,
	type LucideIcon,
	ServerIcon,
	SmartphoneIcon,
} from "lucide-preact";
import type { SkillLevel } from "../const/skill-level.const";

interface TechItem {
	name: string;
	icon: string; // Lucide icon or string url
	level: SkillLevel;
}

interface Category {
	id: string;
	title: string;
	icon: LucideIcon;
	description: string;
	techs: TechItem[];
	colSpan: string; // Tailwind class
}

import { type Lang, useTranslations } from "@src/i18n";

export default function SkillBentoGrid({ lang = "es" }: { lang?: Lang }) {
	const t = useTranslations(lang);

	const categories: Category[] = [
		{
			id: "frontend",
			title: t("skills.cat.frontend.title"),
			icon: CodeIcon,
			description: t("skills.cat.frontend.desc"),
			colSpan: "col-span-12 md:col-span-8",
			techs: [
				{ name: "React / Preact", icon: "⚛️", level: "Expert" },
				{ name: "Next.js / Astro", icon: "▲", level: "Expert" },
				{ name: "TypeScript", icon: "TS", level: "Expert" },
				{ name: "Tailwind CSS", icon: "🎨", level: "Expert" },
				{ name: "Three.js / WebGL", icon: "🧊", level: "Advanced" },
			],
		},
		{
			id: "backend",
			title: t("skills.cat.backend.title"),
			icon: ServerIcon,
			description: t("skills.cat.backend.desc"),
			colSpan: "col-span-12 md:col-span-4",
			techs: [
				{ name: "Node.js", icon: "🟢", level: "Expert" },
				{ name: "NestJS", icon: "🦁", level: "Expert" },
				{ name: "Go (Golang)", icon: "🐹", level: "Intermediate" },
				{ name: "Microservices", icon: "🕸️", level: "Advanced" },
			],
		},
		{
			id: "devops",
			title: t("skills.cat.devops.title"),
			icon: ContainerIcon,
			description: t("skills.cat.devops.desc"),
			colSpan: "col-span-12 md:col-span-4",
			techs: [
				{ name: "Docker", icon: "🐳", level: "Advanced" },
				{ name: "Kubernetes", icon: "☸️", level: "Intermediate" },
				{ name: "AWS", icon: "☁️", level: "Advanced" },
				{ name: "GitHub Actions", icon: "🤖", level: "Expert" },
			],
		},
		{
			id: "ai",
			title: t("skills.cat.ai.title"),
			icon: BrainCircuitIcon,
			description: t("skills.cat.ai.desc"),
			colSpan: "col-span-12 md:col-span-4",
			techs: [
				{ name: "LangChain", icon: "🦜", level: "Advanced" },
				{ name: "OpenAI API", icon: "🧠", level: "Expert" },
				{ name: "pgvector", icon: "🐘", level: "Advanced" },
				{ name: "Ollama", icon: "🦙", level: "Intermediate" },
			],
		},
		{
			id: "mobile",
			title: t("skills.cat.mobile.title"),
			icon: SmartphoneIcon,
			description: t("skills.cat.mobile.desc"),
			colSpan: "col-span-12 md:col-span-4",
			techs: [
				{ name: "React Native", icon: "📱", level: "Advanced" },
				{ name: "Expo", icon: "🚀", level: "Advanced" },
			],
		},
	];

	return (
		<div className="grid grid-cols-12 gap-4">
			{categories.map((category) => (
				<div
					key={category.id}
					className={cn(
						"group relative overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 hover:border-primary/50 transition-colors",
						category.colSpan,
					)}
				>
					<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

					<div className="relative z-10 flex flex-col h-full">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 rounded-lg bg-secondary text-primary">
								<category.icon size={24} />
							</div>
							<h3 className="font-bold text-xl">{category.title}</h3>
						</div>

						<p className="text-muted-foreground mb-6 text-sm">
							{category.description}
						</p>

						<div className="mt-auto grid grid-cols-2 md:grid-cols-3 gap-3">
							{category.techs.map((tech) => (
								<div
									key={tech.name}
									className="flex items-center gap-2 p-2 rounded bg-secondary/50 border border-white/5 hover:border-primary/30 transition-colors"
								>
									<span className="text-lg">{tech.icon}</span>
									<div className="flex flex-col">
										<span className="font-semibold text-xs text-foreground">
											{tech.name}
										</span>
										<span
											className={cn("text-[10px]", getLevelColor(tech.level))}
										>
											{tech.level}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

function getLevelColor(level: string) {
	switch (level) {
		case "Expert":
			return "text-primary";
		case "Advanced":
			return "text-blue-400";
		case "Intermediate":
			return "text-green-400";
		default:
			return "text-muted-foreground";
	}
}
