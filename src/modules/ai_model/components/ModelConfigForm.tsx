
import { useSignal } from "@preact/signals";
import { SettingsIcon, CpuIcon, BrainIcon } from "lucide-preact";
import Button from "@components/extras/Button";

export default function ModelConfigForm() {
    const temp = useSignal(0.7);
    const chunkSize = useSignal(512);

    return (
        <div className="bg-card border border-border rounded-xl p-6">
             <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                  <SettingsIcon className="text-primary" />
                  <h3 className="font-bold">Model Configuration (LLM)</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                       <label className="text-sm font-bold flex items-center gap-2">
                            <BrainIcon size={16} /> Temperature ({temp.value})
                       </label>
                       <input 
                            type="range" 
                            min="0" max="2" step="0.1"
                            value={temp.value} 
                            onInput={(e) => temp.value = Number(e.currentTarget.value)}
                            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                       />
                       <p className="text-xs text-muted-foreground">Controls randomness: 0 is deterministic, 2 is chaotic.</p>
                  </div>

                  <div className="space-y-2">
                       <label className="text-sm font-bold flex items-center gap-2">
                            <CpuIcon size={16} /> Chunk Size ({chunkSize.value})
                       </label>
                       <input 
                            type="range" 
                            min="128" max="2048" step="128"
                            value={chunkSize.value} 
                            onInput={(e) => chunkSize.value = Number(e.currentTarget.value)}
                            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                       />
                       <p className="text-xs text-muted-foreground">Tokens per vector chunk.</p>
                  </div>
                  
                  <div className="md:col-span-2">
                       <label className="text-sm font-bold block mb-2">Base Model</label>
                       <select className="w-full bg-secondary border border-border rounded px-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none">
                            <option value="gpt-4">GPT-4 Turbo (OpenAI)</option>
                            <option value="claude-3-opus">Claude 3 Opus (Anthropic)</option>
                            <option value="mistral-large">Mistral Large (Local/API)</option>
                       </select>
                  </div>
             </div>

             <div className="mt-6 flex justify-end">
                  <Button className="bg-primary text-primary-foreground">SAVE_CONFIG</Button>
             </div>
        </div>
    );
}
