import { Eye, EyeOff } from "lucide-preact";
import { useEffect, useRef } from "preact/hooks";
import Button from "./button";

interface EditorPreviewProps {
	content: string;
	className?: string;
	isShowPreview: boolean;
	onClosePreview: () => void;
	buttonTitle: string;
}

function EditorPreview({
	content,
	className = "",
	isShowPreview,
	onClosePreview,
	buttonTitle,
}: EditorPreviewProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	// Cuando se oculta, forzar que el scroll se vaya arriba suave
	useEffect(() => {
		if (!isShowPreview && containerRef.current) {
			containerRef.current.scrollTo({
				top: 0,
				behavior: "smooth",
			});
		}
	}, [isShowPreview]);

	return (
		<div
			ref={containerRef}
			class={`relative ${
				isShowPreview
					? "max-h-[800px] overflow-auto"
					: "max-h-[300px] overflow-hidden"
			} min-h-[100px] transition-all duration-300 ${className}`}
		>
			{/* Barra superior pegajosa */}
			<div class="sticky top-0 z-20 flex justify-end p-2 bg-white/80 backdrop-blur supports-backdrop-filter:bg-white/60 ">
				<Button
					variant="outline"
					size="sm"
					onClick={onClosePreview}
					className="flex gap-2 items-center w-[200px] py-5!"
					type="button"
				>
					{isShowPreview ? (
						<>
							<EyeOff className="w-[20px] h-[20px]" />
							Ocultar
						</>
					) : (
						<>
							<Eye className="w-[20px] h-[20px]" />
							{buttonTitle}
						</>
					)}
				</Button>
			</div>

			{/* Contenido */}
			<div
				class={`all-initial mce-content-body relative ${
					!isShowPreview
						? "after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-white/70"
						: ""
				}`}
				dangerouslySetInnerHTML={{ __html: content }}
			/>

			<style jsx>{`
                .fade-mask {
                    mask-image: linear-gradient(
                            to bottom,
                            transparent,
                            black 10%,
                            black 90%,
                            transparent
                        ),
                        linear-gradient(
                            to right,
                            transparent,
                            black 20px,
                            black calc(100% - 20px),
                            transparent
                        );
                    -webkit-mask-image: linear-gradient(
                            to bottom,
                            transparent,
                            black 10%,
                            black 90%,
                            transparent
                        ),
                        linear-gradient(
                            to right,
                            transparent,
                            black 20px,
                            black calc(100% - 20px),
                            transparent
                        );
                    -webkit-mask-composite: source-in;
                    mask-composite: intersect;
                }
            `}</style>
		</div>
	);
}

interface EditorPreviewOnlyProps {
	content: string;
	height?: number;
}
export function EditorPreviewOnly({ content, height }: EditorPreviewOnlyProps) {
	return (
		<div
			style={height ? { height: `${height || 600}px` } : {}}
			class="overflow-auto"
		>
			<div
				class={"all-initial mce-content-body relative  "}
				dangerouslySetInnerHTML={{
					__html: content,
				}}
			/>
		</div>
	);
}
export default EditorPreview;
