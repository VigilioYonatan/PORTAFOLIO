import { analyticsDashboardApi } from "@modules/analytics/apis/analytics.dashboard.api";
import { NotificationCenter } from "@modules/notification/components/notification.center";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../../components/extras/card";
import AnalyticsGrid from "./analytics.grid";

export default function DashboardHome() {
	const { data, isLoading } = analyticsDashboardApi();

	const weeklyVisits = data?.metrics?.weeklyVisits ?? [
		{ name: "Mon", visits: 0 },
		{ name: "Tue", visits: 0 },
		{ name: "Wed", visits: 0 },
		{ name: "Thu", visits: 0 },
		{ name: "Fri", visits: 0 },
		{ name: "Sat", visits: 0 },
		{ name: "Sun", visits: 0 },
	];

	return (
		<div class="flex-1 space-y-4">
			<div class="flex items-center justify-between space-y-2">
				<h2 class="text-3xl font-black tracking-tighter uppercase italic">
					{">"} SYSTEM_DASHBOARD
				</h2>
			</div>

			<AnalyticsGrid metrics={data?.metrics} isLoading={isLoading} />

			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				<div class="col-span-3 h-[400px]">
					<NotificationCenter />
				</div>
				<Card class="col-span-4 bg-zinc-900/50 border-white/5 overflow-hidden backdrop-blur-sm h-[400px]">
					<CardHeader>
						<CardTitle class="text-sm font-black tracking-widest uppercase">
							Traffic_Uplink_Signal
						</CardTitle>
					</CardHeader>
					<CardContent class="h-[300px] p-0 pr-6 pt-4">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={weeklyVisits}>
								<CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
								<XAxis
									dataKey="name"
									stroke="#71717a"
									fontSize={10}
									fontWeight="bold"
									axisLine={false}
									tickLine={false}
								/>
								<YAxis
									stroke="#71717a"
									fontSize={10}
									fontWeight="bold"
									axisLine={false}
									tickLine={false}
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: "#09090b",
										border: "1px solid rgba(255,255,255,0.05)",
										borderRadius: "0px",
										fontFamily: "monospace",
									}}
									itemStyle={{ color: "#06b6d4" }}
								/>
								<Line
									type="monotone"
									dataKey="visits"
									stroke="#06b6d4"
									strokeWidth={3}
									dot={{ fill: "#06b6d4", r: 4 }}
									activeDot={{ r: 6, stroke: "#06b6d4", strokeWidth: 2 }}
								/>
							</LineChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

