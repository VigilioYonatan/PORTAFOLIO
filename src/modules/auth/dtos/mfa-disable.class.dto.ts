import { createZodDto } from "nestjs-zod";
import { authMfaDisableDto } from "./mfa-disable.dto";

export class AuthMfaDisableClassDto extends createZodDto(authMfaDisableDto) {}
