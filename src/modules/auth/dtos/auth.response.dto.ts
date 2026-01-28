import { z } from "@infrastructure/config/zod-i18n.config";
import { userSchema } from "@modules/user/schemas/user.schema";

// --- Login ---
export const authLoginResponseDto = z.object({
	success: z.literal(true),
	mfa_required: z.boolean(),
	temp_token: z.string().optional(),
	access_token: z.string().optional(),
	refresh_token: z.string().optional(),
	user: userSchema.omit({ password: true }).optional(),
	landing_page_route: z.string().nullable(),
});
export type AuthLoginResponseApi = z.infer<typeof authLoginResponseDto>;

// NestJS/Swagger compatibility schema
export const authLoginResponseClassDto = z.object({
	success: z.boolean(),
	mfa_required: z.boolean(),
	temp_token: z.string().optional(),
	access_token: z.string().optional(),
	refresh_token: z.string().optional(),
	user: userSchema.omit({ password: true }).optional(),
	landing_page_route: z.string().nullable(),
});

// --- Register ---
export const authRegisterResponseDto = z.object({
	success: z.literal(true),
	user: userSchema.omit({ password: true }),
});
export type AuthRegisterResponseApi = z.infer<typeof authRegisterResponseDto>;

// --- Refresh Token ---
export const authRefreshTokenResponseDto = z.object({
	success: z.literal(true),
	access_token: z.string(),
	refresh_token: z.string(),
});
export type AuthRefreshTokenResponseApi = z.infer<
	typeof authRefreshTokenResponseDto
>;

// --- Logout ---
export const authLogoutResponseDto = z.object({
	success: z.literal(true),
	message: z.string(),
});
export type AuthLogoutResponseDto = z.infer<typeof authLogoutResponseDto>;

// --- Forgot Password ---
export const authForgotPasswordResponseDto = z.object({
	success: z.literal(true),
	message: z.string(),
});
export type AuthForgotPasswordResponseDto = z.infer<
	typeof authForgotPasswordResponseDto
>;

// --- Reset Password ---
export const authResetPasswordResponseDto = z.object({
	success: z.literal(true),
	message: z.string(),
});
export type AuthResetPasswordResponseDto = z.infer<
	typeof authResetPasswordResponseDto
>;

// --- Verify Email ---
export const authVerifyEmailResponseDto = z.object({
	success: z.literal(true),
	message: z.string(),
});
export type AuthVerifyEmailResponseDto = z.infer<
	typeof authVerifyEmailResponseDto
>;

// --- MFA Setup ---
export const authMfaSetupResponseDto = z.object({
	success: z.literal(true),
	qr_code: z.string(),
	secret: z.string(),
});
export type AuthMfaSetupResponseDto = z.infer<typeof authMfaSetupResponseDto>;

// --- MFA Verify ---
export const authMfaVerifyResponseDto = z.object({
	success: z.literal(true),
	message: z.string(),
});
export type AuthMfaVerifyResponseDto = z.infer<typeof authMfaVerifyResponseDto>;

// --- MFA Disable ---
export const authMfaDisableResponseDto = z.object({
	success: z.literal(true),
	message: z.string(),
});
export type AuthMfaDisableResponseDto = z.infer<
	typeof authMfaDisableResponseDto
>;

// --- Impersonate ---
export const authImpersonateResponseDto = z.object({
	success: z.literal(true),
	access_token: z.string(),
	refresh_token: z.string(),
	impersonating: z.any(),
	actor_id: z.number().int(),
});
export type AuthImpersonateResponseDto = z.infer<
	typeof authImpersonateResponseDto
>;

// --- End Impersonate ---
export const authEndImpersonateResponseDto = z.object({
	success: z.literal(true),
	message: z.string(),
	ended_at: z.string(),
});
export type AuthEndImpersonateResponseDto = z.infer<
	typeof authEndImpersonateResponseDto
>;

// --- Session ---
export const authSessionResponseDto = z.object({
	success: z.literal(true),
	user: userSchema.omit({ password: true }),
});
export type AuthSessionResponseDto = z.infer<typeof authSessionResponseDto>;
