import type { DashboardMetricsSchema } from "@modules/analytics/dtos/dashboard.response.dto";
import InsightsRadar from "@modules/analytics/components/insights.radar";
import { Activity, Brain, Eye, ShieldAlertIcon, Users } from "lucide-preact";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@components/extras/card";

interface AnalyticsGridProps {
	metrics?: DashboardMetricsSchema;
	isLoading?: boolean | null;
}

export function AnalyticsGrid({ metrics, isLoading }: AnalyticsGridProps) {
	const formatNumber = (num: number) => {
		if (num >= 1000) {
			return `${(num / 1000).toFixed(1)}K`;
		}
		return num.toString();
	};

	const metricsData = [
		{
			title: "Total_Signal_Views",
			value: formatNumber(metrics?.totalViews ?? 0),
			sub: "+20.1% GAIN",
			icon: Eye,
		},
		{
			title: "Recruiter_Uplink",
			value: `+${formatNumber(metrics?.totalUsers ?? 0)}`,
			sub: "+180.1% ACTIVE",
			icon: Users,
		},
		{
			title: "Live_Threads",
			value: formatNumber(metrics?.totalChats ?? 0),
			sub: "+19.2% BURST",
			icon: Activity,
		},
		{
			title: "Core_Integrity",
			value: "99.9%",
			sub: "STABLE",
			icon: ShieldAlertIcon,
			isSuccess: true,
		},
	];
	return (
		<div class="space-y-6">
			{/* Metrics Row */}
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				{metricsData.map((item) => (
					<Card
						key={item.title}
						className={`border-white/5 relative overflow-hidden group transition-all duration-300 hover:border-primary/30 ${
							item.isSuccess
								? "bg-primary/5 border-primary/20"
								: "bg-zinc-950/40"
						}`}
					>
						<div class="absolute inset-0 bg-scanline opacity-[0.03] pointer-events-none" />

						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
							<CardTitle
								className={`text-[9px] font-black tracking-[0.3em] uppercase transition-colors ${
									item.isSuccess
										? "text-primary"
										: "text-muted-foreground group-hover:text-primary/80"
								}`}
							>
								{item.title}
							</CardTitle>
							<item.icon
								size={14}
								class={`transition-all duration-300 ${
									item.isSuccess
										? "text-primary animate-pulse"
										: "text-primary/40 group-hover:text-primary group-hover:scale-110"
								}`}
							/>
						</CardHeader>
						<CardContent className="relative z-10">
							<div
								class={`text-3xl font-black tracking-tighter transition-all duration-300 ${
									item.isSuccess ? "text-primary text-glow" : "text-white"
								}`}
							>
								{item.value}
							</div>
							<div class="flex items-center gap-2 mt-2">
								<div class="h-1 w-8 bg-primary/20 rounded-full overflow-hidden">
									<div
										class="h-full bg-primary animate-shimmer"
										style={{ width: "60%" }}
									/>
								</div>
								<p class="text-[9px] font-black text-primary tracking-widest uppercase opacity-60">
									{item.sub}
								</p>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Insights Row */}
			<div class="grid gap-6 md:grid-cols-2 h-[420px]">
				<Card className="bg-zinc-950/40 border-white/5 overflow-hidden relative group hover:border-primary/20 transition-all flex flex-col">
					<div class="absolute inset-0 bg-scanline opacity-[0.02] pointer-events-none" />
					<CardHeader className="relative z-10">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<Brain class="w-4 h-4 text-primary animate-pulse" />
								<CardTitle className="text-[10px] font-black tracking-[0.3em] uppercase text-white">
									Recruiter_Trend_Radar
								</CardTitle>
							</div>
							<span class="text-[8px] text-primary/40 font-mono">
								LIVE_FEED
							</span>
						</div>
					</CardHeader>
					<CardContent className="flex-1 flex items-center justify-center p-4 relative z-10">
						<InsightsRadar />
					</CardContent>
				</Card>

				<Card className="bg-zinc-950/40 border-white/5 relative group hover:border-primary/20 transition-all">
					<div class="absolute inset-0 bg-scanline opacity-[0.02] pointer-events-none" />
					<CardHeader className="relative z-10">
						<div class="flex items-center justify-between">
							<CardTitle className="text-[10px] font-black tracking-[0.3em] uppercase text-white">
								AI_Signal_Intelligence
							</CardTitle>
							<span class="px-2 py-0.5 bg-primary/20 text-primary text-[8px] font-black rounded-sm border border-primary/40 animate-pulse">
								L_04_AUTH
							</span>
						</div>
					</CardHeader>
					<CardContent className="relative z-10">
						<div class="flex flex-col gap-6">
							<div class="space-y-3">
								<div class="flex flex-wrap gap-2">
									{["Microservices", "WebGL", "RAG_Pattern", "K8s"].map(
										(tag) => (
											<span
												key={tag}
												class="px-2 py-1 bg-primary/5 border border-primary/20 text-primary text-[9px] font-black tracking-widest rounded-sm group-hover:bg-primary/10 transition-colors"
											>
												#{tag}
											</span>
										),
									)}
								</div>
								<div class="p-4 bg-black/40 border border-white/5 rounded-sm relative overflow-hidden">
									<div class="absolute left-0 top-0 bottom-0 w-1 bg-primary/60" />
									<p class="text-[11px] text-muted-foreground leading-relaxed font-mono tracking-tight uppercase">
										&gt; High interest in{" "}
										<span class="text-white font-bold">
											Reactive Architecture
										</span>{" "}
										and{" "}
										<span class="text-primary font-bold">
											Distributed Systems
										</span>{" "}
										detected. Signals suggest expanding the Technical
										documentation for{" "}
										<span class="text-white/80 italic">Uplink Protocols</span>.
									</p>
								</div>
							</div>

							<div class="space-y-3">
								<span class="text-[9px] font-black text-primary/60 tracking-[0.3em] uppercase flex items-center gap-2">
									<Activity size={10} />
									Recommended_Protocols:
								</span>
								<ul class="space-y-2">
									{[
										"DEPLOY_SYSTEM_DESIGN_MANIFEST",
										"OPTIMIZE_CORE_VITAL_METRICS",
										"INITIALIZE_NESTJS_SCALING_MODULE",
									].map((action) => (
										<li
											key={action}
											class="text-[10px] text-zinc-400 font-mono flex items-center gap-3 group/item cursor-pointer hover:text-white transition-colors border border-white/5 p-2 bg-black/20 rounded-sm"
										>
											<span class="text-primary group-hover/item:translate-x-1 transition-transform">
												&gt;_
											</span>
											<span class="tracking-widest">{action}</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
export default AnalyticsGrid;
