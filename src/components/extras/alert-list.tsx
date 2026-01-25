import Alert from "@components/extras/alert";
import type { TypeComponent } from "@components/extras/types";

interface AlertItem {
	id: string;
	type: TypeComponent;
	message: string;
	title?: string;
}

interface AlertListProps {
	alerts: AlertItem[];
	className?: string;
}

export function AlertList({ alerts, className }: AlertListProps) {
	if (!alerts.length) return null;

	return (
		<div className={className}>
			<div className="flex flex-col gap-3">
				{alerts.map((alert) => (
					<Alert
						key={alert.id}
						type={alert.type}
						title={alert.title}
						message={alert.message}
					/>
				))}
			</div>
		</div>
	);
}
