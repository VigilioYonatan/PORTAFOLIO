import { cn } from "@infrastructure/utils/client";

interface SliderProps
	extends Omit<preact.InputHTMLAttributes<HTMLInputElement>, "type"> {
	label?: string;
}

export function Slider({ className, label, ...props }: SliderProps) {
	return (
		<div class="grid gap-2">
			{label && (
				<span class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
					{label}
				</span>
			)}
			<input
				type="range"
				class={cn(
					"w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary",
					className,
				)}
				{...props}
			/>
		</div>
	);
}

export default Slider;
