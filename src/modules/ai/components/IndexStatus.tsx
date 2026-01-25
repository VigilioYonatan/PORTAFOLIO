import Badge from "@components/Badge";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-preact";

export default function IndexStatus({
	status,
}: {
	status: "PENDING" | "READY" | "ERROR";
}) {
	if (status === "PENDING") {
		return (
			<Badge
				variant="outline"
				className="border-yellow-500/50 text-yellow-500 bg-yellow-500/10 gap-2"
			>
				<Loader2 size={12} class="animate-spin" />
				INDEXING
			</Badge>
		);
	}
	if (status === "READY") {
		return (
			<Badge
				variant="outline"
				className="border-green-500/50 text-green-500 bg-green-500/10 gap-2"
			>
				<CheckCircle size={12} />
				READY
			</Badge>
		);
	}
	return (
		<Badge
			variant="outline"
			className="border-red-500/50 text-red-500 bg-red-500/10 gap-2"
		>
			<AlertTriangle size={12} />
			ERROR
		</Badge>
	);
}
