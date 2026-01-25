import { createZodDto } from "nestjs-zod";
import { userStoreDto } from "./user.store.dto";

export class UserStoreClassDto extends createZodDto(userStoreDto) {}
