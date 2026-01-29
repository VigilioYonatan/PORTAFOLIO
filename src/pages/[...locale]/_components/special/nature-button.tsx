import { toggleNatureMode } from "@stores/special-mode.store";
import { BirdIcon } from "lucide-preact"; // Using Bird as the animal icon

export default function NatureButton() {
	return (
		<button
			type="button"
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				toggleNatureMode(true);
			}}
			class="w-12 h-12 flex items-center justify-center 
                   bg-white/10 border-2 border-white text-white
                    rounded-md shadow-(0_0_15px_rgba(16,185,129,0.3))
                   hover:bg-white hover:text-black hover:scale-110 hover:shadow-(0_0_25px_rgba(16,185,129,0.8))
                   transition-all duration-300 group"
			title="ACTIVATE NATURE PROTOCOL"
			aria-label="Activate Nature Protocol"
		>
			<BirdIcon size={24} />
		</button>
	);
}
