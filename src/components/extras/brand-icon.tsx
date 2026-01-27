import type { SimpleIcon } from "simple-icons";

interface BrandIconProps extends preact.SVGAttributes<SVGSVGElement> {
	icon: SimpleIcon;
	size?: number;
}

export function BrandIcon({ icon, size = 24, ...rest }: BrandIconProps) {
	return (
		<svg
			role="img"
			viewBox="0 0 24 24"
			width={size}
			height={size}
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			{...rest}
		>
			<title>{icon.title}</title>
			<path d={icon.path} />
		</svg>
	);
}
