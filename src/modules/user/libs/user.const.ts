import type { UserSchema } from "../schemas/user.schema";

export const userStatusOptions: {
	key: UserSchema["status"];
	value: string;
}[] = [
	{ key: "ACTIVE", value: "Activo" },
	{ key: "BANNED", value: "Baneado" },
	{ key: "PENDING", value: "Pendiente" },
];

export const userRoles: {
	key: UserSchema["role_id"];
	value: string;
}[] = [
	{ key: 1, value: "Administrador" },
	{ key: 2, value: "Usuario" },
	{ key: 3, value: "Moderador" },
];
