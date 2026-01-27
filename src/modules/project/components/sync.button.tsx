import { cn } from "@infrastructure/utils/client/cn"; // Adjust utils path
import { projectSyncApi } from "@modules/project/apis/project.sync.api"; // Adjust path if needed
import { sweetModal } from "@vigilio/sweet";
import { RefreshCw } from "lucide-preact";

interface SyncButtonProps {
	id: number;
	className?: string;
}

export default function SyncButton({ id, className }: SyncButtonProps) {
	const syncMutation = projectSyncApi();

	function onSync() {
		// Since sync might take time, we handle loading state locally if needed,
		// though mutation.isLoading is usually enough.
		sweetModal({
			title: "Sync with GitHub?",
			text: "This will update stars and languages for all linked repositories.",
			showCancelButton: true,
			confirmButtonText: "Yes, Sync",
		}).then(({ isConfirmed }) => {
			if (isConfirmed) {
				syncMutation.mutate(id, {
					onSuccess() {
						sweetModal({
							title: "Success",
							text: "Project synced with GitHub.",
							icon: "success",
						});
					},
				});
			}
		});
	}

	return (
		<button
			type="button"
			class={cn(
				"flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md transition-all font-medium text-sm",
				className,
			)}
			onClick={onSync}
			aria-label="Sync project with GitHub"
			disabled={syncMutation.isLoading ?? false}
		>
			<RefreshCw
				class={cn(
					"w-4 h-4",
					(syncMutation.isLoading ?? false) && "animate-spin",
				)}
			/>
			{syncMutation.isLoading ? "Syncing..." : "Sync GitHub"}
		</button>
	);
}
