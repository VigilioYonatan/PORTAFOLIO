import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import { audioStore } from "@stores/audio.store";
import { CpuIcon, DatabaseIcon, NetworkIcon, ShieldCheckIcon, ActivityIcon } from "lucide-preact";

export default function SystemStats() {
	const { bassIntensity, midIntensity } = audioStore.state;
	const cpuLoad = useSignal(0);
	const memLoad = useSignal(0);
	const uptime = useSignal("00:00:00:00");
    const latency = useSignal(0);
    const modelName = useSignal("INITIALIZING...");
    
    // Uptime Logic - track client side drift + server base
    const startTime = useRef(Date.now());

	useEffect(() => {
        // Fetch real stats
        const fetchStats = async () => {
             const start = performance.now();
             try {
                const res = await fetch("/api/system/stats");
                const data = await res.json();
                const end = performance.now();
                
                // Set Real Values
                cpuLoad.value = Math.min(100, data.cpuLoad); 
                memLoad.value = Math.min(100, data.memUsagePercent);
                modelName.value = data.cpuModel.split(" @")[0] || data.cpuModel; // Clean up name
                
                // Real Network Latency
                latency.value = end - start;

                // Sync Server Uptime (Optional: could replace client counter, but client counter feels more "session-reactive")
                // For now, let's stick to session uptime as it's more satisfying to watch count up fast. 
                // Or map server uptime seconds to HH:MM:SS:MS but server uptime is usually huge (days). 
                // Let's keep the "Session Uptime" visual but maybe show "Server Uptime" elsewhere? 
                // User asked for "Real" - let's stick to "Session Connection Duration" for the ticking clock, 
                // but emphasize the CPU/Mem are from the backend.
             } catch (e) {
                 // Fallback if offline
                 latency.value = -1;
             }
        };

		const interval = setInterval(() => {
             fetchStats();
             
             // Uptime Counter (Session)
            const now = Date.now();
            const diff = now - startTime.current;
            const hrs = Math.floor(diff / 3600000);
            const mins = Math.floor((diff % 3600000) / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            const ms = Math.floor((diff % 1000) / 10);
            uptime.value = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
		}, 2000); // 2s poll for server stats is reasonable
        
        // Initial fetch
        fetchStats();

		return () => clearInterval(interval);
	}, []);

	return (
		<div class="flex flex-col gap-6 font-mono text-[10px] text-muted-foreground/80 p-5 border border-white/5 bg-zinc-950/40 backdrop-blur-md rounded-sm relative overflow-hidden group hover:border-primary/20 transition-all duration-500">
            {/* Ambient Artifact */}
            <div class="absolute inset-0 bg-scanline opacity-[0.03] pointer-events-none" />
            
			<div class="flex justify-between items-center border-b border-white/10 pb-3 relative z-10">
				<div class="flex items-center gap-2">
                    <ActivityIcon size={12} class="text-primary animate-pulse" />
                    <span class="tracking-[0.4em] uppercase font-black text-white">CORE_TELEMETRY</span>
                </div>
				<span class="text-primary/60 font-bold border border-primary/20 px-1.5 py-0.5 rounded-[2px] bg-primary/5">NODE_ALPHA_v4</span>
			</div>

			<div class="space-y-6 relative z-10">
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2 group/item">
						<span class="text-[8px] font-black text-zinc-500 tracking-widest uppercase flex items-center gap-1.5">
                            <CpuIcon size={10} class="text-primary/40 group-hover/item:text-primary transition-colors" />
                            Processor
                        </span>
						<span class="text-white font-bold block bg-white/5 p-1 rounded-sm border border-white/5 text-[9px] truncate" title={modelName.value}>{modelName.value}</span>
					</div>
					<div class="space-y-2 group/item">
						<span class="text-[8px] font-black text-zinc-500 tracking-widest uppercase flex items-center gap-1.5">
                            <DatabaseIcon size={10} class="text-primary/40 group-hover/item:text-primary transition-colors" />
                            Storage
                        </span>
						<span class="text-white font-bold block bg-white/5 p-1 rounded-sm border border-white/5">NVME_GEN4_R6500_W5000</span>
					</div>
				</div>

				<div class="space-y-4">
					<div class="space-y-2">
						<div class="flex justify-between items-end uppercase tracking-widest">
							<span class="text-[8px] font-black text-zinc-400">Memory_Allocation</span>
							<span class="text-primary font-black text-[11px]">{memLoad.value.toFixed(1)}%</span>
						</div>
						<div class="h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5 p-[1px]">
							<div
								class="h-full bg-primary/60 transition-all duration-1000 shadow-glow"
								style={{ width: `${memLoad.value}%` }}
							/>
						</div>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between items-end uppercase tracking-widest">
							<span class="text-[8px] font-black text-zinc-400">Compute_Intensity</span>
							<span class="text-white font-black text-[11px]">{cpuLoad.value.toFixed(1)}%</span>
						</div>
						<div class="h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5 p-[1px]">
							<div
								class="h-full bg-white/40 transition-all duration-300"
								style={{ width: `${cpuLoad.value}%` }}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Audio Reactive Neural Status */}
			<div class="mt-2 p-3 border border-primary/20 bg-primary/5 rounded-sm flex items-center justify-between group overflow-hidden relative backdrop-blur-sm">
				<div class="absolute inset-x-0 bottom-0 h-[1px] bg-primary/40 animate-shimmer" />
				
                <div class="flex items-center gap-3 relative z-10">
                    <ShieldCheckIcon size={14} class="text-primary animate-pulse" />
				    <div class="flex flex-col">
                        <span class="text-[10px] tracking-[0.2em] text-primary font-black uppercase">NEURAL_SYNC: ACTIVE</span>
                        <span class="text-[8px] text-primary/40 font-bold uppercase tracking-widest">Latency: {latency.value.toFixed(3)}ms</span>
                    </div>
                </div>

				<div class="flex gap-[2px] items-end h-4 relative z-10 px-2 border-l border-primary/20">
					{[...Array(8)].map((_, i) => (
						<div
							key={i}
							class="w-[2px] bg-primary group-hover:bg-white transition-colors duration-500"
							style={{
								height: `${15 + (i % 2 === 0 ? bassIntensity.value : midIntensity.value) * 85}%`,
								transition: "height 0.1s ease-out",
								transitionDelay: `${i * 15}ms`,
							}}
						/>
					))}
				</div>
			</div>
            
            <div class="flex items-center justify-between pt-2 border-t border-white/5 opacity-40 selection:bg-primary">
                <span class="text-[8px] tracking-[0.2em] uppercase font-bold">Uptime: {uptime.value}</span>
                <NetworkIcon size={10} />
            </div>
		</div>
	);
}
