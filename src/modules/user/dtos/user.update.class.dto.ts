import { createZodDto } from "nestjs-zod";
import { userUpdateDto } from "./user.update.dto";

export class UserUpdateClassDto extends createZodDto(userUpdateDto) {}
