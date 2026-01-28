
export const PROJECT_STATUS_ENUM = ["live", "in_dev", "archived"] as const;

export const PROJECT_STATUS_OPTIONS: {
	key: (typeof PROJECT_STATUS_ENUM)[number];
	value: string;
}[] = [
	{ key: "live", value: "LIVE" },
	{ key: "in_dev", value: "IN_DEV" },
	{ key: "archived", value: "ARCHIVED" },
];
