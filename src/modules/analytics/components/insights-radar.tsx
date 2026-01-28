import Button from "@components/extras/button";
import { analyticsInsightGenerateApi } from "@modules/analytics/apis/analytics.insight.generate.api";
import { analyticsInsightIndexApi } from "@modules/analytics/apis/analytics.insight.index.api";
import { sweetModal } from "@vigilio/sweet";
import { BrainCircuit, Loader2 } from "lucide-preact";
import {
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";

// Function to map themes to radar data structure (since we don't have explicit scores, we mock them hashing the theme name or count)
function mapThemesToData(themes: string[]) {
	if (!themes || themes.length === 0)
		return [
			{ subject: "Arquitectura", A: 120, fullMark: 150 },
			{ subject: "DevOps", A: 98, fullMark: 150 },
			{ subject: "Seguridad", A: 86, fullMark: 150 },
			{ subject: "Algoritmos", A: 99, fullMark: 150 },
			{ subject: "Sistemas", A: 85, fullMark: 150 },
			{ subject: "Nube", A: 65, fullMark: 150 },
		];

	// For visualization purposes, we assign a "score" to each theme.
	// In a real scenario, the API should return relevance scores.
	return themes.slice(0, 6).map((theme) => ({
		subject: theme.length > 10 ? `${theme.substring(0, 10)}..` : theme,
		A: 80 + ((theme.length * 5) % 70), // Mock score based on string
		fullMark: 150,
	}));
}

export default function InsightsRadar() {
	const query = analyticsInsightIndexApi({ limit: 1 });
	const generateMutation = analyticsInsightGenerateApi();

	const latestInsight = query.data?.results[0];
	const data = mapThemesToData(latestInsight?.insights_data.themes || []);

	function handleGenerate() {
		generateMutation.mutate(undefined, {
			onSuccess() {
				sweetModal({
					icon: "success",
					title: "Análisis Completo",
					text: "Nuevos conocimientos de reclutamiento generados con éxito.",
				});
				query.refetch(false);
			},
			onError(err) {
				sweetModal({
					icon: "danger",
					title: "Análisis Fallido",
					text: err.message,
				});
			},
		});
	}

	return (
		<div class="mt-4 border border-white/5 rounded-xl p-4 bg-card/30 backdrop-blur-md">
			<div class="flex items-center justify-between mb-4">
				<h3 class="font-bold text-sm flex items-center gap-2">
					<BrainCircuit size={14} class="text-primary" />
					Mapa de Interés de Reclutadores
				</h3>
				<Button
					onClick={handleGenerate}
					disabled={!!generateMutation.isLoading}
					className="text-[10px] h-7 px-2 font-mono tracking-widest uppercase bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
				>
					{generateMutation.isLoading ? (
						<Loader2 size={10} class="animate-spin mr-1" />
					) : null}
					{generateMutation.isLoading ? "PROCESANDO..." : "EJECUTAR_ANÁLISIS"}
				</Button>
			</div>

			<div class="h-[250px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
						<PolarGrid stroke="#3f3f46" strokeOpacity={0.5} />
						<PolarAngleAxis
							dataKey="subject"
							tick={{ fill: "#71717a", fontSize: 10, fontFamily: "monospace" }}
						/>
						<PolarRadiusAxis
							angle={30}
							domain={[0, 150]}
							tick={false}
							axisLine={false}
						/>
						<Radar
							dataKey="A"
							stroke="#10b981"
							strokeWidth={2}
							fill="#10b981"
							fillOpacity={0.2}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: "#09090b",
								borderColor: "#27272a",
								fontSize: "12px",
							}}
							itemStyle={{ color: "#10b981" }}
						/>
					</RadarChart>
				</ResponsiveContainer>
			</div>

			<div class="mt-4 grid grid-cols-2 gap-2">
				<div class="p-3 bg-black/20 rounded border border-white/5">
					<span class="text-[10px] text-muted-foreground uppercase block mb-1">
						Sentimiento
					</span>
					<span class="text-lg font-black text-emerald-500">
						{latestInsight?.insights_data.sentiment || "NEUTRAL"}
					</span>
				</div>
				<div class="p-3 bg-black/20 rounded border border-white/5">
					<span class="text-[10px] text-muted-foreground uppercase block mb-1">
						Mejor Acción
					</span>
					<span class="text-xs font-mono text-zinc-300 line-clamp-2">
						{latestInsight?.insights_data.actions?.[0] || "ESPERANDO_DATOS"}
					</span>
				</div>
			</div>
		</div>
	);
}
