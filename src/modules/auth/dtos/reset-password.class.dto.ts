import { createZodDto } from "nestjs-zod";
import { authResetPasswordDto } from "./reset-password.dto";

export class AuthResetPasswordDtoClass extends createZodDto(
	authResetPasswordDto,
) {}
