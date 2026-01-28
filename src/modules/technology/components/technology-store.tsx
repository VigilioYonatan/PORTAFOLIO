import Form from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Refetch } from "@infrastructure/types/client";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { technologyStoreApi } from "@modules/technology/apis/technology.store.api";
import type { TechnologyIndexResponseDto } from "@modules/technology/dtos/technology.response.dto";
import {
	type TechnologyStoreDto,
	technologyStoreDto,
} from "@modules/technology/dtos/technology.store.dto";
import {
	typeTextExtensions,
	UPLOAD_CONFIG,
} from "@modules/uploads/const/upload.const";
import { sweetModal } from "@vigilio/sweet";
import { Layers, Type } from "lucide-preact";
import { useForm, type Resolver } from "react-hook-form";
import { type Lang, useTranslations } from "@src/i18n";

interface TechnologyStoreProps {
	refetch: (data: Refetch<TechnologyIndexResponseDto["results"]>) => void;
	onClose: () => void;
    lang?: Lang;
}

export default function TechnologyStore({
	refetch,
	onClose,
    lang = "es"
}: TechnologyStoreProps) {
    const t = useTranslations(lang);
	const technologyStoreMutation = technologyStoreApi();

	const technologyStoreForm = useForm<TechnologyStoreDto>({
		resolver: zodResolver(technologyStoreDto) as Resolver<TechnologyStoreDto>,
		mode: "all",
	});

	function onTechnologyStore(body: TechnologyStoreDto) {
		technologyStoreMutation.mutate(body, {
			onSuccess(result) {
				sweetModal({
					icon: "success",
					title: t("dashboard.technology.form.success_create"),
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
				<span class="text-[9px] font-black tracking-[0.5em] text-primary uppercase animate-pulse">
					{t("dashboard.technology.form.init_create")}
				</span>
				<h2 class="text-xl font-black tracking-tight text-foreground uppercase">
					{t("dashboard.technology.form.create_title")}
				</h2>
			</div>
			<Form {...technologyStoreForm} onSubmit={onTechnologyStore}>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control<TechnologyStoreDto>
						name="name"
						title={t("dashboard.technology.form.name")}
						ico={<Type size={18} />}
						placeholder="React / Node.js"
					/>
					<Form.control.select<TechnologyStoreDto>
						name="category"
						title={t("dashboard.technology.form.category")}
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
					title={t("dashboard.technology.form.icon")}
					entity="technology"
					property="icon"
					typeFile="image"
					typesText={typeTextExtensions(
						UPLOAD_CONFIG.technology.icon!.mime_types,
					)}
					accept={UPLOAD_CONFIG.technology.icon!.mime_types.join(", ")}
				/>

				<Form.button.submit
					title={t("dashboard.technology.form.submit_create")}
					loading_title={t("dashboard.technology.form.loading")}
					isLoading={technologyStoreMutation.isLoading || false}
					disabled={technologyStoreMutation.isLoading || false}
					className="w-full mt-6 bg-primary text-primary-foreground font-black py-4 uppercase tracking-widest rounded-xl hover:brightness-110 transition-all border-none shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
				/>
			</Form>
		</div>
	);
}
