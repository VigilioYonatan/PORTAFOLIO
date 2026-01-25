import { createZodDto } from "nestjs-zod";
import { authLoginDto } from "./login.dto";

export class AuthLoginDtoClass extends createZodDto(authLoginDto) {}
