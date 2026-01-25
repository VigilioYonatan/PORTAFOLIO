import { createZodDto } from "nestjs-zod";
import {
	contactDestroyResponseDto,
	contactIndexResponseDto,
	contactListResponseDto,
	contactResponseDto,
	contactStoreResponseDto,
	contactUpdateResponseDto,
} from "./contact.response.dto";

export class ContactIndexResponseClassDto extends createZodDto(
	contactIndexResponseDto,
) {}
export class ContactListResponseClassDto extends createZodDto(
	contactListResponseDto,
) {}
export class ContactStoreResponseClassDto extends createZodDto(
	contactStoreResponseDto,
) {}
export class ContactUpdateResponseClassDto extends createZodDto(
	contactUpdateResponseDto,
) {}
export class ContactDestroyResponseClassDto extends createZodDto(
	contactDestroyResponseDto,
) {}
export class ContactResponseClassDto extends createZodDto(contactResponseDto) {}
