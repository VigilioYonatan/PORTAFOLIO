import Form from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Refetch } from "@infrastructure/types/client";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { technologyUpdateApi } from "@modules/technology/apis/technology.update.api";
import type { TechnologyIndexResponseDto } from "@modules/technology/dtos/technology.response.dto";
import {
	type TechnologyUpdateDto,
	technologyUpdateDto,
} from "@modules/technology/dtos/technology.update.dto";
import { type TechnologySchema } from "@modules/technology/schemas/technology.schema";
import {
	typeTextExtensions,
	UPLOAD_CONFIG,
} from "@modules/uploads/const/upload.const";
import { sweetModal } from "@vigilio/sweet";
import { Layers, Type } from "lucide-preact";
import { useForm } from "react-hook-form";

interface TechnologyUpdateProps {
	technology: TechnologySchema;
	refetch: (data: Refetch<TechnologyIndexResponseDto["results"]>) => void;
	onClose: () => void;
}

export default function TechnologyUpdate({
	technology,
	refetch,
	onClose,
}: TechnologyUpdateProps) {
	const technologyUpdateMutation = technologyUpdateApi(technology.id);

	const technologyUpdateForm = useForm<TechnologyUpdateDto>({
		resolver: zodResolver(technologyUpdateDto),
		mode: "all",
		defaultValues: { ...technology },
	});

	function onTechnologyUpdate(body: TechnologyUpdateDto) {
		technologyUpdateMutation.mutate(body, {
			onSuccess(result) {
				sweetModal({
					icon: "success",
					title: "COMPONENT_REVISED",
					text: `Technology "${body.name}" updated in core stack.`,
				});
				refetch(result.technology);
				onClose();
			},
			onError(error) {
				handlerError(technologyUpdateForm, error, "Transmission Failure");
			},
		});
	}

	return (
		<div class="px-1 space-y-4">
			<div class="flex flex-col gap-1 border-b border-white/5 pb-4 mb-4">
				<span class="text-[9px] font-black tracking-[0.5em] text-primary uppercase animate-pulse">
					MODERATING_CORE_DATA
				</span>
				<h2 class="text-xl font-black tracking-tight text-foreground uppercase">
					Update Tech Component
				</h2>
			</div>
			<Form {...technologyUpdateForm} onSubmit={onTechnologyUpdate}>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control<TechnologyUpdateDto>
						name="name"
						title="MODULE_LABEL"
						ico={<Type size={18} />}
						placeholder="React / Node.js"
					/>
					<Form.control.select<TechnologyUpdateDto>
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

				<Form.control.file<TechnologyUpdateDto>
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
					title="COMMIT_REVISION"
					loading_title="COMMITTING..."
					isLoading={technologyUpdateMutation.isLoading || false}
					disabled={technologyUpdateMutation.isLoading || false}
					className="w-full mt-6 bg-primary text-primary-foreground font-black py-4 uppercase tracking-widest rounded-xl hover:brightness-110 transition-all border-none shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
				/>
			</Form>
		</div>
	);
}
