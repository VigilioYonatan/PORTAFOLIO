import { zodResolver } from "@hookform/resolvers/zod";
import type { Refetch } from "@infrastructure/types/client";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { projectStoreApi } from "@modules/project/apis/project.store.api";
import {
	type ProjectStoreDto,
	projectStoreDto,
} from "@modules/project/dtos/project.store.dto";
import { technologyIndexApi } from "@modules/technology/apis/technology.index.api";
import { sweetModal } from "@vigilio/sweet";
import { type Resolver, useForm } from "react-hook-form";
import type { ProjectIndexResponseDto } from "../dtos/project.response.dto";
import { type Lang, useTranslations, defaultLang } from "@src/i18n";
import { ProjectForm } from "./project-form";

interface ProjectStoreProps {
	refetch: (data: Refetch<ProjectIndexResponseDto["results"]>) => void;
	onClose: () => void;
    lang?: Lang;
}

export default function ProjectStore({ refetch, onClose, lang = defaultLang }: ProjectStoreProps) {
    const t = useTranslations(lang);
	const projectStoreMutation = projectStoreApi();
	const technologiesQuery = technologyIndexApi(null, null, { limit: 100 });

	const projectStoreForm = useForm<ProjectStoreDto>({
		resolver: zodResolver(projectStoreDto) as Resolver<ProjectStoreDto>,
		mode: "all",
		defaultValues: {
			techeables: [],
			seo: {
				title: null,
				description: null,
				keywords: [],
				og_image: [],
			},
		},
	});

	function onProjectStore(body: ProjectStoreDto) {
		projectStoreMutation.mutate(body, {
			onSuccess(response) {
				sweetModal({
					icon: "success",
					title: t("dashboard.project.form.success_create"),
					text: t("dashboard.project.form.success_create"),
				});
				projectStoreForm.reset();
                const techMap = new Map(technologiesQuery.data?.results.map(t => [t.id, t]));
                const techeables = body.techeables.map(id => {
                    const tech = techMap.get(id);
                    if (!tech) return null;
					// Optimistic/Mock for cache update
                    return {
						id: 0, // Fake ID
						techeable_id: response.project.id,
						techeable_type: "PORTFOLIO_PROJECT" as const, // Strict type
						tenant_id: 0, // Mock tenant_id, available in server/auth context but optional here for optimistic UI
                        technology_id: tech.id,
                        technology: tech,
						created_at: new Date(),
						updated_at: new Date(),
                    };
                }).filter((t) => t !== null) as ProjectIndexResponseDto["results"][0]["techeables"];
				refetch({...response.project, techeables });
				onClose();
			},
			onError(error) {
				handlerError(projectStoreForm, error, "Error de Sincronización");
			},
		});
	}

	return (
        <ProjectForm
            form={projectStoreForm}
            onSubmit={onProjectStore}
            isLoading={projectStoreMutation.isLoading || false}
            technologies={technologiesQuery.data?.results || []}
        />
	);
}
