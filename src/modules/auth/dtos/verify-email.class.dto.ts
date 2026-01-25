import { createZodDto } from "nestjs-zod";
import { authVerifyEmailDto } from "./verify-email.dto";

export class AuthVerifyEmailDtoClass extends createZodDto(authVerifyEmailDto) {}
