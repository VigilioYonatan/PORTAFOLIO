import Form from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { aiConfigShowApi } from "@modules/ai/apis/ai.config.show.api";
import { aiConfigUpdateApi } from "@modules/ai/apis/ai.config.update.api";
import {
	type AiConfigUpdateDto,
	aiConfigUpdateDto,
} from "@modules/ai/dtos/ai-config.update.dto";
import { sweetModal } from "@vigilio/sweet";
import { Loader2 } from "lucide-preact";
import type { JSX } from "preact";
import { useForm } from "react-hook-form";

export default function ModelConfigForm() {
	const query = aiConfigShowApi();

	let component: JSX.Element | null = null;

	if (query.isLoading) {
		component = (
			<div class="space-y-6 border border-white/5 rounded-xl p-6 bg-card/30 backdrop-blur-md animate-pulse">
				<div class="h-4 bg-white/5 rounded w-1/3 mb-4"></div>
				<div class="h-10 bg-white/5 rounded w-full"></div>
				<div class="space-y-4 mt-4">
					<div class="h-2 bg-white/5 rounded w-full"></div>
					<div class="h-2 bg-white/5 rounded w-full"></div>
				</div>
			</div>
		);
	}

	if (query.isSuccess) {
		const updateMutation = aiConfigUpdateApi();

		const form = useForm<AiConfigUpdateDto>({
			resolver: zodResolver(aiConfigUpdateDto),
			mode: "all",
			defaultValues: query.data?.config,
		});

		function onSubmit(data: AiConfigUpdateDto) {
			updateMutation.mutate(data, {
				onSuccess() {
					sweetModal({
						icon: "success",
						title: "Configuration Saved",
						timer: 1500,
					});
				},
				onError(error) {
					sweetModal({
						icon: "danger",
						title: "Error saving config",
						text: error.message,
					});
				},
			});
		}

		component = (
			<div class="space-y-6 border border-white/5 rounded-xl p-6 bg-card/30 backdrop-blur-md">
				<h3 class="font-bold text-sm flex items-center gap-2">
					<Loader2 size={14} class="text-primary" />
					Neural Configuration
				</h3>

				<Form {...form} onSubmit={onSubmit}>
					<div class="space-y-4">
						<Form.control.select
							title="Generative Model"
							name="chat_model"
							array={[
								{ key: "gpt-4o", value: "GPT-4o (OpenAI)" },
								{
									key: "claude-3-sonnet",
									value: "Claude 3.5 Sonnet (Anthropic)",
								},
								{ key: "llama-3-70b", value: "Llama 3 70B (Local/Groq)" },
							]}
							placeholder="Select Model"
						/>

						<div class="grid grid-cols-2 gap-4">
							<Form.control
								title="Temperature"
								name="temperature"
								type="number"
								options={{ valueAsNumber: true }}
								placeholder="0.7"
							/>
							<Form.control
								title="Max Tokens"
								name="max_tokens"
								type="number"
								options={{ valueAsNumber: true }}
								placeholder="2000"
							/>
						</div>

						<div class="space-y-2 pt-2 border-t border-white/5">
							<p class="text-xs font-bold uppercase tracking-widest text-muted-foreground">
								RAG Parameters
							</p>
							<div class="grid grid-cols-2 gap-4">
								<Form.control
									title="Chunk Size"
									name="chunk_size"
									type="number"
									options={{ valueAsNumber: true }}
								/>
								<Form.control
									title="Overlap"
									name="chunk_overlap"
									type="number"
									options={{ valueAsNumber: true }}
								/>
							</div>
						</div>

						<Form.control.toggle
							title="Active Neural Core"
							name="is_active"
							question="Enable/Disable AI features globally"
						/>

						<Form.button.submit
							title="Update Neural Config"
							loading_title="Updating..."
							isLoading={updateMutation.isLoading || false}
							disabled={updateMutation.isLoading || false}
							className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
						/>
					</div>
				</Form>
			</div>
		);
	}

	return component;
}
