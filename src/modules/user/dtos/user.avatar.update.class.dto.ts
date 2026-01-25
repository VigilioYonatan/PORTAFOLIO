import { createZodDto } from "nestjs-zod";
import { userAvatarUpdateDto } from "./user.avatar.update.dto";

export class UserAvatarUpdateClassDto extends createZodDto(
	userAvatarUpdateDto,
) {}
