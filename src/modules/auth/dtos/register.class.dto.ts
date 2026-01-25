import { createZodDto } from "nestjs-zod";
import { authRegisterDto } from "./register.dto";

export class AuthRegisterDtoClass extends createZodDto(authRegisterDto) {}
