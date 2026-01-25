import { Database, Disc, Layers } from "lucide-preact";
import AudioList from "@modules/music/components/AudioList";
import TechIconGrid from "@modules/technology/components/TechIconGrid";
import WaveEditor from "@modules/music/components/WaveEditor";

export default function SharedWorkspace() {
	return (
		<div class="space-y-8 animate-in fade-in duration-500">
			<div class="mb-6">
				<h2 class="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
					<Database class="text-primary" />
					MEDIA_&_ASSETS
				</h2>
				<p class="text-muted-foreground font-mono text-sm mt-1">
					Audio pipeline and Tech stack catalog.
				</p>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Audio Section */}
				<div class="space-y-4 border border-border/40 p-6 rounded-xl bg-card/20 backdrop-blur-sm">
					<div class="flex items-center justify-between mb-4">
						<h3 class="text-xl font-bold flex items-center gap-2 text-primary">
							<Disc size={20} /> Audio Library
						</h3>
						<span class="text-xs font-mono text-muted-foreground">
							FLAC/MP3 SUPPORTED
						</span>
					</div>
					<WaveEditor />
					<div class="mt-4">
						<AudioList />
					</div>
				</div>

				{/* Tech Stack Section */}
				<div class="space-y-4 border border-border/40 p-6 rounded-xl bg-card/20 backdrop-blur-sm">
					<div class="flex items-center justify-between mb-4">
						<h3 class="text-xl font-bold flex items-center gap-2 text-primary">
							<Layers size={20} /> Tech Stack Catalog
						</h3>
						<span class="text-xs font-mono text-muted-foreground">
							ICON MANAGEMENT
						</span>
					</div>
					<TechIconGrid />
				</div>
			</div>
		</div>
	);
}
