import { togglePlanetMode } from "@stores/special-mode.store";
import { OrbitIcon } from "lucide-preact"; // Planet-like icon

export default function PlanetButton() {
	return (
		<button
			type="button"
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				togglePlanetMode(true);
			}}
			class="fixed z-40 top-4 left-[calc(50%+8rem)] md:static md:translate-x-0 md:mx-auto md:mb-4
                   w-12 h-12 flex items-center justify-center 
                   bg-purple-500/10 border-2 border-purple-500 text-purple-500 
                   rounded-full shadow-(0_0_15px_rgba(168,85,247,0.3))
                   hover:bg-purple-500 hover:text-white hover:scale-110 hover:shadow-(0_0_25px_rgba(168,85,247,0.8))
                   transition-all duration-300 group"
			title="ACTIVATE REAPER PROTOCOL"
			aria-label="Activate Reaper Protocol"
		>
			<OrbitIcon
				size={24}
				class="group-hover:rotate-180 transition-transform duration-1000"
			/>
		</button>
	);
}
