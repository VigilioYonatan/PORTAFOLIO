import { useEffect, useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { isProtostarActive, isOverlayOpen, closeOverlayOnly, toggleProtostarMode } from "@stores/special-mode.store";
import { audioStore } from "@stores/audio.store";
import { XIcon, Loader2Icon } from "lucide-preact";
import { cn } from "@infrastructure/utils/client";

export default function ProtostarOverlay() {
    // Lazy Load State - refactored to Signal
    const hasActivated = useSignal(false);
    
    // Subscribe to signal explicitly for debugging/reliability
    const isActive = isProtostarActive.value; // Keeps video mounted if mode is active
    const isOpen = isOverlayOpen.value; // Controls visibility

    // Monitor activation (mount if mode activates)
    useEffect(() => {
        if (isActive && !hasActivated.value) {
            console.log("[Protostar] Activated for the first time. Mounting Video.");
            hasActivated.value = true;
        }
    }, [isActive]);

    // If never activated, don't render (True Lazy Load)
    if (!hasActivated.value) return null;

    const videoRef = useRef<HTMLVideoElement>(null);
    const isLoading = useSignal(true);
    const canClose = useSignal(false);
    
    // Manage Playback via Overlay VISIBILITY (isOpen)
    useEffect(() => {
        console.log("[Protostar] Overlay Visibility Changed:", isOpen);
        if (isOpen) {
            // Overlay Open: Pause Music, Play Fullscreen Video
            videoRef.current?.play().catch((e) => console.error("Video play error:", e));
            
            if (audioStore.state.isPlaying.value) {
                audioStore.methods.togglePlay();
            }
        } else {
            // Overlay Closed: Pause Fullscreen Video only
            videoRef.current?.pause();
            // Note: We do NOT resume music, because the Mode is still active (Sidebar Video takes over)
        }
    }, [isOpen]);

    // Timer for Close Button (only when Overlay is OPEN)
    useEffect(() => {
        if (isOpen) {
            canClose.value = false;
            const timer = setTimeout(() => {
                canClose.value = true;
            }, 10000); 
            return () => clearTimeout(timer);
        } else {
            canClose.value = false;
        }
    }, [isOpen]);

    const handleVideoLoad = () => {
        isLoading.value = false;
        if (isOpen) videoRef.current?.play();
    };

    const closeOverlay = () => {
        closeOverlayOnly();
        // Mode stays active, just hide overlay
    };

    return (
        <div 
            class={cn(
                "fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden transition-opacity duration-700",
                isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}
        >
            {/* Fog / Particles Effect - Enhanced */}
            <div class="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div 
                        key={i}
                        class="absolute rounded-full bg-white blur-[2px] opacity-0"
                        style={{
                            top: `${Math.random() * 110}%`,
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 6 + 2}px`,
                            height: `${Math.random() * 6 + 2}px`,
                            animation: `float ${Math.random() * 5 + 5}s infinite linear`,
                            animationDelay: `-${Math.random() * 5}s`,
                            boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(255,255,255,0.4)` // Glow for fog feel
                        }}
                    />
                ))}
                 {/* Specific Fog Layers (Gradient overlays) */}
                 <div class="absolute inset-0 bg-gradient-to-t from-green-900/10 via-transparent to-transparent mix-blend-screen" />
                 <div class="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-green-500/5 to-transparent blur-xl" />
            </div>

            {/* Video */}
            <video
                ref={videoRef}
                src="/video/protostar.mp4"
                class={cn("w-full h-full object-cover z-0 transition-opacity duration-1000", isLoading.value ? "opacity-0" : "opacity-100")}
                onCanPlay={handleVideoLoad}
                playsInline
                loop
                // Removed autoPlay to manual control
            />

            {/* Loading Indicator */}
            {isLoading.value && (
                <div class="absolute inset-0 z-20 flex flex-col items-center justify-center text-green-500">
                    <Loader2Icon size={64} class="animate-spin" />
                    <p class="mt-4 font-mono text-sm tracking-[0.3em] animate-pulse">LOADING PROTOSTAR MODULE...</p>
                </div>
            )}

            {/* Close Button (Delayed) */}
            {canClose.value && (
                <button 
                    onClick={closeOverlay}
                    class="absolute top-8 right-8 z-50 p-2 text-white/50 hover:text-white transition-colors duration-300 hover:scale-110 animate-in zoom-in"
                >
                    <XIcon size={24} />
                </button>
            )}
        </div>
    );
}
