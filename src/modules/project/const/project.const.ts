import type { ProjectSchema } from "../schemas/project.schema";

export const PROJECT_STATUS_OPTIONS: {
	key: ProjectSchema["status"];
	value: string;
}[] = [
	{ key: "live", value: "LIVE" },
	{ key: "in_dev", value: "IN_DEV" },
	{ key: "archived", value: "ARCHIVED" },
];
