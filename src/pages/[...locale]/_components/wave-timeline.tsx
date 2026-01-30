import { useEntranceAnimation } from "@hooks/use-motion";
import { cn } from "@infrastructure/utils/client";
import { formatDateTz } from "@infrastructure/utils/hybrid/date.utils";
import FuturisticMDX from "@modules/blog-post/components/futuristic-mdx";
import type { WorkExperienceSchema } from "@modules/work-experience/schemas/work-experience.schema";
import { useSignal } from "@preact/signals";
import { type Lang } from "@src/i18n";
import { audioStore } from "@stores/audio.store";
import { useEffect, useMemo } from "preact/hooks";

interface WaveTimelineProps {
	className?: string;
	experiences: WorkExperienceSchema[];
	lang?: Lang;
}

export default function WaveTimeline({
	className,
	experiences = [],
	lang: _lang = "es",
}: WaveTimelineProps) {
	const containerRef = useEntranceAnimation(0.2);
	// const t = useTranslations(_lang);

	// Fallback to empty if no data
	const data = useMemo(() => {
		return experiences || [];
	}, [experiences]);

	// Group by year
	const grouped = useMemo(() => {
		if (data.length === 0) return [];
		const groups: Record<string, WorkExperienceSchema[]> = {};
		for (const exp of data) {
			const year = formatDateTz(exp.start_date, "YYYY");
			if (!groups[year]) groups[year] = [];
			groups[year].push(exp);
		}
		return Object.entries(groups).sort((a, b) => Number(b[0]) - Number(a[0]));
	}, [data]);

	const selectedYear = useSignal<string>(grouped[0]?.[0] || "");

	if (data.length === 0) {
		return (
			<div class="flex flex-col items-center justify-center py-20 text-center space-y-4">
				<div class="w-16 h-px bg-primary/20" />
				<p class="text-muted-foreground font-mono text-sm uppercase tracking-[0.3em] opacity-40">
					{/* NO_RECORDS_DETECTED_IN_DATABASE */}
				</p>
				<div class="w-16 h-px bg-primary/20" />
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			class={cn("relative w-full flex flex-col gap-16", className)}
		>
			{/* Timeline Navigator */}
			<div class="relative max-w-7xl mx-auto flex flex-row flex-wrap justify-center gap-x-6 md:gap-x-16 gap-y-12 items-center transition-all duration-500 py-6 px-8 bg-zinc-950/40 border border-white/5 backdrop-blur-md rounded-none">
				{grouped.map(([year, exps], index) => (
					<MilestoneItem
						key={year}
						year={year}
						isSelected={selectedYear.value === year}
						onSelect={() => {
							selectedYear.value = year;
						}}
						index={index}
						count={exps.length}
					/>
				))}
			</div>

			{/* Detailed View Area */}
			<div class="w-full max-w-4xl mx-auto">
				<div class="relative min-h-[400px] flex flex-col gap-8">
					{grouped
						.find(([y]) => y === selectedYear.value)?.[1]
						.map((exp) => (
							<ExperienceCard key={exp.id} experience={exp} />
						))}
				</div>
			</div>
		</div>
	);
}

function ExperienceCard({ experience }: { experience: WorkExperienceSchema }) {
	return (
		<div class="relative bg-zinc-950/60 border border-primary/20 p-8 md:p-12 rounded-none overflow-hidden group shadow-[0_0_40px_rgba(6,182,212,0.05)] animate-in fade-in slide-in-from-bottom-8 duration-700">
			{/* HUD Geometry */}
			<div class="absolute top-0 left-0 w-8 h-px bg-primary group-hover:w-16 transition-all duration-500" />
			<div class="absolute top-0 left-0 w-px h-8 bg-primary group-hover:h-16 transition-all duration-500" />
			<div class="absolute bottom-0 right-0 w-8 h-px bg-primary group-hover:w-16 transition-all duration-500" />
			<div class="absolute bottom-0 right-0 w-px h-8 bg-primary group-hover:h-16 transition-all duration-500" />

			<div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
				<div class="space-y-2">
					<span class="text-[10px] text-primary font-mono tracking-[0.5em] uppercase opacity-60">
						{/* DETECTED_RECORD_ID_{experience.id} */}
					</span>
					<h3 class="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase leading-none group-hover:text-glow transition-all">
						{experience.position}
					</h3>
					<div class="flex items-center gap-2">
						<span class="text-primary font-mono text-xs tracking-widest uppercase">
							&lt; {experience.company} /&gt;
						</span>
						<div class="h-px w-8 bg-primary/30" />
					</div>
				</div>
				<div class="hidden md:flex flex-col items-end gap-1">
					<div class="text-[8px] text-primary/40 font-mono tracking-widest uppercase">
						SECURITY_AUTH_STATUS
					</div>
					<div class="px-3 py-1 bg-primary/10 border border-primary/30 text-[10px] text-primary font-bold uppercase tracking-widest animate-pulse">
						AUTHORIZED_PROFILE
					</div>
				</div>
			</div>

			<div class="relative space-y-6">
				<div class="h-px w-full bg-linear-to-r from-primary/40 via-primary/10 to-transparent mb-4" />
				<div class="space-y-4">
					<p class="text-white text-sm md:text-base font-mono leading-relaxed uppercase tracking-wider border-l-2 border-primary/20 pl-6">
						{experience.description}
					</p>
					{experience.content && (
						<div class="mt-8 animate-in fade-in duration-1000">
							<div class="flex items-center gap-2 mb-6 opacity-40">
								<div class="h-px w-8 bg-primary" />
								<span class="text-[10px] font-mono text-primary tracking-[0.5em] uppercase">
									{/* DETAILED_LOG_CONTENT */}
								</span>
								<div class="h-px flex-1 bg-linear-to-r from-primary to-transparent" />
							</div>
							<FuturisticMDX content={experience.content} />
						</div>
					)}
				</div>
			</div>

			{/* Decorative background scanline */}
			<div class="absolute inset-0 bg-scanline opacity-[0.03] pointer-events-none" />
		</div>
	);
}

interface MilestoneItemProps {
	year: string;
	isSelected: boolean;
	onSelect: () => void;
	index: number;
	count: number;
}

function MilestoneItem({
	year,
	isSelected,
	onSelect,
	index,
	count,
}: MilestoneItemProps) {
	const barHeight = useSignal<number>(40);
	const { frequencyData, bassIntensity, midIntensity } = audioStore.state;

	useEffect(() => {
		let currentHeight = 40;
		const update = () => {
			const freq = frequencyData.value;
			const bass = bassIntensity.value;
			const mids = midIntensity.value;

			const binIndex = Math.floor((index / 4) * (freq.length / 2)) + 2;
			const val = freq[binIndex] || 0;

			const targetHeight =
				(isSelected ? 70 : 40) + (val / 255) * 50 + bass * 20 + mids * 10;

			if (targetHeight > currentHeight) {
				currentHeight += (targetHeight - currentHeight) * 0.3;
			} else {
				currentHeight += (targetHeight - currentHeight) * 0.1;
			}

			barHeight.value = currentHeight;
			requestAnimationFrame(update);
		};
		const id = requestAnimationFrame(update);
		return () => cancelAnimationFrame(id);
	}, [index, frequencyData, bassIntensity, midIntensity, isSelected]);

	return (
		<button
			type="button"
			onClick={onSelect}
			class={cn(
				"relative group flex flex-col items-center min-w-[100px] transition-all duration-300 outline-none cursor-pointer",
				isSelected ? "scale-110" : "opacity-30 hover:opacity-70",
			)}
		>
			<div class="mb-4 relative h-24 flex items-end justify-center w-full">
				<div
					class={cn(
						"w-1 md:w-2 bg-linear-to-t transition-all duration-75 ease-linear rounded-t-full relative",
						isSelected
							? "from-primary via-primary to-white"
							: "from-primary/50 to-transparent",
					)}
					style={{
						height: `${barHeight.value}px`,
						filter: isSelected
							? `drop-shadow(0 0 ${20 + bassIntensity.value * 30}px rgba(6,182,212,0.8))`
							: "none",
					}}
				>
					{isSelected && (
						<div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_15px_#fff] animate-pulse" />
					)}
				</div>
			</div>

			<span
				class={cn(
					"text-2xl md:text-3xl font-black tracking-tighter transition-all",
					isSelected
						? "text-primary text-glow translate-y-[-4px]"
						: "text-white/60",
				)}
			>
				{year}
			</span>
			{count > 1 && (
				<span class="text-[9px] text-primary/80 font-bold absolute -top-2 -right-2 bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-sm">
					0{count}
				</span>
			)}

			{isSelected && (
				<div class="absolute -bottom-4 w-12 h-[2px] bg-linear-to-r from-transparent via-primary to-transparent" />
			)}
		</button>
	);
}
