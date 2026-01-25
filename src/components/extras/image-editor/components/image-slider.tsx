import { cn } from "@infrastructure/utils/client";
import type { TargetedEvent } from "preact";

interface ImageSliderProps {
	value: number[];
	onValueChange: (value: number[]) => void;
	min?: number;
	max?: number;
	step?: number;
	disabled?: boolean;
	className?: string;
}

function ImageSlider({
	className,
	value,
	onValueChange,
	min = 0,
	max = 100,
	step = 1,
	disabled = false,
	...props
}: ImageSliderProps) {
	function handleChange(e: TargetedEvent) {
		const newValue = Number((e.target as HTMLInputElement).value);
		onValueChange([newValue]);
	}

	return (
		<div className={cn("relative flex w-full items-center", className)}>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value[0] || 0}
				onChange={handleChange}
				disabled={disabled}
				className={cn(
					"w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer",
					"slider-thumb:appearance-none slider-thumb:h-5 slider-thumb:w-5 slider-thumb:rounded-full",
					"slider-thumb:bg-primary slider-thumb:cursor-pointer slider-thumb:border-2 slider-thumb:border-background",
					"focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
					"disabled:opacity-50 disabled:cursor-not-allowed",
					className,
				)}
				{...props}
			/>
			<style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 0px;
          background: var(--color-primary);
          cursor: pointer;
          border: 2px solid var(--color-background);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        input[type="range"]::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 0px;
          background: var(--color-primary);
          cursor: pointer;
          border: 2px solid var(--color-background);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        input[type="range"]::-webkit-slider-track {
          height: 8px;
          background: var(--color-muted);
          border-radius: 0px;
        }

        input[type="range"]::-moz-range-track {
          height: 8px;
          background: var(--color-muted);
          border-radius: 0px;
          border: none;
        }
      `}</style>
		</div>
	);
}

export default ImageSlider;
