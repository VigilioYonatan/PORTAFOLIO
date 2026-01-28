import { useEntranceAnimation } from "@hooks/use-motion";
import { cn } from "@infrastructure/utils/client";
import { formatDateTz } from "@infrastructure/utils/hybrid/date.utils";
import type { WorkExperienceSchema } from "@modules/work-experience/schemas/work-experience.schema";
import { useSignal } from "@preact/signals";
import { audioStore } from "@stores/audio.store";
import { useEffect } from "preact/hooks";
import { useTranslations } from "@src/i18n";

import { type Lang } from "@src/i18n";

interface WaveTimelineProps {
	className?: string;
	experiences: WorkExperienceSchema[];
    lang?: Lang;
}

export default function WaveTimeline({
	className,
	experiences,
    lang = "es"
}: WaveTimelineProps) {
	const containerRef = useEntranceAnimation(0.2);
    const t = useTranslations(lang);

	return (
		<div
			ref={containerRef}
			class={cn("relative w-full py-32 px-4 overflow-hidden", className)}
		>
			<div class="relative max-w-5xl mx-auto flex flex-col md:flex-row justify-between gap-16 md:gap-4 items-center md:items-start">
				{/* Horizontal Base Line (Desktop) */}
				<div class="absolute top-[12px] left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent hidden md:block" />

				{
					/* Mock Data Fallback if empty - keeps UI looking good */
					(experiences?.length > 0
						? experiences
						: [
								{
									id: "mock-1",
									start_date: new Date("2024-01-01"),
									position: t("mock.timeline.1.pos"),
									company: t("mock.timeline.1.comp"),
									description: t("mock.timeline.1.desc"),
								},
								{
									id: "mock-2",
									start_date: new Date("2022-01-01"),
									position: t("mock.timeline.2.pos"),
									company: t("mock.timeline.2.comp"),
									description: t("mock.timeline.2.desc"),
								},
								{
									id: "mock-3",
									start_date: new Date("2020-01-01"),
									position: t("mock.timeline.3.pos"),
									company: t("mock.timeline.3.comp"),
									description: t("mock.timeline.3.desc"),
								},
							]
					).map((experience, index) => (
						<MilestoneItem
							key={experience.id}
							year={formatDateTz(experience.start_date, "YYYY")}
							title={experience.position}
							company={experience.company}
							description={experience.description}
							index={index}
						/>
					))
				}
			</div>
		</div>
	);
}

interface MilestoneItemProps {
	year: string;
	title: string;
	company: string;
	description: string;
	index: number;
}

function MilestoneItem({
	year,
	title,
	company,
	description,
	index,
}: MilestoneItemProps) {
	const barHeight = useSignal<number>(40);
	const entryRef = useEntranceAnimation(0.1 + index * 0.1);
	const { frequencyData, bassIntensity, midIntensity } = audioStore.state;

	useEffect(() => {
		let currentHeight = 40;
		const update = () => {
			const freq = frequencyData.value;
			const bass = bassIntensity.value;
			const mids = midIntensity.value;

			// Map index to frequency range (spread across different bins)
			const binIndex = Math.floor((index / 4) * (freq.length / 2)) + 2;
			const val = freq[binIndex] || 0;

			// Calculate target height with less aggressive scaling
			// Base 40px + max 80px from audio
			const targetHeight = 40 + (val / 255) * 60 + bass * 20 + mids * 10;

			// Smoothing / Decay (Lerp)
			// If going up, faster (attack). If going down, slower (decay).
			if (targetHeight > currentHeight) {
				currentHeight += (targetHeight - currentHeight) * 0.3; // Attack
			} else {
				currentHeight += (targetHeight - currentHeight) * 0.1; // Decay
			}

			barHeight.value = currentHeight;
			requestAnimationFrame(update);
		};
		const id = requestAnimationFrame(update);
		return () => cancelAnimationFrame(id);
	}, [index, frequencyData, bassIntensity, midIntensity]);

	return (
		<div
			ref={entryRef}
			class="relative group flex flex-col items-center w-full max-w-[280px] md:max-w-none md:w-1/4 text-center"
		>
			{/* The Reactive Bar (Wave Peak) */}
			<div class="mb-6 relative h-48 flex items-end justify-center w-full">
				<div
					class="w-1.5 md:w-3 bg-gradient-to-t from-primary via-primary/60 to-transparent transition-all duration-75 ease-linear rounded-t-full relative"
					style={{
						height: `${barHeight.value}px`,
						filter: `drop-shadow(0 0 ${10 + bassIntensity.value * 20}px rgba(6,182,212,0.6))`,
					}}
				>
					{/* Peak Indicator */}
					<div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_15px_#fff]" />

					{/* Side Echoes */}
					<div
						class="absolute bottom-0 -left-4 w-1 bg-primary/20 rounded-t-full transition-all duration-100"
						style={{ height: `${barHeight.value * 0.6}px` }}
					/>
					<div
						class="absolute bottom-0 -right-4 w-1 bg-primary/20 rounded-t-full transition-all duration-100"
						style={{ height: `${barHeight.value * 0.6}px` }}
					/>
				</div>
			</div>

			<div class="flex flex-col gap-2 relative z-10 px-4 group-hover:-translate-y-2 transition-transform duration-300">
				<div class="relative inline-block mx-auto mb-1">
					<span class="text-primary font-mono text-3xl text-glow tracking-tighter relative z-10">
						{year}
					</span>
					<div class="absolute -inset-2 bg-primary/5 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
				</div>

				<div class="h-[2px] w-12 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto" />

				<h4 class="font-bold text-white text-base tracking-widest uppercase leading-tight mt-2 animate-glitch-sm">
					{title}
				</h4>
				<p class="text-[11px] text-primary font-mono tracking-[0.2em] mb-2 uppercase opacity-80">
					&lt; {company} /&gt;
				</p>
				<p class="text-[11px] text-muted-foreground font-mono leading-relaxed opacity-60 line-clamp-3 uppercase tracking-wider">
					{description}
				</p>
			</div>

			{/* Neomorphic Aura */}
			<div class="absolute inset-x-0 -bottom-12 h-40 bg-primary/10 blur-[100px] rounded-full opacity-0 group-hover:opacity-40 transition-all duration-500 -z-10 scale-50 group-hover:scale-100" />
		</div>
	);
}
