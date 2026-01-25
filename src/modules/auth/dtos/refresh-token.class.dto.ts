import { createZodDto } from "nestjs-zod";
import { authRefreshTokenDto } from "./refresh-token.dto";

export class AuthRefreshTokenDtoClass extends createZodDto(
	authRefreshTokenDto,
) {}
