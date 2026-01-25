import { createZodDto } from "nestjs-zod";
import { authMfaLoginDto } from "./mfa-login.dto";

export class AuthMfaLoginClassDto extends createZodDto(authMfaLoginDto) {}
