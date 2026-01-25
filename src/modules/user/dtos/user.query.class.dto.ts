import { createZodDto } from "nestjs-zod";
import { userQueryDto } from "./user.query.dto";

export class UserQueryClassDto extends createZodDto(userQueryDto) {}
