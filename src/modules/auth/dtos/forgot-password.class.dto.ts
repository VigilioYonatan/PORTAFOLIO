import { createZodDto } from "nestjs-zod";
import { authForgotPasswordDto } from "./forgot-password.dto";

export class AuthForgotPasswordDtoClass extends createZodDto(
	authForgotPasswordDto,
) {}
