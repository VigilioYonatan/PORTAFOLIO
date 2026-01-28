import { useEntranceAnimation } from "@hooks/use-motion";
import { cn } from "@infrastructure/utils/client";
import { technologyIndexApi } from "@modules/technology/apis/technology.index.api";
import { audioStore } from "@stores/audio.store";
import {
	ActivityIcon,
	Code2,
	Cpu,
	DatabaseIcon,
	ExternalLink,
	InfinityIcon,
	Layers,
	LayoutIcon,
	SmartphoneIcon,
	Zap,
} from "lucide-preact";
import type { JSX } from "preact";

interface SkillItem {
	id: string | number;
	title: string;
	level: string;
	icon: any;
	category: string;
	tags: string[];
	color: string;
	span?: string;
}

const CATEGORY_MAP: Record<
	string,
	{ icon: any; color: string; accent: string }
> = {
	FRONTEND: {
		icon: LayoutIcon,
		color: "text-primary",
		accent: "rgba(6,182,212,0.6)",
	},
	BACKEND: {
		icon: Layers,
		color: "text-amber-500",
		accent: "rgba(245,158,11,0.6)",
	},
	DATABASE: {
		icon: DatabaseIcon,
		color: "text-emerald-500",
		accent: "rgba(16,185,129,0.6)",
	},
	DEVOPS: {
		icon: InfinityIcon,
		color: "text-blue-500",
		accent: "rgba(59,130,246,0.6)",
	},
	LANGUAGE: {
		icon: Code2,
		color: "text-zinc-400",
		accent: "rgba(161,161,170,0.6)",
	},
	MOBILE: {
		icon: SmartphoneIcon,
		color: "text-rose-500",
		accent: "rgba(244,63,94,0.6)",
	},
	AI: { icon: Cpu, color: "text-violet-500", accent: "rgba(139,92,246,0.6)" },
};

export default function SkillBentoGrid() {
	const containerRef = useEntranceAnimation(0.2);
	const technologyQuery = technologyIndexApi(null, null, { limit: 12 });

	let component: JSX.Element | null = null;

	if (technologyQuery.isLoading) {
		component = (
			<div class="flex flex-col justify-center items-center h-64 gap-4">
				<div class="w-12 h-1 bg-primary/20 rounded-full overflow-hidden">
					<div class="h-full bg-primary animate-shimmer w-1/2" />
				</div>
				<span class="text-[10px] font-mono text-primary/60 tracking-[0.4em] animate-pulse">
					SYSTEM_SCANNING...
				</span>
			</div>
		);
	}

	if (technologyQuery.isError) {
		component = (
			<div class="text-center py-12 text-destructive border border-destructive/20 bg-destructive/5 rounded-sm p-8 font-mono">
				<p class="text-[10px] tracking-widest uppercase font-black">
					[ CRITICAL_ERROR: FAIL_TO_RETRIEVE_CAPABILITIES ]
				</p>
				<p class="text-[8px] opacity-60 mt-2">
					{technologyQuery.error?.message}
				</p>
			</div>
		);
	}

	if (technologyQuery.isSuccess && technologyQuery.data) {
		const technologies = technologyQuery.data.results;

		component = (
			<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[200px]">
				{technologies.length > 0 ? (
					technologies.map((tech, index) => {
						const catInfo = CATEGORY_MAP[tech.category] || {
							icon: Zap,
							color: "text-primary",
							accent: "rgba(6,182,212,0.6)",
						};
						return (
							<SkillCard
								key={tech.id}
								skill={{
									id: tech.id,
									title: tech.name,
									level: "SENIOR_ADMIN",
									icon: catInfo.icon,
									category: tech.category,
									tags:
										tech.category === "AI"
											? ["LLM", "RAG"]
											: ["Architecture", "Scalability"],
									color: catInfo.color,
									span: index === 0 ? "md:col-span-2 md:row-span-2" : "",
								}}
								index={index}
							/>
						);
					})
				) : (
					<div class="w-full text-center py-12 text-muted-foreground font-mono italic col-span-full border border-white/5 bg-black/20">
						[ EMPTY_RECOGNITION_POOL ]
					</div>
				)}
			</div>
		);
	}

	return (
		<section
			ref={containerRef}
			class="w-full py-32 px-4 bg-zinc-950 relative overflow-hidden"
		>
			{/* Ambient Artifacts */}
			<div class="absolute inset-0 bg-scanline opacity-[0.03] pointer-events-none" />
			<div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

			<div class="max-w-7xl mx-auto relative z-10">
				<div class="flex flex-col items-center mb-20 text-center">
					<div class="flex items-center gap-4 mb-4">
						<div class="h-[1px] w-12 bg-primary/20" />
						<h3 class="text-[10px] font-black text-primary tracking-[0.8em] uppercase text-glow">
							CAPABILITIES_INVENTORY
						</h3>
						<div class="h-[1px] w-12 bg-primary/20" />
					</div>
					<h2 class="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic selection:bg-primary selection:text-black">
						SKILL_SET.manifest
					</h2>
				</div>

				{component}
			</div>

			{/* Background decorative elements */}
			<div class="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full -z-10 animate-pulse" />
			<div class="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary/5 blur-[100px] rounded-full -z-10 animate-pulse delay-1000" />
		</section>
	);
}

interface SkillCardProps {
	skill: SkillItem;
	index: number;
}

function SkillCard({ skill, index }: SkillCardProps) {
	const entranceRef = useEntranceAnimation(0.1 + index * 0.05);
	const Icon = skill.icon;
	const { bassIntensity } = audioStore.state;

	return (
		<div
			ref={entranceRef}
			class={cn(
				"group relative bg-zinc-950/40 border border-white/5 overflow-hidden p-8 transition-all duration-500 hover:border-primary/40 flex flex-col justify-between backdrop-blur-sm shadow-xl",
				skill.span,
			)}
		>
			{/* Ambient background effect */}
			<div class="absolute inset-0 bg-scanline opacity-[0.02] pointer-events-none" />
			<div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

			<div class="absolute top-0 right-0 p-4 opacity-20 font-mono text-[9px] tracking-[0.3em] uppercase font-black text-zinc-500 group-hover:text-primary transition-colors">
				{skill.category}
			</div>

			<div class="relative z-10">
				<div
					class={cn(
						"mb-6 w-12 h-12 flex items-center justify-center rounded-sm bg-zinc-900/60 border border-white/10 group-hover:border-primary/40 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-500 relative overflow-hidden",
						skill.color,
					)}
				>
					<div class="absolute inset-0 bg-scanline opacity-10" />
					<Icon
						size={24}
						class="relative z-10 transition-transform group-hover:scale-110"
					/>
				</div>

				<h4 class="font-black text-sm md:text-base tracking-[0.1em] uppercase mb-2 text-white selection:bg-primary selection:text-black">
					{skill.title}
				</h4>

				<div class="flex items-center gap-3 mb-6">
					<div class="h-1 flex-1 bg-white/5 relative overflow-hidden rounded-full border border-white/10 p-[1px]">
						<div
							class={cn(
								"absolute top-0 left-0 h-full transition-all duration-1000 ease-out",
								skill.color.replace("text-", "bg-"),
								"shadow-[0_0_8px_currentColor]",
							)}
							style={{
								width:
									skill.level === "EXPERT"
										? "95%"
										: skill.level === "SENIOR_ADMIN"
											? "85%"
											: "75%",
								mixBlendMode: "screen",
							}}
						/>
						{/* Audio Reactive Pulse overlay */}
						<div
							class="absolute top-0 left-0 h-full bg-white opacity-20"
							style={{
								width: `${bassIntensity.value * 100}%`,
								transition: "width 0.1s ease-out",
							}}
						/>
					</div>
					<span class="text-[9px] font-black text-primary/60 tracking-widest uppercase">
						{skill.level}
					</span>
				</div>
			</div>

			<div class="relative z-10 mt-auto">
				<div class="flex flex-wrap gap-2">
					{skill.tags.map((tag) => (
						<span
							key={tag}
							class="text-[9px] font-black px-2 py-0.5 bg-zinc-900/80 border border-white/10 text-zinc-500 group-hover:text-primary/80 group-hover:border-primary/30 transition-all rounded-[2px] tracking-widest uppercase"
						>
							#{tag}
						</span>
					))}
				</div>
				<div class="mt-6 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-500">
					<div class="flex items-center gap-2">
						<ActivityIcon size={10} class="text-primary animate-pulse" />
						<span class="text-[8px] text-primary/80 font-black tracking-[0.2em]">
							STATUS: OPTIMIZED
						</span>
					</div>
					<ExternalLink
						size={12}
						class="text-primary/40 hover:text-primary transition-colors cursor-pointer"
					/>
				</div>
			</div>

			{/* Corner decorator */}
			<div class="absolute bottom-0 right-0 w-8 h-8 pointer-events-none overflow-hidden">
				<div class="absolute bottom-0 right-0 w-px h-full bg-gradient-to-t from-primary/60 to-transparent" />
				<div class="absolute bottom-0 right-0 h-px w-full bg-gradient-to-l from-primary/60 to-transparent" />
			</div>
		</div>
	);
}
