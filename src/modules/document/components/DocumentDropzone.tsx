
import { useSignal } from "@preact/signals";
import { UploadCloudIcon, FileTextIcon, Loader2Icon } from "lucide-preact";
import { cn } from "@infrastructure/utils/client";

export default function DocumentDropzone() {
    const isDragging = useSignal(false);
    const isUploading = useSignal(false);

    const handleDragOver = (e: Event) => {
        e.preventDefault();
        isDragging.value = true;
    };

    const handleDragLeave = () => {
        isDragging.value = false;
    };

    const handleDrop = (e: any) => {
        e.preventDefault();
        isDragging.value = false;
        // Mock upload
        isUploading.value = true;
        setTimeout(() => {
             isUploading.value = false;
        }, 2000);
    };

    return (
        <div 
            className={cn(
                "border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-colors cursor-pointer",
                isDragging.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                isUploading.value && "opacity-50 pointer-events-none"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading.value && console.log("Open file dialong")}
        >
             {isUploading.value ? (
                 <Loader2Icon size={48} className="animate-spin text-primary mb-4" />
             ) : (
                 <UploadCloudIcon size={48} className="text-muted-foreground mb-4" />
             )}
             
             <h3 className="font-bold text-lg mb-2">Upload Knowledge Base</h3>
             <p className="text-muted-foreground text-sm max-w-xs">Drag and drop PDF, MD, or TXT files here to train the Neural Network.</p>
        </div>
    );
}

export function IndexStatus({ status }: { status: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED' }) {
    const colors = {
        PENDING: "bg-yellow-500/20 text-yellow-500",
        PROCESSING: "bg-blue-500/20 text-blue-500 animate-pulse",
        READY: "bg-green-500/20 text-green-500",
        FAILED: "bg-red-500/20 text-red-500",
    };

    return (
        <div className={cn("inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-mono font-bold", colors[status] || colors.PENDING)}>
             <div className={cn("w-2 h-2 rounded-full", status === 'PROCESSING' ? "bg-current animate-ping" : "bg-current")} />
             {status}
        </div>
    );
}
