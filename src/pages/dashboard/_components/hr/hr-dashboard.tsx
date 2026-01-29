import { cn } from "@infrastructure/utils/client";
import MessageList from "@modules/contact/components/message-list";
import TechnologyTable from "@modules/technology/components/technology-table";
import TestimonialTable from "@modules/testimonial/components/testimonial-table";
import ExperienceTimeline from "@modules/work-experience/components/experience-timeline";
import { type Lang, useTranslations } from "@src/i18n";
import {
	BriefcaseIcon,
	CpuIcon,
	Heart,
	MessageSquare,
	SendIcon,
	ThumbsUpIcon,
	TrendingUp,
	Users,
} from "lucide-preact";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../../../components/extras/card";

interface HRDashboardProps {
	params: {
		lang: Lang;
	};
}

export default function HRDashboard({ params }: HRDashboardProps) {
	const t = useTranslations(params.lang);
	const stats = [
		{
			label: t("dashboard.hr.stats.recruiter"),
			val: "84%",
			trend: "+12%",
			icon: Users,
			color: "text-primary",
		},
		{
			label: t("dashboard.hr.stats.social"),
			val: "POSITIVO",
			trend: "ESTABLE",
			icon: Heart,
			color: "text-rose-500",
		},
		{
			label: t("dashboard.hr.stats.funnel"),
			val: "12",
			trend: "+2",
			icon: TrendingUp,
			color: "text-amber-500",
		},
		{
			label: t("dashboard.hr.stats.discussions"),
			val: "08",
			trend: "-1",
			icon: MessageSquare,
			color: "text-emerald-500",
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
							<CardTitle class="text-[9px] font-black tracking-[0.3em] text-muted-foreground/60 uppercase group-hover:text-primary transition-colors">
								{s.label}
							</CardTitle>
							<s.icon
								size={14}
								class={cn(
									"transition-all duration-300",
									s.color,
									"opacity-40 group-hover:opacity-100 group-hover:scale-110",
								)}
							/>
						</CardHeader>
						<CardContent>
							<div class="text-3xl font-black tracking-tighter text-white group-hover:text-primary transition-all">
								{s.val}
							</div>
							<div class="flex items-center gap-2 mt-2">
								<div class="h-1 w-6 bg-white/5 rounded-full overflow-hidden">
									<div class="h-full bg-primary/40 w-2/3" />
								</div>
								<p class="text-[9px] font-black text-primary/60 tracking-widest uppercase">
									{s.trend} DELTA_SEÑAL
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
							<h2 class="text-2xl font-black text-white tracking-tighter uppercase italic">
								{t("dashboard.timeline.title")}
							</h2>
							<p class="text-[10px] text-primary/60 font-mono uppercase tracking-[0.3em] font-bold">
								{t("dashboard.timeline.subtitle")}
							</p>
						</div>
					</div>
					<div class="bg-zinc-950/20 border border-white/5 p-6 rounded-sm backdrop-blur-sm hover:border-primary/10 transition-all">
						<ExperienceTimeline lang={params.lang} />
					</div>
				</div>

				{/* Social Proof / Testimonials Section */}
				<div class="lg:col-span-5 space-y-8">
					<div class="flex items-center gap-4 border-l-4 border-amber-500 pl-6 py-1">
						<div class="p-2 bg-amber-500/10 rounded-sm">
							<ThumbsUpIcon size={20} class="text-amber-500" />
						</div>
						<div>
							<h2 class="text-2xl font-black text-white tracking-tighter uppercase italic">
								{t("dashboard.testimonial.title")}
							</h2>
							<p class="text-[10px] text-amber-500/60 font-mono uppercase tracking-[0.3em] font-bold">
								{t("dashboard.hr.validation")}
							</p>
						</div>
					</div>
					<div class="bg-zinc-950/20 border border-white/5 p-6 rounded-sm backdrop-blur-sm hover:border-amber-500/10 transition-all">
						<TestimonialTable lang={params.lang} />
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
						<h2 class="text-2xl font-black text-white tracking-tighter uppercase italic">
							{t("dashboard.technology.title")}
						</h2>
						<p class="text-[10px] text-blue-500/60 font-mono uppercase tracking-[0.3em] font-bold">
							{t("dashboard.technology.subtitle")}
						</p>
					</div>
				</div>
				<div class="bg-zinc-950/20 border border-white/5 p-6 rounded-sm backdrop-blur-sm hover:border-blue-500/10 transition-all">
					<TechnologyTable lang={params.lang} />
				</div>
			</div>

			{/* Contact Messages Section */}
			<div class="space-y-8 relative z-10">
				<div class="flex items-center gap-4 border-l-4 border-emerald-500 pl-6 py-1">
					<div class="p-2 bg-emerald-500/10 rounded-sm">
						<SendIcon size={20} class="text-emerald-500" />
					</div>
					<div>
						<h2 class="text-2xl font-black text-white tracking-tighter uppercase italic">
							{t("dashboard.inbox.title")}
						</h2>
						<p class="text-[10px] text-emerald-500/60 font-mono uppercase tracking-[0.3em] font-bold">
							{t("dashboard.inbox.protocol")}
						</p>
					</div>
				</div>
				<div class="bg-zinc-950/20 border border-white/5 p-6 rounded-sm backdrop-blur-sm hover:border-emerald-500/10 transition-all">
					<MessageList lang={params.lang} />
				</div>
			</div>
		</div>
	);
}
