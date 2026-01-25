import { cn } from "@infrastructure/utils/client";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../../../components/extras/card";
import { Heart, MessageSquare, TrendingUp, Users, ShieldCheckIcon, ActivityIcon, BriefcaseIcon, ThumbsUpIcon, CpuIcon, SendIcon } from "lucide-preact";
import ExperienceTimeline from "@modules/work-experience/components/ExperienceTimeline";
import TestimonialTable from "@modules/testimonial/components/TestimonialTable";
import MessageList from "@modules/contact/components/MessageList";
import TechnologyTable from "@modules/technology/components/TechnologyTable";

export default function HRDashboard() {
	const stats = [
		{ label: "RECRUITER_ENGAGEMENT", val: "84%", trend: "+12%", icon: Users, color: "text-primary" },
		{
			label: "SOCIAL_SENTIMENT",
			val: "POSITIVE",
			trend: "STABLE",
			icon: Heart,
            color: "text-rose-500"
		},
		{ label: "FUNNEL_CONVERSION", val: "12", trend: "+2", icon: TrendingUp, color: "text-amber-500" },
		{
			label: "ACTIVE_DISCUSSIONS",
			val: "08",
			trend: "-1",
			icon: MessageSquare,
            color: "text-emerald-500"
		},
	];

	return (
		<div class="space-y-12 pb-20 relative">
            {/* Ambient System Scanlines */}
            <div class="absolute inset-0 bg-scanline opacity-[0.02] pointer-events-none" />

			{/* Header Stats */}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
				{stats.map((s) => (
					<Card class="bg-zinc-950/40 border-white/5 backdrop-blur-md group hover:border-primary/20 transition-all duration-300 relative overflow-hidden">
                        <div class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
						<CardHeader class="flex flex-row items-center justify-between pb-2">
							<CardTitle class="text-[9px] font-black font-mono tracking-[0.3em] text-muted-foreground/60 uppercase group-hover:text-primary transition-colors">
								{s.label}
							</CardTitle>
							<s.icon size={14} class={cn("transition-all duration-300", s.color, "opacity-40 group-hover:opacity-100 group-hover:scale-110")} />
						</CardHeader>
						<CardContent>
							<div class="text-3xl font-black font-mono tracking-tighter text-white group-hover:text-primary transition-all">
								{s.val}
							</div>
							<div class="flex items-center gap-2 mt-2">
                                <div class="h-1 w-6 bg-white/5 rounded-full overflow-hidden">
                                    <div class="h-full bg-primary/40 w-2/3" />
                                </div>
                                <p class="text-[9px] font-black font-mono text-primary/60 tracking-widest uppercase">
								    {s.trend} SIGNAL_DELTA
							    </p>
                            </div>
						</CardContent>
					</Card>
				))}
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
				{/* Work Experience Section */}
				<div class="lg:col-span-7 space-y-8">
					<div class="flex items-center gap-4 border-l-4 border-primary pl-6 py-1">
                        <div class="p-2 bg-primary/10 rounded-sm">
                            <BriefcaseIcon size={20} class="text-primary" />
                        </div>
                        <div>
						    <h2 class="text-2xl font-black font-mono text-white tracking-tighter uppercase italic">
							    Professional_Nodes
						    </h2>
						    <p class="text-[10px] text-primary/60 font-mono uppercase tracking-[0.3em] font-bold">
							    Chronological_Career_Sequence // Master_Control
						    </p>
                        </div>
					</div>
					<div class="bg-zinc-950/20 border border-white/5 p-6 rounded-sm backdrop-blur-sm hover:border-primary/10 transition-all">
                        <ExperienceTimeline />
                    </div>
				</div>

				{/* Social Proof / Testimonials Section */}
				<div class="lg:col-span-5 space-y-8">
					<div class="flex items-center gap-4 border-l-4 border-amber-500 pl-6 py-1">
                        <div class="p-2 bg-amber-500/10 rounded-sm">
                            <ThumbsUpIcon size={20} class="text-amber-500" />
                        </div>
                        <div>
						    <h2 class="text-2xl font-black font-mono text-white tracking-tighter uppercase italic">
							    Social_Proof
						    </h2>
						    <p class="text-[10px] text-amber-500/60 font-mono uppercase tracking-[0.3em] font-bold">
							    Third_Party_Validation // Endorsements
						    </p>
                        </div>
					</div>
					<div class="bg-zinc-950/20 border border-white/5 p-6 rounded-sm backdrop-blur-sm hover:border-amber-500/10 transition-all">
                        <TestimonialTable />
                    </div>
				</div>
			</div>

			{/* Technology Stack Section */}
			<div class="space-y-8 relative z-10">
				<div class="flex items-center gap-4 border-l-4 border-blue-500 pl-6 py-1">
                    <div class="p-2 bg-blue-500/10 rounded-sm">
                        <CpuIcon size={20} class="text-blue-500" />
                    </div>
                    <div>
					    <h2 class="text-2xl font-black font-mono text-white tracking-tighter uppercase italic">
						    Core_Technology_Stack
					    </h2>
					    <p class="text-[10px] text-blue-500/60 font-mono uppercase tracking-[0.3em] font-bold">
						    Neural_Infrastructure // Tooling_Inventory
					    </p>
                    </div>
				</div>
				<div class="bg-zinc-950/20 border border-white/5 p-6 rounded-sm backdrop-blur-sm hover:border-blue-500/10 transition-all">
                    <TechnologyTable />
                </div>
			</div>

			{/* Contact Messages Section */}
			<div class="space-y-8 relative z-10">
				<div class="flex items-center gap-4 border-l-4 border-emerald-500 pl-6 py-1">
                    <div class="p-2 bg-emerald-500/10 rounded-sm">
                        <SendIcon size={20} class="text-emerald-500" />
                    </div>
                    <div>
					    <h2 class="text-2xl font-black font-mono text-white tracking-tighter uppercase italic">
						    Neural_Transmissions
					    </h2>
					    <p class="text-[10px] text-emerald-500/60 font-mono uppercase tracking-[0.3em] font-bold">
						    Direct_Uplink_Communication_Logs // Port_8080
					    </p>
                    </div>
				</div>
				<div class="bg-zinc-950/20 border border-white/5 p-6 rounded-sm backdrop-blur-sm hover:border-emerald-500/10 transition-all">
                    <MessageList />
                </div>
			</div>
		</div>
	);
}
