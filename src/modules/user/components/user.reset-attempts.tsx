import { sweetModal } from "@vigilio/sweet";
import { RotateCcw } from "lucide-preact";
import { userResetAttemptsApi } from "../apis/user.reset-attemps";

interface ResetAttemptsButtonProps {
	userId: number;
}

export function ResetAttemptsButton({ userId }: ResetAttemptsButtonProps) {
	const resetMutation = userResetAttemptsApi(userId);

	function handleReset() {
		sweetModal({
			title: "¿Resetear intentos?",
			text: "Esto restablecerá el contador de intentos fallidos a 0.",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Resetear",
		}).then(({ isConfirmed }) => {
			if (isConfirmed) {
				resetMutation.mutate(null, {
					onSuccess() {
						sweetModal({
							icon: "success",
							title: "Intentos reseteados",
							timer: 1500,
							showConfirmButton: false,
						});
					},
					onError() {
						sweetModal({
							icon: "danger",
							title: "Error al resetear intentos",
						});
					},
				});
			}
		});
	}

	return (
		<button
			type="button"
			data-testid="reset-button"
			class="p-1 hover:bg-yellow-500/10 rounded text-yellow-600 transition-colors"
			onClick={handleReset}
			disabled={resetMutation.isLoading || false}
			title="Resetear intentos"
		>
			<RotateCcw
				size={12}
				class={resetMutation.isLoading ? "animate-spin" : ""}
			/>
		</button>
	);
}
