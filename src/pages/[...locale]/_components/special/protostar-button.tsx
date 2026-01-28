import { toggleProtostarMode } from "@stores/special-mode.store";
import { AlertTriangleIcon } from "lucide-preact";

export default function ProtostarButton() {
	return (
		<button
			type="button"
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				toggleProtostarMode(true);
			}}
			class="w-12 h-12 flex items-center justify-center 
                   bg-green-500/10 border-2 border-green-500 text-green-500 
                   rounded-md shadow-(0_0_15px_rgba(34,197,94,0.5))
                   hover:bg-green-500 hover:text-black hover:scale-110 hover:shadow-(0_0_25px_rgba(34,197,94,0.8))
                   transition-all duration-300 animate-pulse group"
			title="ACTIVATE PROTOSTAR PROTOCOL"
			aria-label="Activate Protostar Protocol"
		>
			<AlertTriangleIcon class="w-6 h-6" />
		</button>
	);
}
