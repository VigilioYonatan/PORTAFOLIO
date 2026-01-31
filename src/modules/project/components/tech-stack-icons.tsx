import { cn } from "@infrastructure/utils/client";
import { printFileWithDimension } from "@infrastructure/utils/hybrid/file.utils";
import { technologyIndexApi } from "@modules/technology/apis/technology.index.api";
import type { TechnologySchema } from "@modules/technology/schemas/technology.schema";
import { DIMENSION_IMAGE } from "@modules/uploads/const/upload.const";

interface TechStackIconsProps {
	technologyIds: number[];
	className?: string;
}

export default function TechStackIcons({
	technologyIds,
	className,
}: TechStackIconsProps) {
	const { data: technologies } = technologyIndexApi(null);

	const projectTechs = (technologies?.results as TechnologySchema[])?.filter(
		(tech: TechnologySchema) => technologyIds.includes(tech.id),
	);

	if (!projectTechs || projectTechs.length === 0) return null;

	return (
		<div class={cn("flex items-center gap-1.5", className)}>
			{projectTechs.map((tech) => (
				<div
					key={tech.id}
					class="w-6 h-6 p-1 rounded-md bg-zinc-800/50 border border-white/5 flex items-center justify-center group relative"
					title={tech.name}
				>
					{tech.icon?.[0] ? (
						<img
							src={
								printFileWithDimension(
									tech.icon,
									DIMENSION_IMAGE.xs,
									window.env.STORAGE_URL,
								)[0]
							}
							alt={tech.name}
							title={tech.name}
							width={DIMENSION_IMAGE.xs}
							height={DIMENSION_IMAGE.xs}
							class="w-full h-full object-contain"
						/>
					) : (
						<div class="w-full h-full bg-zinc-700 rounded-sm flex items-center justify-center text-[8px] font-bold">
							{tech.name.substring(0, 2).toUpperCase()}
						</div>
					)}
					{/* Tooltip */}
					<span class="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 shadow-xl z-50">
						{tech.name}
					</span>
				</div>
			))}
		</div>
	);
}
