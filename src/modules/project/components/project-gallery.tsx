import environments from "@infrastructure/config/client/environments.config";
import { printFileWithDimension } from "@infrastructure/utils/hybrid/file.utils";
import { DIMENSION_IMAGE } from "@modules/uploads/const/upload.const";
import type { FilesSchema } from "@modules/uploads/schemas/upload.schema";
import { type Lang } from "@src/i18n";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-preact";
import { useCallback, useEffect, useState } from "preact/hooks";

interface ProjectGalleryProps {
	images: FilesSchema[];
	projectTitle: string;
	lang: Lang;
}

export function ProjectGallery({
	images,
	projectTitle,
	lang,
}: ProjectGalleryProps) {
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);

	const openLightbox = useCallback((index: number) => {
		setCurrentIndex(index);
		setLightboxOpen(true);
	}, []);

	const closeLightbox = useCallback(() => {
		setLightboxOpen(false);
	}, []);

	const showPrev = useCallback(() => {
		setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
	}, [images.length]);

	const showNext = useCallback(() => {
		setCurrentIndex((prev) => (prev + 1) % images.length);
	}, [images.length]);

	// Keyboard navigation
	useEffect(() => {
		if (!lightboxOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") closeLightbox();
			if (e.key === "ArrowLeft") showPrev();
			if (e.key === "ArrowRight") showNext();
		};

		document.body.style.overflow = "hidden";
		window.addEventListener("keydown", handleKeyDown);

		return () => {
			document.body.style.overflow = "";
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [lightboxOpen, closeLightbox, showPrev, showNext]);

	if (!images.length) return null;

	return (
		<>
			{/* Thumbnail Grid */}
			<div class="space-y-4">
				<h3 class="font-mono text-primary text-xs uppercase tracking-widest flex items-center gap-2">
					<ZoomIn size={14} />
					{lang === "es" ? "Galería" : "Gallery"}
				</h3>
				<div class="grid grid-cols-3 lg:grid-cols-2 gap-2">
					{printFileWithDimension(images, DIMENSION_IMAGE.md, environments.STORAGE_CDN_URL).map((image, idx) => (
						<button
							key={image}
							type="button"
							aria-label={`Ver imagen ${idx + 1}`}
							class="group relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] cursor-zoom-in"
							onClick={() => openLightbox(idx)}
						>
							<img
								src={
									image
								}
								alt={`${projectTitle} screenshot ${idx + 1}`}
								class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
							/>
							<div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
								<ZoomIn
									size={20}
									class="text-white opacity-0 group-hover:opacity-100 transition-opacity"
								/>
							</div>
						</button>
					))}
				</div>
			</div>

			{/* Lightbox Modal */}
			{lightboxOpen && (
				<div
					class="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fade-in"
					onClick={(e) => {
						if (e.target === e.currentTarget) closeLightbox();
					}}
					role="dialog"
					aria-modal="true"
					aria-label="Image gallery"
				>
					{/* Close Button */}
					<button
						type="button"
						aria-label="Cerrar"
						class="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors group"
						onClick={closeLightbox}
					>
						<X
							size={24}
							class="text-white group-hover:rotate-90 transition-transform duration-200"
						/>
					</button>

					{/* Previous Button */}
					{images.length > 1 && (
						<button
							type="button"
							aria-label="Imagen anterior"
							class="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors hover:scale-110"
							onClick={showPrev}
						>
							<ChevronLeft size={24} class="text-white" />
						</button>
					)}

					{/* Next Button */}
					{images.length > 1 && (
						<button
							type="button"
							aria-label="Imagen siguiente"
							class="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors hover:scale-110"
							onClick={showNext}
						>
							<ChevronRight size={24} class="text-white" />
						</button>
					)}

					{/* Image Container */}
					<div class="relative max-w-[90vw] max-h-[85vh] p-4">
						<img
							src={
								printFileWithDimension(
									[images[currentIndex]],
									DIMENSION_IMAGE.lg,
									environments.STORAGE_CDN_URL,
								)[0]
							}
							alt={`${projectTitle} - ${currentIndex + 1}`}
							class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-zoom-in"
						/>

						{/* Counter */}
						{images.length > 1 && (
							<div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-8 text-white/60 text-sm font-mono">
								{currentIndex + 1} / {images.length}
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
}
