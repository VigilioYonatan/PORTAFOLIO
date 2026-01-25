import Form from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import {
	type TechnologyStoreDto,
	technologyStoreDto,
} from "@modules/technology/dtos/technology.store.dto";
import { technologyStoreApi } from "@modules/technology/apis/technology.store.api";
import {
	typeTextExtensions,
	UPLOAD_CONFIG,
} from "@modules/uploads/const/upload.const";
import { sweetModal } from "@vigilio/sweet";
import { useForm } from "react-hook-form";
import { Layers, Type } from "lucide-preact";
import type { Refetch } from "@infrastructure/types/client";
import type { TechnologyIndexResponseDto } from "@modules/technology/dtos/technology.response.dto";

interface TechnologyStoreProps {
	refetch: (data: Refetch<TechnologyIndexResponseDto["results"]>) => void;
	onClose: () => void;
}

export default function TechnologyStore({
	refetch,
	onClose,
}: TechnologyStoreProps) {
	const technologyStoreMutation = technologyStoreApi();

	const technologyStoreForm = useForm<TechnologyStoreDto>({
		resolver: zodResolver(technologyStoreDto),
		mode: "all",
	});

	function onTechnologyStore(body: TechnologyStoreDto) {
		technologyStoreMutation.mutate(body, {
			onSuccess(result) {
				sweetModal({
					icon: "success",
					title: "MODULE_SYNCHRONIZED",
					text: `Technology "${body.name}" injected in core stack.`,
				});
				refetch(result.technology);
				onClose();
			},
			onError(error) {
				handlerError(technologyStoreForm, error, "Transmission Failure");
			},
		});
	}

	return (
		<div class="px-1 space-y-4">
			<div class="flex flex-col gap-1 border-b border-white/5 pb-4 mb-4">
				<span class="text-[9px] font-black font-mono tracking-[0.5em] text-primary uppercase animate-pulse">
					INJECTING_NEW_MODULE
				</span>
				<h2 class="text-xl font-black tracking-tight text-foreground uppercase">
					Add Tech Component
				</h2>
			</div>
			<Form {...technologyStoreForm} onSubmit={onTechnologyStore}>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control<TechnologyStoreDto>
						name="name"
						title="MODULE_LABEL"
						ico={<Type size={18} />}
						placeholder="React / Node.js"
					/>
					<Form.control.select<TechnologyStoreDto>
						name="category"
						title="STACK_SECTOR"
						ico={<Layers size={18} />}
						array={[
							{ key: "FRONTEND", value: "Frontend" },
							{ key: "BACKEND", value: "Backend" },
							{ key: "DATABASE", value: "Database" },
							{ key: "DEVOPS", value: "DevOps" },
							{ key: "LANGUAGE", value: "Language" },
							{ key: "MOBILE", value: "Mobile" },
							{ key: "AI", value: "AI" },
						]}
						placeholder="Select category"
					/>
				</div>

				<Form.control.file<TechnologyStoreDto>
					name="icon"
					title="COMPONENT_ICON"
					entity="technology"
					property="icon"
					typeFile="image"
					typesText={typeTextExtensions(
						UPLOAD_CONFIG.technology.icon!.mime_types,
					)}
					accept={UPLOAD_CONFIG.technology.icon!.mime_types.join(", ")}
				/>

				<Form.button.submit
					title="INITIALIZE_COMPONENT"
					loading_title="INITIALIZING..."
					isLoading={technologyStoreMutation.isLoading || false}
					disabled={technologyStoreMutation.isLoading || false}
					className="w-full mt-6 bg-primary text-primary-foreground font-black py-4 uppercase tracking-widest rounded-xl hover:brightness-110 transition-all border-none shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
				/>
			</Form>
		</div>
	);
}
