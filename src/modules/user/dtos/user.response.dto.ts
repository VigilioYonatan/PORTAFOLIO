import { z } from "@infrastructure/config/zod-i18n.config";
import { createPaginatorSchema } from "@infrastructure/schemas/paginator.schema";
import { userSchema } from "../schemas/user.schema";

// --- Index / List ---
export const userIndexResponseDto = createPaginatorSchema(
	userSchema.omit({ password: true }),
);
export type UserIndexResponseDto = z.infer<typeof userIndexResponseDto>;
export const userListResponseDto = userIndexResponseDto; // Alias
export type UserListResponseApi = UserIndexResponseDto; // Alias

// --- Show ---
export const userShowResponseDto = z.object({
	success: z.literal(true),
	user: userSchema.omit({ password: true }),
});
export type UserShowResponseDto = z.infer<typeof userShowResponseDto>;

// --- Me ---
export const userMeResponseDto = z.object({
	success: z.literal(true),
	user: userSchema.pick({
		id: true,
		username: true,
		email: true,
		role_id: true,
		status: true,
		avatar: true,
		created_at: true,
		updated_at: true,
	}),
});
export type UserMeResponseDto = z.infer<typeof userMeResponseDto>;

// --- Store ---
export const userStoreResponseDto = z.object({
	success: z.literal(true),
	user: userSchema.omit({ password: true }),
});
export type UserStoreResponseDto = z.infer<typeof userStoreResponseDto>;

// --- Update ---
export const userUpdateResponseDto = z.object({
	success: z.literal(true),
	user: userSchema.omit({ password: true }),
});
export type UserUpdateResponseDto = z.infer<typeof userUpdateResponseDto>;

// --- Destroy ---
export const userDestroyResponseDto = z.object({
	success: z.literal(true),
	message: z.string(),
});
export type UserDestroyResponseDto = z.infer<typeof userDestroyResponseDto>;

// --- Generic ---
export const userResponseDto = z.object({
	success: z.literal(true),
	user: userSchema.omit({ password: true }),
});
export type UserResponseDto = z.infer<typeof userResponseDto>;
