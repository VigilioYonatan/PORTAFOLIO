import { useState, useEffect } from "preact/hooks";
import { Menu, X } from "lucide-preact";
import TerminalLogo from "../../terminal-logo";
import NavLinks from "../../nav-links";


import { cn } from "@infrastructure/utils/client/cn";

interface MobileHeaderProps {
    lang: string;
}

export default function MobileHeader({ lang }: MobileHeaderProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <header className="flex md:hidden items-center justify-between p-4 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
            <TerminalLogo className="text-lg" />

            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-primary hover:bg-primary/10 rounded-sm transition-colors"
                aria-label="Open Menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Full Screen Overlay Menu */}
            <div
                className={cn(
                    "fixed inset-0 h-[100dvh] bg-background/95 backdrop-blur-xl z-[60] flex flex-col transition-all duration-300 ease-in-out",
                    isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
                )}
            >
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
                        System Navigation
                    </span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
                        aria-label="Close Menu"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col p-8 overflow-y-auto gap-8">
                    <div className="flex flex-col gap-4">
                        <NavLinks lang={lang} vertical className="gap-6" />
                    </div>
                </div>
            </div>
        </header>
    );
}
