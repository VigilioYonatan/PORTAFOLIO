import { printFileWithDimension } from "@infrastructure/utils/hybrid/file.utils";
import { DIMENSION_IMAGE } from "@modules/uploads/const/upload.const";
import type { FilesSchema } from "@modules/uploads/schemas/upload.schema";
import { type Lang } from "@src/i18n";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-preact";
import { createPortal } from "preact/compat";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";

interface ProjectGalleryProps {
	images: FilesSchema[];
	projectTitle: string;
	lang: Lang;
	STORAGE_CDN_URL: string;
}

export function ProjectGallery({
	images,
	projectTitle,
	lang,
	STORAGE_CDN_URL,
}: ProjectGalleryProps) {
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);

	const imageUrls = useMemo(
		() => printFileWithDimension(images, DIMENSION_IMAGE.md, STORAGE_CDN_URL),
		[images, STORAGE_CDN_URL],
	);

	const openLightbox = useCallback((index: number) => {
		setCurrentIndex(index);
		setLightboxOpen(true);
	}, []);

	const closeLightbox = useCallback(() => {
		setLightboxOpen(false);
	}, []);

	const showPrev = useCallback(() => {
		setCurrentIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
	}, [imageUrls.length]);

	const showNext = useCallback(() => {
		setCurrentIndex((prev) => (prev + 1) % imageUrls.length);
	}, [imageUrls.length]);

	// Keyboard navigation + scroll lock
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

	const lightboxModal = lightboxOpen && (
		<div
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 9999,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "rgba(0,0,0,0.92)",
				backdropFilter: "blur(20px)",
				WebkitBackdropFilter: "blur(20px)",
				animation: "lb-fade-in 0.25s ease-out",
			}}
			onClick={(e) => {
				if (e.target === e.currentTarget) closeLightbox();
			}}
			role="dialog"
			aria-modal="true"
			aria-label="Image viewer"
		>
			{/* ── Close button ── */}
			<button
				type="button"
				aria-label="Cerrar"
				onClick={closeLightbox}
				style={{
					position: "absolute",
					top: "1.25rem",
					right: "1.25rem",
					zIndex: 10,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					width: "2.75rem",
					height: "2.75rem",
					borderRadius: "9999px",
					border: "1px solid rgba(255,255,255,0.2)",
					background: "rgba(255,255,255,0.08)",
					cursor: "pointer",
					transition: "background 0.2s, transform 0.2s",
				}}
				onMouseEnter={(e) => {
					(e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.18)";
					(e.currentTarget as HTMLButtonElement).style.transform = "rotate(90deg) scale(1.1)";
				}}
				onMouseLeave={(e) => {
					(e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
					(e.currentTarget as HTMLButtonElement).style.transform = "rotate(0deg) scale(1)";
				}}
			>
				<X size={20} style={{ color: "white" }} />
			</button>

			{/* ── Prev button ── */}
			{imageUrls.length > 1 && (
				<button
					type="button"
					aria-label="Imagen anterior"
					onClick={showPrev}
					style={{
						position: "absolute",
						left: "1rem",
						top: "50%",
						transform: "translateY(-50%)",
						zIndex: 10,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						width: "3rem",
						height: "3rem",
						borderRadius: "9999px",
						border: "1px solid rgba(255,255,255,0.2)",
						background: "rgba(255,255,255,0.08)",
						cursor: "pointer",
						transition: "background 0.2s, transform 0.2s",
					}}
					onMouseEnter={(e) => {
						(e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.18)";
						(e.currentTarget as HTMLButtonElement).style.transform = "translateY(-50%) scale(1.1)";
					}}
					onMouseLeave={(e) => {
						(e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
						(e.currentTarget as HTMLButtonElement).style.transform = "translateY(-50%) scale(1)";
					}}
				>
					<ChevronLeft size={24} style={{ color: "white" }} />
				</button>
			)}

			{/* ── Next button ── */}
			{imageUrls.length > 1 && (
				<button
					type="button"
					aria-label="Imagen siguiente"
					onClick={showNext}
					style={{
						position: "absolute",
						right: "1rem",
						top: "50%",
						transform: "translateY(-50%)",
						zIndex: 10,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						width: "3rem",
						height: "3rem",
						borderRadius: "9999px",
						border: "1px solid rgba(255,255,255,0.2)",
						background: "rgba(255,255,255,0.08)",
						cursor: "pointer",
						transition: "background 0.2s, transform 0.2s",
					}}
					onMouseEnter={(e) => {
						(e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.18)";
						(e.currentTarget as HTMLButtonElement).style.transform = "translateY(-50%) scale(1.1)";
					}}
					onMouseLeave={(e) => {
						(e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
						(e.currentTarget as HTMLButtonElement).style.transform = "translateY(-50%) scale(1)";
					}}
				>
					<ChevronRight size={24} style={{ color: "white" }} />
				</button>
			)}

			{/* ── Image + counter ── */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: "1.25rem",
					padding: "1rem",
					maxWidth: "90vw",
					maxHeight: "90vh",
					animation: "lb-zoom-in 0.25s ease-out",
				}}
			>
				<img
					src={imageUrls[currentIndex]}
					alt={`${projectTitle} — ${currentIndex + 1}`}
					style={{
						maxWidth: "100%",
						maxHeight: "80vh",
						objectFit: "contain",
						borderRadius: "0.75rem",
						boxShadow: "0 25px 60px rgba(0,0,0,0.7)",
						display: "block",
					}}
				/>

				{/* Dot indicators */}
				{imageUrls.length > 1 && (
					<div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
						{imageUrls.map((_, idx) => (
							<button
								key={idx}
								type="button"
								aria-label={`Ir a imagen ${idx + 1}`}
								onClick={() => setCurrentIndex(idx)}
								style={{
									width: idx === currentIndex ? "1.5rem" : "0.5rem",
									height: "0.5rem",
									borderRadius: "9999px",
									background: idx === currentIndex ? "white" : "rgba(255,255,255,0.35)",
									border: "none",
									cursor: "pointer",
									transition: "all 0.25s ease",
									padding: 0,
								}}
							/>
						))}
					</div>
				)}

				{/* Numeric counter */}
				<span
					style={{
						color: "rgba(255,255,255,0.45)",
						fontSize: "0.75rem",
						fontFamily: "monospace",
						letterSpacing: "0.1em",
					}}
				>
					{currentIndex + 1} / {imageUrls.length}
				</span>
			</div>

			{/* Keyframe styles injected inline */}
			<style>{`
				@keyframes lb-fade-in {
					from { opacity: 0; }
					to   { opacity: 1; }
				}
				@keyframes lb-zoom-in {
					from { transform: scale(0.92); opacity: 0; }
					to   { transform: scale(1);    opacity: 1; }
				}
			`}</style>
		</div>
	);

	return (
		<>
			{/* ── Thumbnail Grid ── */}
			<div class="space-y-4">
				<h3 class="font-mono text-primary text-xs uppercase tracking-widest flex items-center gap-2">
					<ZoomIn size={14} />
					{lang === "es" ? "Galería" : "Gallery"}
				</h3>
				<div class="grid grid-cols-3 lg:grid-cols-2 gap-2">
					{imageUrls.map((image, idx) => (
						<button
							key={image}
							type="button"
							aria-label={`Ver imagen ${idx + 1}`}
							class="group relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] cursor-zoom-in"
							onClick={() => openLightbox(idx)}
						>
							<img
								src={image}
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

			{/* ── Lightbox Portal ── */}
			{typeof document !== "undefined" &&
				lightboxOpen &&
				createPortal(lightboxModal, document.body)}
		</>
	);
}
