import { createZodDto } from "nestjs-zod";
import { userProfileUpdateDto } from "./user.profile.update.dto";

export class UserProfileUpdateClassDto extends createZodDto(
	userProfileUpdateDto,
) {}
