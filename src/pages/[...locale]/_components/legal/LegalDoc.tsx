
import { cn } from "@infrastructure/utils/client";

interface LegalDocProps {
    title: string;
    lastUpdated: string;
    children: any;
}

export default function LegalDoc({ title, lastUpdated, children }: LegalDocProps) {
    return (
        <div className="max-w-3xl mx-auto py-20 px-4">
             <div className="mb-12 border-b border-border pb-8">
                  <h1 className="text-4xl font-black font-mono mb-4 text-primary">{title}</h1>
                  <p className="text-muted-foreground font-mono text-sm">LAST_UPDATED: {lastUpdated}</p>
             </div>
             
             <div className="prose prose-invert prose-headings:font-mono prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary max-w-none">
                  {children}
             </div>
        </div>
    );
}
