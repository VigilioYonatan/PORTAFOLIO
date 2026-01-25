import { z } from "@infrastructure/config/zod-i18n.config";
import {
	customDateSchema,
	timeStampSchema,
} from "@infrastructure/schemas/time_stamp.schema";
import { UPLOAD_CONFIG } from "@modules/uploads/const/upload.const";
import { filesSchema } from "@modules/uploads/schemas/upload.schema";

export const userSchema = z
	.object({
		id: z.number().int().positive(),
		username: z.string().max(50),
		email: z.string().email().max(100),
		password: z
			.string()
			.min(8)
			.max(200)
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#])[A-Za-z\d@$!%*?&_\-#]{8,}$/,
				"La contraseña debe contener al menos: una mayúscula, una minúscula, un número y un símbolo especial (@$!%*?&_-#)",
			),
		phone_number: z.string().max(50).nullable(),
		google_id: z.string().max(100).nullable(),
		qr_code_token: z.string().max(100).nullable(),
		status: z.enum(["ACTIVE", "BANNED", "PENDING"]),
		security_stamp: z.string().uuid(),
		failed_login_attempts: z.number().int().min(0),
		is_mfa_enabled: z.boolean(),
		is_superuser: z.boolean(),
		email_verified_at: customDateSchema.nullable(),
		lockout_end_at: customDateSchema.nullable(),
		mfa_secret: z.string().max(32).nullable(),
		last_ip_address: z.string().max(45).nullable(),
		last_login_at: customDateSchema.nullable(),
		avatar: z.array(filesSchema(UPLOAD_CONFIG.user.avatar!.dimensions)).nullable(),
		deleted_at: customDateSchema.nullable(),
		role_id: z.number().int().positive(),
		tenant_id: z.number().int().positive(),
		...timeStampSchema.shape,
	});

export type UserSchema = z.infer<typeof userSchema>;

export type UserIndexSchema = Omit<UserSchema, "password">;

export type UserShowSchema = Omit<UserSchema, "password">;

export type UserShowByEmailToLoginSchema = Pick<
	UserSchema,
	| "id"
	| "email"
	| "username"
	| "role_id"
	| "is_superuser"
	| "is_mfa_enabled"
	| "failed_login_attempts"
	| "lockout_end_at"
	| "status"
	| "password"
	| "tenant_id"
	| "security_stamp"
	| "mfa_secret"
	| "google_id"
	| "phone_number"
	| "avatar"
	| "last_ip_address"
	| "last_login_at"
	| "deleted_at"
	| "created_at"
	| "updated_at"
	| "email_verified_at"
	| "qr_code_token"
>;
// UserAuth for middleware
export type UserAuth = Omit<UserShowByEmailToLoginSchema, "password">;
