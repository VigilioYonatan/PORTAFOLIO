import Badge from "@components/extras/Badge";
import { technologyIndexApi } from "@modules/technology/apis/technology.index.api";
import type { TechnologySchema } from "@modules/technology/schemas/technology.schema";
import {
	Activity,
	Cloud,
	Code,
	Cpu,
	Database,
	Globe,
	Layers,
	Plus,
	Server,
	Smartphone,
	Zap,
} from "lucide-preact";
import type { JSX } from "preact/jsx-runtime";

const ICON_MAP: Record<string, any> = {
	Frontend: Globe,
	Backend: Server,
	Database: Database,
	Mobile: Smartphone,
	DevOps: Cloud,
	Tools: Activity,
	AI: Cpu,
	Other: Code,
};

export default function TechIconGrid() {
	const { data, isLoading, isSuccess, isError } = technologyIndexApi(null, null, {
		limit: 100,
	});

	let component: JSX.Element | JSX.Element[] | null = null;

	if (isLoading) {
		component = [...Array(10)].map((_, i) => (
			<div
				key={i}
				class="bg-zinc-950/20 border border-white/5 p-6 rounded-3xl flex flex-col items-center gap-4 animate-pulse min-h-[160px]"
			>
				{/* Icon Skeleton */}
				<div class="w-14 h-14 bg-white/5 rounded-2xl border border-white/10" />

				{/* Text Skeletons */}
				<div class="flex flex-col items-center gap-2 w-full mt-1">
					<div class="w-20 h-2.5 bg-white/5 rounded-full" />
					<div class="w-12 h-4 bg-white/5 rounded-full mt-1" />
				</div>
			</div>
		));
	}

	if (isError) {
		component = (
			<div class="col-span-full p-8 text-center text-red-500 font-mono text-xs">
				ERR_CONNECTION_REFUSED
			</div>
		);
	}

	if (isSuccess && data) {
		const techs = data.results!;
		component = techs.map((tech) => {
			const Icon = ICON_MAP[tech.category] || Zap;
			return (
				<div
					key={tech.id}
					class="bg-zinc-950/40 border border-white/5 p-6 rounded-3xl flex flex-col items-center gap-4 hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all duration-500 group relative overflow-hidden shadow-2xl backdrop-blur-xl"
				>
					{/* Background Glow */}
					<div class="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

					<div class="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-primary/40 transition-all duration-500 z-10 shadow-inner group-hover:shadow-primary/20">
						<Icon
							size={28}
							class="text-muted-foreground group-hover:text-primary transition-colors"
						/>
					</div>

					<div class="text-center z-10 space-y-2">
						<span class="text-[10px] font-black tracking-tight uppercase block group-hover:text-foreground transition-colors truncate max-w-[120px]">
							{tech.name}
						</span>
						<Badge
							variant="secondary"
							className="text-[8px] font-black uppercase tracking-[0.2em] h-5 bg-white/5 border-white/10 group-hover:border-primary/20 group-hover:text-primary/80 px-2"
						>
							{tech.category}
						</Badge>
					</div>
				</div>
			);
		});
	}

	return (
		<div class="space-y-6">
			<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
				{component}

				{/* Add New Trigger */}
				<button
					type="button"
					class="bg-zinc-950/20 border-2 border-dashed border-white/5 p-6 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary/40 cursor-pointer transition-all duration-500 text-muted-foreground/20 hover:text-primary group shadow-lg min-h-[160px]"
				>
					<div class="w-12 h-12 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-primary/40 transition-all duration-500">
						<Plus
							size={24}
							strokeWidth={3}
							class="opacity-50 group-hover:opacity-100"
						/>
					</div>
					<span class="text-[9px] font-black font-mono uppercase tracking-[0.3em]">
						ALLOCATE_NODE
					</span>
				</button>
			</div>
		</div>
	);
}
