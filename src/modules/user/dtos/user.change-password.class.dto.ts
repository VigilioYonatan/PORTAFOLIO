import { createZodDto } from "nestjs-zod";
import { userChangePasswordDto } from "./user.change-password.dto";

export class UserChangePasswordClassDto extends createZodDto(
	userChangePasswordDto,
) {}
