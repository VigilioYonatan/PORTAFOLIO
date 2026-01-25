import { createZodDto } from "nestjs-zod";
import { authMfaSetupDto } from "./auth.mfa-setup.dto";

export class AuthMfaSetupClassDto extends createZodDto(authMfaSetupDto) {}
