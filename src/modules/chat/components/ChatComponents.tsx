
import { cn } from "@infrastructure/utils/client";
import { MessageSquareIcon, CheckCircle2 } from "lucide-preact";

interface Conversation {
    id: string;
    ip: string;
    lastMessage: string;
    date: string;
    isLive: boolean;
}

const CONVERSATIONS: Conversation[] = [
    { id: "1", ip: "192.168.1.1", lastMessage: "How do you implement RAG?", date: "10 mins ago", isLive: true },
    { id: "2", ip: "203.0.113.5", lastMessage: "Pricing for freelance?", date: "2 hrs ago", isLive: false },
    { id: "3", ip: "198.51.100.2", lastMessage: "Nice portfolio!", date: "1 day ago", isLive: false },
];

export function ConversationList() {
    return (
        <div className="border-r border-border h-full flex flex-col bg-card/50">
             <div className="p-4 border-b border-border">
                  <h3 className="font-bold flex items-center gap-2">
                       <MessageSquareIcon size={18} /> Sessions
                  </h3>
             </div>
             <div className="flex-1 overflow-y-auto">
                  {CONVERSATIONS.map((conv) => (
                      <div key={conv.id} className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors relative group">
                           <div className="flex justify-between items-start mb-1">
                                <span className="font-mono text-xs font-bold text-primary">{conv.ip}</span>
                                <span className="text-[10px] text-muted-foreground">{conv.date}</span>
                           </div>
                           <p className="text-sm line-clamp-2 text-muted-foreground group-hover:text-foreground">{conv.lastMessage}</p>
                           {conv.isLive && (
                               <span className="absolute top-4 right-2 w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Live Now" />
                           )}
                      </div>
                  ))}
             </div>
        </div>
    );
}

export function ChatViewer() {
    return (
        <div className="flex flex-col h-full bg-background/50">
             <div className="p-4 border-b border-border flex justify-between items-center">
                  <div>
                       <h3 className="font-bold">192.168.1.1</h3>
                       <span className="text-xs text-green-500">Active now</span>
                  </div>
                  <button className="text-xs font-mono border border-primary text-primary px-3 py-1 rounded hover:bg-primary hover:text-black transition-colors">
                       TAKE_OVER_CONTROL
                  </button>
             </div>
             <div className="flex-1 p-8 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                       <MessageSquareIcon size={48} className="mx-auto mb-4 opacity-50" />
                       <p>Select a conversation to view history or intervene.</p>
                  </div>
             </div>
        </div>
    );
}
