import { createZodDto } from "nestjs-zod";
import { authImpersonateDto } from "./impersonate.dto";

export class AuthImpersonateClassDto extends createZodDto(authImpersonateDto) {}
