import environments from "@infrastructure/config/client/environments.config";
import { printFileWithDimension } from "@infrastructure/utils/hybrid";
import type { BlogPostSchema } from "@modules/blog-post/schemas/blog-post.schema";
import { DIMENSION_IMAGE } from "@modules/uploads/const/upload.const"; // Check if correct
import type { Lang } from "@src/i18n";
import { Calendar, Terminal } from "lucide-preact";

interface RecentBlogsProps {
	latestPosts: BlogPostSchema[];
	lang: Lang;
	STORAGE_CDN_URL: string;
}

export default function RecentBlogs({ latestPosts, lang, STORAGE_CDN_URL }: RecentBlogsProps) {
	if (!latestPosts || latestPosts.length === 0) return null;

	return (
		<div class="flex flex-col gap-4">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				{latestPosts.map((post) => (
					<a
						key={post.id}
						href={`/${lang}/blog/${post.slug}`}
						class="group relative flex flex-col h-full bg-[#050505] border border-white/5 rounded-sm overflow-hidden hover:border-primary/40 transition-colors duration-300"
					>
						{/* Header Line */}
						<div class="h-6 bg-white/5 border-b border-white/5 flex items-center px-3 justify-between">
							<div class="flex items-center gap-1.5">
								<div class="w-2 h-2 rounded-full bg-red-500/50" />
								<div class="w-2 h-2 rounded-full bg-yellow-500/50" />
								<div class="w-2 h-2 rounded-full bg-green-500/50" />
							</div>
							<span class="text-[10px] font-mono text-white/30 truncate max-w-[100px]">
								~/blog/{post.slug}
							</span>
						</div>

						{/* Image Area */}
						<div class="relative h-48 overflow-hidden border-b border-white/5 bg-zinc-900 group-hover:border-primary/20 transition-colors">
							{post.cover ? (
								<img
									src={
										printFileWithDimension(
											post.cover,
											DIMENSION_IMAGE.md,
											STORAGE_CDN_URL,
										)[0]
									}
									alt={post.title}
									class="w-full h-full object-cover opacity-70 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
									width="400"
									height="200"
								/>
							) : (
								<div class="w-full h-full flex items-center justify-center text-white/10">
									<Terminal size={40} />
								</div>
							)}
							{/* Scanline overlay */}
							<div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
						</div>

						{/* Content Body */}
						<div class="p-5 flex flex-col flex-1 gap-4">
							<div class="flex items-center gap-3 text-xs font-mono text-primary/70">
								<span class="bg-primary/10 px-2 py-0.5 rounded text-primary">
									TXT
								</span>
								<span class="flex items-center gap-1">
									<Calendar size={12} />
									{post.published_at
										? new Date(post.published_at).toLocaleDateString()
										: "DRAFT"}
								</span>
							</div>

							<h3 class="text-lg text-white group-hover:text-primary transition-colors leading-tight font-mono font-bold">
								<span class="text-primary/50 mr-2">{`>`}</span>
								{post.title}
								<span class="inline-block w-2 H-4 bg-primary/0 group-hover:bg-primary animate-pulse ml-1 align-middle">
									_
								</span>
							</h3>

							<p class="text-sm text-zinc-500 line-clamp-2 font-mono mt-auto">
								{post.extract || "No description available..."}
							</p>

							{/* Footer metadata */}
							<div class="pt-4 mt-auto border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-white/30 group-hover:text-white/50 transition-colors">
								<span>READ_TIME: {post.reading_time_minutes || 5}m</span>
								<span class="group-hover:translate-x-1 transition-transform">{`[READ_FILE]`}</span>
							</div>
						</div>
					</a>
				))}
			</div>
		</div>
	);
}
