import { lazy, Suspense } from "preact/compat";
import DocumentDropzone, {
	IndexStatus,
} from "@modules/document/components/DocumentDropzone";
import ModelConfigForm from "@modules/ai_model/components/ModelConfigForm";
import InsightsRadar from "@modules/ai_insight/components/InsightsRadar";
import {
	ConversationList,
	ChatViewer,
} from "@modules/chat/components/ChatComponents";
import { BrainCircuitIcon, NetworkIcon, DatabaseIcon, CpuIcon } from "lucide-preact";

export default function AIWorkspace() {
	return (
		<div class="flex flex-col gap-6 p-2 animate-in fade-in duration-500 relative">
            {/* Ambient System Scanlines */}
            <div class="absolute inset-0 bg-scanline opacity-[0.02] pointer-events-none" />

			<div class="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8 relative z-10">
				<div class="flex items-center gap-4">
                    <div class="p-3 bg-primary/10 border border-primary/30 rounded-sm">
                        <BrainCircuitIcon size={24} class="text-primary animate-pulse" />
                    </div>
                    <div>
					    <h1 class="text-3xl font-black font-mono text-white tracking-tighter uppercase italic selection:bg-primary selection:text-black">
						    {">"} RAG_NODE_ALPHA_v4.2
					    </h1>
					    <p class="text-[10px] text-primary/60 font-mono uppercase tracking-[0.4em] mt-1 font-bold">
						    Neural_Knowledge_Base // Stream_Processing_Active
					    </p>
                    </div>
				</div>
                
				<div class="flex items-center gap-8 bg-zinc-950/60 p-4 rounded-sm border border-white/5 backdrop-blur-md relative overflow-hidden group">
                    <div class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
					<IndexStatus status="READY" />
					<div class="h-10 w-px bg-white/5" />
					<div class="flex flex-col">
						<span class="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-black">
							Sync_Protocol
						</span>
						<span class="text-[10px] font-mono text-primary font-bold tracking-[0.1em]">
							AES_ENCRYPTED_STABLE
						</span>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
				<div class="lg:col-span-3">
					<DocumentDropzone />
				</div>
				<div class="lg:col-span-1">
					<div class="bg-zinc-950/60 border border-white/5 p-6 rounded-sm h-full flex flex-col justify-between group hover:border-primary/20 transition-all">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-[9px] font-black font-mono tracking-[0.3em] text-zinc-500">NEURAL_DENSITY</span>
                            <NetworkIcon size={12} class="text-primary/40 group-hover:text-primary transition-colors" />
                        </div>
						<InsightsRadar />
                        <div class="mt-4 pt-4 border-t border-white/5 flex flex-col gap-1">
                            <div class="flex justify-between text-[8px] font-mono">
                                <span class="text-zinc-500">EPS_LOAD</span>
                                <span class="text-primary">840.2k</span>
                            </div>
                            <div class="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div class="h-full bg-primary/60 w-3/4 animate-pulse" />
                            </div>
                        </div>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[650px] relative z-10">
				<div class="lg:col-span-4 bg-zinc-950/20 border border-white/5 rounded-sm p-4 hover:border-primary/10 transition-all">
                    <div class="flex items-center gap-2 mb-6 px-1">
                        <CpuIcon size={14} class="text-primary" />
                        <span class="text-[10px] font-black font-mono tracking-[0.3em] text-white uppercase">Model_Parameters</span>
                    </div>
					<ModelConfigForm />
				</div>
				<div class="lg:col-span-8 border border-white/5 rounded-sm overflow-hidden flex flex-col bg-zinc-950/40 backdrop-blur-sm relative transition-all hover:border-primary/10">
					<div class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-pulse" />
					<div class="flex flex-1 overflow-hidden">
						<div class="w-[30%] border-r border-white/5 flex flex-col bg-black/20">
							<div class="p-4 border-b border-white/5 bg-zinc-950/80 font-mono text-[9px] font-black tracking-[0.3em] text-zinc-400 uppercase flex items-center gap-2">
								<DatabaseIcon size={10} class="text-primary/60" />
                                Neural_Streams
							</div>
							<ConversationList />
						</div>
						<div class="flex-1 flex flex-col">
							<div class="p-4 border-b border-white/5 bg-zinc-950/80 flex justify-between items-center px-6">
								<span class="font-mono text-[10px] font-black tracking-[0.4em] text-primary uppercase selection:bg-primary selection:text-black">
									Active_Neural_Session
								</span>
								<div class="flex gap-2">
									<div class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
									<div class="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse delay-75" />
									<div class="w-1.5 h-1.5 rounded-full bg-primary/20 animate-pulse delay-150" />
								</div>
							</div>
							<ChatViewer />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
