import { toggleNatureMode } from "@stores/special-mode.store";
import { BirdIcon } from "lucide-preact"; // Using Bird as the animal icon

export default function NatureButton() {
    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleNatureMode(true);
            }}
            class="fixed z-40 top-4 left-[calc(50%+4rem)] md:static md:translate-x-0 md:mx-auto md:mb-4
                   w-12 h-12 flex items-center justify-center 
                   bg-white/10 border-2 border-white text-white 
                   rounded-md shadow-[0_0_15px_rgba(255,255,255,0.3)]
                   hover:bg-white hover:text-black hover:scale-110 hover:shadow-[0_0_25px_rgba(255,255,255,0.8)]
                   transition-all duration-300 group"
            title="ACTIVATE NATURE PROTOCOL"
        >
            <BirdIcon size={24} class="animate-[bounce_2s_infinite]" />
        </button>
    );
}
