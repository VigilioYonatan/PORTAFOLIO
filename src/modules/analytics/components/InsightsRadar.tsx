import {
	PolarAngleAxis,
	PolarGrid,
	Radar,
	RadarChart,
	ResponsiveContainer,
} from "recharts";

const DATA = [
	{ subject: "Architecture", A: 120, fullMark: 150 },
	{ subject: "AI/RAG", A: 98, fullMark: 150 },
	{ subject: "Backend", A: 110, fullMark: 150 },
	{ subject: "Frontend", A: 85, fullMark: 150 },
	{ subject: "Cloud", A: 90, fullMark: 150 },
	{ subject: "DevOps", A: 70, fullMark: 150 },
];

export default function InsightsRadar() {
	return (
		<div class="w-full h-full">
			<ResponsiveContainer width="100%" height="100%">
				<RadarChart cx="50%" cy="50%" outerRadius="80%" data={DATA}>
					<PolarGrid stroke="#27272a" />
					<PolarAngleAxis
						dataKey="subject"
						tick={{ fill: "#71717a", fontSize: 10, fontWeight: "bold" }}
					/>
					<Radar
						dataKey="A"
						stroke="#06b6d4"
						fill="#06b6d4"
						fillOpacity={0.4}
					/>
				</RadarChart>
			</ResponsiveContainer>
		</div>
	);
}
