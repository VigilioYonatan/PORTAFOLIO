import { createZodDto } from "nestjs-zod";
import { authMfaVerifyDto } from "./mfa-verify.dto";

export class AuthMfaVerifyClassDto extends createZodDto(authMfaVerifyDto) {}
