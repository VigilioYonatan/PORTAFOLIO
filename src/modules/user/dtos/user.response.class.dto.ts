import { createZodDto } from "nestjs-zod";
import {
	userDestroyResponseDto,
	userIndexResponseDto,
	userListResponseDto,
	userMeResponseDto,
	userResponseDto,
	userShowResponseDto,
	userStoreResponseDto,
	userUpdateResponseDto,
} from "./user.response.dto";

export class UserIndexResponseClassDto extends createZodDto(
	userIndexResponseDto,
) {}

export class UserListResponseClassDto extends createZodDto(
	userListResponseDto,
) {}

export class UserShowResponseClassDto extends createZodDto(
	userShowResponseDto,
) {}

export class UserMeResponseClassDto extends createZodDto(userMeResponseDto) {}

export class UserStoreResponseClassDto extends createZodDto(
	userStoreResponseDto,
) {}

export class UserUpdateResponseClassDto extends createZodDto(
	userUpdateResponseDto,
) {}

export class UserDestroyResponseClassDto extends createZodDto(
	userDestroyResponseDto,
) {}

export class UserResponseClassDto extends createZodDto(userResponseDto) {}
