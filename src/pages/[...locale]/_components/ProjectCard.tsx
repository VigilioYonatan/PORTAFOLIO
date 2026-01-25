import { cn } from "@infrastructure/utils/client";

interface ProjectCardProps {
    title: string;
    description: string;
    tags: string[];
    slug: string;
    image?: string;
    class?: string;
}

export default function ProjectCard({ title, description, tags, slug, image, class: className }: ProjectCardProps) {
    return (
        <a
            href={`/projects/${slug}`}
            class={cn(
                "group relative block border border-border bg-card/40 rounded-sm overflow-hidden hover:border-primary/40 transition-all duration-500 backdrop-blur-sm",
                className
            )}
        >
            <div class="grid grid-cols-1 md:grid-cols-2">
                <div class="aspect-video bg-zinc-900 relative overflow-hidden">
                    {image ? (
                        <img src={image} alt={title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                    ) : (
                        <div class="w-full h-full flex items-center justify-center font-mono text-[10px] text-primary/20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 to-transparent">
                            [ NO_PREVIEW_AVAILABLE ]
                        </div>
                    )}
                    <div class="absolute inset-0 bg-gradient-to-r from-zinc-950/80 to-transparent md:hidden" />
                </div>
                
                <div class="p-8 flex flex-col justify-center relative">
                    {/* Decorative corner */}
                    <div class="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/10 group-hover:border-primary/40 transition-all" />
                    
                    <div class="mb-1 text-[10px] font-mono text-primary/60 tracking-[0.3em] uppercase">PROJECT_NODE</div>
                    <h2 class="text-2xl font-bold mb-3 tracking-tighter group-hover:text-primary group-hover:text-glow transition-all">
                        {title.toUpperCase()}
                    </h2>
                    <p class="text-xs text-muted-foreground mb-6 line-clamp-2 font-mono leading-relaxed uppercase opacity-70">
                        {description}
                    </p>
                    
                    <div class="flex flex-wrap gap-2 mb-8">
                        {tags.map(tag => (
                            <span key={tag} class="px-2 py-0.5 border border-border bg-zinc-900/50 text-[9px] font-mono text-muted-foreground group-hover:border-primary/20 group-hover:text-primary transition-all">
                                {tag}
                            </span>
                        ))}
                    </div>
                    
                    <div class="mt-auto flex items-center gap-2 text-[10px] font-mono font-black text-primary/40 group-hover:text-primary group-hover:text-glow transition-all tracking-[0.2em]">
                        DATA_MINING.exe <span class="group-hover:translate-x-1 transition-transform inline-block">{" >>"}</span>
                    </div>

                </div>
            </div>
        </a>
    );
}
