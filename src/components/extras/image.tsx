import { cn } from "@infrastructure/utils/client";

type ImageSize = "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl";
interface ImageProps {
	className?: string;
	size?: ImageSize;
	alt: string;
	title: string;
	src: string;
}
function Image({ className = "", size = "md", alt, title, src }: ImageProps) {
	const sizes: Record<ImageSize, string> = {
		xs: "min-w-[25px] min-h-[25px] max-w-[35px] max-h-[25px]",
		sm: "min-w-[45px] min-h-[45px] max-w-[45px] max-h-[45px]",
		md: "min-w-[80px] min-h-[80px] max-w-[80px] max-h-[80px]",
		lg: "min-w-[100px] min-h-[100px] max-w-[80px] max-h-[80px]",
		xl: "min-w-[120px] min-h-[120px]",
		xxl: "min-w-[140px] min-h-[140px]",
		xxxl: "min-w-[160px] min-h-[160px]",
	};
	return (
		<img
			alt={alt}
			title={title}
			aria-label={alt}
			src={src}
			width={size === "sm" ? 45 : size === "md" ? 80 : 100}
			class={cn("object-contain", sizes[size], className)}
			height={size === "sm" ? 45 : size === "md" ? 80 : 100}
		/>
	);
}

export default Image;
