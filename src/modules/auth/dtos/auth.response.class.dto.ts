import { createZodDto } from "nestjs-zod";
import {
	authEndImpersonateResponseDto,
	authForgotPasswordResponseDto,
	authImpersonateResponseDto,
	authLoginResponseClassDto,
	authLogoutResponseDto,
	authMfaDisableResponseDto,
	authMfaSetupResponseDto,
	authMfaVerifyResponseDto,
	authRefreshTokenResponseDto,
	authRegisterResponseDto,
	authResetPasswordResponseDto,
	authSessionResponseDto,
	authVerifyEmailResponseDto,
} from "./auth.response.dto";

export class AuthLoginResponseClassDto extends createZodDto(
	authLoginResponseClassDto,
) {}
export class AuthRegisterResponseClassDto extends createZodDto(
	authRegisterResponseDto,
) {}
export class AuthRefreshTokenResponseClassDto extends createZodDto(
	authRefreshTokenResponseDto,
) {}
export class AuthLogoutResponseClassDto extends createZodDto(
	authLogoutResponseDto,
) {}
export class AuthForgotPasswordResponseClassDto extends createZodDto(
	authForgotPasswordResponseDto,
) {}
export class AuthResetPasswordResponseClassDto extends createZodDto(
	authResetPasswordResponseDto,
) {}
export class AuthVerifyEmailResponseClassDto extends createZodDto(
	authVerifyEmailResponseDto,
) {}
export class AuthMfaSetupResponseClassDto extends createZodDto(
	authMfaSetupResponseDto,
) {}
export class AuthMfaVerifyResponseClassDto extends createZodDto(
	authMfaVerifyResponseDto,
) {}
export class AuthMfaDisableResponseClassDto extends createZodDto(
	authMfaDisableResponseDto,
) {}
export class AuthImpersonateResponseClassDto extends createZodDto(
	authImpersonateResponseDto,
) {}
export class AuthEndImpersonateResponseClassDto extends createZodDto(
	authEndImpersonateResponseDto,
) {}
export class AuthSessionResponseClassDto extends createZodDto(
	authSessionResponseDto,
) {}
