import Badge from "@components/extras/badge";
import Modal from "@components/extras/modal";
import { printFileWithDimension } from "@infrastructure/utils/hybrid/file.utils";
import { technologyDestroyApi } from "@modules/technology/apis/technology.destroy.api";
import { technologyIndexApi } from "@modules/technology/apis/technology.index.api";
import TechnologyStore from "@modules/technology/components/technology-store";
import TechnologyUpdate from "@modules/technology/components/technology-update";
import type { TechnologySchema } from "@modules/technology/schemas/technology.schema";
import { DIMENSION_IMAGE } from "@modules/uploads/const/upload.const";
import { useSignal } from "@preact/signals";
import { Edit, Plus, Trash2, Zap } from "lucide-preact";
import type { JSX } from "preact/jsx-runtime";

export default function TechIconGrid() {
	const editingTech = useSignal<TechnologySchema | null>(null);
	const isStoreModalOpen = useSignal<boolean>(false);
	const technologyDestroyApiMutation = technologyDestroyApi();

	const { data, isLoading, isSuccess, isError, refetch } = technologyIndexApi(
		null,
		null,
		{
			limit: 100,
		},
	);

	let component: JSX.Element | JSX.Element[] | null = null;

	if (isLoading) {
		component = [...Array(10)].map((_, i) => (
			<div
				key={i}
				class="bg-zinc-950/20 border border-white/5 p-6 rounded-3xl flex flex-col items-center gap-4 animate-pulse min-h-[160px]"
			>
				{/* Icon Skeleton */}
				<div class="w-14 h-14 bg-white/5 rounded-2xl border border-white/10" />

				{/* Text Skeletons */}
				<div class="flex flex-col items-center gap-2 w-full mt-1">
					<div class="w-20 h-2.5 bg-white/5 rounded-full" />
					<div class="w-12 h-4 bg-white/5 rounded-full mt-1" />
				</div>
			</div>
		));
	}

	if (isError) {
		component = (
			<div class="col-span-full p-8 text-center text-red-500 font-mono text-xs">
				ERR_CONNECTION_REFUSED
			</div>
		);
	}

	if (isSuccess && data) {
		const techs = data.results!;
		component = techs.map((tech) => {
			const iconUrl = tech.icon
				? printFileWithDimension(tech.icon, DIMENSION_IMAGE.xs)[0]
				: null;
			return (
				<div
					key={tech.id}
					class="bg-zinc-950/40 border border-white/5 p-6 rounded-3xl flex flex-col items-center gap-4 hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all duration-500 group relative overflow-hidden shadow-2xl backdrop-blur-xl"
				>
					{/* Background Glow */}
					<div class="absolute inset-0 bg-linear-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

					{/* Edit Button */}
					<button
						type="button"
						aria-label="Editar tecnología"
						onClick={(e) => {
							e.stopPropagation();
							editingTech.value = tech as TechnologySchema;
						}}
						class="absolute top-3 right-3 z-20 p-2 rounded-xl bg-zinc-900/80 border border-white/10 opacity-0 group-hover:opacity-100 hover:bg-amber-500/20 hover:border-amber-500/40 hover:text-amber-400 transition-all duration-300"
					>
						<Edit size={14} />
					</button>

					<div class="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-primary/40 transition-all duration-500 z-10 shadow-inner group-hover:shadow-primary/20 overflow-hidden">
						{iconUrl ? (
							<img
								src={iconUrl}
								alt={tech.name}
								title={tech.name}
								width={DIMENSION_IMAGE.xs}
								height={DIMENSION_IMAGE.xs}
								class="w-full h-full object-contain p-1"
							/>
						) : (
							<Zap
								size={28}
								class="text-muted-foreground group-hover:text-primary transition-colors"
							/>
						)}
					</div>

					<div class="text-center z-10 space-y-2">
						<span class="text-[10px] font-black tracking-tight uppercase block group-hover:text-foreground transition-colors truncate max-w-[120px]">
							{tech.name}
						</span>
						<Badge
							variant="secondary"
							className="text-[8px] font-black uppercase tracking-[0.2em] h-5 bg-white/5 border-white/10 group-hover:border-primary/20 group-hover:text-primary/80 px-2"
						>
							{tech.category}
						</Badge>
					</div>
					{/* Delete Button */}
					<button
						type="button"
						aria-label="Eliminar tecnología"
						onClick={(e) => {
							e.stopPropagation();
							if (
								window.confirm(
									"¿Estás seguro de que deseas eliminar esta tecnología?",
								)
							) {
								technologyDestroyApiMutation.mutate(tech.id, {
									onSuccess: () => {
										refetch();
									},
									onError: (error: { message: string }) => {
										alert(error.message);
									},
								});
							}
						}}
						class="absolute top-3 left-3 z-20 p-2 rounded-xl bg-zinc-900/80 border border-white/10 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 transition-all duration-300"
					>
						<Trash2 size={14} />
					</button>
				</div>
			);
		});
	}

	return (
		<div class="space-y-6">
			<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
				{component}

				{/* Add New Trigger */}
				<button
					type="button"
					aria-label="Agregar nueva tecnología"
					onClick={() => {
						isStoreModalOpen.value = true;
					}}
					class="bg-zinc-950/20 border-2 border-dashed border-white/5 p-6 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary/40 cursor-pointer transition-all duration-500 text-muted-foreground/20 hover:text-primary group shadow-lg min-h-[160px]"
				>
					<div class="w-12 h-12 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-primary/40 transition-all duration-500">
						<Plus
							size={24}
							strokeWidth={3}
							class="opacity-50 group-hover:opacity-100"
						/>
					</div>
					<span class="text-[9px] font-black uppercase tracking-[0.3em]">
						ALLOCATE_NODE
					</span>
				</button>
			</div>

			{/* Update Modal */}
			<Modal
				isOpen={!!editingTech.value}
				onClose={() => {
					editingTech.value = null;
				}}
				contentClassName="max-w-2xl bg-zinc-950 border border-white/10"
			>
				<TechnologyUpdate
					technology={editingTech.value!}
					refetch={() => {
						refetch();
						editingTech.value = null;
					}}
					onClose={() => {
						editingTech.value = null;
					}}
				/>
			</Modal>

			{/* Store Modal */}
			<Modal
				isOpen={isStoreModalOpen.value}
				onClose={() => {
					isStoreModalOpen.value = false;
				}}
				contentClassName="max-w-2xl bg-zinc-950 border border-white/10"
			>
				<TechnologyStore
					refetch={() => {
						refetch();
						isStoreModalOpen.value = false;
					}}
					onClose={() => {
						isStoreModalOpen.value = false;
					}}
				/>
			</Modal>
		</div>
	);
}
