import Modal from "@components/extras/Modal";
import { useSignal } from "@preact/signals";
import { Plus } from "lucide-preact";
import ProjectStore from "@modules/project/components/ProjectStore";
import SyncButton from "./SyncButton";

export default function ContentActions() {
	const isCreateModalOpen = useSignal(false);

	return (
		<div class="flex items-center gap-3">
			<SyncButton />
			<button
				type="button"
				onClick={() => (isCreateModalOpen.value = true)}
				class="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-black text-[11px] tracking-widest uppercase hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]"
			>
				<Plus size={16} stroke-width={3} />
				Initialize_Node
			</button>

			<Modal
				isOpen={isCreateModalOpen.value}
				onClose={() => (isCreateModalOpen.value = false)}
				contentClassName="max-w-4xl bg-zinc-950 border border-white/10 shadow-2xl"
			>
				<ProjectStore
					onSuccess={() => {
						window.dispatchEvent(new CustomEvent("project-refetch"));
					}}
					onClose={() => (isCreateModalOpen.value = false)}
				/>
			</Modal>
		</div>
	);
}
