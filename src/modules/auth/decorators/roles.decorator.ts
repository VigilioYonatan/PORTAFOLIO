import type { UserSchema } from "@modules/user/schemas/user.schema";
import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
export const Roles = (...roles: number[]) => SetMetadata(ROLES_KEY, roles);
