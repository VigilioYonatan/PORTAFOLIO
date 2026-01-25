
import { RadarIcon } from "lucide-preact";

export default function InsightsRadar() {
    return (
        <div className="bg-card border border-border rounded-xl p-6 h-full flex flex-col">
             <div className="flex items-center gap-2 mb-6">
                  <RadarIcon className="text-primary" />
                  <h3 className="font-bold">Recruiter Insights</h3>
             </div>
             
             <div className="flex-1 w-full flex items-center justify-center relative bg-scanline bg-opacity-5">
                  <div className="text-center">
                       <div className="relative w-64 h-64 border rounded-full border-primary/20 animate-pulse-slow flex items-center justify-center">
                            <div className="w-48 h-48 border rounded-full border-primary/40 flex items-center justify-center">
                                 <div className="w-32 h-32 border rounded-full border-primary/60"></div>
                            </div>
                            
                            {/* Mock Data Points */}
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 text-xs font-mono bg-background px-1">REACT</div>
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-xs font-mono bg-background px-1">NODEJS</div>
                            <div className="absolute left-10 top-1/2 -translate-y-1/2 text-xs font-mono bg-background px-1">SALARY</div>
                            <div className="absolute right-10 top-1/2 -translate-y-1/2 text-xs font-mono bg-background px-1">AVAILABILITY</div>
                            
                            {/* Mock Polymer */}
                            <svg className="absolute inset-0 w-full h-full text-primary/30 fill-current" viewBox="0 0 100 100">
                                <polygon points="50,20 80,50 50,80 20,50" />
                            </svg>
                       </div>
                  </div>
             </div>
        </div>
    );
}
