import type { JSX } from "preact/jsx-runtime";

interface HelperProps {
	children: JSX.Element | JSX.Element[];
	top: number;
	right?: number;
}
function Helper({ children, top, right = 2 }: HelperProps) {
	return (
		<button
			type="button"
			aria-label="?"
			class="absolute bg-primary w-[20px] h-[20px] -right-2 -top-2 rounded-full text-primary-foreground group z-[99] font-bold"
			onClick={(e) => {
				e.stopPropagation();
			}}
		>
			?
			<div
				class="absolute bg-popover text-popover-foreground p-2 rounded-sm hidden group-hover:block w-[300px] shadow-lg border border-border"
				style={{ top, right }}
			>
				{children}
			</div>
		</button>
	);
}

export default Helper;
