import { useEntranceAnimation } from "@hooks/use-motion";
import { cn } from "@infrastructure/utils/client";
import { useSignal } from "@preact/signals";
import { CheckIcon, PaletteIcon, PenLineIcon, TrashIcon } from "lucide-preact";
import { useEffect, useRef } from "preact/hooks";

export interface NoteProps {
	initialContent?: string;
	initialColor?: string;
	onDelete?: () => void;
}

const CYBERPUNK_COLORS = [
	"bg-[#fff000]", // Cyber Yellow
	"bg-[#00e1ff]", // Neon Blue
	"bg-[#ff003c]", // Neon Red
	"bg-[#39ff14]", // Neon Green
	"bg-[#bc13fe]", // Neon Purple
];

export default function Note({
	initialContent = "Click to edit note...",
	initialColor = "bg-[#fff000]",
	onDelete,
}: NoteProps) {
	const content = useSignal(initialContent);
	const isEditing = useSignal(false);
	const color = useSignal(initialColor);
	const isPaletteOpen = useSignal(false);
	const ref = useEntranceAnimation(0.2);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Auto-focus when editing starts
	useEffect(() => {
		if (isEditing.value && textareaRef.current) {
			textareaRef.current.focus();
		}
	}, [isEditing.value]);

	function handleSave() {
		isEditing.value = false;
	}

	return (
		<div
			ref={ref}
			class={cn(
				"relative w-64 h-64 p-4 shadow-lg transition-transform hover:scale-105 hover:z-10 group",
				"border-2 border-black/80 dark:border-white/20",
				color.value,
			)}
		>
			{/* Tape effect */}
			<div class="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-white/30 backdrop-blur-sm -rotate-2 border border-black/10 shadow-sm" />

			{/* Actions Toolbar - Visible on Hover */}
			<div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
				<button
					type="button"
					onClick={() => {
						isPaletteOpen.value = !isPaletteOpen.value;
					}}
					class="p-1.5 bg-black/80 text-white rounded hover:bg-black transition-colors"
					aria-label="Change Color"
				>
					<PaletteIcon size={14} />
				</button>
				{isEditing.value ? (
					<button
						type="button"
						onClick={handleSave}
						class="p-1.5 bg-black/80 text-green-400 rounded hover:bg-black transition-colors"
						aria-label="Save"
					>
						<CheckIcon size={14} />
					</button>
				) : (
					<button
						type="button"
						onClick={() => {
							isEditing.value = true;
						}}
						class="p-1.5 bg-black/80 text-white rounded hover:bg-black transition-colors"
						aria-label="Edit"
					>
						<PenLineIcon size={14} />
					</button>
				)}
				<button
					type="button"
					onClick={onDelete}
					class="p-1.5 bg-black/80 text-red-500 rounded hover:bg-black transition-colors"
					aria-label="Delete"
				>
					<TrashIcon size={14} />
				</button>
			</div>

			{/* Color Palette Popover */}
			{isPaletteOpen.value && (
				<div class="absolute top-10 right-2 flex gap-1 bg-black/90 p-1 rounded z-20 shadow-xl border border-white/10">
					{CYBERPUNK_COLORS.map((c) => (
						<button
							type="button"
							key={c}
							class={cn(
								"w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition-transform",
								c,
							)}
							onClick={() => {
								color.value = c;
								isPaletteOpen.value = false;
							}}
						/>
					))}
				</div>
			)}

			{/* Content */}
			<div class="mt-4 h-full overflow-hidden font-mono text-black font-semibold tracking-tight">
				{isEditing.value ? (
					<textarea
						ref={textareaRef}
						class="w-full h-full bg-transparent resize-none outline-none placeholder-black/50"
						value={content.value}
						onInput={(e) => {
							content.value = e.currentTarget.value;
						}}
						onBlur={handleSave}
					/>
				) : (
					<p class="whitespace-pre-wrap break-words leading-relaxed selection:bg-black selection:text-white">
						{content.value}
					</p>
				)}
			</div>

			{/* Corner Fold Effect */}
			<div class="absolute bottom-0 right-0 border-l-[20px] border-b-[20px] border-l-transparent border-b-black/20 group-hover:border-b-black/40 transition-colors pointer-events-none" />
		</div>
	);
}
