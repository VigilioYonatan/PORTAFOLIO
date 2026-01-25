import type { ContactStoreDto } from "../dtos/contact.store.dto";
import type { ContactMessageSchema } from "../schemas/contact-message.schema";

export const CONTACT_STATUS_OPTIONS: {
	key: "all" | "read" | "unread";
	value: string;
}[] = [
	{ key: "all", value: "All" },
	{ key: "read", value: "Read" },
	{ key: "unread", value: "Unread" },
];

export const CONTACT_SUBJECT_OPTIONS: {
	key: NonNullable<ContactStoreDto["subject"]>;
	value: string;
}[] = [
	{ key: "General", value: "Consulta General" },
	{ key: "Soporte", value: "Soporte Técnico" },
	{ key: "Ventas", value: "Información de Ventas" },
	{ key: "Otro", value: "Otro" },
];

export const CONTACT_INFO = {
	phone: "+51 123 456 789",
	email: "contacto@example.com",
	address: "Lima, Perú",
	hours: "Lun - Vie: 9:00 AM - 6:00 PM",
	responseTime: "Respondemos en 24-48h",
};

export function getContactStatusInfo(isRead: boolean): {
	label: string;
	className: string;
	bgClassName: string;
} {
	if (isRead) {
		return {
			label: "READ",
			className: "text-muted-foreground",
			bgClassName: "bg-muted/50",
		};
	}
	return {
		label: "UNREAD",
		className: "text-primary",
		bgClassName: "bg-primary/10",
	};
}

/**
 * Truncate message for preview
 */
export function truncateMessage(message: string, maxLength = 50): string {
	if (message.length <= maxLength) return message;
	return `${message.slice(0, maxLength)}...`;
}
