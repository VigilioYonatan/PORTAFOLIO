import { useEffect, useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { isNatureActive, toggleNatureMode } from "@stores/special-mode.store";
import { audioStore } from "@stores/audio.store";
import { XIcon, Loader2Icon } from "lucide-preact";
import { cn } from "@infrastructure/utils/client";

export default function NatureOverlay() {
    const isActive = isNatureActive.value;
    const hasActivated = useSignal(false);

    // Lazy load logic
    useEffect(() => {
        if (isActive && !hasActivated.value) hasActivated.value = true;
    }, [isActive]);

    if (!hasActivated.value) return null;

    // Pause music when active
    useEffect(() => {
        if (isActive && audioStore.state.isPlaying.value) {
            audioStore.methods.togglePlay();
        }
    }, [isActive]);

    const videos = [
        { src: "/video/wolf.mp4", label: "CANIS_LUPUS" },
        { src: "/video/bird.mp4", label: "AVES_CLASS" },
        { src: "/video/ballena.mp4", label: "CETACEA_GIGAS" },
    ];

    return (
        <div 
            class={cn(
                "fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center transition-opacity duration-700",
                isActive ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}
        >
            {/* Header */}
            <div class="absolute top-8 left-8 text-black font-black tracking-[0.5em] text-2xl uppercase">
                NATURE_PROTOCOL
            </div>

            {/* Video Grid - Split Screen (3 Columns) */}
            <div class="flex flex-col md:flex-row w-full h-full">
                {videos.map((vid, idx) => (
                    <VideoColumn key={idx} vid={vid} isActive={isActive} />
                ))}
            </div>

            {/* Footer */}
            <div class="absolute bottom-4 left-0 right-0 text-center text-black/40 font-mono text-[10px] tracking-[0.2em] pointer-events-none mix-blend-difference">
                SYSTEM_OVERRIDE // BIOS_BIOME_INTEGRATION
            </div>

            {/* Close Button - Moved to end for Z-stacking */}
            <button 
                onClick={(e) => {
                    e.preventDefault();
                    toggleNatureMode(false);
                }}
                class="absolute top-8 right-8 z-[200] p-4 text-black hover:bg-black/10 rounded-full transition-all duration-300 hover:scale-110 flex items-center gap-2 group"
            >
                <span class="text-[10px] font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">EXIT_PROTOCOL</span>
                <XIcon size={32} />
            </button>
        </div>
    );
}

function VideoColumn({ vid, isActive }: { vid: { src: string; label: string }, isActive: boolean }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const isVideoLoading = useSignal(true);
    const hasError = useSignal(false);

    // Sync loading state with actual video readyState
    useEffect(() => {
        // Safety timeout: If video doesn't report ready in 3s, force show it (it might play anyway)
        const timeout = setTimeout(() => {
            if (isVideoLoading.value) isVideoLoading.value = false;
        }, 3000);

        if (isActive && videoRef.current) {
            // Check if already loaded
            if (videoRef.current.readyState >= 3) {
                isVideoLoading.value = false;
            }
            // We rely on preload="auto" instead of manual load() to avoid race conditions
        }

        return () => clearTimeout(timeout);
    }, [isActive]);

    return (
        <div 
            class={cn(
                "group relative flex-1 h-full bg-black overflow-hidden transition-all duration-700 ease-in-out border-r border-white/10 last:border-0",
                "hover:flex-[1.5] grayscale hover:grayscale-0 cursor-pointer"
            )}
        >
            {/* Loading Spinner */}
            {isVideoLoading.value && !hasError.value && (
                <div class="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
                    <Loader2Icon size={32} class="text-white/30 animate-spin" />
                </div>
            )}

             {/* Error State */}
             {hasError.value && (
                <div class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 p-4 text-center">
                    <span class="text-red-500/50 font-black tracking-widest text-xs mb-2">SIGNAL_LOST</span>
                    <span class="text-white/20 font-mono text-[10px] uppercase">MISSING_SOURCE_FILE</span>
                    <span class="text-white/10 font-mono text-[8px] mt-2">{vid.src}</span>
                </div>
            )}

            <video
                ref={videoRef}
                src={vid.src}
                class={cn(
                    "w-full h-full object-cover transition-opacity duration-700",
                    isVideoLoading.value ? "opacity-0" : "opacity-30 group-hover:opacity-100",
                    hasError.value && "hidden"
                )}
                loop
                playsInline
                preload="auto" // Ensure aggressive preloading
                onCanPlay={() => (isVideoLoading.value = false)}
                onError={() => {
                    isVideoLoading.value = false;
                    hasError.value = true;
                }} 
                onMouseEnter={(e) => {
                    if (!hasError.value) { // removed isVideoLoading check to allow force-play even if stuck
                         e.currentTarget.muted = false;
                         e.currentTarget.play().catch(() => {});
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.pause();
                }}
            />
            
            {/* Label Overlay */}
            <div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 bg-white/90 px-4 py-2 text-black font-mono text-sm font-bold tracking-[0.3em] uppercase opacity-70 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {vid.label}
            </div>

            {/* Hover Hint */}
            {!isVideoLoading.value && !hasError.value && (
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
                    <div class="w-12 h-12 border border-white/30 rounded-full flex items-center justify-center bg-black/20 backdrop-blur-sm">
                        <span class="text-white/50 text-[10px] font-black">+</span>
                    </div>
                </div>
            )}
        </div>
    );
}
